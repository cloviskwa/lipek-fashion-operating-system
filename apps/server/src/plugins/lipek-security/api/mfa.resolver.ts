import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, RequestContext, TransactionalConnection, UserInputError } from '@vendure/core';

import { AuditLogService } from '../services/audit-log.service';
import { MfaCodeService } from '../services/mfa-code.service';
import { MfaService } from '../services/mfa.service';
import { TotpService } from '../services/totp.service';
import { WebAuthnService } from '../services/web-authn.service';
import { WebAuthnCredential } from '../entities/web-authn-credential.entity';
import { manageMfaRecoveryPermission } from '../security-permissions';
import { ensureAuthRateLimit } from './auth-rate-limit';

function parseJsonArg(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch {
        throw new UserInputError('The provided value is not valid JSON.');
    }
}

/**
 * Shared MFA ceremony operations (`R-04`, `ADR-0006`/`SEC-002`–`SEC-004`).
 *
 * Plain methods (no GraphQL decorators): NestJS resolver metadata is not
 * inherited by subclasses, so the decorated Admin/Shop resolvers delegate
 * here. Authorization is ownership (`ctx.activeUserId`), enforced
 * server-side in `MfaService.getUserFromCtx` — never by trusting
 * client-supplied ids.
 */
export class MfaResolverBase {
    constructor(
        protected mfa: MfaService,
        protected totp: TotpService,
        protected webAuthn: WebAuthnService,
        protected codes: MfaCodeService,
        protected auditLog: AuditLogService,
        protected connection: TransactionalConnection,
    ) {}

    async mfaStatus(ctx: RequestContext) {
        const user = await this.mfa.getUserFromCtx(ctx);
        const userWithRoles = (await this.mfa.getUserWithRoles(ctx, user.id)) ?? user;
        const profile = await this.mfa.getProfile(ctx, user);
        const credentials = await this.listCredentials(ctx, user.id);
        return {
            totpEnrolled: profile.totpEnrolled,
            backupCodesRemaining: profile.backupCodesRemaining,
            webAuthnCredentials: credentials,
            enforcementRequiresWebAuthn: this.mfa.evaluateEnforcement(userWithRoles).webAuthnRequired,
        };
    }

    async requestWebAuthnAuthenticationChallenge(ctx: RequestContext, req?: { ip?: string }) {
        ensureAuthRateLimit('', req?.ip, 'webauthn-challenge');
        return this.webAuthn.startAuthentication(ctx);
    }

    async startTotpEnrollment(ctx: RequestContext) {
        const user = await this.mfa.getUserFromCtx(ctx);
        return this.totp.startEnrollment(ctx, user);
    }

    async confirmTotpEnrollment(ctx: RequestContext, code: string) {
        const user = await this.mfa.getUserFromCtx(ctx);
        const result = await this.totp.confirmEnrollment(ctx, user, code);
        if (result === 'NO_PENDING_ENROLLMENT') {
            throw new UserInputError('No pending TOTP enrollment.');
        }
        if (result === 'INVALID_CODE') {
            throw new UserInputError('Invalid code.');
        }
        return { status: await this.mfaStatus(ctx), backupCodes: result.backupCodes };
    }

    async regenerateBackupCodes(ctx: RequestContext, password: string) {
        const user = await this.mfa.getUserFromCtx(ctx);
        await this.mfa.requirePassword(ctx, user, password);
        return this.codes.regenerateBackupCodes(ctx, user);
    }

    async disableTotp(ctx: RequestContext, password: string) {
        const user = await this.mfa.getUserFromCtx(ctx);
        await this.mfa.requirePassword(ctx, user, password);
        await this.totp.disable(ctx, user);
        await this.pruneOrphanedBackupCodes(ctx, user.id);
        return this.mfaStatus(ctx);
    }

    async requestWebAuthnRegistrationOptions(ctx: RequestContext) {
        const user = await this.mfa.getUserFromCtx(ctx);
        return this.webAuthn.startRegistration(ctx, user);
    }

    async verifyWebAuthnRegistration(
        ctx: RequestContext,
        correlationKey: string,
        registrationRaw: string,
        nickname: string,
    ) {
        const user = await this.mfa.getUserFromCtx(ctx);
        const ok = await this.webAuthn.verifyRegistration(
            ctx,
            user,
            correlationKey,
            parseJsonArg(registrationRaw),
            nickname,
        );
        if (!ok) {
            throw new UserInputError('WebAuthn registration could not be verified.');
        }
        return this.mfaStatus(ctx);
    }

    async removeWebAuthnCredential(ctx: RequestContext, id: ID, password: string) {
        const user = await this.mfa.getUserFromCtx(ctx);
        await this.mfa.requirePassword(ctx, user, password);
        // Ownership enforced by including userId in the delete condition.
        const result = await this.connection
            .getRepository(ctx, WebAuthnCredential)
            .delete({ id, userId: user.id });
        if ((result.affected ?? 0) !== 1) {
            throw new UserInputError('Unknown credential.');
        }
        await this.auditLog.record(ctx, {
            action: 'mfa.webauthn.removed',
            targetType: 'User',
            targetId: user.id,
            metadata: { credentialId: String(id) },
        });
        await this.pruneOrphanedBackupCodes(ctx, user.id);
        return this.mfaStatus(ctx);
    }

    async requestMfaRecoveryRegistrationOptions(
        ctx: RequestContext,
        identifier: string,
        password: string,
        recoveryCode: string,
        req?: { ip?: string },
    ) {
        ensureAuthRateLimit(identifier, req?.ip, 'mfa-recovery-options');
        const user = await this.mfa.verifyPassword(ctx, identifier, password);
        if (!user) {
            throw new UserInputError('Invalid credentials or recovery code.');
        }
        if (!(await this.codes.hasValidRecoveryCode(ctx, user, recoveryCode))) {
            await this.auditLog.record(ctx, {
                action: 'mfa.recovery_code.rejected',
                targetType: 'User',
                targetId: user.id,
                metadata: { phase: 're_enrollment_start' },
            });
            throw new UserInputError('Invalid credentials or recovery code.');
        }
        await this.auditLog.record(ctx, {
            action: 'mfa.recovery_code.challenge_issued',
            targetType: 'User',
            targetId: user.id,
        });
        return this.webAuthn.startRegistration(ctx, user);
    }

    async verifyMfaRecoveryRegistration(
        ctx: RequestContext,
        identifier: string,
        password: string,
        correlationKey: string,
        registrationRaw: string,
        nickname: string,
        recoveryCode: string,
        req?: { ip?: string },
    ) {
        ensureAuthRateLimit(identifier, req?.ip, 'mfa-recovery-verify');
        const user = await this.mfa.verifyPassword(ctx, identifier, password);
        if (!user) {
            throw new UserInputError('Invalid credentials or recovery code.');
        }
        const ok = await this.webAuthn.verifyRegistration(
            ctx,
            user,
            correlationKey,
            parseJsonArg(registrationRaw),
            nickname,
        );
        if (!ok) {
            return false;
        }
        // The code is consumed only now: a failed attestation leaves it
        // valid so the user can retry the ceremony.
        await this.codes.consumeRecoveryCode(ctx, user, recoveryCode);
        return true;
    }

    private async listCredentials(ctx: RequestContext, userId: ID) {
        const rows = await this.connection
            .getRepository(ctx, WebAuthnCredential)
            .find({ where: { userId } });
        return rows.map(row => ({
            id: row.id,
            nickname: row.nickname,
            deviceType: row.deviceType,
            backedUp: row.backedUp,
            createdAt: row.createdAt,
        }));
    }

    /**
     * Backup codes only make sense alongside an active factor; when the last
     * one goes, the standing codes go with it.
     */
    private async pruneOrphanedBackupCodes(ctx: RequestContext, userId: ID): Promise<void> {
        const totpActive = await this.totp.hasActiveTotp(ctx, userId);
        const webAuthnCount = await this.webAuthn.countCredentials(ctx, userId);
        if (!totpActive && webAuthnCount === 0) {
            await this.codes.deleteBackupCodes(ctx, userId);
        }
    }
}

/**
 * Admin API (staff) surface. Identical self-service ceremony surface as the
 * Shop API, plus the support-flow recovery-code issuance.
 */
@Resolver()
export class MfaAdminResolver extends MfaResolverBase {
    constructor(
        mfa: MfaService,
        totp: TotpService,
        webAuthn: WebAuthnService,
        codes: MfaCodeService,
        auditLog: AuditLogService,
        connection: TransactionalConnection,
    ) {
        super(mfa, totp, webAuthn, codes, auditLog, connection);
    }

    @Query()
    @Allow(Permission.Authenticated)
    mfaStatus(@Ctx() ctx: RequestContext) {
        return super.mfaStatus(ctx);
    }

    @Query()
    @Allow(Permission.Public)
    requestWebAuthnAuthenticationChallenge(
        @Ctx() ctx: RequestContext,
        @Context('req') req?: { ip?: string },
    ) {
        return super.requestWebAuthnAuthenticationChallenge(ctx, req);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    startTotpEnrollment(@Ctx() ctx: RequestContext) {
        return super.startTotpEnrollment(ctx);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    confirmTotpEnrollment(@Ctx() ctx: RequestContext, @Args('code') code: string) {
        return super.confirmTotpEnrollment(ctx, code);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    regenerateBackupCodes(@Ctx() ctx: RequestContext, @Args('password') password: string) {
        return super.regenerateBackupCodes(ctx, password);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    disableTotp(@Ctx() ctx: RequestContext, @Args('password') password: string) {
        return super.disableTotp(ctx, password);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    requestWebAuthnRegistrationOptions(@Ctx() ctx: RequestContext) {
        return super.requestWebAuthnRegistrationOptions(ctx);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    verifyWebAuthnRegistration(
        @Ctx() ctx: RequestContext,
        @Args('correlationKey') correlationKey: string,
        @Args('registration') registration: string,
        @Args('nickname') nickname: string,
    ) {
        return super.verifyWebAuthnRegistration(ctx, correlationKey, registration, nickname);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    removeWebAuthnCredential(@Ctx() ctx: RequestContext, @Args('id') id: ID, @Args('password') password: string) {
        return super.removeWebAuthnCredential(ctx, id, password);
    }

    @Mutation()
    @Allow(Permission.Public)
    requestMfaRecoveryRegistrationOptions(
        @Ctx() ctx: RequestContext,
        @Args('identifier') identifier: string,
        @Args('password') password: string,
        @Args('recoveryCode') recoveryCode: string,
        @Context('req') req?: { ip?: string },
    ) {
        return super.requestMfaRecoveryRegistrationOptions(ctx, identifier, password, recoveryCode, req);
    }

    @Mutation()
    @Allow(Permission.Public)
    verifyMfaRecoveryRegistration(
        @Ctx() ctx: RequestContext,
        @Args('identifier') identifier: string,
        @Args('password') password: string,
        @Args('correlationKey') correlationKey: string,
        @Args('registration') registration: string,
        @Args('nickname') nickname: string,
        @Args('recoveryCode') recoveryCode: string,
        @Context('req') req?: { ip?: string },
    ) {
        return super.verifyMfaRecoveryRegistration(
            ctx,
            identifier,
            password,
            correlationKey,
            registration,
            nickname,
            recoveryCode,
            req,
        );
    }

    @Mutation()
    @Allow(manageMfaRecoveryPermission.Permission)
    async createMfaRecoveryCode(
        @Ctx() ctx: RequestContext,
        @Args('userId') userId: ID,
        @Args('validityMinutes', { type: () => Int, nullable: true }) validityMinutes?: number,
    ) {
        const targetUser = await this.mfa.getUserWithRoles(ctx, Number(userId));
        if (!targetUser) {
            throw new UserInputError('Unknown user.');
        }
        return this.codes.issueRecoveryCode(ctx, targetUser, validityMinutes);
    }
}

/**
 * Shop API (customer) surface — the identical self-service ceremony set,
 * minus the staff-only recovery-code issuance.
 */
@Resolver()
export class MfaShopResolver extends MfaResolverBase {
    constructor(
        mfa: MfaService,
        totp: TotpService,
        webAuthn: WebAuthnService,
        codes: MfaCodeService,
        auditLog: AuditLogService,
        connection: TransactionalConnection,
    ) {
        super(mfa, totp, webAuthn, codes, auditLog, connection);
    }

    @Query()
    @Allow(Permission.Authenticated)
    mfaStatus(@Ctx() ctx: RequestContext) {
        return super.mfaStatus(ctx);
    }

    @Query()
    @Allow(Permission.Public)
    requestWebAuthnAuthenticationChallenge(
        @Ctx() ctx: RequestContext,
        @Context('req') req?: { ip?: string },
    ) {
        return super.requestWebAuthnAuthenticationChallenge(ctx, req);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    startTotpEnrollment(@Ctx() ctx: RequestContext) {
        return super.startTotpEnrollment(ctx);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    confirmTotpEnrollment(@Ctx() ctx: RequestContext, @Args('code') code: string) {
        return super.confirmTotpEnrollment(ctx, code);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    regenerateBackupCodes(@Ctx() ctx: RequestContext, @Args('password') password: string) {
        return super.regenerateBackupCodes(ctx, password);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    disableTotp(@Ctx() ctx: RequestContext, @Args('password') password: string) {
        return super.disableTotp(ctx, password);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    requestWebAuthnRegistrationOptions(@Ctx() ctx: RequestContext) {
        return super.requestWebAuthnRegistrationOptions(ctx);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    verifyWebAuthnRegistration(
        @Ctx() ctx: RequestContext,
        @Args('correlationKey') correlationKey: string,
        @Args('registration') registration: string,
        @Args('nickname') nickname: string,
    ) {
        return super.verifyWebAuthnRegistration(ctx, correlationKey, registration, nickname);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    removeWebAuthnCredential(@Ctx() ctx: RequestContext, @Args('id') id: ID, @Args('password') password: string) {
        return super.removeWebAuthnCredential(ctx, id, password);
    }

    @Mutation()
    @Allow(Permission.Public)
    requestMfaRecoveryRegistrationOptions(
        @Ctx() ctx: RequestContext,
        @Args('identifier') identifier: string,
        @Args('password') password: string,
        @Args('recoveryCode') recoveryCode: string,
        @Context('req') req?: { ip?: string },
    ) {
        return super.requestMfaRecoveryRegistrationOptions(ctx, identifier, password, recoveryCode, req);
    }

    @Mutation()
    @Allow(Permission.Public)
    verifyMfaRecoveryRegistration(
        @Ctx() ctx: RequestContext,
        @Args('identifier') identifier: string,
        @Args('password') password: string,
        @Args('correlationKey') correlationKey: string,
        @Args('registration') registration: string,
        @Args('nickname') nickname: string,
        @Args('recoveryCode') recoveryCode: string,
        @Context('req') req?: { ip?: string },
    ) {
        return super.verifyMfaRecoveryRegistration(
            ctx,
            identifier,
            password,
            correlationKey,
            registration,
            nickname,
            recoveryCode,
            req,
        );
    }
}

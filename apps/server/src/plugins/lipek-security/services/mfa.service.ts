import { Injectable } from '@nestjs/common';
import {
    ForbiddenError,
    ID,
    LogLevel,
    NativeAuthenticationMethod,
    PasswordCipher,
    RequestContext,
    TransactionalConnection,
    User,
    UserInputError,
    UserService,
} from '@vendure/core';

import { AuditLogService } from './audit-log.service';
import { MfaCodeService } from './mfa-code.service';
import { MfaProfile } from './mfa.types';
import { mfaConfig } from '../mfa-config';
import { TotpService } from './totp.service';
import { WebAuthnService } from './web-authn.service';

/**
 * Pre-computed bcrypt hash used when the identifier does not exist, so that
 * "unknown user" and "wrong password" take the same wall-clock time.
 * (Same mitigation as Vendure's own native strategy.)
 */
const DUMMY_PASSWORD_HASH = '$2b$12$SFfIOqrqph9N4yvWLtbqteiV5C6GEN/YOumGLryDDbHeMLtSQo4/6';

/**
 * Orchestration for the MFA login decision (`R-04`, `ADR-0006`):
 *
 * - assembles the {@link MfaProfile} for a user (active factors);
 * - verifies identifier+password once, shared by the login strategy and the
 *   recovery re-enrollment ceremony;
 * - evaluates enforcement: under `LIPEK_MFA_ENFORCEMENT=privileged`, users
 *   holding a privileged role (default: `super-admin`, per SOT §22) must
 *   complete login with a WebAuthn assertion *specifically* — TOTP, backup
 *   and recovery codes do not satisfy the requirement.
 *
 * Lockout analysis (the master plan's stop condition demands a plausible
 * lockout path before enforcement may be enabled): a privileged user without
 * a passkey can still *re-enroll* via the recovery-code ceremony, which
 * requires password + support-issued recovery code but never creates a
 * session; the operator's break-glass is `LIPEK_MFA_ENFORCEMENT=off` plus a
 * restart. Neither path bypasses the WebAuthn requirement for *login*.
 */
@Injectable()
export class MfaService {
    constructor(
        private connection: TransactionalConnection,
        private userService: UserService,
        private passwordCipher: PasswordCipher,
        private totp: TotpService,
        private webAuthn: WebAuthnService,
        private codes: MfaCodeService,
        private auditLog: AuditLogService,
    ) {}

    /** Active-factor snapshot for one user. */
    async getProfile(ctx: RequestContext, user: User): Promise<MfaProfile> {
        const [totpEnrolled, webAuthnCredentialCount, backupCodesRemaining] = await Promise.all([
            this.totp.hasActiveTotp(ctx, user.id),
            this.webAuthn.countCredentials(ctx, user.id),
            this.codes.countBackupCodes(ctx, user.id),
        ]);
        return { totpEnrolled, webAuthnCredentialCount, backupCodesRemaining };
    }

    /**
     * Verify identifier + password, mirroring the native strategy's timing
     * protections (dummy hash comparison for unknown identifiers). Returns
     * `undefined` when credentials do not match — callers must not reveal
     * which of the two failed.
     */
    async verifyPassword(ctx: RequestContext, identifier: string, password: string): Promise<User | undefined> {
        const user = await this.userService.getUserByEmailAddress(ctx, identifier);
        if (!user) {
            await this.passwordCipher.check(password, DUMMY_PASSWORD_HASH);
            return undefined;
        }
        const nativeMethod = user.getNativeAuthenticationMethod(false);
        if (!nativeMethod) {
            // No password auth method: still burn a comparison for timing.
            await this.passwordCipher.check(password, DUMMY_PASSWORD_HASH);
            return undefined;
        }
        const row = await this.connection
            .getRepository(ctx, NativeAuthenticationMethod)
            .findOne({ where: { id: nativeMethod.id }, select: ['passwordHash'] });
        const matches = await this.passwordCipher.check(password, row?.passwordHash ?? '');
        if (!matches) {
            return undefined;
        }
        return user;
    }

    /**
     * Reload the user with its roles. The user returned by password
     * verification carries no roles (Vendure attaches them later in
     * `AuthService.authenticate`), but the privileged-role check needs them.
     */
    async getUserWithRoles(ctx: RequestContext, userId: ID): Promise<User | undefined> {
        return (
            (await this.connection.getRepository(ctx, User).findOne({
                where: { id: userId },
                relations: ['roles'],
            })) ?? undefined
        );
    }

    /**
     * The signed-in user for self-service resolvers. Ownership is the real
     * authorization: every self-service operation is scoped to *this* user,
     * never to a client-supplied id.
     */
    async getUserFromCtx(ctx: RequestContext): Promise<User> {
        if (ctx.activeUserId == null) {
            throw new ForbiddenError(LogLevel.Verbose);
        }
        const user = await this.connection.getRepository(ctx, User).findOne({ where: { id: ctx.activeUserId } });
        if (!user) {
            throw new ForbiddenError(LogLevel.Verbose);
        }
        return user;
    }

    /** Password re-confirmation for destructive self-service operations. */
    async requirePassword(ctx: RequestContext, user: User, password: string): Promise<void> {
        const verified = await this.verifyPassword(ctx, user.identifier, password);
        if (!verified) {
            throw new UserInputError('error.invalid-credentials');
        }
    }

    /** Whether the user holds any role configured as privileged. */
    isPrivileged(user: User): boolean {
        const codes = (user.roles ?? []).map(role => role.code);
        return mfaConfig.privilegedRoles.some(privileged => codes.includes(privileged));
    }

    /**
     * The enforcement decision for this user's next login attempt.
     * Requires WebAuthn when enforcement mode is `privileged` and the user
     * holds a privileged role — regardless of any other enrolled factor.
     */
    evaluateEnforcement(user: User): { webAuthnRequired: boolean } {
        return {
            webAuthnRequired: mfaConfig.enforcementMode === 'privileged' && this.isPrivileged(user),
        };
    }

    /** Record an enforcement denial (called from the login strategy). */
    async recordEnforcementDenial(ctx: RequestContext, user: User): Promise<void> {
        await this.auditLog.record(ctx, {
            action: 'auth.login.webauthn_required',
            targetType: 'User',
            targetId: user.id,
            metadata: { enforcementMode: mfaConfig.enforcementMode },
        });
    }

    // -- Login-flow audit helpers ------------------------------------------------
    // The actor is the *attempted* identifier: at this point no session
    // exists, and failed attempts in particular must still be attributable.

    async auditLoginFailed(ctx: RequestContext, identifier: string): Promise<void> {
        await this.auditLog.record(ctx, {
            action: 'auth.login.failed',
            actorIdentifier: identifier,
        });
    }

    async auditSecondFactorRequired(ctx: RequestContext, identifier: string): Promise<void> {
        await this.auditLog.record(ctx, {
            action: 'auth.login.second_factor_required',
            actorIdentifier: identifier,
        });
    }

    async auditSecondFactorRejected(ctx: RequestContext, identifier: string): Promise<void> {
        await this.auditLog.record(ctx, {
            action: 'auth.login.second_factor_rejected',
            actorIdentifier: identifier,
        });
    }
}
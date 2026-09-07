import { Injectable } from '@nestjs/common';
import { ID, RequestContext, TransactionalConnection, User } from '@vendure/core';
import { generateSecret, generateURI, verify } from 'otplib';

import { AuditLogService } from './audit-log.service';
import { MfaCryptoService } from './mfa-crypto.service';
import { MfaEnrollmentStart, TotpVerificationResult } from './mfa.types';
import { mfaConfig } from '../mfa-config';
import { BackupCode } from '../entities/backup-code.entity';
import { TotpCredential } from '../entities/totp-credential.entity';

/**
 * RFC 6238 TOTP factor (`SEC-003`, `ADR-0006`) — the fallback MFA factor for
 * devices without a platform authenticator.
 *
 * Enrollment is deliberately two-phase: `startEnrollment` issues a secret and
 * an `otpauth://` URI but stores the credential **pending**, and only
 * `confirmEnrollment` — which requires a valid code from that very secret —
 * activates it. This guarantees a user can never be locked out by an
 * abandoned enrollment: a pending credential is invisible to the login gate.
 *
 * The `enrolled` flag lives inside the encrypted envelope rather than in a
 * schema column: the database schema is authoritative over the entities
 * (`BACKEND_REBUILD_PLAN.md` §4) and carries no such column, and the flag is
 * not worth a migration.
 *
 * Codes are single-use: the time step of every successful verification is
 * recorded and later verifications must land on a strictly greater step,
 * defeating replay of an intercepted code within its validity window.
 */
@Injectable()
export class TotpService {
    constructor(
        private connection: TransactionalConnection,
        private crypto: MfaCryptoService,
        private auditLog: AuditLogService,
    ) {}

    /** Issue a new (pending) secret, replacing any previous enrollment. */
    async startEnrollment(ctx: RequestContext, user: User): Promise<MfaEnrollmentStart> {
        const repo = this.connection.getRepository(ctx, TotpCredential);
        // One credential per user: re-enrolling replaces, never accumulates.
        await repo.delete({ userId: user.id });

        const secret = generateSecret({ length: 20 });
        const otpauthUri = generateURI({
            issuer: 'LIPEK',
            label: user.identifier,
            secret,
            period: mfaConfig.totpPeriodSeconds,
        });
        await repo.save(
            new TotpCredential({
                userId: user.id,
                secretCiphertext: this.encodeEnvelope(secret, false),
            }),
        );
        await this.auditLog.record(ctx, {
            action: 'mfa.totp.enroll_started',
            targetType: 'User',
            targetId: user.id,
        });
        return { secret, otpauthUri };
    }

    /**
     * Activate a pending enrollment with the first valid code. Returns the
     * plaintext backup codes (also hashed + stored here) exactly once.
     */
    async confirmEnrollment(
        ctx: RequestContext,
        user: User,
        code: string,
    ): Promise<{ backupCodes: string[] } | 'NO_PENDING_ENROLLMENT' | 'INVALID_CODE'> {
        const repo = this.connection.getRepository(ctx, TotpCredential);
        const credential = await repo.findOne({ where: { userId: user.id } });
        if (!credential) {
            return 'NO_PENDING_ENROLLMENT';
        }
        const secret = this.decodeEnvelope(credential.secretCiphertext);
        if (!secret || secret.enrolled) {
            return 'NO_PENDING_ENROLLMENT';
        }
        let result;
        try {
            result = await verify({
                secret: secret.value,
                token: code,
                epochTolerance: mfaConfig.totpEpochToleranceSeconds,
            });
        } catch {
            // otplib throws on malformed tokens (wrong length, non-numeric):
            // a backup code submitted while TOTP is enrolled must land as a
            // plain rejection, never as an error thrown at the caller.
            return 'INVALID_CODE';
        }
        if (!result.valid) {
            await this.auditLog.record(ctx, {
                action: 'mfa.totp.rejected',
                targetType: 'User',
                targetId: user.id,
                metadata: { phase: 'confirm' },
            });
            return 'INVALID_CODE';
        }
        // Record the confirm-time step immediately so the code shown during
        // enrollment cannot be replayed as a login second factor.
        // The functional verify() return is a union across TOTP/HOTP result
        // shapes whose per-strategy fields TS cannot narrow, so the matched
        // step is derived here: current step plus the reported drift offset.
        credential.lastUsedTimeStep = this.currentTimeStep() + result.delta;
        credential.secretCiphertext = this.encodeEnvelope(secret.value, true);
        await repo.save(credential);

        const backupCodes = await this.issueBackupCodes(ctx, user);
        await this.auditLog.record(ctx, {
            action: 'mfa.totp.confirmed',
            targetType: 'User',
            targetId: user.id,
        });
        return { backupCodes };
    }

    /**
     * Verify a login-time second factor. Only *enrolled* credentials count;
     * a pending enrollment is invisible here by design.
     */
    async verify(ctx: RequestContext, user: User, code: string): Promise<TotpVerificationResult> {
        const credential = await this.connection.getRepository(ctx, TotpCredential).findOne({
            where: { userId: user.id },
        });
        if (!credential) {
            return { ok: false, reason: 'NOT_ENROLLED' };
        }
        const secret = this.decodeEnvelope(credential.secretCiphertext);
        if (!secret?.enrolled) {
            return { ok: false, reason: 'NOT_ENROLLED' };
        }
        let result;
        try {
            result = await verify({
                secret: secret.value,
                token: code,
                epochTolerance: mfaConfig.totpEpochToleranceSeconds,
                // Replay protection: strictly greater than the last used step.
                afterTimeStep: credential.lastUsedTimeStep ?? undefined,
            });
        } catch {
            // otplib throws on malformed tokens (e.g. a backup code offered
            // while TOTP is enrolled) — treat as an invalid TOTP attempt.
            await this.auditLog.record(ctx, {
                action: 'mfa.totp.rejected',
                targetType: 'User',
                targetId: user.id,
                metadata: { phase: 'login', reason: 'malformed_token' },
            });
            return { ok: false, reason: 'INVALID_CODE' };
        }
        if (!result.valid) {
            await this.auditLog.record(ctx, {
                action: 'mfa.totp.rejected',
                targetType: 'User',
                targetId: user.id,
                metadata: { phase: 'login' },
            });
            return { ok: false, reason: 'INVALID_CODE' };
        }
        credential.lastUsedTimeStep = this.currentTimeStep() + result.delta;
        await this.connection.getRepository(ctx, TotpCredential).save(credential);
        await this.auditLog.record(ctx, {
            action: 'mfa.totp.verified',
            targetType: 'User',
            targetId: user.id,
        });
        return { ok: true };
    }

    /** Remove the TOTP credential. Returns whether one was actually deleted. */
    async disable(ctx: RequestContext, user: User): Promise<boolean> {
        const deleted = await this.connection.getRepository(ctx, TotpCredential).delete({ userId: user.id });
        const removed = (deleted.affected ?? 0) > 0;
        if (removed) {
            await this.auditLog.record(ctx, {
                action: 'mfa.totp.disabled',
                targetType: 'User',
                targetId: user.id,
            });
        }
        return removed;
    }

    /** Whether the user has an *activated* TOTP credential. */
    async hasActiveTotp(ctx: RequestContext, userId: ID): Promise<boolean> {
        const rows = await this.connection.getRepository(ctx, TotpCredential).find({
            where: { userId },
        });
        // An activated credential has the envelope flag set; a pending one
        // (issued but never confirmed) must not count as a factor.
        return rows.some(row => this.decodeEnvelope(row.secretCiphertext)?.enrolled === true);
    }

    private async issueBackupCodes(ctx: RequestContext, user: User): Promise<string[]> {
        const repo = this.connection.getRepository(ctx, BackupCode);
        await repo.delete({ userId: user.id });
        const plaintexts: string[] = [];
        for (let i = 0; i < mfaConfig.backupCodeCount; i++) {
            const code = this.crypto.generateBackupCode();
            plaintexts.push(code);
            await repo.save(new BackupCode({ userId: user.id, codeHash: this.crypto.hashCode(code) }));
        }
        return plaintexts;
    }

    /** The RFC 6238 time step T = floor((now − T0) / X) for the fixed period. */
    private currentTimeStep(): number {
        return Math.floor(Date.now() / 1000 / mfaConfig.totpPeriodSeconds);
    }

    private encodeEnvelope(secret: string, enrolled: boolean): string {
        return this.crypto.encryptSecret(JSON.stringify({ v: 1, secret, enrolled }));
    }

    private decodeEnvelope(envelope: string): { value: string; enrolled: boolean } | undefined {
        try {
            const parsed = JSON.parse(this.crypto.decryptSecret(envelope)) as {
                v?: number;
                secret?: string;
                enrolled?: boolean;
            };
            if (parsed.v !== 1 || typeof parsed.secret !== 'string') {
                return undefined;
            }
            return { value: parsed.secret, enrolled: parsed.enrolled === true };
        } catch {
            // Wrong key, tampered row, or legacy plaintext — treat as absent
            // rather than crashing the login path.
            return undefined;
        }
    }
}

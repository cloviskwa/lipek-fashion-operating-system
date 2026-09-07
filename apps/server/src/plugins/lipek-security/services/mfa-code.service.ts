import { Injectable } from '@nestjs/common';
import { ID, RequestContext, TransactionalConnection, User } from '@vendure/core';

import { AuditLogService } from './audit-log.service';
import { MfaCryptoService } from './mfa-crypto.service';
import { mfaConfig } from '../mfa-config';
import { BackupCode } from '../entities/backup-code.entity';
import { MfaRecoveryCode } from '../entities/mfa-recovery-code.entity';

/**
 * Single-use codes (`SEC-003`/`SEC-004`, `ADR-0006`) — the last-resort
 * recovery paths, both stored as hashes:
 *
 * - **Backup codes** are the standing set handed over when MFA is confirmed
 *   (issued by {@link TotpService}); here they are re-issued and consumed.
 *   No expiry: losing every device may happen long after enrollment.
 *   Consumption is by deletion, so the remaining row count *is* the number
 *   of codes left.
 * - **MFA recovery codes** are issued on demand during a support interaction
 *   and expire after {@link mfaConfig.recoveryCodeTtlMinutes}. The expiry is
 *   what makes reading one out over a support channel safe. Crucially, a
 *   recovery code never *creates a session* — its only login-adjacent use is
 *   authorizing a WebAuthn re-enrollment ceremony, which keeps privileged
 *   accounts fail-closed (see `MfaEnforcementService`).
 */
@Injectable()
export class MfaCodeService {
    constructor(
        private connection: TransactionalConnection,
        private crypto: MfaCryptoService,
        private auditLog: AuditLogService,
    ) {}

    /** Replace the standing backup-code set; plaintext returned exactly once. */
    async regenerateBackupCodes(ctx: RequestContext, user: User): Promise<string[]> {
        const repo = this.connection.getRepository(ctx, BackupCode);
        await repo.delete({ userId: user.id });
        const plaintexts: string[] = [];
        for (let i = 0; i < mfaConfig.backupCodeCount; i++) {
            const code = this.crypto.generateBackupCode();
            plaintexts.push(code);
            await repo.save(new BackupCode({ userId: user.id, codeHash: this.crypto.hashCode(code) }));
        }
        await this.auditLog.record(ctx, {
            action: 'mfa.backup_codes.regenerated',
            targetType: 'User',
            targetId: user.id,
        });
        return plaintexts;
    }

    /**
     * Consume a backup code. Atomic by deletion: the row is removed and the
     * `affected` count is the single source of truth, so two concurrent
     * attempts can never both succeed.
     */
    async consumeBackupCode(ctx: RequestContext, user: User, code: string): Promise<boolean> {
        const repo = this.connection.getRepository(ctx, BackupCode);
        const candidates = await repo.find({ where: { userId: user.id } });
        const match = candidates.find(row => this.crypto.verifyCodeHash(code, row.codeHash));
        if (!match) {
            await this.auditLog.record(ctx, {
                action: 'mfa.backup_code.rejected',
                targetType: 'User',
                targetId: user.id,
            });
            return false;
        }
        const result = await repo.delete({ id: match.id });
        if ((result.affected ?? 0) !== 1) {
            // Lost a race with a concurrent consumption of the same code.
            return false;
        }
        await this.auditLog.record(ctx, {
            action: 'mfa.backup_code.used',
            targetType: 'User',
            targetId: user.id,
            metadata: { remaining: candidates.length - 1 },
        });
        return true;
    }

    async countBackupCodes(ctx: RequestContext, userId: ID): Promise<number> {
        return this.connection.getRepository(ctx, BackupCode).count({ where: { userId } });
    }

    /**
     * Existence check *without* consumption — used by the recovery
     * re-enrollment ceremony's first leg, which must stay valid while the
     * client performs the WebAuthn ceremony; the code is consumed only when
     * the new credential is actually stored.
     */
    async hasValidRecoveryCode(ctx: RequestContext, user: User, code: string): Promise<boolean> {
        const candidates = await this.connection
            .getRepository(ctx, MfaRecoveryCode)
            .find({ where: { userId: user.id } });
        const now = Date.now();
        return candidates.some(
            row => row.expiresAt.getTime() > now && this.crypto.verifyCodeHash(code, row.codeHash),
        );
    }

    /** Remove all of a user's backup codes (used when the last factor goes away). */
    async deleteBackupCodes(ctx: RequestContext, userId: ID): Promise<void> {
        await this.connection.getRepository(ctx, BackupCode).delete({ userId });
    }

    /**
     * Support-issued recovery code (`SEC-004`). Requires the
     * `ManageMfaRecovery` permission at the resolver; the plaintext is shown
     * once, the hash persists until use or expiry.
     */
    async issueRecoveryCode(
        ctx: RequestContext,
        targetUser: User,
        validityMinutes: number = mfaConfig.recoveryCodeTtlMinutes,
    ): Promise<{ code: string; expiresAt: Date }> {
        const code = this.crypto.generateRecoveryCode();
        const expiresAt = new Date(Date.now() + validityMinutes * 60_000);
        const repo = this.connection.getRepository(ctx, MfaRecoveryCode);
        // The surviving schema constrains one recovery code per user
        // (UNIQUE userId): a fresh code replaces the old one.
        await repo.delete({ userId: targetUser.id });
        await repo.save(new MfaRecoveryCode({ userId: targetUser.id, codeHash: this.crypto.hashCode(code), expiresAt }));
        await this.auditLog.record(ctx, {
            action: 'mfa.recovery_code.issued',
            targetType: 'User',
            targetId: targetUser.id,
            metadata: { validityMinutes, expiresAt: expiresAt.toISOString() },
        });
        return { code, expiresAt };
    }

    /**
     * Consume a recovery code. Same atomic-deletion discipline as backup
     * codes, plus the expiry check. Returns `false` for wrong *and* expired
     * codes alike — the caller cannot distinguish, and neither should the
     * attacker.
     */
    async consumeRecoveryCode(ctx: RequestContext, user: User, code: string): Promise<boolean> {
        const repo = this.connection.getRepository(ctx, MfaRecoveryCode);
        const candidates = await repo.find({ where: { userId: user.id } });
        const now = Date.now();
        const match = candidates.find(
            row => row.expiresAt.getTime() > now && this.crypto.verifyCodeHash(code, row.codeHash),
        );
        if (!match) {
            await this.auditLog.record(ctx, {
                action: 'mfa.recovery_code.rejected',
                targetType: 'User',
                targetId: user.id,
            });
            return false;
        }
        const result = await repo.delete({ id: match.id });
        if ((result.affected ?? 0) !== 1) {
            return false;
        }
        await this.auditLog.record(ctx, {
            action: 'mfa.recovery_code.used',
            targetType: 'User',
            targetId: user.id,
        });
        return true;
    }
}
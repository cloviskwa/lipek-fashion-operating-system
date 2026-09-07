import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { adminApiExtensions } from './api/admin-api-extensions';
import { AuditLogResolver } from './api/audit-log.resolver';
import { AuditLogEntry } from './entities/audit-log-entry.entity';
import { BackupCode } from './entities/backup-code.entity';
import { MfaRecoveryCode } from './entities/mfa-recovery-code.entity';
import { TotpCredential } from './entities/totp-credential.entity';
import { WebAuthnChallenge } from './entities/web-authn-challenge.entity';
import { WebAuthnCredential } from './entities/web-authn-credential.entity';
import { readAuditLogPermission } from './security-permissions';
import { AuditLogService } from './services/audit-log.service';

import { lipekCorsOptions } from './origin-allow-list';
import { rateLimitMiddleware } from './rate-limit.middleware';

/**
 * General API security baseline for the Admin and Shop GraphQL APIs:
 * origin allow-list (replacing Vendure's permissive `{ origin: true }` default)
 * and a general-purpose rate limiter.
 *
 * Rebuild task `R-04` restores the credential and audit-trail entities whose
 * tables survived the August 2026 loss: TOTP enrolments, WebAuthn credentials
 * and challenges, MFA recovery and backup codes, and the append-only audit
 * log (which still holds 425 rows written before the loss).
 *
 * The authentication *ceremonies* -- TOTP verification and the WebAuthn
 * registration/assertion flows -- are original engineering work gated on
 * `ADR-0006`/`ADR-0008` and are not implemented here. This plugin currently
 * owns the storage model, the audit trail and its read API; the
 * `AuthenticationStrategy` implementations follow.
 *
 * `AuditLogService` is exported so other plugins can record security-relevant
 * actions without duplicating the write path.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
    entities: [
        TotpCredential,
        WebAuthnCredential,
        WebAuthnChallenge,
        MfaRecoveryCode,
        BackupCode,
        AuditLogEntry,
    ],
    providers: [AuditLogService],
    exports: [AuditLogService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [AuditLogResolver],
    },
    configuration: config => {
        config.authOptions.customPermissions.push(readAuditLogPermission);
        config.apiOptions.cors = lipekCorsOptions;
        config.apiOptions.middleware = [
            ...(config.apiOptions.middleware ?? []),
            { handler: rateLimitMiddleware, route: '*splat' },
        ];
        return config;
    },
})
export class LipekSecurityPlugin {}

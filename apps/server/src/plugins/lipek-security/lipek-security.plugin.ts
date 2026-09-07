import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { AuditLogResolver } from './api/audit-log.resolver';
import { MfaAdminResolver, MfaShopResolver } from './api/mfa.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/mfa-api-extensions';
import { AuditLogEntry } from './entities/audit-log-entry.entity';
import { BackupCode } from './entities/backup-code.entity';
import { MfaRecoveryCode } from './entities/mfa-recovery-code.entity';
import { TotpCredential } from './entities/totp-credential.entity';
import { WebAuthnChallenge } from './entities/web-authn-challenge.entity';
import { WebAuthnCredential } from './entities/web-authn-credential.entity';
import { readAuditLogPermission, manageMfaRecoveryPermission } from './security-permissions';
import { AuditLogService } from './services/audit-log.service';
import { MfaCodeService } from './services/mfa-code.service';
import { MfaCryptoService } from './services/mfa-crypto.service';
import { MfaService } from './services/mfa.service';
import { TotpService } from './services/totp.service';
import { WebAuthnChallengeService } from './services/web-authn-challenge.service';
import { WebAuthnService } from './services/web-authn.service';

import { lipekCorsOptions } from './origin-allow-list';
import { rateLimitMiddleware } from './rate-limit.middleware';

/**
 * Security baseline + native MFA for the Admin and Shop APIs (`R-04`,
 * `ADR-0006`): origin allow-list, general rate limiting, the credential and
 * audit-trail entities, the audit-log read API, and the authentication
 * ceremonies — WebAuthn/passkeys (primary factor), TOTP (fallback), hashed
 * single-use backup codes, expiring support-issued recovery codes, and
 * privileged-account WebAuthn enforcement.
 *
 * The MFA-aware login flow is wired through
 * {@link LipekNativeMfaAuthenticationStrategy} (registered in
 * `vendure-config.ts` under the native strategy name) so that no un-gated
 * native login path remains.
 *
 * `AuditLogService` is exported so other plugins can record security-relevant
 * actions without duplicating the write path.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
    dashboard: './dashboard/index.tsx',
    entities: [
        TotpCredential,
        WebAuthnCredential,
        WebAuthnChallenge,
        MfaRecoveryCode,
        BackupCode,
        AuditLogEntry,
    ],
    providers: [
        MfaCryptoService,
        AuditLogService,
        TotpService,
        MfaCodeService,
        WebAuthnChallengeService,
        WebAuthnService,
        MfaService,
    ],
    exports: [AuditLogService],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [AuditLogResolver, MfaAdminResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [MfaShopResolver],
    },
    configuration: config => {
        config.authOptions.customPermissions.push(readAuditLogPermission);
        config.authOptions.customPermissions.push(manageMfaRecoveryPermission);
        config.apiOptions.cors = lipekCorsOptions;
        config.apiOptions.middleware = [
            ...(config.apiOptions.middleware ?? []),
            { handler: rateLimitMiddleware, route: '*splat' },
        ];
        return config;
    },
})
export class LipekSecurityPlugin {}

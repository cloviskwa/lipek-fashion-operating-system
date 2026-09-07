import 'dotenv/config';

/**
 * Runtime configuration for the MFA/WebAuthn ceremonies (`R-04`, `ADR-0006`).
 *
 * Every value comes from the environment so that local development, the
 * Dashboard, the storefront and a production deployment can each present the
 * correct WebAuthn relying-party identity without code changes. Defaults are
 * dev-only and must be overridden explicitly outside `APP_ENV=dev`.
 */

export type MfaEnforcementMode = 'off' | 'privileged';

function parseEnum<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
    if (!value) {
        return fallback;
    }
    const normalized = value.trim().toLowerCase();
    return (allowed as readonly string[]).includes(normalized) ? (normalized as T) : fallback;
}

function parseList(value: string | undefined, fallback: readonly string[]): string[] {
    if (!value) {
        return [...fallback];
    }
    return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

const IS_DEV = process.env.APP_ENV === 'dev';

export const mfaConfig = {
    /**
     * Enforcement tier (`ADR-0006` decision 4, borrowing the sibling
     * enforcement-mode design): `off` disables gating entirely; `privileged`
     * requires privileged staff roles (see `privilegedRoles`) to complete
     * login with a WebAuthn assertion *specifically* — TOTP, backup and
     * recovery codes do not satisfy the requirement for those accounts.
     */
    enforcementMode: parseEnum<MfaEnforcementMode>(process.env.LIPEK_MFA_ENFORCEMENT, ['off', 'privileged'], 'off'),

    /**
     * Vendure Role `code`s considered privileged for enforcement purposes,
     * seeded from the SOT §22 staff role catalog. The built-in superadmin
     * role's code is `super-admin`.
     */
    privilegedRoles: parseList(process.env.LIPEK_PRIVILEGED_ROLES, ['super-admin']),

    /**
     * WebAuthn relying party identity. `rpID` must be a registrable domain
     * suffix of the origins the ceremonies run on.
     */
    webAuthnRpId: process.env.LIPEK_WEBAUTHN_RP_ID ?? 'localhost',
    webAuthnRpName: process.env.LIPEK_WEBAUTHN_RP_NAME ?? 'LIPEK',

    /**
     * Origins allowed to perform WebAuthn ceremonies. In dev the Admin API
     * (3000), the Dashboard's Vite dev server (5173) and the storefront
     * (3001) all run ceremonies against the same server.
     */
    webAuthnOrigins: parseList(
        process.env.LIPEK_WEBAUTHN_ORIGINS,
        IS_DEV ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'] : [],
    ),

    /**
     * How long a WebAuthn challenge (and the correlation key that carries it)
     * remains valid. Short by design: a challenge is a single-use nonce.
     */
    webAuthnChallengeTtlSeconds: 120,

    /**
     * How long a support-issued MFA recovery code remains valid. Short
     * expiry is what makes reading one out over a support channel safe
     * (`SEC-004`).
     */
    recoveryCodeTtlMinutes: 30,

    /** Number of standing backup codes issued when MFA is confirmed. */
    backupCodeCount: 10,

    /**
     * TOTP acceptance window, in seconds, symmetric around the current time
     * step — accepts the current step plus one step of clock drift on either
     * side (30s step → ±30s), the common user-friendly default.
     */
    totpEpochToleranceSeconds: 30,

    /** TOTP step size in seconds; matches authenticator-app defaults. */
    totpPeriodSeconds: 30,
} as const;

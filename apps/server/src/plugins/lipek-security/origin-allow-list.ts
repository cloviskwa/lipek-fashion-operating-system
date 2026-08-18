/**
 * Explicit origin allow-list for the Admin/Shop GraphQL APIs.
 *
 * Vendure's own default (`apiOptions.cors` unset) is `{ origin: true, credentials: true }`
 * -- it reflects whatever `Origin` header the client sends, for any origin. That is fine
 * for a wide-open demo but wrong for an API that sets authenticated session cookies
 * (`credentials: true`): an allow-list must never simply reflect `*`. Ported from the
 * pattern documented in docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md §3.2
 * (digital2moro-platform's src/lib/security/origin.ts).
 *
 * FOUND-019 scope: general API origin hardening. Auth-endpoint-specific hardening
 * (rate limiting on login/MFA/recovery) is SEC-005 (Phase 1C), layered on top of this.
 */

function parseAllowList(envValue: string | undefined, fallback: readonly string[]): string[] {
    if (!envValue) {
        return [...fallback];
    }
    return envValue
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
}

// Local dev default: only the storefront's own dev origin needs cross-origin access.
// The Dashboard and GraphiQL are served by apps/server itself (same-origin, no CORS
// needed). Production origins are supplied via LIPEK_ALLOWED_ORIGINS (comma-separated)
// once real domains exist -- never widen this by editing the fallback for a one-off need.
const allowedOrigins = parseAllowList(process.env.LIPEK_ALLOWED_ORIGINS, ['http://localhost:3001']);

// Typed structurally against Vendure's `ApiOptions.cors` (`boolean | CorsOptions`
// from the underlying `cors`/Express ecosystem) at the point of use in
// lipek-security.plugin.ts, rather than importing that type here directly --
// avoids adding @nestjs/common as an apps/server devDependency purely for one
// re-exported interface.
export const lipekCorsOptions = {
    credentials: true,
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // No Origin header: same-origin browser navigation, or a server-to-server /
        // curl / GraphiQL request. Not a cross-origin credentialed request, so it's
        // outside what this allow-list needs to police.
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        // Never reflect an unrecognized origin back -- reject silently rather than
        // throwing, matching the standard `cors` package contract (`allowed: false`).
        callback(null, false);
    },
};

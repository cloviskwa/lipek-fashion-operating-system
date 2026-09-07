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

// Local dev defaults. Two origins genuinely need cross-origin access to the API:
//
//   :3001  the storefront's Next.js dev server
//   :5173  the Dashboard's Vite dev server
//
// The Dashboard is same-origin only when it is served from a production build by
// apps/server itself. Under `vendure dev all` it is served by Vite on its own port,
// so its calls to the Admin API are cross-origin and must be allowed or the sign-in
// request fails in the browser with "Failed to fetch". If Vite falls back to another
// port because 5173 is taken, add that origin via LIPEK_ALLOWED_ORIGINS.
//
// These defaults are dev-only and are dropped outside `APP_ENV=dev`. Production
// origins are supplied via LIPEK_ALLOWED_ORIGINS (comma-separated) once real domains
// exist -- never add a production origin to this fallback.
const DEV_ORIGINS = ['http://localhost:3001', 'http://localhost:5173'];

const allowedOrigins = parseAllowList(
    process.env.LIPEK_ALLOWED_ORIGINS,
    process.env.APP_ENV === 'dev' ? DEV_ORIGINS : [],
);

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

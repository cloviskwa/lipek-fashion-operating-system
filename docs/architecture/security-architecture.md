# Security Architecture

**Status:** Derived (growing — this is the `FOUND-019` general-API-hardening layer; authentication, MFA, RBAC, and audit logging are added in Phase 1C, `SEC-001` onward)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §38, §52C; `docs/adr/ADR-0006`, `ADR-0008`; `docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md`

## What exists today (`FOUND-019`)

### `apps/server/src/plugins/lipek-security`

A minimal Vendure plugin (`LipekSecurityPlugin`) applying two general API-hardening measures via `apiOptions`, Vendure's own supported extension points — not hand-rolled Express wiring bypassing the framework:

| Concern           | File                       | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origin allow-list | `origin-allow-list.ts`     | Replaces Vendure's permissive default (`{ origin: true, credentials: true }` — reflects any `Origin` header) with an explicit allow-list, env-driven via `LIPEK_ALLOWED_ORIGINS` (comma-separated), defaulting to `http://localhost:3001` (the storefront's dev origin) locally. Never reflects an unrecognized origin. Verified: an allowed origin gets `Access-Control-Allow-Origin` echoed back with credentials; a disallowed origin gets no CORS header at all.                     |
| Rate limiting     | `rate-limit.middleware.ts` | In-memory fixed-window limiter (300 requests/60s per method+path+IP), applied globally via `apiOptions.middleware`. Generic `429` message that never reveals whether an account/resource exists. **Explicitly not multi-instance-safe** — a Redis-backed store is required before Phase 11's horizontal scaling (`OPS-007`); auth-endpoint-specific tighter limits are `SEC-005` (Phase 1C), layered on top, not a replacement. Verified: trips at exactly request #301 in a 60s window. |

Both patterns are ported from the working utilities documented in `SIBLING_PROJECT_SECURITY_FINDINGS.md` §3.2 (`digital2moro-platform`'s `src/lib/security/{origin,rateLimit}.ts`) — the only genuinely reusable, working security code found across the sibling-project audit.

### `apps/storefront/next.config.ts`

Security headers on every route, plus API-specific hardening:

| Header                                | Value                                                                                                                                  | Scope                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `X-Content-Type-Options`              | `nosniff`                                                                                                                              | All routes                                              |
| `X-Frame-Options`                     | `SAMEORIGIN`                                                                                                                           | All routes                                              |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`                                                                                                      | All routes                                              |
| `Permissions-Policy`                  | `camera=(), microphone=(), geolocation=(), payment=(), usb=()`                                                                         | All routes                                              |
| `Content-Security-Policy-Report-Only` | `default-src 'self'` + explicit `script-src`/`style-src`/`img-src`/`font-src`/`connect-src`/`frame-ancestors`/`base-uri`/`form-action` | All routes — **report-only**, not enforcing (see below) |
| `Strict-Transport-Security`           | `max-age=63072000; includeSubDomains; preload`                                                                                         | Production only (`NODE_ENV === 'production'`)           |
| `Cache-Control`                       | `private, no-store`                                                                                                                    | `/api/*` only                                           |
| `X-Robots-Tag`                        | `noindex`                                                                                                                              | `/api/*` only                                           |

**Why CSP is report-only:** per the sibling-project finding's own documented rationale — move to enforcing once all third-party origins are actually known (payment provider — `ADR-0001`, Phase 4; OAuth — `ADR-0008`, Phase 1D; AI endpoint — Phase 9). Flipping to enforcing prematurely risks silently breaking a not-yet-integrated third party's script/frame with no visibility into what broke.

## What does not exist yet (Phase 1C, `SEC-001` onward)

Authentication (native email+password, WebAuthn/passkey MFA, TOTP fallback, backup codes), RBAC/permission enforcement beyond Vendure's native Role model, audit logging, Google/Apple OAuth, and secrets-rotation tooling all live in `apps/server/src/plugins/lipek-security` too, expanding this same plugin rather than a new one — see `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` Phase 1C/1D task cards and `docs/adr/ADR-0006`/`ADR-0008` for the accepted design. This document expands alongside that work; it is not complete until Phase 1D closes.

## Non-negotiable rules carried forward from the SOT (apply to all future work in this plugin)

- No arbitrary SQL tools, ever exposed to any agent (SOT §52C).
- Customer measurement data (Phase 5+) never enters a shared AI RAG index and is access-restricted to the customer + authorized staff (SOT §52C).
- Payment webhook signatures verified, payment/order mutations idempotent, raw card data never stored (SOT §52C — Phase 4).
- Every `SEC-*` task's audit-relevant action is logged once `SEC-009` lands (Phase 1D).

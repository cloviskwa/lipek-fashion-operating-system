# Sibling Project Security & Auth Findings

**Status:** Operational (research input to ADR-0006/ADR-0008; not itself a design document)
**Scope:** Read-only audit of the other projects under `C:\Users\KWA\dev` (excluding `LIPEK FASHION` itself), performed to identify reusable authentication/MFA/social-login/security patterns before designing LIPEK's `lipek-security` Vendure plugin.

---

## 1. Bottom Line

**No sibling project has a working MFA, TOTP, WebAuthn, or social-login (Google/Apple) implementation.** LIPEK's MFA and social-login work is a from-scratch build (confirmed as ADR-0006/ADR-0008 premise). Two projects contain partial patterns worth reusing at the *design* level, and three concrete, working, copyable security utilities exist in `digital2moro-platform`.

## 2. Projects Reviewed

| Project | Verdict |
|---|---|
| `digital2moro-platform` (+ 4 near-identical forks: `-claude-ui`, `-codex-seo`, `-gemini-ops`, `-groq-docs`) | Partial pattern — MFA *gate* designed but not wired to a real enrollment flow; three genuinely reusable security utilities |
| `course-platform` | Partial pattern — Clerk dependency present but never configured; simple RBAC enum shape worth copying |
| `ERP` | Bare NestJS scaffold, nothing to reuse |
| `sapilot-template`, `d2m-design-system`, `react-nextjs-template`, `d2m-archive` | No auth/security code |

## 3. `digital2moro-platform` Family

Stack: Next.js 16 + Payload CMS. All five forks share byte-identical `proxy.ts` and `src/lib/security/*` — treated as one canonical pattern.

### 3.1 MFA gate design (worth reusing the *design*, not the code as-is)

`proxy.ts` (repo root) implements Next.js middleware that gates `/dashboard/*` behind an MFA check. Design points worth carrying into LIPEK's ADR-0006 decision:

- **Fail-open when unconfigured, fail-closed once configured** — controlled via `MFA_ENFORCEMENT_MODE` / `MFA_METHOD_ENROLLMENT_MODE` / `WEBAUTHN_ENROLLMENT_MODE` environment toggles, so MFA can be rolled out progressively (matches SOT §46 feature-flag philosophy).
- **Never hard-403s on a missing/invalid MFA cookie** — redirects to `/dashboard/mfa/*` enrollment/verification pages instead, avoiding user lockouts.
- **Signed HMAC-SHA256 cookies verified via WebCrypto** (`d2m_mfa`, `d2m_mfa_enroll`) checked in middleware without a DB round-trip on every request — good latency pattern for a high-traffic gate.
- **Separate enforcement tier for privileged accounts** — a distinct flag requires WebAuthn specifically (not just "any MFA factor") for admin-level accounts, which maps directly onto LIPEK's staff/admin vs. customer MFA distinction.

**Caveat — do not copy as working code:** the actual `/dashboard/mfa/*` enrollment pages, the Payload collections backing them, and any `otplib`/`@simplewebauthn` packages the gate implies are **not present** in any of the five checkouts (verified against `src/app` and `package.json`). This is a well-designed but disconnected/WIP scaffold — only the *gate strategy* (env-driven enforcement modes, redirect-not-403, signed stateless cookie check, privileged-account WebAuthn requirement) should inform LIPEK's design.

### 3.2 Reusable, working security utilities

| File | What it does | LIPEK reuse |
|---|---|---|
| `src/lib/security/rateLimit.ts` | In-memory fixed-window limiter keyed by `${key}:${clientIp}`; explicitly documented as needing Redis/Upstash for multi-instance production; returns a generic message that never reveals whether an account/resource exists | Port the pattern (not the in-memory store) into `apps/server`'s `lipek-security` plugin, backed by Redis once `SEC-005`/Phase 11 queue infra lands |
| `src/lib/security/origin.ts` | Allow-list-based origin validation (never reflects `*`) used for both CORS on public API routes and same-origin CSRF defense-in-depth | Directly applicable to LIPEK's Admin API/Shop API edge policy (SOT §52A distinguishes Admin API exposure from Shop API) |
| `next.config.mjs` headers | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` (locks camera/mic/geo/payment/usb), CSP shipped **report-only**, HSTS gated to production only, `Cache-Control: private, no-store` + `noindex` on all `/api/*` | LIPEK's current `next.config.mjs` already has a subset of these (see `CURRENT_REPOSITORY_ASSESSMENT.md` §2.1); extend to match this fuller set, add CSP (start report-only, move to enforcing once all third-party origins — payment provider, OAuth, AI endpoint — are known), and add the `/api/*` cache/`noindex` treatment |

Session handling in this family relies on Payload CMS's own JWT cookie — **not directly transferable**, since LIPEK's identity system is Vendure-authoritative (SOT §52B forbids shadow customer-identity stores), not Payload's.

## 4. `course-platform`

Stack: Next.js + Prisma (PostgreSQL), intended Clerk auth (`@clerk/nextjs` in `package.json`).

- **Auth:** Clerk is a declared dependency and the route structure follows Clerk conventions (`src/app/(auth)/sign-in/[[...sign-in]]`, `sign-up/[[...sign-up]]`), but it is **not wired up** — the sign-in page is a placeholder with an explicit `TODO(auth)` comment awaiting `ClerkProvider` + real keys. No `middleware.ts` exists.
- **RBAC shape worth copying:** `prisma/schema.prisma`'s `User` model uses `authProviderId` (comment: "Clerk/Auth.js subject id") plus a simple `role Role @default(STUDENT)` enum (`STUDENT | INSTRUCTOR | ADMIN`) with inline comments showing intended authorization checks. This is a clean, minimal RBAC shape — LIPEK's staff roles (SOT §22) are more numerous (Super Admin, Store Manager, E-commerce Manager, Customer Service, Tailoring Manager, Tailor, Laundry Manager, Delivery Staff, Marketing, Finance, Analyst) but the "enum-typed role on the identity record, checked at the authorization boundary" pattern is directly applicable — though for LIPEK it should be Vendure's own `Role`/`Channel`/`Permission` model (native RBAC, SOT §0B.2, §22) rather than a bespoke Prisma enum, since Vendure is the identity system of record.
- Because Clerk was never actually configured, there is **no working MFA or social-login code to inspect here** — only a dependency choice that was never executed. This reinforces (not contradicts) ADR-0008: no sibling project demonstrates a working Google/Apple OAuth flow.

## 5. Implication for LIPEK's ADRs

- **ADR-0006 (MFA):** Confirmed as a from-scratch build. Recommended approach (WebAuthn primary + TOTP fallback + backup codes, self-hosted in a `lipek-security` Vendure plugin) should borrow the `digital2moro-platform` gate's *enforcement-mode* and *privileged-account-requires-WebAuthn* design, implemented against Vendure's own session/authentication strategy rather than a Next.js middleware cookie, since LIPEK's identity is Vendure-authoritative and must work identically for the storefront, the Dashboard, and the mobile apps (which don't share Next.js middleware).
- **ADR-0008 (Social login):** Confirmed as a from-scratch build. No sibling project's OAuth config, client-ID wiring, or provider callback handling can be reused because none was ever completed.
- **Immediately reusable (not gated by an ADR):** the rate-limiter pattern, origin/CORS allow-list, and expanded security-headers/CSP set from `digital2moro-platform`, ported into `apps/server` and `apps/storefront` respectively during `SEC-005`/`FOUND-019`.

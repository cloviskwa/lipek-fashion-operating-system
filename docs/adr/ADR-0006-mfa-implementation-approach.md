# ADR-0006: MFA Implementation Approach

**Status:** Accepted
**Date:** 2026-08-17

## Context

This engagement requires MFA built to "most advanced current practice." Vendure Core does not ship first-party MFA (to be re-verified against current Vendure docs at implementation time per `AGENTS.md`). No sibling `/dev` project audited for this engagement (`docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md`) has a working, reusable MFA implementation — the closest is a well-designed but disconnected MFA _gate_ pattern in the `digital2moro-platform` family (env-driven enforcement modes, redirect-not-403 on missing factor, privileged-account-requires-stronger-factor), with no working enrollment flow behind it.

## Decision

Implement MFA as original engineering work inside a new `lipek-security` Vendure plugin, server-authoritative (not a Next.js-middleware-only gate, since it must work identically for the storefront, the Dashboard, and the mobile apps):

1. **WebAuthn/passkeys (FIDO2)** as the primary "most advanced practice" factor — phishing-resistant, no shared secret to leak.
2. **TOTP (RFC 6238)** as a fallback factor for devices without a platform authenticator.
3. **Single-use, hashed backup/recovery codes** as the last-resort recovery path.
4. Privileged staff roles (per source of truth §22) **require** WebAuthn specifically, not just any factor — borrowing the enforcement-tier design observed in the `digital2moro-platform` gate.
5. Self-hosted, not a third-party identity provider (Auth0/Clerk/WorkOS) — avoids a recurring vendor cost and an external dependency on a security-critical path at this stage of the business. This is a build-vs-buy call that can be revisited via a new ADR if in-house build velocity becomes a genuine blocker.

## Consequences

- `SEC-001`–`SEC-006` (Phase 1) may proceed immediately; nothing further blocks their start.
- MFA implementation is genuinely new engineering effort, not integration work — scoped and staffed accordingly in the risk register (R-2).
- Exact library choices (`otplib`, `@simplewebauthn/*` or current equivalents) are confirmed against official docs at implementation time and recorded in the dependency register, per `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md` §8.

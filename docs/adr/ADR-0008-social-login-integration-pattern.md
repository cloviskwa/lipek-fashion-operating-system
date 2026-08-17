# ADR-0008: Social Login Integration Pattern (Google, Apple)

**Status:** Accepted
**Date:** 2026-08-17

## Context

This engagement requires customer account creation via Google, Apple, and email. No sibling `/dev` project audited (`docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md`) has a working OAuth implementation — `course-platform` declares a Clerk dependency but never wires it up. Two structurally different integration patterns exist: OAuth handled server-side in Vendure directly, vs. OAuth handled in Next.js (e.g. via Auth.js) and bridged into Vendure afterward.

## Decision

Server-authoritative: implement Google and Apple OAuth against Vendure's `ExternalAuthenticationStrategy` inside the `lipek-security` plugin (`SEC-007`, `SEC-008`), with `apps/storefront` handling only the OAuth redirect UX. This avoids two independent notions of "who is logged in," and — critically — lets the mobile apps (which do not run Next.js middleware) reuse the exact same server-side flow rather than needing a parallel implementation.

## Consequences

- `SEC-007`/`SEC-008` are scoped as original engineering work, confirmed against current Vendure `ExternalAuthenticationStrategy` API shape before implementation (per `AGENTS.md`'s verify-before-build rule).
- Mobile apps get social login "for free" once the server-side flow exists, rather than needing their own OAuth SDK integration.

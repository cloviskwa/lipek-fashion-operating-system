# Architecture Decision Record Backlog

**Status:** Authoritative (backlog) — **all 12 original items resolved as of 2026-08-17**; see `docs/adr/ADR-0001` through `ADR-0012` for the accepted decisions and rationale. A 13th ADR (`ADR-0013`, Dashboard extension colocation) was added during the pre-Phase-1 architecture normalization pass — it is an architecture correction discovered by re-verifying the official Vendure Dashboard extension model, not a pre-existing backlog item, so it is not listed in this file's resolution table; see `docs/adr/ADR-0013-dashboard-extension-colocation.md` directly. This document is retained as the historical record of _why_ each decision was open and what was considered; it is no longer the place to look for current status — the individual ADR files are.
**Purpose:** Track every open technical decision the source of truth deliberately leaves unresolved (SOT §0.3 "PLANNED/PROVISIONAL/UNDECIDED"), plus decisions introduced by this engagement's additional requirements (MFA, social login, mobile apps, theming). Do not invent decisions that aren't genuinely open.

## Resolution Summary (2026-08-17)

| ADR                                                                                                             | Resolution                                                                                                                                                                                     | Nature of resolution                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR-0001](../adr/ADR-0001-payment-provider.md)                                                                 | Stripe, provisional                                                                                                                                                                            | Accepted-provisional — reconfirm before production                                                                                                        |
| [ADR-0002](../adr/ADR-0002-email-sms-provider.md)                                                               | Transactional-email specialist now, SMS deferred to Phase 7 with regional-coverage check                                                                                                       | Accepted-provisional                                                                                                                                      |
| [ADR-0003](../adr/ADR-0003-object-storage-provider.md)                                                          | Cloudflare R2 / Backblaze B2, provisional                                                                                                                                                      | Accepted-provisional — reconfirm before production                                                                                                        |
| [ADR-0004](../adr/ADR-0004-opensearch-hosting.md)                                                               | No decision made — correctly deferred to Phase 8 gate                                                                                                                                          | Deferred by design                                                                                                                                        |
| [ADR-0005](../adr/ADR-0005-llm-model-provider.md)                                                               | Anthropic Claude for Phase 9 pilot, provider-agnostic config                                                                                                                                   | Accepted-provisional — reconfirm before Phase 10                                                                                                          |
| [ADR-0006](../adr/ADR-0006-mfa-implementation-approach.md)                                                      | WebAuthn primary + TOTP fallback + backup codes, self-hosted `lipek-security` plugin                                                                                                           | **Accepted (final)**                                                                                                                                      |
| [ADR-0007](../adr/ADR-0007-mobile-app-strategy.md)                                                              | Hybrid: Capacitor customer app, native delivery app, responsive Dashboard for staff                                                                                                            | **Accepted (final)**                                                                                                                                      |
| [ADR-0008](../adr/ADR-0008-social-login-integration-pattern.md)                                                 | Server-authoritative `ExternalAuthenticationStrategy`                                                                                                                                          | **Accepted (final)**                                                                                                                                      |
| [ADR-0009](../adr/ADR-0009-hosting-provider.md)                                                                 | No vendor selected — Docker Compose parity mandated now, vendor chosen in Phase 11                                                                                                             | Deferred by design                                                                                                                                        |
| [ADR-0010](../adr/ADR-0010-aeo-strategy.md)                                                                     | `llms.txt` + structured Q&A, sequenced after SEO stabilizes (Phase 9)                                                                                                                          | **Accepted (final)**                                                                                                                                      |
| [ADR-0011](../adr/ADR-0011-theming-token-ownership.md)                                                          | Single token source in `packages/ui`, per-renderer bridges                                                                                                                                     | **Accepted (final)**                                                                                                                                      |
| [ADR-0012](../adr/ADR-0012-typescript-version-pin.md)                                                           | Platform-wide: avoid TS 7.x (native compiler). Per-app: `apps/server` stays on 5.8.2, `apps/storefront` stays on ^6.0.3 — each app's own official scaffold pin, not forced to a single version | **Accepted (final), amended during `FOUND-014`** — the original blanket 5.9.x pin conflicted with the official Next.js starter's own `^6.0.3` requirement |
| [ADR-0013](../adr/ADR-0013-dashboard-extension-colocation.md) _(not an original backlog item — see note above)_ | Remove `apps/staff-console-extensions`; colocate each plugin's Dashboard extension at `apps/server/src/plugins/<name>/dashboard/`                                                              | **Accepted (final)** — added during the pre-Phase-1 architecture normalization pass, 2026-08-17                                                           |

Nothing in this plan is blocked by an unresolved MUST-DECIDE-BEFORE-IMPLEMENTATION item. The four items marked "provisional" and the two marked "deferred by design" are explicitly not blocking — see each ADR's Consequences section for exactly what they gate (all are production-readiness gates, not implementation-start gates).

Each entry: **Decision**, **Classification**, **Why it's open**, **Options**, **Recommendation (if any)**, **Blocks**.

Classifications: `MUST DECIDE BEFORE IMPLEMENTATION` · `MUST DECIDE BEFORE PRODUCTION` · `CAN DEFER` · `REQUIRES CLIENT INPUT` · `REQUIRES INFRA RESEARCH` · `REQUIRES POC`

---

## ADR-0001 — Payment Provider(s)

- **Classification:** MUST DECIDE BEFORE PRODUCTION (Stripe is SOT's provisional default; not blocking early commerce scaffolding, which uses Vendure's provider-agnostic payment abstraction from day one per SOT §13A).
- **Why open:** SOT §0.3 marks Stripe "PROVISIONAL — confirm client merchant eligibility/country requirements." LIPEK's storefront copy (current prototype) shows a Cameroon address; Stripe's direct merchant support and local payment-method coverage in that region needs confirmation.
- **Options:** Stripe (global default); a regional/local processor with Stripe as secondary; a payment-orchestration layer if multiple regional providers are needed for later multi-region expansion (SOT §33).
- **Recommendation:** Build the Vendure payment-provider adapter abstraction first (task `COM-014`) so the concrete provider is swappable; do not block Phase 4 commerce work on this decision, only block go-live.
- **Blocks:** Production launch of checkout (`COM-015`–`COM-018`).

## ADR-0002 — Email / SMS Provider

- **Classification:** MUST DECIDE BEFORE PRODUCTION.
- **Why open:** SOT §0.3 marks this "UNDECIDED." Needed for transactional email (order confirmation, receipts, MFA codes if SMS/email OTP is chosen as a factor, appointment reminders) and marketing automation (SOT §32).
- **Options:** Postmark/Resend/SES for transactional email; Twilio/Africa's Talking (regional SMS coverage) for SMS. Evaluate deliverability and regional SMS coverage for Cameroon/West/Central Africa specifically.
- **Recommendation:** Separate transactional (must be rock-solid, receipts/MFA) from marketing (can tolerate a different provider) — do not force one vendor to do both if it compromises deliverability.
- **Blocks:** `COM-019` (receipt/notification email), `SEC-004` (email OTP factor if chosen), `CRM-010` (marketing automation).

## ADR-0003 — S3-Compatible Object Storage Provider

- **Classification:** MUST DECIDE BEFORE PRODUCTION (local dev unblocked by Vendure `AssetServerPlugin`).
- **Why open:** SOT §0.3 "PLANNED — provider selected during infrastructure ADR."
- **Options:** AWS S3, Cloudflare R2, Backblaze B2, MinIO self-hosted (also a viable _local dev_ emulator regardless of production choice).
- **Recommendation:** Prefer a provider with no/low egress fees if the storefront serves large product-image volumes globally (Cloudflare R2 or Backblaze B2 are common choices here); confirm against final hosting ADR-0009 for network locality.
- **Blocks:** `FOUND-021` (asset pipeline), `OPS-003` (document/receipt storage).

## ADR-0004 — OpenSearch Hosting

- **Classification:** CAN DEFER (explicitly a later-phase concern per SOT §3.4/§16A/§52E — "do not add OpenSearch before the catalog/search requirements justify it").
- **Why open:** No decision needed until Phase 8 (`SEARCH-` tasks). Self-hosted vs. managed (e.g. Amazon OpenSearch Service, Bonsai, self-hosted on the same infra as the rest of the backend) affects operational overhead.
- **Blocks:** `SEARCH-005` onward only.

## ADR-0005 — LLM Model Provider(s) for Mastra

- **Classification:** REQUIRES INFRA RESEARCH, MUST DECIDE BEFORE PRODUCTION AI ROLLOUT (not before Phase 9 scaffolding, since Mastra's model layer is provider-agnostic per SOT §3.3).
- **Why open:** SOT explicitly decouples business logic from a single model vendor. Cost, latency, function/tool-calling reliability, and data-residency terms differ by provider.
- **Options:** Anthropic Claude, OpenAI, or a multi-provider routing strategy (different models for different agent roles — e.g. a cheaper/faster model for read-only lookups, a stronger model for the stylist/reasoning agent).
- **Recommendation:** Start with one well-supported provider behind Mastra's provider-agnostic config for Phase 9's pilot; revisit before Phase 10's write-capable/agentic rollout.
- **Blocks:** `AI-001` onward (config only), `AI-014` (production pilot).

## ADR-0006 — MFA Implementation Approach

- **Classification:** MUST DECIDE BEFORE IMPLEMENTATION (customer/staff auth is foundational; this engagement explicitly requires "most advanced practice" MFA).
- **Why open:** Vendure Core does not ship first-party MFA out of the box (verify against current Vendure docs at implementation time per SOT §0.2/§0G — this is exactly the kind of "unstable technical detail" the SOT requires re-verifying). No sibling `/dev` project audited for this engagement had a reusable MFA implementation to draw from (see [`SIBLING_PROJECT_SECURITY_FINDINGS.md`](SIBLING_PROJECT_SECURITY_FINDINGS.md) once the research task lands — if that file has not yet been created, treat MFA as a from-scratch build).
- **Options:**
  1. **TOTP (RFC 6238)** via a custom Vendure `AuthenticationStrategy`/extension using a well-audited library (e.g. `otplib`), with encrypted-at-rest secrets and single-use backup recovery codes.
  2. **WebAuthn/Passkeys** (FIDO2) via `@simplewebauthn/server` + `@simplewebauthn/browser` (or equivalent current library) for phishing-resistant, "most advanced practice" authentication — recommended as the primary factor with TOTP as a fallback for devices without platform authenticator support.
  3. Third-party identity provider (e.g. Auth0/Clerk/WorkOS) that provides MFA/passkeys out of the box, federated into Vendure via `ExternalAuthenticationStrategy` — trades build effort for a recurring vendor cost and an external dependency for a security-critical path.
- **Recommendation:** WebAuthn/passkeys as the primary "advanced practice" factor + TOTP fallback + backup codes, implemented as a `lipek-security` Vendure plugin, self-hosted (option 1+2 combined) to avoid a third-party identity dependency for a fashion-commerce business at this stage; revisit option 3 only if in-house build velocity becomes a blocker. **Must be confirmed against current Vendure `AuthenticationStrategy`/Dashboard extension APIs before implementation begins.**
- **Blocks:** `SEC-001`–`SEC-006`, and transitively all customer-account and staff-login work (`COM-010`, `ADMIN-001`).

## ADR-0007 — Mobile/Native App Strategy

- **Classification:** MUST DECIDE BEFORE IMPLEMENTATION of Phase 3's app-readiness tasks (storefront PWA itself is not blocked).
- **Why open:** A disconnected Capacitor scaffold (`mobile-wrapper/`) already exists in the repo (see Gap Analysis §11) but is unintegrated, and this engagement requires app-readiness for **three distinct audiences** — customers, delivery/courier staff, and admin/staff — which the existing scaffold does not distinguish.
- **Options:**
  1. **Capacitor**, wrapping the Next.js PWA per audience (fastest path to "app-ready," maximum code reuse with `apps/storefront`, good for the customer app; less natural fit for a delivery app needing background GPS/native push reliability).
  2. **React Native / Expo**, sharing business logic via `packages/graphql`/`packages/schemas` but with a separate native UI layer per audience (more native-feeling delivery/staff apps, more build effort).
  3. **Hybrid**: Capacitor for the customer app (PWA-first, matches SOT §35 "PWA first, native apps come later and reuse platform APIs"), React Native/Expo for the delivery app specifically (background location, reliable push, camera-heavy proof-of-delivery flows benefit from native APIs), and a Capacitor or web-only responsive admin app for staff (admin work is primarily desk/tablet-based, lower native-API need).
- **Recommendation:** Option 3 (hybrid), reusing the existing `mobile-wrapper/` Capacitor scaffold as the customer app's starting point per the migration plan (`TARGET_REPOSITORY_STRUCTURE.md` Step 7), building the delivery app natively when Phase 6 (Laundry pickup/delivery) makes it necessary, and keeping staff/admin as a responsive web app (Vendure Dashboard is already React-based and works on tablets) unless a concrete admin-on-the-go requirement emerges.
- **Blocks:** `MOBILE-001` onward.

## ADR-0008 — Social Login Integration Pattern (Google, Apple)

- **Classification:** MUST DECIDE BEFORE IMPLEMENTATION of `SEC-007`/`SEC-008`.
- **Why open:** Two structurally different integration patterns exist and the SOT does not prescribe one; no sibling project audited during this engagement had a working reference implementation to standardize on.
- **Options:**
  1. Implement Google/Apple OAuth directly against Vendure's `ExternalAuthenticationStrategy` on the server side, with `apps/storefront` only handling the OAuth redirect UX.
  2. Use an auth library (e.g. Auth.js/NextAuth) in `apps/storefront` as the OAuth handshake layer, then exchange the verified identity with Vendure's external-auth endpoint to establish the Vendure session — keeps OAuth provider SDKs/config on the Next.js side, commerce identity remains Vendure-authoritative.
- **Recommendation:** Option 1 (server-authoritative) to avoid two independent notions of "who is logged in" and to keep the mobile apps (which do not run Next.js middleware) able to reuse the exact same server-side flow. Confirm current Vendure `ExternalAuthenticationStrategy` API shape against official docs before implementation (SOT §0.2).
- **Blocks:** `SEC-007`, `SEC-008`.

## ADR-0009 — Hosting / Cloud Provider

- **Classification:** MUST DECIDE BEFORE PRODUCTION (local/dev work via Docker Compose is unblocked regardless).
- **Why open:** SOT §0.3 "UNDECIDED — choose after capacity, region, cost and operational review." Must support persistent Vendure Server + Worker processes, PostgreSQL, Redis, and (later) OpenSearch — ruling out pure serverless/static hosts like the previously configured Netlify/Vercel for the backend (storefront static/edge assets could still use a CDN/edge layer in front of it).
- **Options:** A container/VM host (e.g. a managed Kubernetes/App-platform offering, or a simpler managed-VM/PaaS route) close to the target customer region (West/Central Africa initially, per current storefront copy) with a CDN in front for the storefront.
- **Recommendation:** Defer final selection to Phase 11 (production hardening) but validate Docker Compose parity early so the eventual target is a lift-and-shift, not a rewrite.
- **Blocks:** `FOUND-018` (deployment topology finalization), `OPS-014` (go-live).

## ADR-0010 — AEO (Answer-Engine Optimization) Strategy

- **Classification:** CAN DEFER (build the storefront's content/SEO layer first; AEO builds on top of it, not in parallel).
- **Why open:** This engagement's explicit requirement, not addressed anywhere in the SOT text. No standardized spec exists yet for `llms.txt`/AI-crawler markup (the ecosystem is still forming); over-committing early risks building against a convention that changes.
- **Options:** Publish `llms.txt` + enhanced structured data (FAQ/HowTo/Product schema, already partially planned per SOT §36) and machine-readable Q&A endpoints; monitor emerging conventions (e.g. `llms.txt` adoption, AI-crawler `robots.txt` directives) and adjust.
- **Recommendation:** Ship strong traditional SEO + structured data first (Phase 3), add `llms.txt` and any additional AEO surface as a low-risk incremental addition once content is backend-driven and stable (Phase 3/9 — see task `SEO-006`).
- **Blocks:** Nothing critical-path; quality-of-marketing item.

## ADR-0011 — Dashboard/Storefront/Mobile Theming Token Ownership Model

- **Classification:** CAN DEFER to Phase 2/3 (does not block Phase 0/1 foundation work).
- **Why open:** This engagement's explicit dark/light theme requirement. Needs a decision on whether `packages/ui` owns a single token set consumed everywhere (web + Dashboard extensions + mobile) or whether the Vendure Dashboard's own theming system (which may have its own conventions) is layered separately from the storefront/mobile token set.
- **Recommendation:** Single source of token _values_ in `packages/ui`, with a thin per-renderer bridge (CSS custom properties for web, Dashboard's extension theming hooks, native theming APIs for mobile) rather than three independent token sets.
- **Blocks:** `THEME-001` onward.

---

## Backlog Summary Table

| ADR      | Decision                         | Classification                                           | Blocks                                      |
| -------- | -------------------------------- | -------------------------------------------------------- | ------------------------------------------- |
| ADR-0001 | Payment provider                 | MUST DECIDE BEFORE PRODUCTION                            | `COM-015`–`COM-018`                         |
| ADR-0002 | Email/SMS provider               | MUST DECIDE BEFORE PRODUCTION                            | `COM-019`, `SEC-004`, `CRM-010`             |
| ADR-0003 | Object storage provider          | MUST DECIDE BEFORE PRODUCTION                            | `FOUND-021`, `OPS-003`                      |
| ADR-0004 | OpenSearch hosting               | CAN DEFER                                                | `SEARCH-005`+                               |
| ADR-0005 | LLM model provider(s)            | MUST DECIDE BEFORE PRODUCTION AI ROLLOUT                 | `AI-014`                                    |
| ADR-0006 | MFA implementation approach      | MUST DECIDE BEFORE IMPLEMENTATION                        | `SEC-001`–`SEC-006`, `COM-010`, `ADMIN-001` |
| ADR-0007 | Mobile/native app strategy       | MUST DECIDE BEFORE IMPLEMENTATION (Phase 3 mobile tasks) | `MOBILE-001`+                               |
| ADR-0008 | Social login integration pattern | MUST DECIDE BEFORE IMPLEMENTATION                        | `SEC-007`, `SEC-008`                        |
| ADR-0009 | Hosting/cloud provider           | MUST DECIDE BEFORE PRODUCTION                            | `FOUND-018`, `OPS-014`                      |
| ADR-0010 | AEO strategy                     | CAN DEFER                                                | `SEO-006`                                   |
| ADR-0011 | Theming token ownership          | CAN DEFER                                                | `THEME-001`+                                |

No ADR in this backlog was invented without a corresponding open item in the SOT or an explicit requirement from this engagement's brief.

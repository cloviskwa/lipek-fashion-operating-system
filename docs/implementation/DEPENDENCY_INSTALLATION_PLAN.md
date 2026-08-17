# Dependency & Installation Plan

**Status:** Provisional (package names/purposes are locked by the SOT where marked LOCKED; exact versions must be re-verified against official docs at bootstrap time per SOT §0.4 before any `pnpm add`)
**Nothing in this document has been installed.** This is the plan; `docs/implementation/dependency-register.md` (created in `FOUND-006`) becomes the live, versioned record once packages are actually added.

Each entry: package/service, purpose, app/module, phase introduced, runtime/dev/infra, version strategy, license note, alternatives if undecided.

---

## 1. Required Immediately (Phase 0–1: Foundation & Commerce Core)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| Node.js 24 LTS | Runtime | all | 0 | infra | Pin via `.node-version`/`engines` (already present) | — | — |
| pnpm | Package manager/workspace | all | 0 | infra | `packageManager` field pin, current `11.16.0` re-verified at bootstrap | MIT | — |
| `@vendure/create` (CLI, not a dependency) | Scaffolds `apps/server` + `apps/storefront` | tooling only | 1 | dev (one-time) | Use current stable at run time | MIT | — |
| `@vendure/core` | Commerce engine | `apps/server` | 1 | runtime | Current stable 3.x (≥3.5.2 baseline per SOT §3.2), lockfile-pinned | GPL-3.0/MIT-dual (verify current Vendure license terms) | None — LOCKED |
| `@vendure/asset-server-plugin` | Local/dev asset storage, later S3-compatible in production | `apps/server` | 1 | runtime | Track Vendure core version | Vendure license | — |
| `@vendure/admin-ui-plugin` (NOT the legacy Angular admin app itself) or `@vendure/dashboard` | Staff backend UI | `apps/server` | 1 | runtime | Current `@vendure/dashboard` (React) only — legacy Angular Admin UI is explicitly forbidden (SOT §0.2) | Vendure license | None — LOCKED to React Dashboard |
| `typeorm` (transitive via Vendure) | ORM/migrations | `apps/server` | 1 | runtime | Version dictated by Vendure core compatibility | Apache-2.0/MIT | — |
| `pg` | PostgreSQL driver | `apps/server` | 1 | runtime | Matches Vendure's supported driver version | MIT | — |
| PostgreSQL (service, not npm package) | Primary database | infra | 1 | infra | Current stable major supported by Vendure; run via Docker Compose locally | PostgreSQL License | None — LOCKED |
| `next` | Storefront framework | `apps/storefront` | 1 | runtime | Version delivered by the **official Vendure Next.js starter** (targets Next.js 16 per SOT §3.1/§52F at time of writing) — do **not** independently pin ahead of what the starter provides | MIT | None — LOCKED (starter-controlled) |
| `react` / `react-dom` | UI runtime | `apps/storefront` | 1 | runtime | Version bundled by the Next.js release above | MIT | — |
| `typescript` | Type safety | all apps/packages | 0 | dev | Latest stable compatible with Next.js + NestJS + Vendure simultaneously | Apache-2.0 | — |
| `tailwindcss` (+ `@tailwindcss/postcss`) | Storefront styling | `apps/storefront`, `packages/ui` | 1 | dev/runtime | v4 CSS-first, matches current prototype's approach (reusable pattern) | MIT | — |
| `eslint` + `eslint-config-next` | Lint | all | 0 | dev | Current major, shared via `packages/config` | MIT | — |
| `prettier` | Format | all | 0 | dev | Current major, shared config | MIT | — |
| GraphQL codegen tooling (e.g. `@graphql-codegen/cli` + Vendure-aware presets) | Generate `packages/graphql` types from Shop/Admin schema | `packages/graphql` | 1 | dev | Verify current Vendure-recommended codegen approach at bootstrap | MIT | — |
| Docker / Docker Compose | Local infra reproducibility | `infra/` | 0 | infra | Current stable | — | — |

---

## 2. Required for Commerce (Phase 1–4)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| `@vendure/payments-plugin` (or provider-specific adapter) | Payment provider abstraction | `apps/server` | 4 | runtime | Track Vendure core | Vendure license | — |
| Stripe SDK (`stripe`) | Payment provider integration | `apps/server` | 4 | runtime | Pending **ADR-0001** | MIT | Regional processor per ADR-0001 |
| PDF generation library (exact package TBD at implementation) | Receipts/invoices/quotes (`DocumentsPlugin`, SOT §14A) | `apps/server` | 4 | runtime | Select during `COM-020`, record in dependency register/ADR | Verify at selection | e.g. `pdf-lib`, `puppeteer`-based rendering, or a hosted document API |
| Email/SMS SDK (provider-specific) | Transactional notifications | `apps/server` (`integrations` plugin) | 4 | runtime | Pending **ADR-0002** | Verify at selection | — |
| Zod | Runtime schema validation | `packages/schemas`, all apps | 1–4 | runtime | Current major (already used in current prototype — reuse) | MIT | — |

## 3. Required for Custom Services (Phase 5–6: Tailoring, Alterations, Laundry)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| Image upload/processing (e.g. `sharp`, already an allowed build in `pnpm-workspace.yaml`) | Reference photos, measurement sheets, garment condition photos | `apps/server` | 5–6 | runtime | Current stable, native build already allow-listed | Apache-2.0 | — |
| Calendar/scheduling utility (exact package TBD) | Fitting/pickup/delivery appointment slot logic | `apps/server` (`appointments` plugin) | 5–6 | runtime | Select during `TAILOR-005`/`ALTER-004`, record in register | Verify at selection | Could be hand-rolled given Vendure's own domain modeling patterns |

## 4. Required for CRM (Phase 7)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| No new third-party CRM SaaS package | CRM is built as a Vendure plugin/domain, not an external dependency (SOT §19A) | `apps/server` (`crm` plugin) | 7 | runtime | N/A | N/A | Explicitly rejected: standalone CRM SaaS, unless a later ADR proves the Dashboard is a constraint |
| Marketing automation trigger library (exact package TBD, likely built on the existing BullMQ job queue rather than a new dependency) | Segmentation/campaign event dispatch | `apps/server` | 7 | runtime | Select during `CRM-009` | Verify at selection | — |

## 5. Required for AI (Phase 9–10)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| `@mastra/core` | Agent/tool orchestration | `apps/ai` | 9 | runtime | Current compatible release | Elastic License 2.0 / verify current terms at install | None — LOCKED |
| `@mastra/memory` | Conversation/thread memory | `apps/ai` | 9 | runtime | Track `@mastra/core` | same family | — |
| `@mastra/rag` | Knowledge ingestion/retrieval | `apps/ai` | 9 | runtime | Track `@mastra/core` | same family | — |
| `@mastra/pg` | Postgres/pgvector storage adapter | `apps/ai` | 9 | runtime | Track `@mastra/core` | same family | — |
| `pgvector` (Postgres extension, not npm) | Vector storage | infra (Postgres) | 9 | infra | Enable extension on the same Postgres instance, logically isolated schema | PostgreSQL-compatible | — |
| `@mastra/mcp` | MCP integration (optional/approved external tools) | `apps/ai` | 10 | runtime | Only if a concrete external tool need arises — do not install speculatively (SOT §0F.3) | same family | — |
| `@mastra/client-js` | Client SDK, only if a non-server context needs direct Mastra client calls | `apps/storefront` (AI BFF only if needed) | 9 | runtime | Only if the BFF pattern requires it | same family | — |
| LLM provider SDK(s) | Model inference | `apps/ai` | 9 | runtime | Pending **ADR-0005** | Provider-specific | — |

## 6. Required for Search (Phase 8)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| Vendure `DefaultSearchPlugin` | Bundled with `@vendure/core` | `apps/server` | 1 (launch baseline) | runtime | Track Vendure core | Vendure license | — |
| OpenSearch client (exact package TBD) | Advanced/hybrid search adapter | `apps/server` (custom search plugin) | 8 | runtime | Select during `SEARCH-005`, pending **ADR-0004** hosting decision | Verify at selection | — |

## 7. Required for Production (Phase 11)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| `@vendure/job-queue-plugin` (BullMQ strategy) | Production job queue | `apps/server` | 11 (may pull forward if multi-queue load appears earlier) | runtime | Track Vendure core | Vendure license | — |
| `bullmq` | Queue engine | `apps/server` | 11 | runtime | Current stable | MIT | — |
| Redis (service) | Queue/cache backing store | infra | 11 | infra | Current stable | BSD/RSAL — verify current Redis licensing terms at selection | Valkey (open fork) if Redis licensing is a concern |
| S3-compatible SDK | Production object storage | `apps/server` | 11 (or earlier if asset volume demands it) | runtime | Pending **ADR-0003** | Verify at selection | — |
| `@opentelemetry/*` packages | Observability/tracing | `apps/server`, `apps/ai` | 11 | runtime | Current stable, matched to chosen monitoring backend | Apache-2.0 | — |
| Vitest | Unit/integration test runner | all apps/packages | 1 (introduce early, not deferred to 11) | dev | Current stable | MIT | — |
| Playwright | E2E tests | `apps/storefront`, `apps/staff-console-extensions` | 3–4 (introduce with first real user journeys) | dev | Current stable | Apache-2.0 | — |
| axe-core / `@axe-core/playwright` | Accessibility test integration | `apps/storefront` | 3 | dev | Current stable | MPL-2.0 | — |
| k6 | Load/performance testing | infra/CI | 11 | dev/infra | Current stable | AGPL-3.0 (CLI use only, does not affect app licensing) | — |

## 8. Security-Specific Dependencies (MFA, Social Login, Hardening — this engagement's explicit requirement)

| Package/Service | Purpose | App/Module | Phase | Type | Version strategy | License | Alternatives |
|---|---|---|---|---|---|---|---|
| `otplib` (or equivalent current, well-audited TOTP library) | RFC 6238 TOTP MFA factor | `apps/server` (`lipek-security` plugin) | 1 (auth is foundational, pulled into Phase 1 not deferred) | runtime | Verify current best-maintained option at implementation time, record rationale in ADR-0006's linked ADR file | MIT-family, verify | — |
| `@simplewebauthn/server` + `@simplewebauthn/browser` (or equivalent current) | WebAuthn/passkey MFA factor | `apps/server`, `apps/storefront` | 1 | runtime | Verify current release against W3C WebAuthn spec compliance | MIT | — |
| `argon2` (or `bcrypt` if Vendure's native strategy already covers hashing — verify before adding a second hasher) | Password hashing, only if a custom strategy needs its own hashing beyond Vendure's built-in `NativeAuthenticationStrategy` | `apps/server` | 1 | runtime | Confirm against current Vendure native auth internals before introducing a duplicate hasher | Apache-2.0 (argon2) | — |
| Rate-limiting middleware (exact package TBD — e.g. a NestJS-compatible limiter) | API/auth endpoint rate limiting | `apps/server` | 1 | runtime | Select during `SEC-005`, record in register | Verify at selection | — |
| Dependency scanning tool (e.g. `pnpm audit`, GitHub Dependabot/CodeQL, or Snyk) | Automated security scanning (SOT §0.2) | CI | 0–1 | dev/infra | Prefer built-in `pnpm audit` + GitHub-native tooling before adding a paid third-party scanner | — | Snyk if deeper coverage is later justified |

## 9. Optional / Future

| Package/Service | Purpose | App/Module | Phase | Type | Notes |
|---|---|---|---|---|---|
| Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`) | Customer mobile app shell | `apps/mobile/customer` | 3/11 | runtime | Pending ADR-0007; existing disconnected `mobile-wrapper/` scaffold already implies this direction for the customer app |
| React Native / Expo | Delivery app native shell | `apps/mobile/delivery` | 6/11 | runtime | Pending ADR-0007 |
| Push notification service (FCM/APNs via a unifying SDK) | Mobile push | `apps/mobile/*`, `apps/server` | 11 | runtime | Provider selection follows ADR-0007 |
| Feature flag service/library | Controlled rollout (SOT §46) | `apps/server`, `apps/storefront` | 11 | runtime | Evaluate a lightweight self-hosted approach (DB-backed flags via Vendure Settings Store) before adding a third-party flag SaaS |
| Visual search / image embedding model | Future AI feature (SOT §17.1, §28) | `apps/ai` | Future (beyond Phase 10) | runtime | Explicitly future per SOT §47 |

---

## 10. Dependency Register Discipline

Per SOT §0.2, every package added during implementation must be recorded in `docs/implementation/dependency-register.md` with: package name, purpose, exact version, license, owning module, and upgrade notes. This plan is the *pre-installation* map; the register is the *live, post-installation* record. No agent may install a package "because it exists" without a recorded purpose (SOT §52E).

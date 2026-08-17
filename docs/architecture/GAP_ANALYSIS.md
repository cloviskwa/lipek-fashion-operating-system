# Gap Analysis — Current Repository vs. LIPEK Master Source of Truth

**Status:** Authoritative
**Basis:** [`CURRENT_REPOSITORY_ASSESSMENT.md`](CURRENT_REPOSITORY_ASSESSMENT.md) vs. `public/docs/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md`

Each item is classified into exactly one of:

`REUSABLE` · `REFACTOR` · `PARTIAL` · `MISSING` · `CONFLICT` · `OBSOLETE` · `DECISION`

---

## 1. Repository / Monorepo Architecture

| Item | Classification | Notes |
|---|---|---|
| pnpm as package manager | REUSABLE | Already pinned; carry forward. |
| `apps/`, `packages/`, `infra/`, `scripts/` monorepo layout (SOT §0A) | MISSING | Repo is single-package today. |
| `pnpm-workspace.yaml` workspace globs | MISSING | File exists but declares no `packages:`. |
| `AGENTS.md` / `CLAUDE.md` | MISSING | Required by SOT §0D and §48A Phase 0. |
| Current Next.js app as `apps/storefront` seed | REFACTOR | Route/IA/design-token value retained; app itself must be re-bootstrapped from the official Vendure Next.js starter (see §5). |

## 2. Documentation (SOT §0D)

| Item | Classification | Notes |
|---|---|---|
| `docs/architecture/*`, `docs/domains/*`, `docs/api/*`, `docs/implementation/*`, `docs/testing/*`, `docs/operations/*`, `docs/adr/*` | MISSING | This engagement creates the first layer (`architecture/`, `implementation/`); remaining domain/api/testing/operations docs are scheduled in the plan (see [`DOCUMENTATION_MAP.md`](../implementation/DOCUMENTATION_MAP.md)). |
| `README.md` | REFACTOR | `Readme.md` exists (note casing) but describes the old static-JSON prototype, not the platform. Must be rewritten once the monorepo lands. |
| `public/docs/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` location | CONFLICT | Publicly servable under Next.js `public/`; SOT explicitly forbids client exposure. Must move to a private path (e.g. `docs/internal/` or repo root outside any `public/` folder) before any deploy. |
| `CHANGELOG.md` | REUSABLE | Format is fine; keep appending. |

## 3. Commerce Backend (SOT §3.2, §4)

| Item | Classification | Notes |
|---|---|---|
| Vendure Core / NestJS server | MISSING | Zero backend exists. |
| PostgreSQL | MISSING | No database anywhere in the repo. |
| Product/variant/collection/facet catalog | MISSING | `src/content/shop/*.json` is static placeholder copy, not a catalog. |
| Cart / checkout / payments / orders | MISSING | No commerce logic exists; `BookingForm`/`ContactForm` are unwired client forms. |
| Inventory | MISSING | — |
| Vendure React Dashboard | MISSING | — |
| Vendure Admin API / Shop API | MISSING | — |

## 4. Backend-Editable Content (SOT §0B)

| Item | Classification | Notes |
|---|---|---|
| `LipekContentPlugin` custom entities (ContentPage, Banner, FaqItem, PolicyDocument, Article, StoreLocation, Testimonial, ServiceDefinition, NavigationMenu) | MISSING | — |
| Current `src/content/*.json` (services, process, gallery, faq, legal, blog, testimonials, shop, data) | CONFLICT | Directly violates SOT §0B ("staff must be able to manage without code") — content is developer-only, committed to source control. Valid only as **seed/fixture data** feeding the future CMS entities, never as the production data source. |
| Homepage backend-driven composition (SOT §5A) | MISSING | Current homepage sections (`Hero`, `ServiceCardGrid`, etc.) are hard-coded React trees reading local JSON, not backend-managed page sections. |
| Navigation (`NAV_LINKS`, `FOOTER_LINK_GROUPS` in `src/lib/config/site.ts`) | CONFLICT | Hard-coded in source per SOT §52E ("do not hard-code catalog categories/navigation"). Must become `NavigationMenu`/`NavigationItem` entities. |
| Storefront cache invalidation (SOT §0B.4) | MISSING | Not applicable yet (nothing to invalidate against); becomes required once content is backend-driven. |

## 5. Services (Tailoring / Alterations / Laundry) (SOT §9A–§13)

| Item | Classification | Notes |
|---|---|---|
| Marketing/informational pages (`/services/custom-tailoring/*`, `/services/alterations`, `/services/laundry`) | REUSABLE | Good IA and copy structure to keep as the storefront shell; content becomes backend-driven `ServiceDefinition` records instead of JSON. |
| Tailoring configurator, measurement profiles, fitting appointments, production state machine | MISSING | No workflow/state logic exists anywhere. |
| Alteration request/quote/tracking workflow | MISSING | `BookingForm` collects no alteration-specific data and posts nowhere. |
| Laundry booking/tracking workflow | MISSING | Same as above. |
| `TailoringPlugin` / `AlterationsPlugin` / `LaundryPlugin` / `AppointmentsPlugin` | MISSING | — |

## 6. Customer Accounts, Auth, Security (SOT §7, §38, §52C + this engagement's MFA/social-login/hardening requirement)

| Item | Classification | Notes |
|---|---|---|
| Customer authentication (any form) | MISSING | No login/register flow exists. |
| MFA (TOTP/WebAuthn) | MISSING | No sibling `/dev` project has a reusable MFA implementation either — see [`ADR_BACKLOG.md`](../implementation/ADR_BACKLOG.md) ADR-0006. |
| Social login (Google, Apple) | MISSING | No OAuth wiring in this repo or sibling repos found during this audit. |
| RBAC / staff roles & permissions | MISSING | No staff backend exists at all yet. |
| Audit logging | MISSING | — |
| Security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) | REUSABLE | Good baseline in `next.config.mjs`; carry forward and extend with CSP once dynamic origins (Vendure API, AI endpoint, payment provider, OAuth) are known. |
| `.well-known/security.txt` | REUSABLE | Keep and keep current with real contact details. |
| `.well-known/assetlinks.json`, `apple-developer-merchantid-domain-association` | PARTIAL | Placeholder stubs anticipating Android App Links / Apple Pay; must be regenerated with real values once app signing and payment-provider ADRs are resolved. |
| Secrets management (`.env` contract) | MISSING | No `.env.example`, no documented environment variables yet. |

## 7. AI (SOT §23A–§31)

| Item | Classification | Notes |
|---|---|---|
| Mastra service (`apps/ai`) | MISSING | — |
| RAG / pgvector | MISSING | — |
| Any AI chat UI or endpoint | MISSING | — |

## 8. CRM / Customer 360 / Loyalty (SOT §19A–§20)

| Item | Classification | Notes |
|---|---|---|
| `CrmPlugin`, `LoyaltyPlugin` | MISSING | — |
| Customer 360 aggregation | MISSING | — |

## 9. Search (SOT §16A–§17)

| Item | Classification | Notes |
|---|---|---|
| Vendure `DefaultSearchPlugin` | MISSING | No backend to attach it to. |
| Client-side filtering on `/shop` | REFACTOR | Any current filtering (if present) is over static JSON; must be replaced with the Vendure search GraphQL contract per SOT §16A. |
| OpenSearch / semantic search | MISSING (later phase per SOT) | Correctly out of scope for now — do not introduce prematurely (SOT §52E). |

## 10. Search Engine & Answer Engine Optimization (SOT §36 + this engagement's explicit AEO requirement)

| Item | Classification | Notes |
|---|---|---|
| `sitemap.ts`, `robots.ts`, JSON-LD builders (`LocalBusiness`, `FAQ`, `Article`, `Breadcrumb`) | REUSABLE | Strong foundation; port pattern into the new storefront against backend-sourced data. |
| Per-page SEO fields (title/meta/canonical/OG) via `Metadata` builder | REUSABLE | Pattern is right; must become editable per-page (SOT `SeoMetadata`/SEO custom fields, §0B.3) rather than derived only from static JSON. |
| AEO (`llms.txt`, machine-readable FAQ/knowledge endpoints, structured Q&A optimized for AI answer engines) | MISSING | Not addressed anywhere in the current repo; new requirement layered on top of SOT §36 — see plan Phase 3/9 AEO tasks. |

## 11. Progressive Web App & Native Apps (SOT §35 + this engagement's explicit app-readiness requirement)

| Item | Classification | Notes |
|---|---|---|
| `src/app/manifest.ts` | PARTIAL | Declares name/icons/theme colors only; no service worker registered by the Next.js app, no offline strategy, no install-prompt UX. |
| `mobile-wrapper/` (Capacitor Android/iOS scaffold) | DECISION | Present but structurally disconnected from the current app (no build/sync script, no shared config). Whether to resume Capacitor-wrapping the PWA, or use a different native strategy for the **customer app, delivery/courier app, and staff/admin app** (three distinct audiences per this engagement's requirement), is an open ADR — see ADR-0007. |
| Push notifications | MISSING | — |
| App store readiness (icons, splash, signing, store listings) | MISSING | — |

## 12. Theming — Dark/Light Mode (this engagement's explicit requirement)

| Item | Classification | Notes |
|---|---|---|
| `src/styles/variables.css` design tokens | REUSABLE | Good token foundation (color/type/spacing/radius) to extend with light/dark token pairs. |
| Dark/light theme system (tokens, `prefers-color-scheme`, manual toggle, persistence) | MISSING | Not implemented anywhere; no theme provider, no CSS custom-property scheme switching. |
| Dashboard/admin theming | MISSING | No dashboard exists yet; must be planned alongside Vendure Dashboard extension work. |

## 13. Analytics, Events, Observability (SOT §40–§42)

| Item | Classification | Notes |
|---|---|---|
| Event bus / domain events | MISSING | — |
| Analytics event pipeline | MISSING | — |
| Observability (OpenTelemetry, tracing, monitoring) | MISSING | — |

## 14. Testing (SOT §43)

| Item | Classification | Notes |
|---|---|---|
| Unit/integration/E2E/a11y/performance tests | MISSING | No test runner, no test file, in the entire repository. |
| Deleted `tests/lighthouse-config.json` | OBSOLETE | Belonged to the old static-HTML build pipeline; superseded by the Playwright/Vitest/axe/k6 baseline defined in SOT §0F.4. |

## 15. CI/CD, Hosting, Infrastructure (SOT §44, §52A)

| Item | Classification | Notes |
|---|---|---|
| CI pipeline | MISSING | No `.github/workflows` or equivalent. |
| `netlify.toml` / `vercel.json` / `.htaccess` (deleted in working tree) | OBSOLETE, pending DECISION | Both target platforms are serverless/static-hosting oriented and cannot natively host a persistent Vendure Server + Worker + Postgres + Redis topology. Do not restore until the hosting ADR (ADR-0009) is resolved; the final choice may still involve a CDN/edge layer in front of a container/VM-hosted backend, which is compatible with keeping a trimmed static-hosting config for the storefront only. |
| Docker / Docker Compose local infra | MISSING | — |
| Feature flag system (SOT §46) | MISSING | — |

## 16. Deleted Legacy Scaffold

| Item | Classification | Notes |
|---|---|---|
| `public/**/*.html`, `src/pages/*`, `src/includes/*`, `tools/*.js`, `config/*.config.js`, `app/android`, `app/ios`, `app/pwa` (pre-rename) | OBSOLETE | Fully superseded by the Next.js rebuild; the pending deletions in `git status` are correct and should be committed as part of Phase 0 cleanup, not resurrected. |

---

## Summary Counts

| Classification | Approx. item count | Interpretation |
|---|---|---|
| REUSABLE | 10 | Design tokens, IA/route structure, SEO/JSON-LD pattern, security headers baseline, `security.txt`, pnpm/Node toolchain, CHANGELOG format |
| REFACTOR | 4 | Storefront app re-bootstrap, `README.md`, service marketing pages, client-side search |
| PARTIAL | 2 | Manifest/PWA, App Links/Apple Pay stubs |
| MISSING | ~45 | Nearly the entire platform: commerce, CMS, services, auth/MFA, AI, CRM, search backend, AEO, native apps, theming, observability, testing, CI/CD |
| CONFLICT | 4 | Static JSON as "content management", hard-coded navigation, SOT document publicly servable, Next.js/React version pin vs. locked Vendure starter version |
| OBSOLETE | 3 groups | Deleted static-HTML scaffold, deleted Netlify/Vercel configs pending hosting ADR, deleted Lighthouse test config |
| DECISION | 2 | Mobile/native app strategy (`mobile-wrapper` fate), hosting platform |

**Interpretation:** this is a green-field platform build with a small, genuinely useful design/IA/SEO seed. The implementation plan must not attempt to incrementally evolve the current Next.js app's *architecture* — it must re-bootstrap from the official Vendure Next.js starter and migrate the reusable presentation assets into it deliberately (see [`TARGET_REPOSITORY_STRUCTURE.md`](TARGET_REPOSITORY_STRUCTURE.md) §6, Migration Plan).

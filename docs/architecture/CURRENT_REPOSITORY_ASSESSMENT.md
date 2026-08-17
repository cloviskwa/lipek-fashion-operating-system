# Current Repository Assessment

**Status:** Authoritative (as of this audit)
**Audit date:** 2026-08-17
**Scope:** `C:\Users\KWA\dev\LIPEK FASHION` working tree, compared against `public/docs/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` ("the source of truth" / SOT).
**Method:** Full recursive inspection of tracked/untracked files, `package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`, `Readme.md`, `CHANGELOG.md`, and `git status`. No sibling repository was modified.

---

## 1. Executive Summary

The repository currently contains **one static-content Next.js marketing site** for a bespoke tailoring business. It is a well-built, modern brochure site — but it is **not** the LIPEK Intelligent Fashion Commerce & Services Platform described in the source of truth. There is no commerce engine, no database, no admin backend, no authentication, no AI service, no CRM, and no monorepo. The gap between "what exists" and "what the SOT requires" is total at the platform-architecture level, while being genuinely reusable at the design/content/SEO level.

The repository is also **mid-migration**: `git status` shows the previous static-HTML scaffold (`public/*.html`, `src/pages`, `src/includes`, `tools/`, `config/`, `netlify.toml`, `vercel.json`) as deleted, and a new Next.js App Router tree as untracked. This is a prior, incomplete rebuild (documented in `CHANGELOG.md`) that intentionally modeled itself on a sibling project (`digital2moro-platform`), not yet on the LIPEK source of truth. None of this has been committed yet.

**Bottom line:** treat the current tree as a **design/content prototype and a discardable technical prototype for the storefront's presentation layer**, not as a foundation to incrementally extend into Vendure/NestJS/Mastra. The commerce and platform engineering work starts from zero.

---

## 2. What Currently Exists

### 2.1 Application

| Item | Detail |
|---|---|
| Framework | Next.js `^15.5.4`, App Router, React 19, TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, no JS config bridge), custom design tokens in `src/styles/variables.css` |
| Package manager | pnpm (`packageManager: pnpm@11.16.0`), single-package repo — **no `pnpm-workspace.yaml` packages defined** (the file only sets `allowBuilds`) |
| Rendering | Fully static — content is read from local JSON at build time via `src/lib/content/reader.ts` (`server-only`), pages use `generateStaticParams` |
| Routes | `/`, `/about`, `/services` (+ custom-tailoring sub-pages, alterations, laundry), `/process`, `/gallery`, `/shop`, `/book-fitting` (+ calendar/confirmation), `/testimonials` (+ video), `/blog` (+ category/slug), `/faq` (+ slug), `/contact` (+ location/wholesale/thank-you), `/legal/[slug]` |
| Components | `layout/` (Header, Footer, Breadcrumbs), `sections/` (Hero, ServiceCardGrid, ProcessSteps, FaqAccordion, GalleryGrid, TestimonialCard, BlogPostCard, Newsletter, PageHeader), `ui/primitives/` (Container, Section, Cta, Card, Badge), `forms/` (BookingForm, ContactForm — client components, no backend submission target), `schema/JsonLdScript.tsx` |
| Content | JSON files under `src/content/{services,process,gallery,faq,legal,blog,testimonials,shop,data}` — all placeholder copy for a fictional business per `Readme.md` |
| SEO | `src/lib/seo/metadata.ts` (Next `Metadata` builder), `src/lib/schema/builders.ts` (JSON-LD: LocalBusiness, FAQ, Article, Breadcrumb), `src/app/sitemap.ts`, `src/app/robots.ts` |
| PWA | `src/app/manifest.ts` (name/short_name/theme_color/icons only — no service worker registered in `src/app`) |
| Security headers | `next.config.mjs` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` — a reasonable baseline, nothing more |
| Lint/format | ESLint 9 flat config (`eslint.config.mjs`), Prettier 3, `tsc --noEmit` |
| `.well-known/` | `assetlinks.json` (Android App Links stub), `apple-developer-merchantid-domain-association` (Apple Pay domain stub), `security.txt`, an ACME challenge placeholder — evidence of prior intent to support Apple Pay / Android app-linking, not wired to any current app |

### 2.2 Non-application artifacts

| Item | Detail |
|---|---|
| `mobile-wrapper/` | Untracked. Capacitor scaffold: `android/app`, `android/build.gradle`, `ios/App/App.xcodeproj`, `capacitor.config.json`, `pwa/sw.js`, `pwa/icons`. Renamed from the previous `app/` (collided with Next's `app/` router convention). **Not integrated with the current Next.js app** — no `pnpm` script builds or syncs it. |
| `public/docs/` | Untracked. Contains `LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` (the SOT itself — **must not remain publicly servable** under `/docs/...`, see [Gap Analysis](GAP_ANALYSIS.md)) and a `.docx` product/category reference (plus its Office lock file `~$pek...docx`, which should not be committed). |
| `CNAME`, `LICENSE` | Present at repo root, untouched by the current diff. |
| `.vscode/` | Editor settings/extension recommendations. |

### 2.3 Deleted-but-still-relevant (previous scaffold, per `git status`)

A prior static-HTML/vanilla-JS/"includes" build system existed (`public/**/*.html`, `src/pages`, `src/includes`, `tools/*.js` build scripts, `config/*.config.js`, `netlify.toml`, `vercel.json`, `.htaccess`). It is fully superseded by the Next.js rebuild described above and should be treated as **historical only** — do not resurrect it. Its route inventory (services, legal pages, FAQ, gallery, etc.) is useful as a checklist that the new Next.js route tree already covers equivalently.

### 2.4 Git state

- Branch `main`, one commit (`3dbfc14 initial commit`) — i.e. the "initial commit" already contains the *old* scaffold, and the working tree holds the *uncommitted* Next.js rebuild plus deletions. **Nothing described in section 2.1–2.2 is committed yet.**
- No `.env*` files present (none tracked, none untracked found) — no secrets at risk currently, but also no environment-variable contract established.
- No CI configuration (`.github/workflows` absent).
- No test files or test runner configured anywhere in the tree.

---

## 3. What Does Not Exist (relative to the SOT)

Everything in this list is a **hard requirement of the source of truth with zero current implementation**:

- Monorepo layout (`apps/`, `packages/`, `infra/`, `scripts/`, `AGENTS.md`, `CLAUDE.md`) — SOT §0A
- Vendure Core, NestJS, PostgreSQL, any transactional database — SOT §3.2
- Vendure React Dashboard / any staff-facing admin backend — SOT §20A, §21
- Any product catalog, cart, checkout, payments, orders, inventory — SOT §4
- `LipekContentPlugin` or any backend-editable CMS — everything in `src/content/*.json` today is **source-controlled, developer-only content**, which directly contradicts SOT §0B ("staff must be able to operate the platform from the backend without touching code")
- Tailoring, Alterations, Laundry operational workflows/state machines — SOT §9A–§13
- Customer accounts, authentication, sessions — SOT §7, §38
- MFA, social login (Google/Apple), RBAC, audit logs — SOT §22, §38 (and this engagement's explicit additional requirement)
- CRM, Customer 360, Loyalty — SOT §19A–§20
- Search beyond static Next.js routing (no Vendure search, no OpenSearch) — SOT §16A–§17
- Mastra AI service, RAG, agents, tools — SOT §23A–§31
- Redis/BullMQ, object storage, event bus, background jobs — SOT §38A–§40
- Analytics/event pipeline, observability stack — SOT §41–§42
- Test suite of any kind (unit/integration/E2E/a11y/perf) — SOT §43
- CI/CD pipeline — SOT §44
- Backup/DR procedures — SOT §45
- Feature flag system — SOT §46
- A functioning PWA (manifest exists; no service worker, no offline strategy, no install prompt wired) and no working native app packaging (Capacitor scaffold present but disconnected) — SOT §35 and this engagement's explicit mobile-readiness requirement
- Dark/light theme system — no theme tokens, no `prefers-color-scheme` handling, no toggle, anywhere in the current CSS
- AEO (answer-engine optimization) — sitemap/robots/JSON-LD exist (good SEO foundation) but nothing targets AI answer engines specifically (no `llms.txt`, no machine-readable Q&A/knowledge endpoints)
- Documentation set required by SOT §0D (`docs/architecture/*`, `docs/domains/*`, `docs/api/*`, `docs/implementation/*`, `docs/testing/*`, `docs/operations/*`, `docs/adr/*`) — this audit is the first step toward closing that gap

---

## 4. Retained vs. Rebuilt Assessment

| Asset | Verdict | Rationale |
|---|---|---|
| Visual/brand design tokens (`src/styles/variables.css`), typography choice (Montserrat/Playfair) | **Retain, migrate as reference** | No architectural conflict; feed into `packages/ui` design system and dark/light theme token work. |
| Route inventory / information architecture (About, Services incl. sub-categories, Process, Gallery, FAQ, Legal, Testimonials, Blog, Contact) | **Retain as UX baseline** | Matches SOT's storefront intent for the tailoring/alterations/laundry marketing surface; becomes the initial page shell in `apps/storefront`, now rendered from backend content instead of local JSON. |
| SEO/JSON-LD patterns (`metadata.ts`, `builders.ts`, `sitemap.ts`, `robots.ts`) | **Retain pattern, rewire data source** | The *approach* is correct (typed metadata builder, JSON-LD graph merge); the *data source* must move from static JSON to Vendure/`LipekContentPlugin` APIs. |
| `src/content/*.json` copy | **Retain as seed/fixture data only** | Explicitly placeholder per `Readme.md`. Useful as seed data / content-authoring reference for the CMS entities, never as production data source. |
| Component primitives (`Container`, `Section`, `Cta`, `Card`, `Badge`) | **Retain, promote into `packages/ui`** | Reasonable, reusable UI primitives; low risk, high reuse value once theming/dark-mode tokens are added. |
| `BookingForm`, `ContactForm` | **Rebuild** | Currently client components with no submission target/backend; must be rebuilt against real Appointments/CRM/Contact APIs. |
| `mobile-wrapper/` (Capacitor) | **Requires ADR before reuse** | Not integrated with the current app; unclear if Capacitor-wrapping the Next.js PWA is the final mobile strategy vs. a dedicated native/React Native client for staff/delivery apps. See ADR backlog. |
| Next.js 15 / React 19 pin | **Conflicts with SOT** | SOT §0.3 locks the storefront to the **official Vendure Next.js starter**, which "currently targets Next.js 16" (§3.1, §52F). The existing app must be re-bootstrapped from that starter, not upgraded in place, to inherit Vendure's Shop API wiring. |
| `public/docs/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` location | **Conflicts with SOT** | The SOT is explicitly internal-only ("Do not provide this technical version to the client unless explicitly requested"). Living under `public/` makes it web-servable at `/docs/...` in the current static site. Must move to a non-public path (e.g. repo-root `docs/` is already the convention this plan uses) before any deployment. |
| Deleted static-HTML scaffold (`public/*.html`, `src/pages`, `src/includes`, `tools/`) | **Obsolete, do not restore** | Fully superseded; the deletions in `git status` are correct and should be committed once the rest of the migration is staged. |
| `netlify.toml`, `vercel.json`, `.htaccess` (deleted) | **Obsolete pending hosting ADR** | Hosting provider is `UNDECIDED` per SOT §0.3; do not restore either config until an infrastructure ADR selects a target platform capable of running Vendure Server + Worker + Postgres + Redis (neither Netlify nor Vercel serverless functions are suitable for the persistent Vendure server/worker processes without a dedicated backend host). |

---

## 5. Toolchain Verification

| Requirement (SOT) | Current repo | Status |
|---|---|---|
| Node.js 24 LTS | `.node-version` = `24`, `package.json engines.node` = `24.x` | ✅ Matches SOT §0.4 |
| pnpm workspace manager | `packageManager: pnpm@11.16.0`, but `pnpm-workspace.yaml` has no `packages:` entries | ⚠️ Needs monorepo `packages:` glob (SOT §0A) |
| TypeScript strict | `tsconfig.json` `"strict": true` | ✅ |
| Git repository | Present, `main` branch, clean-enough history (1 commit) | ✅ Safe to build on |

---

## 6. Risks Observed During Audit

1. **Uncommitted destructive diff.** The working tree currently shows the entire previous scaffold as deleted and the new app as untracked. Until this is committed, a careless `git checkout`/`git clean` would destroy the new work. No destructive git command was run during this audit.
2. **Source-of-truth exposure.** `public/docs/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` is inside the Next.js `public/` directory, which Next.js serves verbatim. If this app is ever deployed as-is, the internal technical document (and the Office lock file `~$pek...docx`) would be publicly downloadable. This is flagged as a P0 item, not deferred to a later phase.
3. **No secrets found** — good current state, but there is also no `.env.example`/environment contract yet, so this must be established before any credentialed service (database, payment provider, OAuth) is introduced.

---

## 7. Conclusion

The repository is a clean, small, well-organized *storefront presentation prototype* with zero platform/commerce/backend/AI/security substance relative to the source of truth. It is safe and useful to mine for design tokens, route/IA structure, and SEO patterns, but the actual engineering program described in the source of truth — Vendure, NestJS, PostgreSQL, the Dashboard, Mastra, CRM, tailoring/alterations/laundry workflows, authentication/MFA, mobile packaging, and dark/light theming — starts from an empty foundation. See [`GAP_ANALYSIS.md`](GAP_ANALYSIS.md) for the item-by-item classification and [`TARGET_REPOSITORY_STRUCTURE.md`](TARGET_REPOSITORY_STRUCTURE.md) for the destination architecture and migration plan.

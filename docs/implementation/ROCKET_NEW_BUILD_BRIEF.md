# LIPEK Platform — External Build Brief (rocket.new)

**Status:** Derived
**Precedence:** Subordinate to `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` ("the SOT") and to `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` ("the master plan"). Where this brief is silent, those govern. Where this brief appears to contradict them, they win and the contradiction is a bug in this brief.
**Audience:** An external AI application builder (rocket.new) producing the LIPEK platform's user interface layer.
**Repository:** `https://github.com/cloviskwa/lipek-fashion-operating-system.git` (private)
**Fidelity contract:** `docs/implementation/repo-manifest.json` + `scripts/verify-manifest.mjs`

---

## Contents

| § | Section | What it settles |
| --- | --- | --- |
| [0](#0-how-to-use-this-brief) | How to use this brief | Scope, non-negotiables, precedence, what to do without repo access |
| [1](#1-the-product-in-one-page) | The product in one page | The four business lines and the two success statements |
| [2](#2-hard-rules) | Hard rules | The never/always list you are held to |
| [3](#3-repository-contract) | Repository contract | Exact tree, the fidelity manifest, where you may add files |
| [4](#4-locked-technology-and-exact-versions) | Locked technology | Pinned versions and the rule for adding dependencies |
| [5](#5-storefront-architecture-conventions) | Storefront conventions | Feature/route/i18n structure the tests enforce |
| [6](#6-data-contract-and-the-mock-adapter) | Data contract | How to ship a full demo without hard-coding business content |
| [7](#7-catalog-taxonomy--the-exact-structure) | Catalog taxonomy | Men/Women/Children trees, collections, facets, filters |
| [8](#8-route-map) | Route map | Every URL you must produce |
| [9](#9-screen-specifications) | Screen specifications | Homepage sections, PLP, PDP, checkout, account, all three service flows |
| [10](#10-design-system) | Design system | `#0DABDA` palette, the rounding contract, type, motion |
| [11](#11-staff-back-office) | Staff back office | Dashboard extension screens per plugin |
| [12](#12-pwa-mobile-and-offline) | PWA and mobile | Installable web app, Capacitor shell, courier app |
| [13](#13-ai-surfaces-ui-only) | AI surfaces | Chat, stylist, approvals — UI only, flag-gated |
| [14](#14-documentation-reproduction) | Documentation | What to copy verbatim, what to write |
| [15](#15-what-this-build-satisfies-in-the-master-plan) | Task mapping | Which of the 168 planned tasks this delivers |
| [16](#16-acceptance-criteria) | Acceptance criteria | The checks your handover must pass |
| [17](#17-delivery) | Delivery | Branch, commits, pull request, handover |
| [A](#appendix-a--showcase-catalog-specification) | Showcase catalog | The demo data to build |
| [B](#appendix-b--glossary-and-key-source-references) | Glossary | Terms, SOT sections, official docs |
| [C](#appendix-c--directory-structure) | Directory structure | Generated directory tree |
| [D](#appendix-d--file-manifest-sha-256) | File manifest | Generated SHA-256 list of all 451 files |

---

## 0. How to use this brief

### 0.1 What you are building

LIPEK is not a web shop. It is a fashion **commerce and services operating system**: retail commerce, custom tailoring, alterations, and laundry/dry-cleaning, unified behind one customer account, one staff back office, and one set of APIs.

An engineering repository for this platform **already exists** and is the thing you are extending. It contains a working pnpm monorepo, a bootstrapped Vendure 3.7.2 commerce server, the official Vendure Next.js 16 storefront starter, a security plugin, thirteen accepted architecture decision records, and a complete documentation tree. None of that is a suggestion or a starting sketch — it is the shape of the product, already decided, already committed, already reviewed.

Your job is the **entire user interface layer** on top of it:

| You build | You do not build |
| --- | --- |
| The customer storefront: every page, every flow, every state | Vendure plugins' server-side business logic, entities, migrations |
| The staff back-office screens, as Vendure Dashboard extensions | Real payment processing, real auth/MFA cryptography, real webhooks |
| The PWA shell and the mobile app shells | Database schema, seed migrations, background job workers |
| The AI chat / stylist / approval-queue interfaces (UI only) | Any live LLM call, any model provider integration |
| The complete design system as shared tokens and components | Anything that requires a secret to run |

Backend wiring is done by the LIPEK team after your handover. Your output must therefore be **structured so that wiring is a substitution, not a rewrite** — see §6.

### 0.2 Non-negotiables, in order

1. **Reproduce the repository exactly.** Every file in `docs/implementation/repo-manifest.json` must exist in your output with identical content. Not "equivalent". Identical. §3 explains the mechanism and the one command that proves it.
2. **Reproduce the documentation exactly.** `docs/**`, `AGENTS.md`, `CLAUDE.md`, `README.md`, and every ADR are copied verbatim. Do not summarize, reformat, "improve", regenerate, or translate them. §14.
3. **Add only where you are permitted to add.** §3.3 lists the directories where new files may be created. Everywhere else is read-only to you.
4. **Never hard-code business content into a component.** Categories, navigation, tags/filters, promotions, prices, policies, service definitions, FAQs — all of it is backend-owned data that staff edit without a developer. This is the single most-repeated rule in the LIPEK source of truth and the most common way an otherwise good build fails acceptance. §2, §6.
5. **The storefront is a renderer, never a system of record.** SOT §3.1.
6. **The staff back office is the Vendure Dashboard, extended — never a separate admin application.** SOT §20A, `ADR-0013`. §11.

### 0.3 Precedence when sources disagree

```text
1. docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md   (business intent + mandatory architecture)
2. Accepted ADRs (docs/adr/ADR-0001 ... ADR-0013)
3. This brief and the other derived docs (docs/architecture, docs/api, docs/implementation)
4. Tests and schemas
5. Current code
```

For **files that already exist**, the repository wins over this brief — copy the file, do not "correct" it. For **new UI that does not exist yet**, this brief is the specification.

### 0.4 If you cannot clone the repository

This brief is written to be self-sufficient. Sections 3–16 contain the full structure, taxonomy, routes, screens, design system, and acceptance criteria needed to build correct UI with no repository access at all. If you cannot read the repository, build from this brief alone and mark every file you could not copy verbatim in your handover notes, so the LIPEK team can reconcile. Do **not** invent replacements for documents you could not read.

---

## 1. The product in one page

LIPEK combines four business lines behind a single account, a single cart/payment spine, and a single staff back office.

| Business line | What the customer does | Where its logic lives |
| --- | --- | --- |
| **Fashion commerce** | Shops clothing, footwear, jewelry, watches, bags, accessories for men, women and children | Vendure Core (native `Product`/`ProductVariant`/`Collection`/`Facet`) |
| **Custom tailoring** (flagship) | Configures a made-to-measure garment across 13 steps, saves measurements, books fittings, pays a deposit, tracks production stage by stage | `TailoringPlugin` + `AppointmentsPlugin` |
| **Alterations** | Selects a garment and an alteration, uploads photos, receives a quote, drops off or books a pickup, tracks the work | `AlterationsPlugin` |
| **Laundry & dry cleaning** | Books a service, lists garments, schedules pickup and delivery, pays, tracks each cleaning stage | `LaundryPlugin` |

Cross-cutting capabilities shared by all four: customer accounts, payments and deposits, receipts/invoices/quotes as generated documents, order **and** service tracking in one place, notifications, CRM and Customer 360, loyalty, inventory, search, analytics, AI assistance, staff operations dashboards, security and RBAC, PWA and native app shells.

The product's own one-sentence definition, from the SOT:

> LIPEK is an intelligent fashion commerce and services platform connecting shopping, custom tailoring, alterations, garment care and AI-assisted personal styling through one unified customer experience.

### 1.1 The two success statements you are building toward

**Customer side** — a customer can discover LIPEK through search or an AI answer engine, find the right product or service quickly, understand it, choose the correct variation, authenticate securely, add to cart or configure a service, pay, receive confirmation and a receipt automatically, track the order or service without calling anyone, receive it, request an exchange or alteration, reach support (human or AI) immediately, and do all of it smoothly on a low-cost mobile device, an installed PWA, or a native app, over an average connection, in light or dark theme.

**Staff side** — LIPEK staff, including couriers on their own app, can see the order, payment, customer, inventory allocation and fulfillment or service status; process the transaction; communicate with the customer; update tracking; issue refunds; review history; manage every service line; operate behind enforced MFA; review AI escalations; and diagnose routine problems **without touching the database or asking a developer**.

Every screen you build is judged against those two paragraphs.

---

## 2. Hard rules

These are adapted from the SOT's §52E "Do Not" list and §0.2 operating rules, which every agent working in this repository is bound by. They are not style preferences.

### 2.1 Never

- **Never hard-code catalog categories** in navigation, menus, footers, or any component. Navigation comes from backend `NavigationMenu`/`NavigationItem` data; categories come from the Vendure `Collection` tree.
- **Never hard-code product tags or filter lists.** Filters are derived from `Facet`/`FacetValue` data returned with search results.
- **Never hard-code homepage promotions, hero copy, banners, testimonials, FAQs, policies, service descriptions or prices.** Staff edit all of it from the back office. The code owns **section component types and rendering rules**; the data owns what appears, in what order, and when.
- **Never build a second admin application.** The Vendure React Dashboard is the back office; you extend it (§11).
- **Never use the deprecated Vendure Angular Admin UI.**
- **Never bypass Vendure to write commerce data directly**, and never duplicate customer/order/payment truth into a second store.
- **Never expose Admin API credentials, tokens or secrets to the browser.** No secret of any kind appears in source, in a component, in a client bundle, or in a committed `.env`. `.env.example` files carry placeholder values only.
- **Never use `any`** across a domain boundary as a shortcut.
- **Never put the source of truth (`docs/internal/`) into any `public/`-servable directory** of any app. This was a P0 fix in this repository's history (`FOUND-004`); do not undo it.
- **Never let the AI UI call a model provider directly from the browser**, and never present an AI write action without a confirmation gate (§13).
- **Never install a dependency without recording it** in `docs/implementation/dependency-register.md` with package, version, purpose, license, owning module.
- **Never mark work complete without tests and documentation.**

### 2.2 Always

- Treat every list, label, price, image and piece of copy on a customer-facing page as **data arriving from an API**, even while that API is mocked (§6).
- Keep Next.js files under `src/app/` thin; substantial behaviour lives in the owning feature (§5).
- Colocate a feature's GraphQL operations and translations with the feature.
- Ship both light and dark treatments for every screen, from the same token set (§10).
- Meet WCAG 2.2 AA on everything you build (§16.4).
- Write conventional commit messages.

---

## 3. Repository contract

### 3.1 The mechanism

The repository ships a machine-checkable fidelity manifest:

- `docs/implementation/repo-manifest.json` — every project file with its byte length and SHA-256 of its **canonical content** (text normalized to LF, binaries raw, so Windows and Linux checkouts hash identically).
- `scripts/verify-manifest.mjs` — re-hashes the working tree and exits non-zero on any file that is missing, changed, or added without being listed.
- `scripts/generate-manifest.mjs` — regenerates the manifest (only the LIPEK team runs this; you never do).

Your reproduction is correct when this passes in your output tree:

```bash
node scripts/verify-manifest.mjs
```

It must report `Manifest verification passed` for every manifest entry, with your new UI files reported as `EXTRA`. Include that command's full output in your handover. The complete manifest is also inlined in **Appendix D** of this document, so it is available even without repository access.

### 3.2 The tree you must produce

```text
lipek-platform/
├── apps/
│   ├── server/                          Vendure Core + NestJS plugins + the aggregate Dashboard build
│   │   ├── docker-compose.yml           Postgres (6543), Redis, Typesense, Elasticsearch profiles
│   │   ├── Dockerfile
│   │   ├── package.json                 @lipek/server
│   │   ├── tsconfig.json
│   │   ├── tsconfig.dashboard.json      includes "src/plugins/**/dashboard/*"
│   │   ├── vite.config.mts              Dashboard build (vendureDashboardPlugin)
│   │   ├── src/
│   │   │   ├── vendure-config.ts
│   │   │   ├── index.ts, index-worker.ts
│   │   │   ├── environment.d.ts
│   │   │   ├── gql/
│   │   │   └── plugins/
│   │   │       ├── lipek-security/      EXISTS: origin allow-list + rate limiting
│   │   │       │   └── dashboard/       YOU ADD: MFA enforcement, audit log viewer
│   │   │       ├── lipek-content/       YOU ADD (dashboard/ only — see §11.1)
│   │   │       ├── tailoring/           YOU ADD (dashboard/ only)
│   │   │       ├── alterations/         YOU ADD (dashboard/ only)
│   │   │       ├── laundry/             YOU ADD (dashboard/ only)
│   │   │       ├── appointments/        YOU ADD (dashboard/ only)
│   │   │       ├── crm/                 YOU ADD (dashboard/ only)
│   │   │       ├── loyalty/             YOU ADD (dashboard/ only)
│   │   │       ├── documents/           YOU ADD (dashboard/ only)
│   │   │       ├── customer-experience/ YOU ADD (dashboard/ only)
│   │   │       ├── analytics-events/    YOU ADD (dashboard/ only)
│   │   │       └── integrations/        YOU ADD (dashboard/ only)
│   │   └── static/                      email templates, local assets
│   │
│   ├── storefront/                      Next.js 16 customer storefront + PWA  <- your main surface
│   │   ├── src/app/                     route wiring only (thin re-exports)
│   │   ├── src/config/                  store-wide values, metadata, JSON-LD builders
│   │   ├── src/features/                vertical commerce capabilities  <- most of your work
│   │   ├── src/platform/                Next.js/i18n/revalidation/Vendure mechanics
│   │   ├── src/site/                    store-specific composition, navigation, branding
│   │   ├── src/components/ui/           generic design primitives (shadcn/base-ui)
│   │   ├── src/hooks/, src/lib/
│   │   ├── tests/                       architecture boundary + i18n tests (must stay green)
│   │   ├── public/
│   │   └── docs/                        storefront architecture + upgrade protocol
│   │
│   ├── mobile/
│   │   ├── customer/                    Capacitor shell around the storefront PWA (ADR-0007)
│   │   ├── delivery/                    Native courier app (React Native/Expo)
│   │   └── staff/                       Placeholder — responsive Dashboard instead
│   │
│   └── ai/                              Mastra service (Phase 9). UI-only for you.
│
├── packages/
│   ├── ui/                              Design system: tokens + primitives  <- §10 lives here
│   ├── shared/                          Domain-neutral utilities
│   ├── schemas/                         Shared Zod contracts
│   ├── graphql/                         Generated GraphQL types/documents
│   ├── config/                          Shared lint/TS/build config
│   └── testing/                         Shared fixtures/test helpers (content + catalog fixtures)
│
├── docs/
│   ├── internal/                        The source of truth. NEVER public, NEVER in any app's public/
│   └── architecture/  domains/  api/  implementation/  operations/  testing/  adr/
│
├── infra/                               docker/ compose/ deployment/
├── scripts/                             repo automation incl. the manifest tooling
├── .well-known/                         ACME, Apple merchant, Android assetlinks, security.txt
├── .vscode/
├── AGENTS.md   CLAUDE.md   README.md   CHANGELOG.md   LICENSE   CNAME
├── package.json   pnpm-workspace.yaml   pnpm-lock.yaml
└── .gitignore   .prettierrc   .prettierignore   .node-version
```

`apps/server` and `apps/storefront` were generated by the official `@vendure/create` scaffold and the official Vendure Next.js starter respectively, and are **preserved as generated** except where a documented reason exists (SOT §0A "Monorepo rule"). Do not restructure them.

### 3.3 Where you may create files

You may create new files **only** under these paths:

| Path | What goes there |
| --- | --- |
| `apps/storefront/src/features/<feature>/**` | New feature modules (routes, components, actions, messages, GraphQL documents) |
| `apps/storefront/src/site/**` | Navigation, footer, header, home composition, branding |
| `apps/storefront/src/components/ui/**` | New generic primitives only when shadcn/base-ui genuinely lacks one |
| `apps/storefront/src/app/[locale]/**` | Thin route files that re-export from a feature (§5.2) |
| `apps/storefront/src/config/**` | Store-wide config, metadata, structured-data builders |
| `apps/storefront/public/**` | Icons, manifest assets, static images, offline page |
| `apps/storefront/tests/**` | New tests |
| `apps/server/src/plugins/<plugin>/dashboard/**` | Dashboard extension screens (§11) |
| `packages/ui/src/**` | Design tokens and shared primitives |
| `packages/testing/fixtures/**` | Showcase/seed fixtures (§6.3) |
| `apps/mobile/customer/**`, `apps/mobile/delivery/**` | App shells |
| `docs/**` | Only the new documents this brief explicitly asks for (§14.3) |

Everywhere else — including every existing file in the manifest — is **read-only**. If you believe an existing file must change, do not change it: list it in your handover notes with the reason.

### 3.4 Files you must not touch, specifically

`docs/internal/**` · `pnpm-lock.yaml` (except as the natural result of a legitimate `pnpm install`) · `apps/storefront/.upgrades/**` · `apps/storefront/scripts/**` · `apps/server/src/vendure-config.ts` · `apps/server/src/plugins/lipek-security/{lipek-security.plugin.ts,origin-allow-list.ts,rate-limit.middleware.ts}` · every ADR · `AGENTS.md` · `CLAUDE.md`.

---

## 4. Locked technology and exact versions

The following are **LOCKED** by SOT §0.3 and may not be substituted, "upgraded for you", or replaced with an equivalent: Vendure Core, NestJS, the Vendure **React** Dashboard, PostgreSQL, Mastra, the GraphQL Shop/Admin APIs, the Next.js App Router storefront, TypeScript end-to-end, and the pnpm workspace.

Versions as installed and locked in this repository (`docs/implementation/dependency-register.md`):

| Package / tool | Version | Notes |
| --- | --- | --- |
| Node.js | 24.x LTS | `.node-version` = 24 |
| pnpm | 11.9.0 | workspace manager; `pnpm-workspace.yaml` globs `apps/*`, `apps/mobile/*`, `packages/*` |
| `@vendure/core`, `@vendure/dashboard`, `@vendure/cli`, `@vendure/asset-server-plugin`, `@vendure/email-plugin`, `@vendure/graphiql-plugin` | 3.7.2 | all pinned exactly |
| PostgreSQL | 16-alpine (Docker), port **6543** locally | deliberately non-default port |
| `next` | 16.3.1 | App Router, RSC |
| `react` / `react-dom` | 19.2.8 | |
| `typescript` | 6.0.3 storefront · 5.8.2 server · 5.9.3 root | per-app pins, `ADR-0012`. **Never adopt TypeScript 7.x.** |
| `tailwindcss` | 4.3.3 | CSS-first v4 (`@theme`), not a `tailwind.config.js` project |
| `@base-ui/react` + `shadcn` | 1.6.0 / 4.14.1 | the storefront's existing primitive library |
| `next-intl` | 4.13.x | i18n, `en` + `de` locales already generated |
| `next-themes` | 0.4.6 | already wired — use it for dark/light, do not add a second theme system |
| `gql.tada` | 1.11.x | typed GraphQL documents against the Shop API |
| `zod` | 4.4.3 | validation |
| `react-hook-form` + `@hookform/resolvers` | 7.82 / 5.4 | forms |
| `embla-carousel-react`, `recharts`, `sonner`, `vaul`, `cmdk`, `lucide-react`, `date-fns` | as locked | carousels, charts, toasts, drawers, command palette, icons, dates |

**Adding a dependency** requires: a real need none of the above covers, a row appended to `docs/implementation/dependency-register.md` (package, exact version, purpose, type, license, "added in" = `ROCKET-BUILD`), and a note in your handover. Prefer zero new dependencies. Never add a UI kit that duplicates shadcn/base-ui, a state library where React state suffices, a second icon set, or an animation library where CSS transitions suffice.

**Verify before you assume.** The SOT requires checking framework behaviour against current official documentation rather than trusting stale knowledge — this repository is on Next.js 16, React 19, Tailwind v4 and Vendure 3.7, all of which differ from older training data. `apps/storefront/AGENTS.md` carries Next.js's own warning to read `node_modules/next/dist/docs/` before writing routing code.

---

## 5. Storefront architecture conventions

These are the existing conventions of `apps/storefront`, documented in `apps/storefront/docs/architecture.md` and **enforced by ESLint and by `apps/storefront/tests/architecture/boundaries.test.mjs`**. Violating them breaks the build, not just the review.

### 5.1 Source ownership

```text
src/
  app/            Next.js route wiring only
  config/         Store-wide values shared by features and site composition
  features/       Vertical commerce capabilities
  platform/       Cross-cutting Next.js, i18n, revalidation and Vendure mechanics
  site/           Store-specific composition, navigation and branding
  components/ui   Generic design primitives
  hooks/, lib/    Small shared helpers
```

Dependencies point **toward** shared configuration and platform mechanics. `site/` may compose `features/`; `features/` must never import from `site/`.

### 5.2 Routes are thin

Every file under `src/app/[locale]/**/page.tsx` is a one-line re-export. This is the existing, mandatory pattern:

```tsx
// src/app/[locale]/product/[slug]/page.tsx
export {default, generateMetadata} from '@/features/products/routes/page';
```

The real page lives at `src/features/products/routes/page.tsx`. Loading states follow the same shape (`export {default} from '@/features/products/routes/loading'`). Never place layout, data fetching, or markup directly in `src/app/`.

### 5.3 Feature module shape

```text
src/features/<feature>/
  graphql.ts                 GraphQL documents owned by this feature
  messages.ts                locale registration for this feature
  messages/en.json           translations (en + de both required)
  messages/de.json
  <public-module>.ts         the feature's external interface (narrow, purposeful)
  components/                INTERNAL — no other feature may import from here
  routes/                    INTERNAL — page/loading/action implementations
```

A feature's top-level files are its **only** public interface. Prefer a narrow module (`features/account/customer.ts`) over a catch-all barrel, so server/client boundaries stay explicit and bundles stay small. Existing features you extend rather than duplicate: `account`, `authentication`, `cart`, `checkout`, `collections`, `currency`, `orders`, `pricing`, `products`, `search`.

New features you will create: `tailoring`, `alterations`, `laundry`, `appointments`, `activity` (unified tracking), `wishlist`, `documents`, `loyalty`, `content` (CMS-driven pages/sections), `editorial` (blog/guides), `support`, `ai` (chat + stylist, flag-gated).

### 5.4 Internationalization

`next-intl` is already configured with `en` and `de`, routing under `src/app/[locale]/`. Each feature or site module registers its own messages; `src/site/i18n/messages.ts` composes those registrations and **rejects duplicate namespaces**. `apps/storefront/tests/i18n/messages.test.mjs` verifies that `en` and `de` stay structurally identical — every key you add to one must exist in the other. No user-visible string is ever hard-coded in a component: all copy goes through `next-intl`.

Note the distinction that trips builders up: **UI chrome strings** (button labels, form errors, section headings that are part of the design) are translations. **Business content** (product names, category names, promo copy, policies) is backend data, not translations. Do not put business content into message files.

### 5.5 Data access

`src/platform/vendure/` owns the transport: `api.ts`, `graphql.ts`, `auth-token.ts`, `channel.ts`, `channel-graphql.ts`. Features write typed documents with `gql.tada` and call through the platform layer — never `fetch()` a GraphQL endpoint directly from a component. Server Components are the default; a client component is justified only by interactivity.

### 5.6 Existing primitives

`src/components/ui/` already contains a full shadcn/base-ui set (60+ components: accordion, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, combobox, command, dialog, drawer, dropdown-menu, form, input, input-otp, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, tooltip, and more). **Restyle these via tokens; do not replace them and do not add a parallel component library.**

---

## 6. Data contract and the mock adapter

This section is how you build a beautiful, fully-populated demo **without** violating the "no hard-coded business content" rule. Read it before writing a single component.

### 6.1 The rule restated

The live platform serves catalog and content from Vendure's Shop GraphQL API and the LIPEK content plugin. That backend is wired after your handover. In the meantime you use showcase data — but showcase data enters the app through **exactly the same interface** the real API will, so switching is a one-line configuration change.

### 6.2 The adapter

Create `apps/storefront/src/platform/data/` with:

```text
src/platform/data/
  types.ts            Domain types (shapes mirror the Vendure Shop API)
  source.ts           export function getDataSource(): LipekDataSource
  live/index.ts       LIVE  — implemented against src/platform/vendure/* (thin, may be partly TODO)
  mock/index.ts       MOCK  — reads packages/testing/fixtures/**, deterministic
```

`source.ts` selects the implementation from an environment variable:

```ts
// LIPEK_DATA_SOURCE = "mock" | "live"   (default: "live")
export function getDataSource(): LipekDataSource {
  return process.env.LIPEK_DATA_SOURCE === 'mock' ? mockSource : liveSource;
}
```

Add `LIPEK_DATA_SOURCE=mock` to `apps/storefront/.env.example` **as a commented line with an explanatory comment**, and document it in `docs/implementation/environment-variables.md` (that file is append-only for you: add rows, change nothing existing).

Rules that make this work:

- **No component, page, or feature module imports a fixture file directly.** Ever. They call the data source.
- The mock implementation returns the same shapes, the same pagination envelopes, the same nullability and the same error cases as the live one.
- Every method is `async` and can fail; every consuming screen has a loading state and an error state.
- The mock introduces a small artificial latency (~120–300 ms) so loading skeletons are actually exercised and visible in the demo.

### 6.3 Where showcase data lives

`packages/testing/fixtures/` already holds the ported content fixtures (`content/blog/*`, `content/faq/*`, `content/legal/*`, `content/services/*`, `content/gallery/*`, `content/process/*`, `content/shop/*`, `content/testimonials/*`, `content/data/business.json`). **Reuse these** — they are LIPEK's own placeholder copy — and add:

```text
packages/testing/fixtures/catalog/
  collections.json    the full category tree of section 7 as nested collections
  facets.json         the facet/facet-value set of section 7.5
  products.json       ~60 products (Appendix A), each with variants, options, assets, facet values
  promotions.json     showcase promotions/banners
packages/testing/fixtures/home/
  sections.json       the ordered homepage section list (section 9.1) as backend-shaped data
packages/testing/fixtures/navigation/
  menus.json          header, mega-menu and footer menus as NavigationMenu/NavigationItem shapes
packages/testing/fixtures/services/
  tailoring.json  alterations.json  laundry.json     ServiceDefinition-shaped records
packages/testing/fixtures/account/
  orders.json  tailoring-jobs.json  alteration-jobs.json  laundry-jobs.json
  measurements.json  documents.json  loyalty.json  appointments.json
```

Every fixture record carries the field names the real entity uses (§7, §11.1), so the LIPEK team can feed the same JSON to a seed script later.

### 6.4 The data source interface, minimum surface

```ts
interface LipekDataSource {
  // Navigation & content (backed by LipekContentPlugin)
  getNavigation(location: 'header' | 'footer' | 'mobile'): Promise<NavigationMenu>;
  getHomeSections(): Promise<PageSection[]>;
  getContentPage(slug: string): Promise<ContentPage | null>;
  getBanners(placement: string): Promise<Banner[]>;
  getFaqs(category?: string): Promise<FaqItem[]>;
  getPolicy(slug: string): Promise<PolicyDocument | null>;
  getArticles(query: ArticleQuery): Promise<Paginated<Article>>;
  getArticle(slug: string): Promise<Article | null>;
  getTestimonials(): Promise<Testimonial[]>;
  getStoreLocations(): Promise<StoreLocation[]>;
  getSiteSettings(): Promise<SiteSettings>;              // contact, hours, socials, feature flags
  getServiceDefinitions(line: ServiceLine): Promise<ServiceDefinition[]>;

  // Catalog (backed by the Vendure Shop API)
  getCollectionTree(): Promise<Collection[]>;
  getCollection(slug: string): Promise<Collection | null>;
  searchProducts(input: SearchInput): Promise<SearchResult>;   // returns items + facetValues + totalItems
  getProduct(slug: string): Promise<Product | null>;
  getRelatedProducts(productId: string, kind: 'similar' | 'complete-the-look'): Promise<Product[]>;

  // Commerce session
  getActiveOrder(): Promise<Order | null>;
  addToOrder(variantId: string, quantity: number): Promise<Order>;
  adjustOrderLine(lineId: string, quantity: number): Promise<Order>;
  applyCouponCode(code: string): Promise<Order>;
  setCheckoutStep(input: CheckoutStepInput): Promise<Order>;

  // Account, services, documents
  getCustomer(): Promise<Customer | null>;
  getOrders(query: PageQuery): Promise<Paginated<Order>>;
  getActivityFeed(query: PageQuery): Promise<Paginated<ActivityItem>>;  // section 9.9
  getTailoringJobs(): Promise<TailoringJob[]>;
  getAlterationJobs(): Promise<AlterationJob[]>;
  getLaundryJobs(): Promise<LaundryJob[]>;
  getAppointments(): Promise<Appointment[]>;
  getMeasurementProfile(): Promise<MeasurementProfile | null>;
  getDocuments(): Promise<DocumentRecord[]>;
  getLoyaltyStatus(): Promise<LoyaltyStatus>;
  getWishlist(): Promise<WishlistItem[]>;
}
```

Extend it as screens require, but keep it a single named interface, implemented twice.

### 6.5 Authentication in the demo

Real authentication (email+password, WebAuthn/passkey MFA, TOTP, Google/Apple OAuth) is **server-authoritative and out of your scope** — it belongs to the `lipek-security` Vendure plugin (`ADR-0006`, `ADR-0008`). What you build is the complete **UI** for it, driven by the mock source: sign-in, register, forgot/reset password, email verification, passkey enrollment and challenge, TOTP enrollment (QR + 6-digit input) and challenge, backup-code display and re-generation, recovery flow, social sign-in buttons for Google and Apple, and a session-expired state.

Never implement your own credential storage, hashing, token issuance, or "temporary" auth shortcut. The mock source simply returns a signed-in or signed-out customer.

---

## 7. Catalog taxonomy — the exact structure

This is LIPEK's retail structure, reproduced from SOT §5. It is modelled in Vendure as a **nested `Collection` tree** (categories) plus **`Facet`/`FacetValue`** (tags, attributes, filters). Do not invent a parallel category or tag system — SOT §0B.2 forbids it explicitly.

### 7.1 Vendure mapping (binding)

| LIPEK concept | Vendure implementation |
| --- | --- |
| Product | `Product` |
| Purchasable SKU | `ProductVariant` |
| Size / Color creating separate SKUs | `ProductOptionGroup` + `ProductOption` + variants |
| Category hierarchy | Nested `Collection` tree |
| Tags / structured attributes / filters | `Facet` + `FacetValue` |
| Product media | `Asset` |
| Stock | `StockLevel` / `StockLocation` |
| Region / storefront | `Channel` |
| Customer group | `CustomerGroup` |
| Promotions | Vendure Promotions |
| Extra product fields | Vendure custom fields |

### 7.2 Men

| Category | Subcategories |
| --- | --- |
| Clothing | Suits, Blazers, Shirts, T-Shirts, Polos, Trousers, Jeans, Chinos, Shorts, Jackets, Coats, Sweaters, Hoodies, Tracksuits, Two-Piece Sets, Underwear, Sleepwear |
| African Wear | Agbada, Senator Wear, Kaftans, Dashiki, Boubou, Ankara Shirts, African Print Suits, Kente Wear, Traditional Sets |
| Formal Wear | Business Suits, Tuxedos, Dinner Jackets, Dress Shirts, Waistcoats, Formal Trousers |
| Casual Wear | T-Shirts, Polos, Jeans, Shorts, Casual Shirts, Hoodies, Joggers |
| Shoes | Oxford Shoes, Derby Shoes, Loafers, Monk Straps, Dress Boots, Chelsea Boots, Sneakers, Sandals, Slippers |
| Jewelry | Chains, Necklaces, Bracelets, Rings, Cufflinks, Tie Clips, Earrings |
| Watches | Dress Watches, Casual Watches, Sports Watches, Smart Watches |
| Bags | Backpacks, Briefcases, Messenger Bags, Crossbody Bags, Travel Bags, Wallets |
| Accessories | Belts, Ties, Bow Ties, Pocket Squares, Hats, Caps, Scarves, Sunglasses, Socks, Suspenders |
| Grooming & Lifestyle | Fragrances, Grooming Kits, Toiletry Bags |

### 7.3 Women

| Category | Subcategories |
| --- | --- |
| Clothing | Dresses, Tops, Blouses, Shirts, T-Shirts, Bodysuits, Skirts, Trousers, Jeans, Shorts, Jumpsuits, Rompers, Blazers, Jackets, Coats, Knitwear, Two-Piece Sets |
| African Wear | Ankara Dresses, Kente Dresses, African Print Sets, Boubous, Gowns, Wrapper & Blouse Sets, Traditional Wedding Wear |
| Formal & Occasion Wear | Evening Dresses, Cocktail Dresses, Wedding Guest Dresses, Prom Dresses, Formal Suits, Party Wear |
| Casual Wear | Casual Dresses, Jeans, Tops, T-Shirts, Shorts, Jumpsuits, Lounge Sets |
| Activewear | Leggings, Sports Bras, Tracksuits, Workout Sets, Yoga Wear |
| Lingerie & Sleepwear | Bras, Panties, Shapewear, Night Dresses, Pajamas, Robes |
| Shoes | Heels, Pumps, Flats, Loafers, Sneakers, Boots, Sandals, Slippers, Wedges |
| Handbags | Tote Bags, Shoulder Bags, Crossbody Bags, Clutches, Mini Bags, Backpacks |
| Jewelry | Necklaces, Earrings, Bracelets, Bangles, Rings, Anklets, Brooches |
| Watches | Luxury Watches, Fashion Watches, Smart Watches |
| Accessories | Belts, Scarves, Hats, Sunglasses, Hair Accessories, Headwraps, Gloves |
| Beauty & Fashion Extras | Fragrances, Cosmetic Bags, Fashion Gift Sets |

### 7.4 Children

| Category | Subcategories |
| --- | --- |
| Boys' Clothing | Shirts, T-Shirts, Polos, Trousers, Jeans, Shorts, Suits, Blazers, Tracksuits, Jackets, Sleepwear |
| Girls' Clothing | Dresses, Tops, Skirts, Trousers, Jeans, Shorts, Jumpsuits, Two-Piece Sets, Jackets, Sleepwear |
| Baby Clothing | Bodysuits, Rompers, Sets, Dresses, Sleepsuits, Jackets, Baby Accessories |
| African Wear | Kids' Agbada, Ankara Dresses, Kaftans, Kente Outfits, Traditional Sets, Matching Family Wear |
| Formal Wear | Boys' Suits, Girls' Occasion Dresses, Wedding Outfits, Birthday Outfits, Religious Ceremony Wear |
| Shoes | Sneakers, Formal Shoes, Sandals, Boots, School Shoes, Slippers |
| Accessories | Caps, Hats, Belts, Ties, Bow Ties, Hair Accessories, Sunglasses, Socks |
| Jewelry | Children's Bracelets, Earrings, Necklaces, Watches |
| School & Everyday | Backpacks, Lunch Bags, School Accessories, Casual Clothing |

### 7.5 Cross-store collections

New Arrivals · African Fashion · Wedding Collection · Formal Wear · Casual Wear · Shoes · Jewelry · Watches · Bags & Leather Goods · Accessories · Matching Family Sets · Gift Ideas · Sale · Gift Cards

These are curated collections that cut across Men/Women/Children. They appear in navigation, on the homepage, and at `/collections/<slug>`.

### 7.6 Facets (tags / filters)

| Facet | Example values |
| --- | --- |
| Gender | Men, Women, Boys, Girls, Baby, Unisex |
| Brand | (staff-managed list — never hard-coded) |
| Material | Wool, Cotton, Linen, Silk, Lace, Ankara, Kente, Aso-Oke, Denim, Leather, Cashmere, Blend |
| Occasion | Wedding, Business, Traditional, Party, Casual, Religious Ceremony, Graduation, Festival |
| Style | Classic, Modern, Slim, Oversized, Minimal, Statement, Heritage |
| Fit | Slim, Regular, Relaxed, Tailored |
| Season | All Season, Summer, Rainy, Harmattan, Winter |
| Color | Black, White, Navy, Burgundy, Cream, Gold, Emerald, Cyan, Multi-print |
| Size | XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL + numeric shoe sizes |
| Care | Machine Wash, Dry Clean Only, Hand Wash, Specialist Care |

Colour and size usually also exist as **`ProductOptionGroup`s** where they create distinct SKUs; the facet exists for filtering across products. Both are staff-managed.

### 7.7 Product / variant custom fields

Editable from the back office without code: `fit`, `material`, `careInstructions`, `modelInfo` (model height and size worn), `sizeGuideRef`, `deliveryEstimate`, `lowStockThreshold`, plus SEO fields (`seoTitle`, `seoDescription`, `canonicalOverride`, `noIndex`, Open Graph fields).

### 7.8 Filter behaviour on listing pages

The §17.2 filter set — Gender, Category, Brand, Price, Size, Color, Material, Fit, Style, Occasion, Availability, Rating, Collection, Discount — with these rules:

1. Facet options and their counts come **from the search response**, never from a static list.
2. Multi-select within a facet is OR; across facets it is AND.
3. Every filter change updates the URL query string (shareable, back-button-correct, server-rendered).
4. Zero-result combinations render a helpful empty state that offers to clear the narrowest filter, never a blank grid.
5. Active filters appear as removable pills above the grid, with a "Clear all".
6. On mobile the filter panel is a bottom sheet with an "Apply" affordance and a live result count.
7. Sorting: Relevance, Newest, Price ascending, Price descending, Top rated.
8. Pagination is server-driven; also support "Load more" on mobile. Never client-side-slice a full catalog.

---

## 8. Route map

All customer routes are locale-prefixed (`/[locale]/...`, `en` default, `de` present). Paths below omit the locale segment.

### 8.1 Retail

```text
/                                     Home (backend-composed sections)
/men                                  Audience landing
/men/<category>                       e.g. /men/suits
/men/<category>/<subcategory>         e.g. /men/suits/three-piece
/women, /women/<category>, /women/<category>/<subcategory>
/children, /children/<category>, /children/<category>/<subcategory>
/collections/<slug>                   Cross-store collections (new-arrivals, sale, wedding, ...)
/product/<slug>                       Product detail
/search                               Search results + full faceted filtering
/cart
/checkout
/order-confirmation/<code>
```

### 8.2 Services

```text
/custom-tailoring                      Service landing (ServiceDefinition-driven)
/custom-tailoring/<service-slug>       e.g. /custom-tailoring/wedding-suits
/custom-tailoring/configure            The 13-step configurator (section 9.6)
/alterations                           Service landing
/alterations/request                   Request flow (section 9.7)
/laundry-dry-cleaning                  Service landing
/laundry-dry-cleaning/book             Booking flow (section 9.8)
/book-fitting                          Appointment booking
/book-fitting/calendar
/book-fitting/confirmation
```

### 8.3 My LIPEK (account)

Mirrors SOT §7 exactly:

```text
/account                               Overview
/account/orders                        Commerce: orders
/account/orders/<code>                 Order detail + tracking timeline
/account/returns                       Returns & exchanges
/account/wishlist
/account/saved-looks
/account/recently-viewed
/account/tailoring                     Services: My Tailoring
/account/alterations                   My Alterations
/account/laundry                       My Laundry
/account/appointments                  My Appointments
/account/pickups                       My Pickup/Delivery Requests
/account/activity                      "Your LIPEK Activity" — all four lines in one feed
/account/style                         My Style: sizes, measurements, shoe size, fits, colors, categories
/account/documents                     Receipts, invoices, quotes, measurement sheets, delivery notes
/account/rewards                       Relationship: rewards, tier, points
/account/gift-cards
/account/referrals
/account/support                       Support cases
/account/ai-conversations              AI conversation history
/account/addresses
/account/payment-methods
/account/preferences                   Communication preferences
/account/security                      Password, passkeys, TOTP, backup codes, sessions
```

### 8.4 Authentication

```text
/sign-in   /register   /forgot-password   /reset-password
/verify    /verify-pending   /account/verify-email
/mfa/challenge        (passkey / TOTP / backup code)
/mfa/enroll           (passkey primary, TOTP fallback, backup codes)
```

### 8.5 Editorial, informational, legal

```text
/about
/services                              Services index (all three lines)
/process, /process/<slug>              How LIPEK works
/gallery, /gallery/<slug>              Lookbook / previous work
/blog, /blog/<category>, /blog/<category>/<slug>
/faq, /faq/<slug>
/legal/<slug>                          Returns, shipping, privacy, terms, tailoring, laundry policies
/testimonials, /testimonials/video-testimonials
/contact, /contact/location, /contact/wholesale, /contact/thank-you
/stores                                Store locations, hours, pickup rules
/size-guide
```

### 8.6 AI (feature-flagged, off by default)

```text
/ai/chat        Full-page chat (also available as a docked panel site-wide)
/ai/stylist     AI Fashion Stylist look builder
```

### 8.7 Machine-facing routes

```text
/sitemap.xml     generated from live catalog + published content, never a static list
/robots.txt
/manifest.webmanifest
/llms.txt        AEO surface (ADR-0010) — mirrors published CMS state, never drifts
/api/health      exists
/api/revalidate  exists — secured by REVALIDATION_SECRET, do not weaken it
```

Legacy IA that must be preserved as it is re-platformed (from `docs/architecture/storefront-architecture.md`): `/services/custom-tailoring/{african-fashion, casual-modern, shirts-tops, special-occasion, suits-formal, trousers-bottoms, womens-tailoring}`. Serve these as `ServiceDefinition`-driven pages under `/custom-tailoring/<slug>` and keep the old paths as redirects.

---

## 9. Screen specifications

Every screen ships: a loading skeleton, an empty state, an error state, a mobile layout, a desktop layout, light and dark treatments, full keyboard operability, and translated chrome (`en` + `de`).

### 9.1 Homepage — a backend-composed section system

The homepage is **not** a hand-written page. Code defines **section component types**; the backend supplies which sections appear, in what order, with what content, and on what schedule (SOT §5A). Build a renderer:

```tsx
// src/features/content/section-renderer.tsx
const REGISTRY = {
  hero: HeroSection,
  featuredCollection: FeaturedCollectionSection,
  productGrid: ProductGridSection,
  audienceCards: AudienceCardsSection,
  promoStrip: PromoStripSection,
  saleSpotlight: SaleSpotlightSection,
  serviceCta: ServiceCtaSection,
  shopTheLook: ShopTheLookSection,
  valueProps: ValuePropsSection,
  testimonials: TestimonialsSection,
  editorialFeature: EditorialFeatureSection,
  categoryMosaic: CategoryMosaicSection,
  newsletter: NewsletterSection,
  countdownOffer: CountdownOfferSection,
} as const;
```

Unknown section types render nothing and log a warning — never crash the page.

The default composition the demo ships with (all of it data, not markup):

| # | Section | Content |
| --- | --- | --- |
| 1 | `hero` | Full-bleed rounded hero: large editorial image or short muted autoplay video, headline, subline, primary CTA ("Shop new arrivals") + secondary ghost CTA ("Book a fitting"). Supports 1–3 rotating slides with an unobtrusive indicator. |
| 2 | `audienceCards` | Three soft cards — Men / Women / Children — each a rounded image with a label and item count, linking to the audience landing page. |
| 3 | `saleSpotlight` | **The sales showcase.** A wide rounded panel: campaign title, discount badge, supporting copy, CTA, and a horizontally scrollable row of 6–10 discounted products showing original price struck through, sale price, and a "-30%" pill. Optional countdown when the promotion has an end date. |
| 4 | `productGrid` | "New Arrivals" — 8 products from a referenced collection, with a "View all" link. |
| 5 | `categoryMosaic` | An asymmetric mosaic of 5–7 rounded category tiles (African Wear, Wedding, Formal, Shoes, Bags, Watches) with generous whitespace. |
| 6 | `serviceCta` | Three service panels (Custom Tailoring / Alterations / Laundry) each with an icon, one-line promise, a starting price or turnaround, and a CTA into that service's flow. Tailoring is visually dominant — it is the flagship. |
| 7 | `valueProps` | **"What sets us apart"** — 4 items: Master tailoring since <year>, Free pickup & delivery over <threshold>, Fitting guarantee, Authentic African fabrics. Icon + heading + one line each. |
| 8 | `shopTheLook` | A curated look: one large lifestyle image with hotspot markers; clicking a hotspot opens a rounded product card; "Add all to cart" totals the look. |
| 9 | `promoStrip` | Slim rounded announcement band (e.g. free delivery this week), schedulable, dismissible, remembered per device. |
| 10 | `testimonials` | 3 approved testimonials in soft cards with rating, name, and service used; carousel on mobile. |
| 11 | `editorialFeature` | Two guides from the blog ("How to Style an Agbada", "Wedding Suit Guide") as large rounded cards. |
| 12 | `newsletter` | Rounded inset panel, single email field, clear consent copy, success and error states. |

Each section type accepts `{id, type, title, subtitle, visible, startsAt, endsAt, order, props}` so staff can reorder, hide and schedule without a deploy. Respect `visible`, `startsAt`, `endsAt` at render time.

### 9.2 Category / listing pages (PLP)

Applies to `/men`, `/women`, `/children`, every category and subcategory, `/collections/<slug>`, and `/search`.

- **Header block:** breadcrumb, category title, short description (data), and a rounded category banner when one is set.
- **Subcategory chips:** horizontally scrollable rounded pills of child collections.
- **Layout:** left filter rail on desktop (sticky, collapsible groups), bottom-sheet filters on mobile. Grid: 2 columns mobile, 3 tablet, 4 desktop, generous gutters.
- **Product card:** rounded image (4:5) with hover swap to the second asset, wishlist heart top-right, badge slot top-left (New / -30% / Low stock / Made to order), name, brand, price (with struck-through compare-at when discounted), and colour swatch dots that change the card image on hover/tap.
- **Toolbar:** result count, sort dropdown, view density toggle, active-filter pills.
- **Behaviour:** URL-driven filters (§7.8), server-rendered first page, skeleton cards while loading, keyboard-navigable filters, focus retained when filters update.

### 9.3 Product detail page (PDP)

Left: media gallery — rounded main image, thumbnail rail (vertical on desktop, swipeable on mobile), zoom on hover/pinch, video and 360° slots, image changes with colour selection.

Right: brand, title, rating summary, price block (with discount treatment), colour swatches (visual, with names), size selector with an inline "Size guide" trigger opening a rounded sheet, fit and material chips, quantity, primary "Add to bag" CTA, secondary "Add to wishlist", low-stock indicator ("Only 2 left"), availability (online / in-store), delivery estimate, and a "Not your size? Request custom tailoring" link into the configurator pre-filled with the product context.

Below: accordion sections — Description, Details & materials, Care instructions, Model info (height and size worn), Delivery & returns (from policy data), Reviews (rating breakdown, photo reviews, helpful votes). Then "Complete the Look" (shoes, belt, jewelry, watch — as a shoppable rounded row), "Similar items", and "Recently viewed".

Also: back-in-stock subscribe when a variant is out of stock, share affordance, breadcrumb, and full Product JSON-LD (§14.2).

### 9.4 Cart and checkout

**Cart** (`/cart`): rounded line-item rows with image, name, colour/size, quantity stepper, line price, remove and "move to wishlist"; promotion-code input with applied-code chips; order summary panel with subtotal, discounts, shipping estimate, tax, total; delivery-threshold progress bar ("Add $40 for free delivery"); trust row; primary "Checkout" and a "Continue shopping" ghost. Empty state offers new arrivals.

**Checkout** (`/checkout`): guest and registered paths, both first-class. Five steps, one panel at a time on mobile, two-column with a sticky summary on desktop:

1. **Contact** — email, phone; sign-in offer for returning customers.
2. **Shipping address** — address form with country select; saved addresses for signed-in customers.
3. **Delivery** — shipping methods with prices and estimates, plus **store pickup** as a first-class option showing location and hours.
4. **Payment** — payment method selection (card, wallet, and a clearly-labelled demo method), saved methods, billing-address toggle, gift card / store credit application. **Never render a real card form that posts anywhere.** Use the provider's hosted-fields placeholder shape and mark it `TODO: provider integration (COM-015)`.
5. **Review** — full order review, terms acknowledgement, place-order CTA.

Persistent, resumable, validated inline with `react-hook-form` + `zod`. Step state survives refresh. An order-confirmation page follows with order number, timeline preview, receipt download affordance, and a create-account offer for guests.

### 9.5 My LIPEK

A rounded left nav (bottom tab bar on mobile) over the §8.3 route set. The **Overview** dashboard shows: greeting, loyalty tier and points with progress to next tier, active services strip (tailoring, alteration, laundry cards with current stage), recent orders, upcoming appointments, and saved measurements status.

**My Style** is a genuine profile screen: sizes per garment type, body measurements (privacy-marked — see §9.6), shoe size, preferred fits, favourite colours and categories, style preferences. Measurements display with an explicit privacy note and are never shown in URLs.

**Documents** lists receipts, invoices, quotes, measurement sheets and delivery notes with type filters and download actions.

**Security** covers password change, passkey list with add/remove, TOTP status, backup-code regeneration, active sessions, and recent security events.

### 9.6 Custom tailoring configurator — the flagship

`/custom-tailoring/configure`. Exactly the 13 steps of SOT §10.1, as a stepper (horizontal rail on desktop, progress bar with step counter on mobile), with a **live summary panel** showing running price, selected options, and estimated completion date:

```text
01 STYLE        Two Piece · Three Piece · Tuxedo            (large rounded visual cards)
02 FIT          Slim · Regular · Relaxed                    (illustrated)
03 FABRIC       Wool · Linen · Cotton · Premium Blend       (swatch tiles, zoomable texture, price delta)
04 COLOR        swatch grid tied to the chosen fabric
05 LAPEL        Notch · Peak · Shawl                        (line-drawing cards)
06 BUTTONS      count and style
07 LINING       colour/pattern swatches
08 MONOGRAM     text input, thread colour, placement, live preview
09 MEASUREMENTS Use saved · Enter manually · Book a measurement appointment
10 FITTING      choose fitting appointment slot(s)
11 DELIVERY DATE  calendar with feasible dates only, rush option if offered
12 REVIEW       full spec summary, editable per step, price breakdown
13 DEPOSIT      deposit amount, remaining balance, payment
```

Rules: every step is deep-linkable and back-navigable without losing state; progress persists (signed-in: to the account; guest: locally) so a configuration survives a reload; each option's price delta is visible at the moment of choice; the manual-measurement form explains **how** to measure with a diagram per field and validates plausible ranges; the deposit step shows the SOT §14.2 model explicitly (e.g. total $800, deposit $300, remaining $500) and states when the balance is due.

Measurements are private customer data (SOT §52C): never in a URL, never in analytics payloads, never in an AI context.

### 9.7 Alterations request flow

`/alterations/request`, following SOT §12.1 exactly: select garment → select alteration required → upload photos → describe requirement → receive estimate or request quote → choose drop-off or pickup → select date → pay deposit or full amount → track work.

Photo upload validates type and size client-side with clear errors, shows rounded thumbnails with remove, and supports camera capture on mobile. The alteration catalogue (Trouser, Suit, Dress, Shirt, Skirt alterations; Zippers & Fasteners; Repairs; Restyling; Wedding; Traditional Wear) comes from `ServiceDefinition` data, not from a hard-coded list. Estimates render as a clear range with the caveat that assessment confirms the final quote.

### 9.8 Laundry booking flow

`/laundry-dry-cleaning/book`, following SOT §13.1 exactly: choose service → choose garments → enter quantity → select pickup address → choose pickup date/time → choose delivery preference → review price → payment → track order.

Garment selection is a quantity-stepper list grouped by service type (Laundry, Dry Cleaning, Pressing, Specialty Cleaning, Stain Treatment, Household Textiles, Express, Bulk, Pickup & Delivery) with per-item prices and a live running total. Date/time pickers show only available slots. Include the recurrence UI (weekly / every two weeks / monthly / custom) as a data-model-only selection, clearly marked as scheduling preference rather than a subscription charge.

### 9.9 Unified tracking — "Your LIPEK Activity"

`/account/activity` renders retail orders, tailoring jobs, alterations and laundry in **one reverse-chronological feed** (SOT §8). Each entry: type badge, reference number, title, current stage, next milestone with date, and a CTA into that item's detail. Filter chips per type. This screen is the clearest proof that the four business lines are one platform — treat it as a hero surface, not an afterthought.

### 9.10 Tracking timelines

One reusable vertical timeline component, four stage sets, all sourced from data (never free-text status strings):

| Flow | Stages |
| --- | --- |
| Retail order | Order Confirmed → Payment Received → Processing → Packed → Shipped → Out for Delivery → Delivered |
| Tailoring | Order Confirmed → Measurements Taken → Fabric Confirmed → Pattern Created → Cutting → Sewing → First Fitting → Adjustments → Final Fitting → Quality Control → Ready for Pickup/Delivery → Completed |
| Alteration | Received → Assessment → Quote Approved → In Alteration → Quality Check → Ready for Pickup → Completed |
| Laundry | Order Received → Garments Collected → Inspection → Cleaning/Dry Cleaning → Stain Treatment → Pressing → Quality Check → Packaging → Out for Delivery → Delivered |

Each stage shows done / current / upcoming states with timestamps, and the retail timeline additionally shows carrier, tracking number, estimated delivery, and delivery events. Provide a support entry point at every stage.

### 9.11 Returns and exchanges

`/account/returns` and the flow from an order: select item → select reason → refund **or** choose replacement size → choose return method → generate instructions → track return. Show exchange availability per size (the real backend validates inventory; the mock reflects it), and support item-level partial returns, refunds, and store credit as an outcome.

### 9.12 Search

Instant search from the header opening a rounded overlay with recent searches, trending searches, suggested categories, and product previews as you type. Full results page reuses the PLP grid and filters, adds "did you mean" for typos, and gracefully handles zero results with suggested collections. Natural-language queries ("a loose African outfit for a summer wedding") must not error — they degrade to keyword search now and become semantic later.

### 9.13 Editorial, informational and support screens

Blog index with category chips and rounded feature cards; article page with generous measure (≈70ch), pull quotes in the editorial serif, inline shoppable product cards, related guides, and Article JSON-LD. FAQ with accordions grouped by category and a search field. Legal/policy pages from `PolicyDocument`. About, Process, Gallery/lookbook, Testimonials, Store locations (cards with map placeholder, hours, phone, pickup rules), Contact with a validated form plus a wholesale-enquiry variant, and Size guide with per-garment tables and a measuring diagram.

### 9.14 Global chrome

**Header:** slim promo strip (data-driven, dismissible), then logo, primary navigation with a mega-menu built from `NavigationMenu` data (columns of categories with a featured image slot), search trigger, account, wishlist, cart with count, currency picker, locale picker, theme toggle. Sticky with a compact scrolled state. Mobile: hamburger opening a full-height rounded drawer with accordion navigation, plus a bottom tab bar (Home, Shop, Services, Activity, Account).

**Footer:** menu groups from `NavigationMenu` data, newsletter, contact details and hours from site settings, social links, payment/trust marks, locale/currency, legal links, and a "Powered by LIPEK" line. Never hard-code the link lists.

Also global: cart drawer, wishlist drawer, toast system (`sonner`), cookie/consent banner defaulting to the most privacy-preserving option, offline banner, and the docked AI chat launcher (feature-flagged, §13).

---

## 10. Design system

### 10.1 Direction

**Soft, premium, editorial fashion.** Rounded everything, generous whitespace, big confident imagery, quiet typography, one decisive accent colour. The feeling is a modern tailoring house that happens to be excellent online — calm and expensive-looking, never loud, never "startup dashboard".

Reference moodboards (visual direction only — do not copy assets, layouts pixel-for-pixel, or copy text):

- <https://www.behance.net/gallery/253456433/Premium-Fashion-E-commerce-Website> — the softness reference. Note the rounding, the padding, the restraint.
- <https://www.behance.net/gallery/217550967/Fashion-Ecommerce-Web-design-UIUX-Case-Study> — the commerce-structure reference: hero, category blocks, product grid rhythm.

### 10.2 Where the design system lives

Per `ADR-0011`, **token values are defined once in `packages/ui` and consumed everywhere** — storefront, Dashboard extensions, and mobile shells. There is no second token set. Structure:

```text
packages/ui/src/
  tokens/
    legacy-variables.css     EXISTS — the ported prototype palette. Do not delete; supersede.
    lipek-tokens.css         NEW — the token contract below (light + dark), the single source
    tokens.ts                NEW — the same values as typed TS, for non-CSS consumers (mobile, charts)
  primitives/                EXISTS — Container, Section, Cta, Card, Badge (+ index.ts)
  theme/
    storefront.css           NEW — bridge: maps tokens onto the storefront's Tailwind v4 @theme
    dashboard.css            NEW — bridge: maps the same tokens onto the Vendure Dashboard build
```

The storefront's Tailwind v4 `@theme` block in `src/app/[locale]/globals.css` consumes the CSS custom properties; it does not redefine colours.

### 10.3 Colour

Brand primary is **`#0DABDA`**, with white and black as the structural palette.

One measured constraint you must respect: `#0DABDA` has a contrast ratio of **2.67:1 against white** and **7.85:1 against black**. Therefore:

- **Never** put white text on `#0DABDA`.
- **Do** put near-black text on `#0DABDA` — this is the brand's signature button treatment and it passes AA comfortably.
- For primary-coloured **text or icons on a white background**, use `--lipek-primary-700` (`#0A7F9F`, 4.6:1) or darker. Never `#0DABDA` for small text on white.

```css
/* packages/ui/src/tokens/lipek-tokens.css */
:root {
  /* Brand ramp */
  --lipek-primary-50:  #E8F8FC;
  --lipek-primary-100: #CDF0F8;
  --lipek-primary-200: #9EE3F2;
  --lipek-primary-300: #63D2EA;
  --lipek-primary-400: #2ABEE1;
  --lipek-primary-500: #0DABDA;   /* brand */
  --lipek-primary-600: #0B95BF;
  --lipek-primary-700: #0A7F9F;   /* minimum for text on white */
  --lipek-primary-800: #08657F;
  --lipek-primary-900: #064E62;

  /* Neutrals */
  --lipek-black:   #0B0B0C;
  --lipek-ink-900: #121316;
  --lipek-ink-700: #3A3D42;
  --lipek-ink-500: #6B7076;
  --lipek-ink-300: #A8ADB3;
  --lipek-line:    #E7EBEE;
  --lipek-surface-2:#F4F7F9;
  --lipek-white:   #FFFFFF;

  /* Status */
  --lipek-success: #17825A;
  --lipek-warning: #B2740B;
  --lipek-danger:  #B3261E;
  --lipek-info:    var(--lipek-primary-700);

  /* Semantic — LIGHT (default) */
  --lipek-bg:               var(--lipek-white);
  --lipek-bg-subtle:        var(--lipek-surface-2);
  --lipek-surface:          var(--lipek-white);
  --lipek-surface-raised:   var(--lipek-white);
  --lipek-text:             var(--lipek-black);
  --lipek-text-muted:       var(--lipek-ink-500);
  --lipek-border:           var(--lipek-line);
  --lipek-accent:           var(--lipek-primary-500);
  --lipek-accent-text:      var(--lipek-primary-700);   /* accent-coloured text on light bg */
  --lipek-on-accent:        var(--lipek-black);         /* text ON the accent fill */
  --lipek-accent-soft:      var(--lipek-primary-50);
  --lipek-focus:            var(--lipek-primary-700);
  --lipek-overlay:          rgb(11 11 12 / 0.48);
}

:root[data-theme='dark'],
:root.dark {
  --lipek-bg:             #0B0E10;
  --lipek-bg-subtle:      #101418;
  --lipek-surface:        #14181C;
  --lipek-surface-raised: #1B2126;
  --lipek-text:           #F5F8FA;
  --lipek-text-muted:     #9AA3AB;
  --lipek-border:         #262D33;
  --lipek-accent:         var(--lipek-primary-500);
  --lipek-accent-text:    var(--lipek-primary-300);     /* lighter for contrast on dark */
  --lipek-on-accent:      var(--lipek-black);
  --lipek-accent-soft:    #0C2A33;
  --lipek-focus:          var(--lipek-primary-300);
  --lipek-overlay:        rgb(0 0 0 / 0.64);
  --lipek-success:        #3BAF83;
  --lipek-warning:        #D9A441;
  --lipek-danger:         #E0685F;
}
```

Usage discipline: the accent is **punctuation, not paint**. Primary CTAs, active states, focus rings, key badges, progress and selected chips. A page should read black-on-white (or white-on-near-black) with cyan appearing a handful of times. Do not tint large surfaces with cyan except one deliberate section per page at most (a sale spotlight or a service CTA panel).

### 10.4 Softness — the rounding contract

Every visible box has a radius. This is a hard rule, and the reviewer will look for violations.

```css
--lipek-radius-xs:   8px;    /* chips, tags, small badges, checkbox */
--lipek-radius-sm:   12px;   /* inputs, selects, small buttons, toasts */
--lipek-radius-md:   16px;   /* buttons, list rows, table containers, tabs */
--lipek-radius-lg:   24px;   /* cards, product tiles, media thumbnails, popovers */
--lipek-radius-xl:   32px;   /* modals, drawers, sheets, section panels */
--lipek-radius-2xl:  40px;   /* hero media, feature blocks, full-bleed panels */
--lipek-radius-pill: 999px;  /* filter pills, avatars, pill CTAs, counters, swatches */
```

Applies to: cards, panels, inputs, selects, textareas, buttons, badges, chips, modals, drawers, sheets, popovers, tooltips, toasts, tables (container radius with clipped corners), skeletons, image and video containers, map placeholders, avatars, and the header's scrolled/floating state.

The only permitted square edges: the page background itself, 1px hairline dividers, and full-bleed section backgrounds that intentionally run edge-to-edge.

Images and video: always inside a rounded container with `overflow: hidden`, always with an explicit aspect ratio (product 4:5, lifestyle 3:2, hero 16:9 desktop / 4:5 mobile, avatar 1:1), always with `object-fit: cover`, always with width/height set to prevent layout shift, and always with a low-cost blurred or solid-tint placeholder while loading.

### 10.5 Elevation, borders, texture

Shadows are soft, wide and low-opacity — never hard drop shadows.

```css
--lipek-shadow-xs: 0 1px 2px rgb(11 11 12 / 0.04);
--lipek-shadow-sm: 0 2px 8px rgb(11 11 12 / 0.05);
--lipek-shadow-md: 0 8px 24px rgb(11 11 12 / 0.07);
--lipek-shadow-lg: 0 20px 48px rgb(11 11 12 / 0.10);
--lipek-shadow-accent: 0 12px 32px rgb(13 171 218 / 0.22);   /* primary CTA hover only */
```

In dark mode, elevate with lighter surfaces rather than heavier shadows. Prefer a 1px `--lipek-border` hairline plus `--lipek-shadow-sm` over a heavy shadow anywhere.

### 10.6 Typography

Loaded via `next/font` (self-hosted, no external request at runtime):

| Role | Family | Usage |
| --- | --- | --- |
| Display / headings | **Manrope** 700/800, tracking `-0.02em` | Hero, section titles, page titles |
| Body / UI | **Inter** 400/500/600 | Everything else |
| Editorial accent | **Playfair Display** italic 400 | Pull quotes, blog decks, testimonial quotes — sparingly |

```css
--lipek-text-xs:   0.75rem/1.4;
--lipek-text-sm:   0.875rem/1.5;
--lipek-text-base: 1rem/1.6;
--lipek-text-lg:   1.125rem/1.6;
--lipek-text-xl:   1.375rem/1.4;
--lipek-text-2xl:  1.75rem/1.3;
--lipek-text-3xl:  2.25rem/1.2;
--lipek-text-4xl:  3rem/1.1;
--lipek-text-5xl:  clamp(2.75rem, 6vw, 4.5rem)/1.05;   /* hero only */
```

Body copy measure caps at ~70ch. Prices use tabular numerals. Never centre more than two consecutive lines of body text. Never use the accent colour for headings.

### 10.7 Spacing, layout, motion

Spacing scale (4px base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128. Section vertical rhythm: 64px mobile, 96–128px desktop — the whitespace is the luxury. Container max-width 1360px with 20px mobile / 40px desktop gutters; grid is 12 columns desktop, 6 tablet, 4 mobile. Breakpoints: 480 / 768 / 1024 / 1280 / 1536.

Motion: durations 120ms (micro), 200ms (default), 320ms (panel/sheet); easing `cubic-bezier(0.22, 1, 0.36, 1)`. Hover on cards = 1.02 scale of the image inside its fixed rounded frame plus a shadow step, never a layout shift. Page and section reveals are a 12px rise plus fade, once, never on every scroll pass. **Everything respects `prefers-reduced-motion: reduce`** — animations become instant, autoplaying media pauses.

### 10.8 Component styling rules

- **Buttons** — Primary: `--lipek-accent` fill, `--lipek-on-accent` text, `--lipek-radius-md` (pill for hero CTAs), 44px min height, hover darkens to `--lipek-primary-600` and adds `--lipek-shadow-accent`. Secondary: transparent with a 1px border. Ghost: text only with a soft hover wash. Destructive uses `--lipek-danger`. Every button has hover, active, focus-visible, disabled and loading (spinner + preserved width) states.
- **Inputs** — `--lipek-radius-sm`, 1px border, 44px min height, floating or top-aligned label (be consistent), helper text slot, error state with border + icon + message tied by `aria-describedby`. Never rely on colour alone.
- **Focus** — visible on every interactive element: 2px `--lipek-focus` ring with a 2px offset. Never remove outlines.
- **Cards** — `--lipek-radius-lg`, hairline border, `--lipek-shadow-sm`, 16–24px padding, image flush to the rounded top edge.
- **Badges/pills** — `--lipek-radius-pill`, 12px text, generous horizontal padding; sale badges use `--lipek-danger`, new uses `--lipek-accent-soft` with `--lipek-accent-text`, low stock uses `--lipek-warning`.
- **Skeletons** — match the final layout's shape and radius exactly; subtle shimmer, disabled under reduced motion.
- **Empty states** — illustration or icon, one-line explanation, one clear action. Never a bare "No results".

### 10.9 Imagery

All demo imagery must be royalty-free and safely licensed (e.g. Unsplash/Pexels) or generated, and must be recorded in the handover with source and licence. Prefer fashion imagery that suits the audience: African and Western formal wear, tailoring detail shots (fabric, stitching, chalk marks), lifestyle over cut-outs. Optimize: modern formats, responsive `sizes`, lazy loading below the fold, `priority` for the hero only. No image ships larger than 300 KB.

---

## 11. Staff back office

### 11.1 The architecture, and the mistake to avoid

The staff back office is the **Vendure React Dashboard**, extended. It is one Vite-built SPA assembled from every plugin's own colocated `dashboard/` folder. There is **no** separate admin app, no `apps/admin`, no second login, no parallel Next.js dashboard. `ADR-0013` records this decision after verification against the official Vendure Dashboard extension model, and `AGENTS.md` restates it as standing law.

```text
apps/server/
  vite.config.mts            aggregate Dashboard build (vendureDashboardPlugin) — scans plugins
  tsconfig.dashboard.json    includes "src/plugins/**/dashboard/*"
  src/plugins/<plugin>/
    dashboard/               your screens for that plugin live here
      index.ts               defineDashboardExtension({ routes, navSections, widgets, pageBlocks })
      routes/                list + detail screens
      components/            screen-local components
      widgets/               dashboard widgets
```

Extensions may contribute custom routes/pages, navigation sections, list tables, detail forms, widgets, page blocks, action buttons, alerts, custom field editors, history/timeline entries and toolbar actions. **Verify the current `@vendure/dashboard` 3.7.2 extension API against the official documentation before writing code** (<https://docs.vendure.io/current/core/extending-the-dashboard/extending-overview>) — do not guess the API shape from memory. If some screen genuinely cannot be expressed through the extension API, build it as close as the API allows and record the limitation in your handover; do not route around it with a separate app.

The governing design principle, from SOT §20A: *a staff member should not be able to tell which screen comes from Vendure core and which comes from a LIPEK plugin.* Match the Dashboard's own layout conventions; apply LIPEK tokens through `packages/ui/src/theme/dashboard.css` (§10.2) rather than restyling screens individually.

### 11.2 Navigation (SOT §21.1)

Native Vendure sections (Products, Variants, Collections, Facets, Assets, Orders, Customers, Promotions, Stock Locations, Channels, Roles/Administrators, Settings) stay as they are. Your extensions add the LIPEK sections so the combined navigation reads:

```text
Dashboard
Commerce      Products · Categories · Collections · Brands · Pricing · Promotions · Inventory · Orders · Returns · Refunds
Services      Tailoring · Alterations · Laundry · Appointments · Pickup & Delivery · Service Tracking
Customers     Customer 360 · Leads · Opportunities · Support Cases · Loyalty · Segments
Operations    Tailor Workload · Production Queue · Laundry Queue · Quality Control · Deliveries · Delays/Exceptions
Content       Homepage · Collections · Promotional Banners · Editorial Content · SEO
AI & Automation   AI Conversations · Escalations · Recommendations · Automation Rules · Approval Queue
Analytics     Sales · Customers · Inventory · Services · Marketing · AI Performance · Operational Performance
Administration  Staff · Roles · Permissions · Settings · Integrations · Audit Logs
```

### 11.3 Screens by plugin

**`lipek-content/dashboard`** — list/detail/form screens for every content entity: `ContentPage`, `PageSection`, `NavigationMenu`, `NavigationItem`, `Banner`, `FaqItem`, `PolicyDocument`, `Article`, `ArticleCategory`, `StoreLocation`, `Testimonial`, `ServiceDefinition`, plus SEO fields per entity. Three screens carry the most weight:

- **Homepage composer** — the storefront section list (§9.1) as a drag-to-reorder board; each section has a type, a content form matching that type, a visibility toggle, and a schedule (`startsAt`/`endsAt`). A live preview link. This screen is what makes SOT §0B.5 items 4, 5 and 10 pass.
- **Navigation manager** — nested drag-and-drop tree editor for header, mega-menu, mobile and footer menus, where each item points at a collection, page, article or external URL. This is what removes hard-coded nav.
- **Publishing control** — every content entity carries `DRAFT → SCHEDULED → PUBLISHED → ARCHIVED`, shown as a status chip with permitted transitions only. The storefront must never receive `DRAFT`.

Also: a bulk import/export screen with file upload, a pre-commit validation report (row-level errors before anything is written), and a downloadable error CSV.

**`lipek-security/dashboard`** — MFA enrollment enforcement UI for staff onboarding (a privileged account cannot pass first login without enrolling), an authenticator/passkey management view, and an **audit log viewer** filterable by actor, action, entity and date range with detail drawers.

**`tailoring/dashboard`** — production board (kanban by stage, using the §9.10 tailoring stages) with cards showing customer, garment, tailor, due date and balance; a job detail screen reproducing SOT §21.4 (stage checklist with the current stage highlighted, view measurements, view reference images, update stage, schedule fitting, message customer, add internal note); tailor workload view (jobs per tailor, capacity, overdue); fittings calendar; material requirements; QC queue. Overdue jobs are unmissable.

**`alterations/dashboard`** — assessment queue, quote builder and approval state, work queue by stage, quality-control checklist screen, and photo review against the customer's uploads.

**`laundry/dashboard`** — daily pickup/delivery schedule, intake and inspection notes per garment, cleaning method and stain notes, pressing/QC/packaging status, delivery assignment to courier staff, and the recurring-plan list.

**`appointments/dashboard`** — resource and slot configuration, a calendar with conflict prevention (no double-booking a tailor or a room), and a booking detail view.

**`crm/dashboard`** — **Customer 360** exactly as SOT §20.1 (Identity, Commerce with AOV/LTV, Fashion Profile with sizes and measurements under permission, Services, Engagement, CRM, Loyalty); sales pipeline board with the ten SOT §20.2 stages; leads, opportunities, follow-up tasks, support cases with SLA indicators, interaction history, internal notes, segment builder and segment reporting; the **AI approval queue** surfaces here alongside escalations.

**`loyalty/dashboard`** — tiers (Member / Silver / Gold / Platinum), thresholds, earning rules, rewards catalogue, referral tracking, gift cards, and per-customer point adjustments with an audit trail.

**`documents/dashboard`** — generated document list (receipt, invoice, quote, measurement sheet, delivery note, refund receipt) with preview, re-send and re-generate actions, plus the order-screen action blocks (verify payment, allocate inventory, update fulfillment, add tracking, cancel, refund, notes, timeline — SOT §21.3) extending Vendure's native Order screens rather than replacing them.

**`analytics-events/dashboard`** — the **executive dashboard** (SOT §21.2): revenue today/week/month, orders awaiting processing, orders at risk, tailoring jobs at risk, alterations awaiting approval, laundry in progress, deliveries due, low stock, high-value customers needing follow-up, conversion rate, AOV, return rate, LTV, top categories, top products, service profitability, AI-assisted revenue, support escalations. Plus the operations dashboard and KPI screens. Charts use `recharts`, tokenized colours, accessible labels and a table fallback for every chart.

**`customer-experience/dashboard`** — reviews moderation queue, wishlist/back-in-stock demand signals, saved looks.

**`integrations/dashboard`** — provider status cards (payment, email/SMS, storage, OAuth, LLM) showing configured/not-configured state, last event, and a link to the relevant ADR. **Never display or accept a secret value in this UI** — configuration is environment-driven.

### 11.4 Roles drive what each screen shows

Seed and respect the SOT §22 role catalogue: Super Administrator, Store Manager, E-commerce Manager, Customer Service, Tailoring Manager, Tailor, Laundry Manager, Delivery Staff, Marketing, Finance, Analyst. Every screen you build declares the permission it requires; a user without it does not see the nav item, the route, or the action button. Measurement data is visible only to the customer and authorized tailoring staff (SOT §52C).

### 11.5 Data in the Dashboard demo

Dashboard extensions read through the Admin API. Where an entity does not exist yet (every LIPEK plugin except `lipek-security`), build the screen against a typed, clearly-labelled mock module inside that plugin's `dashboard/` folder (`dashboard/mock/`), mirroring §6's discipline: one interface, two implementations, no fixture imported by a component. Mark every mock module with a header comment naming the task that will replace it (e.g. `// MOCK — replaced by CONTENT-001`).

---

## 12. PWA, mobile and offline

### 12.1 PWA (`COM-010`, `MOBILE-001`)

- `apps/storefront/src/app/manifest.ts` — real name, short name, description, `#0DABDA` theme colour, background colour matching the light background, `display: standalone`, `start_url`, scope, orientation, categories, screenshots, and a complete icon set (192, 256, 384, 512, plus a maskable 512 and an Apple touch icon). Icons go in `apps/storefront/public/`.
- Service worker: precache the app shell, static assets and the offline page; runtime-cache images (cache-first with expiry) and API GETs (stale-while-revalidate); never cache authenticated account responses, cart, or checkout.
- Offline page: branded, explains what is unavailable, and lists what still works (recently viewed products, cached collections).
- Install prompt: a tasteful, dismissible, once-per-30-days rounded banner — never a modal on first paint.
- Reachable from the existing seeded shell at `apps/mobile/customer/pwa/sw.js` — that file is currently an empty placeholder you may fill.

### 12.2 Capacitor customer app (`apps/mobile/customer`)

Per `ADR-0007`, the customer app is Capacitor wrapping the storefront PWA. Fill the existing placeholders (`capacitor.config.json`, `android/build.gradle`, `ios/App.xcodeproj` are empty placeholder files today) with a real configuration: app id `com.lipek.customer`, app name LIPEK, the storefront URL as the web target, splash screen and adaptive icons using the brand palette, deep-link configuration matching `.well-known/assetlinks.json` and the Apple association file, status-bar theming that follows the active theme, safe-area handling, and a push-notification registration stub (no provider wired). Document the local build steps in a new `apps/mobile/customer/README.md`.

### 12.3 Delivery/courier app (`apps/mobile/delivery`)

Native (React Native/Expo per `ADR-0007`). For this engagement, build the **UI** only: courier sign-in, today's task list (pickups and deliveries, sorted by time window), task detail with customer, address, phone and instructions, navigation hand-off button, proof-of-delivery capture (photo, signature, notes), status updates against the laundry/alteration pickup-delivery stages, and an offline queue indicator for actions taken without signal. Same tokens, same rounding, larger touch targets (48px minimum), one-handed reachability.

### 12.4 Staff mobile

No dedicated app. `apps/mobile/staff/` stays a placeholder. Instead, make sure every Dashboard extension screen you build is genuinely usable on a tablet: no fixed-width tables, no hover-only actions, no drag-only interactions without a keyboard/tap alternative.

---

## 13. AI surfaces (UI only)

The Mastra AI service (`apps/ai`) is Phase 9 work and is **not** in your scope. You build the interfaces it will later drive, behind a feature flag that is **off by default**.

### 13.1 Rules

- No model provider call from anywhere in your code. No API key. No prompt sent anywhere.
- The chat UI talks to a single storefront BFF route (`/api/ai/chat`) which, for now, returns a scripted mock stream. Real identity propagation and tool calls are `AI-005`.
- The AI must never appear to have privileged access. Every AI-surfaced customer datum in the mock is data the signed-in customer already owns.
- Follow SOT §25's three permission classes in the **UI affordances**:
  - **READ** (search products, check stock, order/tailoring/alteration/laundry status, policies, appointments) — the assistant answers directly.
  - **PREPARE** (prepare return, exchange, appointment, support case, cart, alteration request, tailoring consultation) — the assistant produces a **draft** the customer must review and confirm. Render it as a rounded proposal card with an explicit "Confirm" and "Edit" pair. Nothing finalizes on its own.
  - **ACTION** (cancel order, change appointment, submit return, change address, place order, pay, refund, change sensitive info) — always an explicit confirmation dialog stating exactly what will happen, and, where relevant, a note that staff approval is required.
- Treat any content rendered inside the chat as untrusted: no HTML injection, no auto-executed links, prompt-injection-safe rendering of product/content text.

### 13.2 Screens

**Chat** — a docked launcher (rounded pill, bottom-right, respects safe areas) opening a rounded panel; full-page at `/ai/chat`. Message list with clear customer/assistant distinction, streaming indicator, suggested starter prompts, inline rich cards (product, order status, appointment slot), the PREPARE proposal card, a persistent "Talk to a human" escalation button, transcript history, and a visible disclosure that this is an AI assistant. Accessible: announced updates via a polite live region, full keyboard operation, focus management on open/close.

**Stylist** (`/ai/stylist`) — a brief-input panel (occasion, date, budget, preferences, sizes from the profile), then a generated "Your LIPEK Look": stacked rounded product cards with per-item prices and a total against the stated budget, swap-item affordances, "add all to bag", and save-as-look. Reproduce the SOT §27 example scenario end to end with mock data.

**Escalations and approvals** (Dashboard, `crm/dashboard`) — a queue of AI-escalated conversations with customer, order reference, conversation summary, transcript, urgency and recommended action; approve/reject/edit controls for AI-proposed actions, each recording who approved what.

---

## 14. Documentation reproduction

### 14.1 Copy verbatim, do not regenerate

Every one of these files must exist in your output with byte-identical content. They are the platform's governance layer; rewriting them destroys the audit trail that makes the project reviewable.

```text
Root:      AGENTS.md   CLAUDE.md   README.md   CHANGELOG.md   LICENSE   CNAME

docs/internal/
  LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md          (3,603 lines — the authority)
  Lipek Fashion Product & Service Categories.docx

docs/architecture/
  CURRENT_REPOSITORY_ASSESSMENT.md   GAP_ANALYSIS.md   TARGET_REPOSITORY_STRUCTURE.md
  system-overview.md   deployment-topology.md   domain-boundaries.md   data-model.md
  event-model.md   storefront-architecture.md   ai-architecture.md   security-architecture.md

docs/implementation/
  MASTER_IMPLEMENTATION_PLAN.md   DEPENDENCY_INSTALLATION_PLAN.md   ADR_BACKLOG.md
  DOCUMENTATION_MAP.md   SIBLING_PROJECT_SECURITY_FINDINGS.md
  dependency-register.md   environment-variables.md   migrations.md
  repo-manifest.json   ROCKET_NEW_BUILD_BRIEF.md   (this file)

docs/api/          storefront-graphql.md   admin-api-extensions.md
docs/testing/      strategy.md   test-matrix.md   performance.md   accessibility.md
docs/adr/          ADR-0001 … ADR-0013  (payment provider, email/SMS, object storage,
                   OpenSearch hosting, LLM provider, MFA approach, mobile strategy,
                   social login pattern, hosting provider, AEO strategy, theming tokens,
                   TypeScript pin, dashboard extension colocation)

apps/storefront/   README.md  AGENTS.md  CONTEXT.md  CONTRIBUTING.md  LICENSE
                   docs/architecture.md  docs/upgrades.md  docs/adr/0001-*.md
                   .upgrades/**  schemas/**
apps/server/       README.md  AGENTS.md
apps/ai/  apps/mobile/delivery/  apps/mobile/staff/     README.md each
infra/  scripts/  packages/{ui,shared,schemas,graphql,config}/   README.md each
```

The `docs/domains/` and `docs/operations/` directories are listed in `DOCUMENTATION_MAP.md` as pending; they do not exist yet, and you do not create them.

### 14.2 The documentation rules you inherit

- Every document declares its authority level under its title: **Authoritative**, **Derived**, **Provisional** or **Operational**.
- Derived documents cite SOT section numbers; they never copy SOT text.
- A decision lives in exactly one place: open decisions in `ADR_BACKLOG.md`, closed decisions in `docs/adr/ADR-XXXX-*.md`.
- `docs/internal/` never enters any `public/` directory of any app.

### 14.3 The documents you must write

Only these, and each must declare its authority level and cite the SOT sections it derives from:

| File | Level | Content |
| --- | --- | --- |
| `docs/architecture/design-system.md` | Derived | The token contract of §10 as implemented, the rounding rules, contrast decisions, and where the bridges live |
| `docs/architecture/admin-content-architecture.md` | Derived | How the Dashboard extension screens map to content entities and to SOT §0B.5's twelve acceptance tests |
| `docs/implementation/rocket-build-handover.md` | Operational | What you built, what is mocked and where, every `TODO` marker with its task ID, every deviation from this brief with its reason, and the verification output of §16 |

Append-only edits (add rows, change nothing existing): `docs/implementation/dependency-register.md` for any new package, `docs/implementation/environment-variables.md` for any new variable, `docs/testing/test-matrix.md` for tests you add.

---

## 15. What this build satisfies in the master plan

`docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` carries 168 tasks across 12 phases. Your work delivers the **UI half** of the tasks below. Reference the task ID in the commit that implements it, and in the handover state honestly whether it is complete or UI-only.

| Task ID | Title | What you deliver |
| --- | --- | --- |
| `COM-006` | Homepage implementation | The full backend-composed section system (§9.1) |
| `COM-007` | Catalog browse experience | Audience/category pages + faceted filtering (§9.2, §7.8) |
| `COM-008` | Product detail page | Full PDP (§9.3) |
| `COM-009` | "My LIPEK" account shell | Every §8.3 route (§9.5) |
| `COM-010` | Responsive/PWA foundation | Manifest, service worker, offline shell, install prompt (§12.1) |
| `COM-011` | Performance budget | Meeting the budget; CI enforcement stays ours |
| `COM-012` | Accessibility baseline pass 1 | WCAG 2.2 AA across everything you build |
| `COM-013` | Cart/checkout hardening | Guest + registered checkout UI (§9.4) |
| `COM-017` | Order confirmation, history, tracking UI | §9.10 timelines |
| `COM-018` | Returns/exchanges workflow | The customer-facing flow (§9.11) |
| `COM-021` | Staff order management screens | Dashboard order action blocks (§11.3 documents) |
| `CONTENT-002` | Dashboard extensions for content entities | All content screens (§11.3) |
| `CONTENT-004` | Homepage backend-driven composition | The homepage composer (§11.3) |
| `CONTENT-005` | Navigation menu management | The navigation manager (§11.3) |
| `ADMIN-001` | Dashboard build/shell configuration | Unified navigation across native + extension screens (§11.2) |
| `ADMIN-003` | Executive dashboard shell | §11.3 analytics screens |
| `ADMIN-004` | Staff MFA enrollment enforcement UI | §11.3 security screens |
| `ADMIN-005` | Audit log viewer | §11.3 security screens |
| `ADMIN-006` | Bulk import/export tooling UI | §11.3 content screens |
| `THEME-001` | Dark/light design tokens | `packages/ui` token contract (§10.3) |
| `THEME-002` | Storefront theme provider | Via the existing `next-themes` wiring |
| `THEME-003` | Dashboard theming bridge | `packages/ui/src/theme/dashboard.css` |
| `THEME-004` | Mobile theming bridge | Capacitor + delivery app theming (§12) |
| `MOBILE-001` | Capacitor customer-app shell | §12.2 |
| `MOBILE-002` | Customer app store readiness | Icons, splash, listing draft (§12.2) |
| `MOBILE-003` | Delivery/courier app | UI only (§12.3) |
| `SEO-001`–`SEO-005` | SEO fields, structured data, sitemap, editorial, audit | §14.2 metadata + JSON-LD + generated sitemap/robots |
| `SEO-006` | AEO surface | `llms.txt` + machine-readable Q&A (§8.7), per `ADR-0010` |
| `TAILOR-003` | Suit configurator UI | All 13 steps (§9.6) |
| `TAILOR-006`/`009` | Tailor assignment, production dashboard | §11.3 tailoring |
| `TAILOR-008` | Customer tailoring tracking UI | §9.10 |
| `ALTER-003`/`006`/`007` | Alteration request, staff queue, tracking | §9.7, §11.3 |
| `LAUNDRY-003`/`006`/`007` | Booking flow, ops dashboard, tracking | §9.8, §11.3 |
| `LAUNDRY-008` | Unified service tracking surface | "Your LIPEK Activity" (§9.9) |
| `CRM-003`/`006` | Customer 360, staff CRM screens | §11.3 crm |
| `CRM-008` | Loyalty | §11.3 loyalty + customer rewards screens |
| `AI-011` | Storefront AI chat UI | §13, flag-gated |
| `AI-015` | AI Stylist | §13.2, flag-gated |

**Not yours, and do not attempt:** `SEC-001`–`SEC-012` (real auth/MFA/OAuth/RBAC/audit implementation), `COM-014`–`COM-016`/`COM-019`/`COM-020`/`COM-022` (payments, notifications, document generation, deposits), `COM-001`–`COM-005` (real Vendure catalog configuration and import pipeline), every `*-001`/`*-002` entity and state-machine task, `OPS-*`, `SEARCH-*`, `AI-001`–`AI-010`/`AI-012`–`AI-014`/`AI-016`.

---

## 16. Acceptance criteria

Your handover is accepted when **all** of the following hold. Include the command output for each in `docs/implementation/rocket-build-handover.md`.

### 16.1 Fidelity

```bash
node scripts/verify-manifest.mjs
```

Zero `MISSING`, zero `CHANGED`. `EXTRA` entries are expected and must all be files you were permitted to add under §3.3.

### 16.2 Build and quality gates

```bash
pnpm install                      # resolves cleanly, no lockfile surprises
pnpm typecheck                    # all apps
pnpm lint                         # all apps
pnpm format:check                 # root Prettier scope
pnpm --filter @lipek/storefront test    # architecture boundary + i18n tests
pnpm --filter @lipek/storefront build   # production build succeeds for all locales
pnpm --filter @lipek/server build:dashboard   # aggregate Dashboard SPA builds
```

`apps/storefront/tests/architecture/boundaries.test.mjs` and `tests/i18n/messages.test.mjs` must pass **unmodified**. If your structure makes them fail, your structure is wrong, not the tests.

### 16.3 Functional

- Every route in §8 renders in both themes, at 375px, 768px, 1280px and 1536px, with no horizontal page scroll.
- Every screen has loading, empty and error states, all reachable and visually verified.
- `LIPEK_DATA_SOURCE=mock` produces a fully populated, convincing store. Unsetting it does not crash the app — the live source may return empty results, but pages must render their empty states rather than throw.
- **Zero business content is hard-coded.** A reviewer will grep components for category names, product names, prices, promo copy, nav labels and policy text. Any hit fails the review.
- The homepage composition, navigation menus and footer all come from data, and reordering a fixture section reorders the page with no code change.
- Both `en` and `de` are complete; no missing-message warnings in the console.

### 16.4 Accessibility (WCAG 2.2 AA — a release gate, not a nice-to-have)

Zero critical or serious axe violations on home, PLP, PDP, cart, checkout, account, tailoring configurator and the AI chat. Full keyboard operability including the mega-menu, filter panel, configurator stepper, drawers and dialogs. Visible focus everywhere. Correct heading hierarchy. Labelled form controls with errors tied by `aria-describedby`. Contrast: 4.5:1 body, 3:1 large text and UI boundaries — verified, not assumed (§10.3). Respect `prefers-reduced-motion`. Touch targets ≥44px (48px in the delivery app). Screen-reader announcements for cart updates, filter results and chat messages.

### 16.5 Performance

Lighthouse mobile on the homepage and a PDP: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95, PWA installable. LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms on a simulated mid-tier mobile device over a throttled connection. No image over 300 KB. No layout shift from fonts or images.

### 16.6 Security posture

No secret in any committed file. No Admin API credential reachable from the browser. `apps/storefront/next.config.ts`'s existing security headers and report-only CSP still present and not weakened — if a feature you add needs a CSP origin, add it to the report-only policy and say so in the handover. `/api/revalidate` still requires `REVALIDATION_SECRET`. No new endpoint accepts unauthenticated writes. `docs/internal/` is not reachable from any app's public directory.

---

## 17. Delivery

1. Work on a branch: `feat/rocket-ui-build`.
2. Conventional commits, scoped by area (`feat(storefront): ...`, `feat(dashboard): ...`, `feat(ui): ...`, `docs: ...`), one coherent change per commit.
3. Open a pull request into `main` whose description contains: the §16 verification output, the list of task IDs delivered, every mock module and its replacement task, every deviation from this brief with its justification, every dependency added with its reason, and the licence/source of every image asset.
4. Leave `TODO` markers in the exact form `// TODO(<TASK-ID>): <what remains>` so the backend wiring pass can find them mechanically.
5. Do not squash the documentation-reproduction commit together with feature commits — the LIPEK team reviews fidelity separately from features.

**When this brief and reality disagree:** for an existing file, the repository wins. For an undecided detail, the SOT wins. For a genuine gap in all three, choose the most boring, most reversible option, and write it in the handover under "decisions I had to make" — do not invent a business requirement, and do not drop a requirement because it was difficult.

---

## Appendix A — Showcase catalog specification

The demo must look like a real store on first load. Build the fixtures in `packages/testing/fixtures/catalog/` to this shape and volume. Everything here is **fixture data behind the adapter** (§6) — none of it is ever imported by a component.

### A.1 Volume and spread

Around 60 products, distributed so every navigation path leads somewhere real:

| Audience | Products | Must include |
| --- | --- | --- |
| Men | 26 | 4 suits (incl. a three-piece and a tuxedo), 3 blazers, 4 shirts, 2 trousers, 2 jeans, 4 African wear (Agbada, Senator, Kaftan, Ankara shirt), 3 shoes (Oxford, Loafer, Chelsea boot), 1 watch, 1 bag, 2 accessories (belt, tie) |
| Women | 22 | 4 dresses (evening, cocktail, casual, wedding guest), 4 African wear (Ankara dress, Kente dress, Boubou, wrapper set), 2 blazers, 2 tops, 2 skirts/trousers, 3 shoes (heels, flats, boots), 2 handbags, 3 jewelry |
| Children | 12 | 3 boys' (suit, shirt, trousers), 3 girls' (dress, top, set), 2 baby, 2 African wear incl. a matching-family set, 2 shoes |

### A.2 Per-product data

Each product record carries: `id`, `slug`, `name`, `description` (2–4 sentences of plausible merchandising copy), `collectionIds` (audience → category → subcategory, matching §7.2–§7.4 exactly), `facetValueIds` (Gender, Brand, Material, Occasion, Style, Fit, Season, Color, Care — §7.6), `assets` (3–5 images: front, back or detail, lifestyle, and one per additional colour), `optionGroups` (Size and/or Color), `variants` (SKU, price, `compareAtPrice` where discounted, stock level, option combination), `customFields` (`fit`, `material`, `careInstructions`, `modelInfo`, `sizeGuideRef`, `deliveryEstimate`), `rating` + `reviewCount`, and SEO fields.

Make the data do work for the UI:

- **~12 products discounted** (15–40%) so the sale spotlight, the `-30%` pills and struck-through prices are all exercised.
- **~6 products low-stock** (1–3 units) so the low-stock indicator appears.
- **2 products out of stock** so the back-in-stock flow is reachable.
- **~10 products flagged new** (recent `createdAt`) to fill New Arrivals.
- **At least 8 products with 3+ colour variants** to exercise swatches and image swapping.
- **One curated "look"** of 4 products (suit, shoes, belt, watch) for Shop the Look and Complete the Look.
- Prices spread realistically (accessories from ~$25, suits to ~$900) so price filtering and sorting are meaningful. Use a single currency in fixtures; the currency picker switches presentation only.

### A.3 Services, content and account fixtures

- `ServiceDefinition` records for all twelve tailoring categories (SOT §11), all ten alteration categories (§12.3) and all nine laundry categories (§13.3), each with name, slug, description, price or price range, duration/turnaround, image and active flag.
- Reuse the existing `packages/testing/fixtures/content/**` copy for blog, FAQ, legal, gallery, process, testimonials and business data — it is LIPEK's own placeholder content, already ported.
- Account fixtures for one signed-in demo customer with: 4 past orders across different stages, 1 tailoring job mid-production (at "Sewing", with a scheduled first fitting), 1 alteration awaiting quote approval, 1 laundry order out for delivery, a saved measurement profile, 6 documents, Gold loyalty tier with points and progress, 3 wishlist items and 2 upcoming appointments. This one customer makes §9.5, §9.9 and §9.10 demonstrable in a single click.

### A.4 Honesty rules for demo data

Never invent a claim the business has not made: no fake certifications, no fabricated review counts presented as real, no invented awards, no real third-party brand names presented as stocked brands. Keep testimonial names clearly placeholder-ish. Add a `"__fixture": true` marker to every fixture file's root object so a real seed script can never mistake it for production content.

---

## Appendix B — Glossary and key source references

| Term | Meaning |
| --- | --- |
| **SOT** | `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md`, the authoritative specification |
| **Master plan** | `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md`, 12 phases, 168 tasks |
| **Task ID** | `FOUND-###`, `SEC-###`, `CONTENT-###`, `ADMIN-###`, `THEME-###`, `COM-###`, `MOBILE-###`, `SEO-###`, `TAILOR-###`, `ALTER-###`, `LAUNDRY-###`, `CRM-###`, `SEARCH-###`, `AI-###`, `OPS-###` |
| **ADR** | Architecture Decision Record, `docs/adr/ADR-XXXX-*.md`; 13 accepted |
| **Dashboard** | The Vendure **React** Dashboard — the staff back office. Never the deprecated Angular Admin UI |
| **Dashboard extension** | Staff screens contributed by a plugin from its colocated `dashboard/` folder |
| **Shop API / Admin API** | Vendure's two GraphQL APIs: customer-facing and back-office |
| **Collection** | Vendure's nested category entity — LIPEK's category tree |
| **Facet / FacetValue** | Vendure's structured attribute model — LIPEK's tags and filters |
| **My LIPEK** | The customer account area (SOT §7) |
| **Your LIPEK Activity** | The unified cross-service tracking feed (SOT §8) |
| **READ / PREPARE / ACTION** | The AI permission classes (SOT §25) |

### SOT sections this brief draws on

§0A repository architecture · §0B backend-first administration and the twelve acceptance tests · §0C plugin boundaries · §0F dependencies · §3 technology architecture · §4 commerce foundation · §5 store structure · §5A backend-driven composition · §6 product detail · §6A storefront API and session rules · §7 My LIPEK · §8 universal tracking · §9/§9A order tracking and service state machines · §10–§11 tailoring · §12 alterations · §13 laundry · §14–§15 payments and documents · §16 returns · §17 search and filters · §18 personalization · §19 loyalty · §20/§20A CRM and unified admin · §21 staff backend · §22 roles · §23A–§31 AI · §35 PWA · §36 SEO · §37 accessibility · §38 security · §40 events · §41 analytics · §46 feature flags · §50–§52E readiness, topology, data rules, AI security and the Do-Not list.

### Official documentation to consult rather than recall

Vendure Core <https://docs.vendure.io/current/core> · Dashboard extensions <https://docs.vendure.io/current/core/extending-the-dashboard/extending-overview> · Collections <https://docs.vendure.io/current/core/core-concepts/collections> · Search <https://docs.vendure.io/current/core/core-concepts/search> · Settings Store <https://docs.vendure.io/current/core/developer-guide/settings-store> · Next.js App Router <https://nextjs.org/docs/app> · Next.js PWA guide <https://nextjs.org/docs/app/guides/progressive-web-apps> · NestJS <https://docs.nestjs.com> · Mastra <https://mastra.ai>

---

## Appendix C — Directory structure

Directory-level view with file counts. The complete per-file listing with hashes is Appendix D.

<!-- BEGIN:repo-tree -->

```text
lipek-platform/
|-- .vscode/  (2 files)
|-- .well-known/  (3 files)
|   `-- acme-challenge/  (1 file)
|-- apps/
|   |-- ai/  (1 file)
|   |-- mobile/
|   |   |-- customer/  (1 file)
|   |   |   |-- android/  (1 file)
|   |   |   |-- ios/  (1 file)
|   |   |   `-- pwa/  (1 file)
|   |   |-- delivery/  (1 file)
|   |   `-- staff/  (1 file)
|   |-- server/  (10 files)
|   |   |-- src/  (4 files)
|   |   |   |-- gql/  (2 files)
|   |   |   `-- plugins/
|   |   |       `-- lipek-security/  (3 files)
|   |   `-- static/
|   |       `-- email/
|   |           `-- templates/
|   |               |-- email-address-change/  (1 file)
|   |               |-- email-verification/  (1 file)
|   |               |-- order-confirmation/  (1 file)
|   |               |-- partials/  (2 files)
|   |               `-- password-reset/  (1 file)
|   `-- storefront/  (16 files)
|       |-- .upgrades/  (1 file)
|       |   |-- changes/  (3 files)
|       |   `-- releases/
|       |       `-- v1.0.0/  (2 files)
|       |-- .vendure/  (1 file)
|       |-- docs/  (2 files)
|       |   `-- adr/  (1 file)
|       |-- public/  (2 files)
|       |-- schemas/  (2 files)
|       |-- scripts/  (3 files)
|       |   `-- lib/  (1 file)
|       |-- src/  (2 files)
|       |   |-- app/
|       |   |   |-- [locale]/  (5 files)
|       |   |   |   |-- account/  (1 file)
|       |   |   |   |   |-- addresses/  (2 files)
|       |   |   |   |   |-- orders/  (2 files)
|       |   |   |   |   |   `-- [code]/  (1 file)
|       |   |   |   |   |-- profile/  (2 files)
|       |   |   |   |   `-- verify-email/  (1 file)
|       |   |   |   |-- cart/  (2 files)
|       |   |   |   |-- checkout/  (2 files)
|       |   |   |   |-- collection/
|       |   |   |   |   `-- [slug]/  (2 files)
|       |   |   |   |-- forgot-password/  (1 file)
|       |   |   |   |-- order-confirmation/
|       |   |   |   |   `-- [code]/  (1 file)
|       |   |   |   |-- product/
|       |   |   |   |   `-- [slug]/  (2 files)
|       |   |   |   |-- register/  (1 file)
|       |   |   |   |-- reset-password/  (1 file)
|       |   |   |   |-- search/  (2 files)
|       |   |   |   |-- sign-in/  (1 file)
|       |   |   |   |-- verify/  (1 file)
|       |   |   |   `-- verify-pending/  (1 file)
|       |   |   `-- api/
|       |   |       |-- health/  (1 file)
|       |   |       `-- revalidate/  (1 file)
|       |   |-- components/
|       |   |   `-- ui/  (58 files)
|       |   |-- config/  (3 files)
|       |   |-- features/
|       |   |   |-- account/  (3 files)
|       |   |   |   |-- components/  (1 file)
|       |   |   |   |-- messages/  (2 files)
|       |   |   |   `-- routes/  (1 file)
|       |   |   |       |-- addresses/  (5 files)
|       |   |   |       |-- orders/  (2 files)
|       |   |   |       |   `-- [code]/  (2 files)
|       |   |   |       |-- profile/  (6 files)
|       |   |   |       `-- verify-email/  (1 file)
|       |   |   |-- authentication/  (4 files)
|       |   |   |   |-- messages/  (2 files)
|       |   |   |   `-- routes/
|       |   |   |       |-- forgot-password/  (3 files)
|       |   |   |       |-- register/  (3 files)
|       |   |   |       |-- reset-password/  (3 files)
|       |   |   |       |-- sign-in/  (3 files)
|       |   |   |       |-- verify/  (5 files)
|       |   |   |       `-- verify-pending/  (1 file)
|       |   |   |-- cart/  (2 files)
|       |   |   |   |-- components/  (1 file)
|       |   |   |   |-- messages/  (2 files)
|       |   |   |   `-- routes/  (7 files)
|       |   |   |-- checkout/  (3 files)
|       |   |   |   |-- messages/  (2 files)
|       |   |   |   `-- routes/  (7 files)
|       |   |   |       `-- steps/  (5 files)
|       |   |   |-- collections/  (3 files)
|       |   |   |   |-- messages/  (2 files)
|       |   |   |   `-- routes/  (2 files)
|       |   |   |-- currency/  (3 files)
|       |   |   |-- orders/  (2 files)
|       |   |   |   |-- messages/  (2 files)
|       |   |   |   `-- routes/  (2 files)
|       |   |   |-- pricing/  (1 file)
|       |   |   |-- products/  (7 files)
|       |   |   |   |-- components/  (6 files)
|       |   |   |   |-- messages/  (2 files)
|       |   |   |   `-- routes/  (2 files)
|       |   |   `-- search/  (5 files)
|       |   |       |-- components/  (1 file)
|       |   |       |-- messages/  (2 files)
|       |   |       `-- routes/  (4 files)
|       |   |-- hooks/  (1 file)
|       |   |-- lib/  (1 file)
|       |   |-- platform/
|       |   |   |-- health/  (1 file)
|       |   |   |-- i18n/  (6 files)
|       |   |   |   `-- messages/  (2 files)
|       |   |   |-- revalidation/  (1 file)
|       |   |   `-- vendure/  (5 files)
|       |   `-- site/  (4 files)
|       |       |-- home/  (3 files)
|       |       |   `-- messages/  (2 files)
|       |       |-- i18n/  (2 files)
|       |       |-- messages/  (2 files)
|       |       |-- navigation/  (4 files)
|       |       |   |-- messages/  (2 files)
|       |       |   |-- navbar/  (12 files)
|       |       |   `-- skeletons/  (2 files)
|       |       `-- providers/  (1 file)
|       `-- tests/
|           |-- architecture/  (1 file)
|           |-- i18n/  (1 file)
|           `-- upgrade/  (2 files)
|-- docs/
|   |-- adr/  (13 files)
|   |-- api/  (2 files)
|   |-- architecture/  (11 files)
|   |-- implementation/  (8 files)
|   |-- internal/  (2 files)
|   `-- testing/  (4 files)
|-- infra/  (1 file)
|-- packages/
|   |-- config/  (1 file)
|   |-- graphql/  (1 file)
|   |-- schemas/  (1 file)
|   |-- shared/  (1 file)
|   |-- testing/
|   |   `-- fixtures/
|   |       `-- content/
|   |           |-- blog/  (8 files)
|   |           |-- data/  (1 file)
|   |           |-- faq/  (3 files)
|   |           |-- gallery/  (4 files)
|   |           |-- legal/  (4 files)
|   |           |-- process/  (4 files)
|   |           |-- services/  (2 files)
|   |           |   `-- custom-tailoring/  (8 files)
|   |           |-- shop/  (2 files)
|   |           `-- testimonials/  (1 file)
|   `-- ui/
|       `-- src/
|           |-- primitives/  (6 files)
|           `-- tokens/  (1 file)
`-- scripts/  (4 files)
(+ 13 files at the repository root)
```

<!-- END:repo-tree -->

---

## Appendix D — File manifest (SHA-256)

Every entry must be reproduced exactly. Hashes are over canonical content: text files normalized to LF, binary files raw — so a Windows checkout and a Linux checkout of the same commit produce identical hashes. Verify with `node scripts/verify-manifest.mjs`.

<!-- BEGIN:repo-manifest -->

_Generated by `node scripts/generate-manifest.mjs`. 451 files, 2,633,535 bytes._

_Excluded (self-referential): `docs/implementation/repo-manifest.json`, `docs/implementation/ROCKET_NEW_BUILD_BRIEF.md`._

| # | Path | Bytes | SHA-256 |
| --- | --- | --- | --- |
| 1 | `.gitignore` | 601 | `6ddabcda5c4de4f95957ffb5da975ba3e31d507ee59fb25e528b677a718c9bbb` |
| 2 | `.node-version` | 3 | `68ca3fba3b7e864770cb61aeb306d4bd4354b68ab4dd38450860c5d823e42a53` |
| 3 | `.prettierignore` | 1463 | `4b1a681d8009d27238ac16b85a49c5e355d6a6aabddafdfe2fb63f7d1211d3ee` |
| 4 | `.prettierrc` | 89 | `ebe733191f06a29fdd34a4683327d9a36c008ed8da564d8e7def1c700d7463ff` |
| 5 | `.vscode/extensions.json` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 6 | `.vscode/settings.json` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 7 | `.well-known/acme-challenge/[random-token]` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 8 | `.well-known/apple-developer-merchantid-domain-association` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 9 | `.well-known/assetlinks.json` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 10 | `.well-known/security.txt` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 11 | `AGENTS.md` | 6884 | `b54b99726be496790d5fb7741daaef217d822094f2fef65a7d93d390b4a0301a` |
| 12 | `CHANGELOG.md` | 805 | `328ad17b82b632746ef0650922976a8e58cb8abaa2a4bdf7c346874de217765f` |
| 13 | `CLAUDE.md` | 1838 | `8b1621492de56009d6faed234e8ad2a60a6db9a91f568d4a5f97c2460c962435` |
| 14 | `CNAME` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 15 | `LICENSE` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 16 | `README.md` | 3871 | `90a817268b830e7e8e3058d243bea7562df009ab99ed7f9608f9b2c4b9f34212` |
| 17 | `apps/ai/README.md` | 378 | `3428bdea20626662696b8cffc4789e4094e44ca1bac2756327a692d9522a5070` |
| 18 | `apps/mobile/customer/android/build.gradle` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 19 | `apps/mobile/customer/capacitor.config.json` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 20 | `apps/mobile/customer/ios/App.xcodeproj` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 21 | `apps/mobile/customer/pwa/sw.js` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 22 | `apps/mobile/delivery/README.md` | 360 | `05c7bb8d9607587c9f389521276b45966de320f35cf47b41123feffcbb38a271` |
| 23 | `apps/mobile/staff/README.md` | 363 | `046a1fdb4820b94c730d1771a4979f81221410ababaa6f49259a17cc47a4a451` |
| 24 | `apps/server/.env.example` | 1730 | `774151d0c277c6c701a5a3c5df8504977251d1e98ad47b3b80c7cdf84a951725` |
| 25 | `apps/server/.gitignore` | 76 | `0d668fed311c46856fcd65246f510dae8b8022eaf9759b1315d3bad6cdca9117` |
| 26 | `apps/server/AGENTS.md` | 1115 | `7fdd7c157b8bf461dc80345cf9c175688007eef4aac469eec37d2ed41b72d0bb` |
| 27 | `apps/server/Dockerfile` | 113 | `3ae0ae2ffdcb82bc3a6ed0d2dc1d57c80a228aa505a163fdf26dbafda75aa0b2` |
| 28 | `apps/server/README.md` | 5413 | `bb5fbac13d9107ea9ca0a0ac739af48b236479131458b583e75e6366f439ebe9` |
| 29 | `apps/server/docker-compose.yml` | 5283 | `68b5507de92154c02c58192d7d8e3b75b8d9df4c1f6d0b2f975298771207f7c9` |
| 30 | `apps/server/package.json` | 1015 | `e49b72fe6474c9bb934c1254aeefdde45a68ab34c2ed6e9a0110f2d46c25e9df` |
| 31 | `apps/server/src/environment.d.ts` | 630 | `d063e61b373bb470acfdd73ce8747ddcc2ac0e7cf177d48fdd2d39d1d057de0a` |
| 32 | `apps/server/src/gql/graphql-env.d.ts` | 441246 | `36b0a2dea828fcc3ecebc28acb5b6a630ab8cc2d863bef0e8cd0bbac7034bb79` |
| 33 | `apps/server/src/gql/graphql.ts` | 408 | `299ad35e9e2185ee0298d95155aa8ea2739bcaa6736c4f5dd76b944cca4fec65` |
| 34 | `apps/server/src/index-worker.ts` | 215 | `80de1d1fe81d45846bf577be3b64318c8b29ad28bb78f856773b361f587ef4cf` |
| 35 | `apps/server/src/index.ts` | 213 | `1726dc7ef9685c6cf182a840e4987955be9b35453f50ac843d517fcdde97f289` |
| 36 | `apps/server/src/plugins/lipek-security/lipek-security.plugin.ts` | 1204 | `051400091d126f10e2ab3bada630b06bc19ad50fdcb92fed6c6b43bee80a2638` |
| 37 | `apps/server/src/plugins/lipek-security/origin-allow-list.ts` | 2588 | `c605fc407c4106f4823c7d656d21aab5c21911dcf447378213c4b7bbb6c9b5c0` |
| 38 | `apps/server/src/plugins/lipek-security/rate-limit.middleware.ts` | 2573 | `2ae5e19884582cdc7d5e487b18e4e4aae4539aef323793b4b45fc494c898ec15` |
| 39 | `apps/server/src/vendure-config.ts` | 4229 | `96250dc415266dbb345a20bb30dd2a99722db9df48a4184cbda3a62799284f3c` |
| 40 | `apps/server/static/email/templates/email-address-change/body.hbs` | 636 | `3aa7a7f8469eb2d35dc05a3cc2760f7d15f1434162e71fa71b983628f687db25` |
| 41 | `apps/server/static/email/templates/email-verification/body.hbs` | 607 | `109438580b8c7ad526d0a9943ac28b9f1c681e8257760c33db1b22db9d3b8ef4` |
| 42 | `apps/server/static/email/templates/order-confirmation/body.hbs` | 4401 | `0b0e15fc4bd585a2256d8220bea6ec946b9ede59e04959b6f5d8299aebeacbd3` |
| 43 | `apps/server/static/email/templates/partials/footer.hbs` | 244 | `d6e7b424e7248d1280191480b50d816eeabda412404f9494d05a071d11a5096f` |
| 44 | `apps/server/static/email/templates/partials/header.hbs` | 448 | `d6315dfe64daafca4a87a591fd023b70e785df87bac01b311cf8446d2ebc61d4` |
| 45 | `apps/server/static/email/templates/password-reset/body.hbs` | 696 | `4af564ed24ed2651069e56bbdc6a1f6c31b9418bb33c24b07f66ed3b42d5300f` |
| 46 | `apps/server/tsconfig.dashboard.json` | 390 | `165a3ff36371b7d91e1a2b8a50d2a54bfaf58b20128005ab1208dc5936d88342` |
| 47 | `apps/server/tsconfig.json` | 758 | `6037303920f1c5e1803b2e4c07da41eef901ec1fec3941743402dd06fb23ee8b` |
| 48 | `apps/server/vite.config.mts` | 1750 | `115be7d3a9100a845f2e8f5b87c715ef3f80b695a6f390e2c7a7d0abeb9cbdb4` |
| 49 | `apps/storefront/.env.example` | 1232 | `dc4cfb0c9268e5e7e3aee07236a3b3a342fe6b2c29dae1a4e2ea6cc41ec360a1` |
| 50 | `apps/storefront/.gitignore` | 560 | `df2902acfa64a61e5f8f3a01719bf93a2d2dd02edc9ef22e2dd904ba40dca72f` |
| 51 | `apps/storefront/.mcp.json` | 225 | `1caa24634d02a0c6b241e1ef804c587f06c7d3f7ba669ac47dbd963c1ce22bdb` |
| 52 | `apps/storefront/.npmrc` | 599 | `709d6ed59fbcf248149ffcaf1b906ba89ad853887e429f8b0f95b22c89f2cee0` |
| 53 | `apps/storefront/.upgrades/areas.json` | 225 | `65b2ff6eb6ee828113e9fbc4b60ed23ea0b77781253a03add32603507d9e4847` |
| 54 | `apps/storefront/.upgrades/changes/README.md` | 589 | `d29e088764f31fe82b211af3b70eb9661323c80813f4cc6ba311a1ae99321c45` |
| 55 | `apps/storefront/.upgrades/changes/_example.md` | 317 | `be81d9e77b83dfadb335022317b5b09cd98170e0a901f64992ac530372ac27ef` |
| 56 | `apps/storefront/.upgrades/changes/fix-account-verification.md` | 1693 | `2a1df5a13cf2ca946a75a7c51d649970456c68767784a07d59dc5835bc5ad5b4` |
| 57 | `apps/storefront/.upgrades/releases/v1.0.0/guide.md` | 4437 | `f255f2117e599d4d4b002b2ae8cad5ce46375923cebb69592c54d9f5c1a27148` |
| 58 | `apps/storefront/.upgrades/releases/v1.0.0/manifest.json` | 4979 | `9039412834f484a734341d32b933e4b90180d06dcf34d55508fffc00524b97c0` |
| 59 | `apps/storefront/.vendure/storefront.json` | 327 | `f21c6ebeda27c3d20e343acb1f371d273e1b8f3a59de218f7c972e9bba39188a` |
| 60 | `apps/storefront/AGENTS.md` | 1433 | `aec666307a898173aff17bd63a3d6ff66717ed4c1e46930bc5d9e9c7d8d16694` |
| 61 | `apps/storefront/CONTEXT.md` | 1506 | `b569737837ecd4fb140ee2a42fb794337c5b63c939e69cd7ab6be5d5f3ebce43` |
| 62 | `apps/storefront/CONTRIBUTING.md` | 704 | `ff827038ef9a6128930d973a67cb307d7e632108ff296c782525e3ed81df46f8` |
| 63 | `apps/storefront/LICENSE` | 1069 | `aa532736dbbb7db60536dab3354bd6c8ed1e69dd5efe157e29e236bed0626e4f` |
| 64 | `apps/storefront/README.md` | 4582 | `89289cc2edc802dba63d88e8a9d34ec68ba79aac7e5e530a3c7059adfe85f294` |
| 65 | `apps/storefront/components.json` | 459 | `81d02a4816cce01aab58b0474c96cdd1ec7edd9c1765e1fa808f6419bcf426f8` |
| 66 | `apps/storefront/docs/adr/0001-source-distributed-agent-upgrades.md` | 1042 | `f270c638a5e5cff0a416ee4ec22288d24bf0cd04b5115c496e1edd38379ea41e` |
| 67 | `apps/storefront/docs/architecture.md` | 2581 | `dc1d953718e6ace73b5db5fccc9cc7b9ffc6536466c0e8e25d258d7021431b4b` |
| 68 | `apps/storefront/docs/upgrades.md` | 3955 | `ee731e1c2e922ef3b445471c02ee9d19bc69c8722fff1d8e97c562bbb5f0e3b9` |
| 69 | `apps/storefront/eslint.config.mjs` | 1608 | `3e7cb2de9ac9d0b6e1f904ac1e3bea7838327b9219c326f60fb60f972cfffd16` |
| 70 | `apps/storefront/graphql.config.yml` | 52 | `09b804acf0237614f294cd79128251604bb9bd16c1210088ef2023ec76eb7557` |
| 71 | `apps/storefront/next.config.ts` | 3307 | `20ff41e43f6ddefe4641599cd086aaece10627ca096d1bf5a6241dd4e0c9832e` |
| 72 | `apps/storefront/package.json` | 1918 | `f1985580696e09fd07d93dc46cba35494438da139d63d5d0b95c9728d29913b7` |
| 73 | `apps/storefront/postcss.config.mjs` | 81 | `141ef24ca27a99d08962210fdf20212d3435fdcfa21b46cd88b44d22f751dfae` |
| 74 | `apps/storefront/public/next.svg` | 1211 | `16038afa4489791682b7aa107b8e3422186b769ff336f70cd924037fb2596835` |
| 75 | `apps/storefront/public/vendure.svg` | 792 | `7e6a13444e424f2f90b9ab582fd309f3c193e6620ea74dbc409c43bdb1c59a7d` |
| 76 | `apps/storefront/schemas/storefront.schema.json` | 793 | `c4d23215528d7310a5014bed50cb7b550bde0e030a4a8b3db579c7f5ecf040fd` |
| 77 | `apps/storefront/schemas/upgrade-manifest.schema.json` | 998 | `b4b92b01dee2717d6b1a6d86179fe1471e1bbee16fafdb86d248f348ff750545` |
| 78 | `apps/storefront/scripts/lib/upgrade-protocol.mjs` | 21506 | `d07fc00a010e09c6715219cb4c6ec9bb1608d2d3a5e23fe171f34976cf6e7688` |
| 79 | `apps/storefront/scripts/storefront-release.mjs` | 3564 | `28d729cc2588606eb58329eaa646080211601d104ba6774dceab7b13118692af` |
| 80 | `apps/storefront/scripts/storefront-upgrade.mjs` | 2334 | `2f9cf23aa5703ec488530fe226693c862f9d91dd576854ace087f3479cad6fdf` |
| 81 | `apps/storefront/scripts/validate-upgrades.mjs` | 5106 | `b5c97c355216f576d3251683a8110c947edb33c13a08566dc258d6da282716d3` |
| 82 | `apps/storefront/src/app/[locale]/account/addresses/loading.tsx` | 69 | `ebaf40b80bb6488c24f1828a9383eb7069c3fcc5d4643d5b342bb74bf7e54a38` |
| 83 | `apps/storefront/src/app/[locale]/account/addresses/page.tsx` | 84 | `90703c9844283d87e0a1fc1f61dbed982d64a0afd4468af2bad93bb10705f273` |
| 84 | `apps/storefront/src/app/[locale]/account/layout.tsx` | 68 | `f2aa4bf47269da806be20f310a92ac180fa4b5ade78ed5379b0167079013d88c` |
| 85 | `apps/storefront/src/app/[locale]/account/orders/[code]/page.tsx` | 88 | `43123262a0a7246a27ac791be1b16350f831d8a9ac20223c2cc73b1e7860a4e1` |
| 86 | `apps/storefront/src/app/[locale]/account/orders/loading.tsx` | 66 | `b577ca2ea95837c4efdc14b53e55819e6f57a4ae26d4056f5d75f63c3ffc6674` |
| 87 | `apps/storefront/src/app/[locale]/account/orders/page.tsx` | 81 | `33a28e9a210763b0348f908443967531aeaf51b5dae705b3cc8b04f8dbc3138e` |
| 88 | `apps/storefront/src/app/[locale]/account/profile/loading.tsx` | 67 | `b62ddff2930ae1714e6281088b7654bdfaa953360f5e496eb0987d2ad549598a` |
| 89 | `apps/storefront/src/app/[locale]/account/profile/page.tsx` | 82 | `f493ea813532c5b0eb0d547a5aa30a551b676d15a58685ba73badf90966fcd59` |
| 90 | `apps/storefront/src/app/[locale]/account/verify-email/page.tsx` | 69 | `d093c4f2d7155359d08749fe1117a7ad65239e54b24e1776678c56bde79f427b` |
| 91 | `apps/storefront/src/app/[locale]/cart/loading.tsx` | 56 | `9c93dadab789ff87a50e8e60090d676424d54daa477e1eb9f23b56d8ce1a8c57` |
| 92 | `apps/storefront/src/app/[locale]/cart/page.tsx` | 71 | `9c9ace61c395e89279e11f2f3a39b3bd03524a7e336b81941314c72695e88769` |
| 93 | `apps/storefront/src/app/[locale]/checkout/loading.tsx` | 60 | `a193bbb86705416e3b0aff628593473de875e249edcecbe9a71f37b93d948ea9` |
| 94 | `apps/storefront/src/app/[locale]/checkout/page.tsx` | 75 | `cd366861b57bc3cd25d7c1c138a481a87dde2fd5cbdd447630a630d0c7f141a6` |
| 95 | `apps/storefront/src/app/[locale]/collection/[slug]/loading.tsx` | 63 | `73fcc464b3a61cff7a194c6d13c3bce676c483b093a0dadf3372d59d88d7b8f4` |
| 96 | `apps/storefront/src/app/[locale]/collection/[slug]/page.tsx` | 78 | `df1ac8042bab78535eee09fb440ff9cedc57d286f504eb3eca24a7452fe243ac` |
| 97 | `apps/storefront/src/app/[locale]/favicon.ico` | 25931 | `2b8ad2d33455a8f736fc3a8ebf8f0bdea8848ad4c0db48a2833bd0f9cd775932` |
| 98 | `apps/storefront/src/app/[locale]/forgot-password/page.tsx` | 97 | `112a1c2c6bd8f4eeaa9c6dfda8ffa1291c956982e2688f35125773e292cb3d37` |
| 99 | `apps/storefront/src/app/[locale]/globals.css` | 4845 | `b9b7e387f11680f0217b721fac24f57a0313fd3c7eeb7e48b3926c52950a7ed6` |
| 100 | `apps/storefront/src/app/[locale]/layout.tsx` | 140 | `f93dc25a2b02d40f6e751ce2b20e1f78b640282a98c6a7556f76575db1c2a855` |
| 101 | `apps/storefront/src/app/[locale]/not-found.tsx` | 42 | `78b0a51376570dd24fd09cd2dc6dc039da7a2153b8654826d62121cd5518c0c0` |
| 102 | `apps/storefront/src/app/[locale]/order-confirmation/[code]/page.tsx` | 73 | `6c45d3ff89f787b8594c1cb67d6e8443de1296caa03d5375d2d52363a609557b` |
| 103 | `apps/storefront/src/app/[locale]/page.tsx` | 60 | `da9d677cc10d00573a62b19ffc8591cab31f7ed2002fac9fe09584476b2e980b` |
| 104 | `apps/storefront/src/app/[locale]/product/[slug]/loading.tsx` | 60 | `f230cf275c8539511566f4c380b0dcaf3eb8fadb43675d7d3299cd21766c9987` |
| 105 | `apps/storefront/src/app/[locale]/product/[slug]/page.tsx` | 75 | `e0cbd2b7be228c8815b889f77d674322eb40281314bb07474e33be8007fa34f6` |
| 106 | `apps/storefront/src/app/[locale]/register/page.tsx` | 90 | `5fcfa3a9577e7616dd7c58dc040c02f636f053a12aca752ba2a53c922b173b2a` |
| 107 | `apps/storefront/src/app/[locale]/reset-password/page.tsx` | 88 | `83e579e3fd7fddf6ae59560ce44e6aa1b2678f5bc70910cd186f6da23bf5c819` |
| 108 | `apps/storefront/src/app/[locale]/search/loading.tsx` | 58 | `fc553506caef76475e8a044dcf529719c8e3f18db1c6581c83659ed11ff8e764` |
| 109 | `apps/storefront/src/app/[locale]/search/page.tsx` | 73 | `7fcbab34482fe4fd4dcd67bc6505d78fcb94eea3b0c9226613781153e71bf257` |
| 110 | `apps/storefront/src/app/[locale]/sign-in/page.tsx` | 89 | `3075f27db671721de5d68d171730a07780fe7a3417d32001c532d3fe5ed4ef96` |
| 111 | `apps/storefront/src/app/[locale]/verify-pending/page.tsx` | 88 | `05d30c030160be89fd9bf2aec2de5d8a3686775e842193a0cb4b6b24adc43396` |
| 112 | `apps/storefront/src/app/[locale]/verify/page.tsx` | 80 | `4b96f6e812958597443ce686c369bf88f0f37c93f95a9aff51d8cdd66e9206fb` |
| 113 | `apps/storefront/src/app/api/health/route.ts` | 47 | `f477778b31dc71bbccb19e0caf471b72788c166cad4a56ee3bbd5d513e96f584` |
| 114 | `apps/storefront/src/app/api/revalidate/route.ts` | 54 | `3f9f0b62eb238dce6db40a751d9e56782f92e5fa9710dae11d48451b45660e28` |
| 115 | `apps/storefront/src/components/ui/accordion.tsx` | 2608 | `3bf7a9f19b40494f24ffa43b3d78e723a18ffbe818eacaad85aed3fb038327d6` |
| 116 | `apps/storefront/src/components/ui/alert-dialog.tsx` | 5186 | `1a256ee8b805c792c8ac9ab1fa7a97653f798f3688be11d38013964c13428351` |
| 117 | `apps/storefront/src/components/ui/alert.tsx` | 2050 | `26142e6f255d291475046412fd47b6054294f244f531636e40e57d5fdd3bbbf3` |
| 118 | `apps/storefront/src/components/ui/aspect-ratio.tsx` | 403 | `c6db82ab2401e402c7c6d178ff59eb570535c76db5953b3bb78be564c5b24669` |
| 119 | `apps/storefront/src/components/ui/avatar.tsx` | 3038 | `357b2f9aac0192c071cb2ed65cb6e4c8ec01fa02fc15cf50d889b85731b75666` |
| 120 | `apps/storefront/src/components/ui/badge.tsx` | 1925 | `968b0403af74a785c9408ca69a677235e49d0c80b2c27fb9858ad421a8778c7d` |
| 121 | `apps/storefront/src/components/ui/breadcrumb.tsx` | 2599 | `42ba479095437a93592d351c1f1f3348155b6c91059ed18bf233e473ee56de1f` |
| 122 | `apps/storefront/src/components/ui/button-group.tsx` | 2490 | `3f6073d35fa44d54c32ee6bc3aab0b0f0671b517ee7b846cfcb4a6de8f62372e` |
| 123 | `apps/storefront/src/components/ui/button.tsx` | 3183 | `2c8bd48487a3d4a1644638f4714b988114aaaeeea6d0e7d52e76bf898651b0d1` |
| 124 | `apps/storefront/src/components/ui/calendar.tsx` | 8268 | `60bb28f6dfacdea3716ec49b0a83a2d20654ef40fd87e8d92304a0ba73044267` |
| 125 | `apps/storefront/src/components/ui/card.tsx` | 2600 | `9523c2f027e5c89fc2694dd7c39dc6712700210596b5eea2f76367c3f3b88884` |
| 126 | `apps/storefront/src/components/ui/carousel.tsx` | 5625 | `139dad00a475fba78155113fcf927a8102e11c6d3f3a97844d237a2bb0878c8e` |
| 127 | `apps/storefront/src/components/ui/chart.tsx` | 10501 | `0060b7708d85a5fffc914dcd1ee4753b5acfe83db7ba634b4cea280bd9f19c8f` |
| 128 | `apps/storefront/src/components/ui/checkbox.tsx` | 1367 | `edd756241dd84023b75601f6904224684dbd7b8b05014a2cc65e75bb93fde6ef` |
| 129 | `apps/storefront/src/components/ui/collapsible.tsx` | 658 | `ead4349ff7b01d696ef89294a81d18ee1d3f732321398896462c834ab9b9e065` |
| 130 | `apps/storefront/src/components/ui/combobox.tsx` | 9058 | `a04965745e88e6ba8792d3eb527f334284495be00a0288684c3ea90f47fb74d5` |
| 131 | `apps/storefront/src/components/ui/command.tsx` | 5013 | `bdb6c906cc106171f9ee116b4f5e8b6d687178eab37733c5fe4f638e32431948` |
| 132 | `apps/storefront/src/components/ui/context-menu.tsx` | 8021 | `4970437a3ff8ecd6c869fe4df8f4cc317178c7a02ff1f34958e30f66cc69c742` |
| 133 | `apps/storefront/src/components/ui/country-select.tsx` | 2187 | `e4a5efa11361698180e3ec055bb7ae740716e13174490075d457e5dda4f0ce37` |
| 134 | `apps/storefront/src/components/ui/dialog.tsx` | 3957 | `f1b33935a05653ef07552e0870da206f9782d24f33693e81f832ec8366ec63a6` |
| 135 | `apps/storefront/src/components/ui/direction.tsx` | 103 | `661ff5b9c0dc26edde1226bfedc0ab50976d84f8bae42ca83a38dc3b478fd4d4` |
| 136 | `apps/storefront/src/components/ui/drawer.tsx` | 4316 | `2f354fd8f2ff8a3fe58f8d4a9425ffe322697b18f05dda1083cc1b6605fd3c96` |
| 137 | `apps/storefront/src/components/ui/dropdown-menu.tsx` | 8728 | `1d9c675696543e55be016481a923650930cf969e222f6d71a7942d9cfbf589aa` |
| 138 | `apps/storefront/src/components/ui/empty.tsx` | 2384 | `8fd6e4908b00138108cf1754ce2bda20e82f3e4a69c4b2d2ecc61935e8b647d0` |
| 139 | `apps/storefront/src/components/ui/field.tsx` | 6024 | `08d3062d571475ed9f68b47e435568105a79bc2eed708eab453b0e4ac15d123e` |
| 140 | `apps/storefront/src/components/ui/form.tsx` | 3795 | `3874eb0a616827f33b0af1ecfc6fce55ed373d8fda69471d1187418c885ede8f` |
| 141 | `apps/storefront/src/components/ui/hover-card.tsx` | 1853 | `49cf2bbb064008c230941833e23704b0156474ce89d202b6b407bab8a3834831` |
| 142 | `apps/storefront/src/components/ui/input-group.tsx` | 5087 | `d377d8a55f56b8a4fe5928d5595d4843c3efd0e0d4510a0de2e4d8b915276829` |
| 143 | `apps/storefront/src/components/ui/input-otp.tsx` | 2557 | `9694392bbfb93ba822b2dd598c1bf68446520ddced4ae6812fe262f6d5d95d3f` |
| 144 | `apps/storefront/src/components/ui/input.tsx` | 1015 | `6103e13ae46f88158c423718afc2228959b7636defb5a74b2ff0ecb8358f15f2` |
| 145 | `apps/storefront/src/components/ui/item.tsx` | 4860 | `bc90e60ea030b75c66b66bf1ae7a411b2182392de53a6b5c016ea4f850b46d97` |
| 146 | `apps/storefront/src/components/ui/kbd.tsx` | 837 | `1e477363fca474e23b9a1f0e5d2920cd7319e076eaa5156ba29ea4722b96bba5` |
| 147 | `apps/storefront/src/components/ui/label.tsx` | 518 | `7f19b8476658d25ff197c84030e58cd7395059d876a54630e025951e474ebdae` |
| 148 | `apps/storefront/src/components/ui/menubar.tsx` | 8167 | `c34e16c24ef25dbacfed8b7fd36febfa1129d25439d252f9f77008ed61395eef` |
| 149 | `apps/storefront/src/components/ui/native-select.tsx` | 1902 | `2d8d6001743788bb0322dc5826fd371a72eff71d8f21f954d8e481ee54db5016` |
| 150 | `apps/storefront/src/components/ui/navigation-menu.tsx` | 7383 | `a6fc478dcb836522ebe354e890734d3a58ca510abae9dd70969bd33365f935a0` |
| 151 | `apps/storefront/src/components/ui/pagination.tsx` | 2858 | `a6f28004a41543137afb1b10eded2771b545d24d99581774f5a9454b5f223a26` |
| 152 | `apps/storefront/src/components/ui/password-input.tsx` | 1328 | `e546e7df02481f0d3f3f6d57f41376f54a7e256457dbd83f8eb889647e950038` |
| 153 | `apps/storefront/src/components/ui/popover.tsx` | 2568 | `a9349bcf39e71e1e37c01ce11d1532bcf2664b6bfb02df53a21f808befa89392` |
| 154 | `apps/storefront/src/components/ui/progress.tsx` | 1742 | `001c65bfb53b5bcbb738d4ff902970a5d1c34ec25f6a9ca854a2edaed06b6a3e` |
| 155 | `apps/storefront/src/components/ui/radio-group.tsx` | 1653 | `f8d30996bf429ef7f90aa42a8efdf47fee08c6b49e038944ab91331b16eea76a` |
| 156 | `apps/storefront/src/components/ui/resizable.tsx` | 1671 | `379baf7a1de109a1ea14419c99b76fbec1cb4f10d6ee13605b0b2940d615afeb` |
| 157 | `apps/storefront/src/components/ui/scroll-area.tsx` | 1624 | `42de3962daca60255bf1d3cd90bd3c038db73a3ed61ecaac6cffc6a153181e4a` |
| 158 | `apps/storefront/src/components/ui/select.tsx` | 6611 | `ed693f9bf28804417edcd8a0583c093b5b516c1ea52de63cacfb0a69078ef788` |
| 159 | `apps/storefront/src/components/ui/separator.tsx` | 545 | `75085bd84ff6965e4a356c53a4689799cabf65caa93c0bba064d5a0c6fa78f13` |
| 160 | `apps/storefront/src/components/ui/sheet.tsx` | 4365 | `611be711a2c08ea403de7d9b3b7534524b2b77c72deeaafbad6ec8725e0e2ea3` |
| 161 | `apps/storefront/src/components/ui/sidebar.tsx` | 21643 | `716ece208111d6e4f76068cea62653766493b4675e1f40d231fbc104e189747e` |
| 162 | `apps/storefront/src/components/ui/skeleton.tsx` | 275 | `8110bba70d0cb9fe968c0b7bd092ad12258caef40b028b4a87f402bdab907faf` |
| 163 | `apps/storefront/src/components/ui/slider.tsx` | 1971 | `002bb33d5d8cb1bdaadc2e2f699c16e1593ba7853b35d099535a0ec91d129de4` |
| 164 | `apps/storefront/src/components/ui/sonner.tsx` | 1226 | `2dd975ad2170ba2570b00e58713dcbda90f26a7fffdaceb1ef7255f450c2d2a6` |
| 165 | `apps/storefront/src/components/ui/spinner.tsx` | 302 | `1aa4cbc4272e833ecda915e3f59649ec5dfa8528d6c583a0a1b1e668496abacf` |
| 166 | `apps/storefront/src/components/ui/switch.tsx` | 1717 | `8ccf9bcb71a7ccc76057eb1eebcd251c1dbab537ba82b2f518240d9e1e584386` |
| 167 | `apps/storefront/src/components/ui/table.tsx` | 2372 | `10990ec0d1343db7848818b7459418c2283dc7e0213e31f9d60c9c5dd1350f54` |
| 168 | `apps/storefront/src/components/ui/tabs.tsx` | 3427 | `34f6b3356ac05ac3591414363d7917f21eb7be26cc9f26f2e02dba837bc0e79f` |
| 169 | `apps/storefront/src/components/ui/textarea.tsx` | 817 | `f7b389a3abce47c4fa1f8bd3ffde22add0328ce9d032dc943dc9333d01cdfa6a` |
| 170 | `apps/storefront/src/components/ui/toggle-group.tsx` | 3112 | `f504fc0add1286e13e9b84f289ccaa3580d20dc04927c1590dcae1034b2f2051` |
| 171 | `apps/storefront/src/components/ui/toggle.tsx` | 1460 | `0c3fe0d65e6fd51b1566b7fcd6ed9342294373270ba478c3f5b7ce3834393e63` |
| 172 | `apps/storefront/src/components/ui/tooltip.tsx` | 2846 | `2cea2294d4947b88d815860f64e0b5e0eb47a59bde47cfd194aac2230c923865` |
| 173 | `apps/storefront/src/config/json-ld-script.tsx` | 565 | `0268ad47cba86d069564a61a3b6e3b967af9e55aa97de661fc23faeedb7dc5e1` |
| 174 | `apps/storefront/src/config/json-ld.ts` | 3233 | `bfaf17fe60d9bb8f210a961f052691df32d4a90e14015321ccc478d163ee8b4d` |
| 175 | `apps/storefront/src/config/metadata.ts` | 1764 | `4bf230c991f12b25e7d08b1fee5f9a0b71dc4229749f9ca4ded4572f3b7f9db0` |
| 176 | `apps/storefront/src/features/account/components/account-nav-links.tsx` | 2746 | `f356391c1e348967f899857cef1f892f14633b6fe94c8d6b7cd3498dc1ab3a16` |
| 177 | `apps/storefront/src/features/account/customer.ts` | 517 | `284f192761bfd1387cbaf066261279f7e19e686789e32af9b9f92440ebc75322` |
| 178 | `apps/storefront/src/features/account/graphql.ts` | 6996 | `65c0b286bc7bed45b9c4797e0bdc216f906ee4f466fe2f1c6af7fcef8507af1d` |
| 179 | `apps/storefront/src/features/account/messages.ts` | 209 | `abdda1adc5226dca6428f6fcddb10b11902ec2da297cbd705e229da5d4182fd4` |
| 180 | `apps/storefront/src/features/account/messages/de.json` | 5571 | `2e0fee30c39d38032148148d2e69c74d89659676f2a0fd97aafd4130b46c5e7f` |
| 181 | `apps/storefront/src/features/account/messages/en.json` | 4935 | `7b18f6591c3e707b63c75ff80f87a3161755064a2a25729ab85699afdcea14b5` |
| 182 | `apps/storefront/src/features/account/routes/addresses/actions.ts` | 3494 | `fd1593479d975a62335682fd6c2cc99fdc7231829957433a32e849bd1a711539` |
| 183 | `apps/storefront/src/features/account/routes/addresses/address-form.tsx` | 6042 | `41202497de830a28530154e07445e839518b3e8325496642802dad1dd7858e96` |
| 184 | `apps/storefront/src/features/account/routes/addresses/addresses-client.tsx` | 13158 | `bbc8260d68829bb0cfaa2ab768b9419eebae6fa292bc564a318bef8663c9e2e6` |
| 185 | `apps/storefront/src/features/account/routes/addresses/loading.tsx` | 2042 | `64881c707e1a65e81138d3ea828152138ea156280a2255b31cf67b49d6ee8ef6` |
| 186 | `apps/storefront/src/features/account/routes/addresses/page.tsx` | 1531 | `600261e4f687c4f216e8053e4b08e93e423b9964bc5dbfd17d05e4bc0dd6314d` |
| 187 | `apps/storefront/src/features/account/routes/layout.tsx` | 1366 | `e5d25745d8c2456d5993fba83bc1de0570a63930e1605ed6b0313c9a5001d108` |
| 188 | `apps/storefront/src/features/account/routes/orders/[code]/order-detail.tsx` | 12987 | `3831475a91b48ec1efa9e7d117d32793b60ffdb2e3b048b37c2498121ffd6daf` |
| 189 | `apps/storefront/src/features/account/routes/orders/[code]/page.tsx` | 1292 | `d259df904062007f6ff86a66d75a3919f118be48385e70138645f0a29b4798a5` |
| 190 | `apps/storefront/src/features/account/routes/orders/loading.tsx` | 1972 | `32e38466babd7598bff01f1367430d6b8efc8abf6122f8ba774162665c8feb3c` |
| 191 | `apps/storefront/src/features/account/routes/orders/page.tsx` | 10882 | `07df7da813d8fe7142032444b9c406c65274d3d043b571ab052703c545354b83` |
| 192 | `apps/storefront/src/features/account/routes/profile/actions.ts` | 3459 | `771fab4bd53b713f1269920ca0172fc2879cdaf60f4487f958b8bc559414c9f3` |
| 193 | `apps/storefront/src/features/account/routes/profile/change-password-form.tsx` | 3270 | `a8ef842f7d8fca222879f8017a3deb9c248cd7c9da0e6363219ee5c035841cb4` |
| 194 | `apps/storefront/src/features/account/routes/profile/edit-email-form.tsx` | 3537 | `d24c683c0a6cd1e74539c6cbf6d33a34ac4e8217d9400344e11468cc40dbf43c` |
| 195 | `apps/storefront/src/features/account/routes/profile/edit-profile-form.tsx` | 3035 | `ac5469e9d4b18ebec0887a3368d6e5b4c6cb3ab820e22b5b124a61c7c712b427` |
| 196 | `apps/storefront/src/features/account/routes/profile/loading.tsx` | 2033 | `da17a27699c3c812fc483444a75004f8361c2428448af39b45bb54d08cdd84e3` |
| 197 | `apps/storefront/src/features/account/routes/profile/page.tsx` | 1284 | `72af459f2fb93cd6cfffa1c512c7ddbbd73c6f3b9c38a51e522ab91fea7dd733` |
| 198 | `apps/storefront/src/features/account/routes/verify-email/page.tsx` | 4898 | `066abdf748ea6e9ff8d4f3a94bfcd86d13ecb8bbf3687b5bad4651a50605762c` |
| 199 | `apps/storefront/src/features/authentication/auth-context.tsx` | 1006 | `ee1675203e86a7df5c64693f1fafe78d48cb9999eb00fd4c13fe900ba74df71b` |
| 200 | `apps/storefront/src/features/authentication/graphql.ts` | 2238 | `8cbc36b0a2f4c33adfce63eb7922d74465c795b639732fa7030570ce5eb1bee1` |
| 201 | `apps/storefront/src/features/authentication/logout.ts` | 443 | `d40348ada753c7e302d90b946fd6e3538892c02214c22f1a834114bac14119cd` |
| 202 | `apps/storefront/src/features/authentication/messages.ts` | 216 | `d45f6aed31317061551099736202fcf43daaf1aab9aafa5e14c5181b5ef66b90` |
| 203 | `apps/storefront/src/features/authentication/messages/de.json` | 3786 | `6c49014331856b7661e104df6e2ef2678f49cb9b72955c8f4faad69db5c46851` |
| 204 | `apps/storefront/src/features/authentication/messages/en.json` | 3308 | `1fbed6ea39ab598cf50599ab59166bed29d4cdd4687160271a3ccb5ac524b1c2` |
| 205 | `apps/storefront/src/features/authentication/routes/forgot-password/actions.ts` | 937 | `66ce50673ff6ce85fee71303dcef63c5d1379857fd09db267778b2d173615e5b` |
| 206 | `apps/storefront/src/features/authentication/routes/forgot-password/forgot-password-form.tsx` | 4782 | `886a0387e0c4fce7e147734d5d089277273cf34c090cf6e1a8639eb7594fc511` |
| 207 | `apps/storefront/src/features/authentication/routes/forgot-password/page.tsx` | 726 | `fa8cc3e92a394d48d37e8641980eb0d6adda527dbefbf901cea79a0ed1f0966e` |
| 208 | `apps/storefront/src/features/authentication/routes/register/actions.ts` | 1639 | `e2824beda029d3d59b0a0c38d34aa93c1d1192232a4f6746633461d1144ae6b0` |
| 209 | `apps/storefront/src/features/authentication/routes/register/page.tsx` | 5008 | `4cb650174351b2a3249d9d41c5946bc3f5da19d09e71ce288e70e6bdb97f0160` |
| 210 | `apps/storefront/src/features/authentication/routes/register/registration-form.tsx` | 9684 | `c5af8cada8dba66cc7838235a7e4bea83ab541b4095a411cc28b29df93e3ea95` |
| 211 | `apps/storefront/src/features/authentication/routes/reset-password/actions.ts` | 1293 | `8e65e3e1ea8ed22d329140abd0b696ab9180a18ffbc6b0f15dda1ae99d4b3471` |
| 212 | `apps/storefront/src/features/authentication/routes/reset-password/page.tsx` | 886 | `79cc8f2ed9491545d00b481dc0e9684ab310ec245ac6a600fb8ed3cf8c5ac502` |
| 213 | `apps/storefront/src/features/authentication/routes/reset-password/reset-password-form.tsx` | 3688 | `93d892f41fb68a4d44189acf7980800507f52501de1a5a27bcfc0f3cb47401b6` |
| 214 | `apps/storefront/src/features/authentication/routes/sign-in/actions.ts` | 1492 | `17690566437e0c4170bf635d9247eb92299488a55942d88391449a0c24e8908d` |
| 215 | `apps/storefront/src/features/authentication/routes/sign-in/login-form.tsx` | 5426 | `3930f305b52469687105f315c29c3014684fea01db5fd31ece4931d91a8048c5` |
| 216 | `apps/storefront/src/features/authentication/routes/sign-in/page.tsx` | 4212 | `589ac3d1ea164b4e5e2258e54c495766d65d09cecf89e41868ecdd749eacafe3` |
| 217 | `apps/storefront/src/features/authentication/routes/verify-pending/page.tsx` | 2668 | `d19cbfcb5a341488dbfe6be4b0a7b27f6f96f4d631d21fda8e8d32ce2ee21389` |
| 218 | `apps/storefront/src/features/authentication/routes/verify/actions.ts` | 1036 | `d88aae9fe8df5c4dfd75e6ae18fdbb3a56bb4a38e5edb73ca7cba45caef9ea14` |
| 219 | `apps/storefront/src/features/authentication/routes/verify/page.tsx` | 725 | `0387d19f8883aa8ded2b9ac101aee3a70c49a2156ad092befcbb5ae00628efce` |
| 220 | `apps/storefront/src/features/authentication/routes/verify/verify-content.tsx` | 3076 | `7e3ebd2ce35060ea68760ade2061e1c151f342fa153f9349f4630680011f3fbc` |
| 221 | `apps/storefront/src/features/authentication/routes/verify/verify-loading.tsx` | 737 | `86627bd9e7668fbd55aa573a88df92ccead345b7f023ae3ee1a591d0a408841c` |
| 222 | `apps/storefront/src/features/authentication/routes/verify/verify-result.tsx` | 2849 | `8a22d999eb39ad5ea987630c3f1fa6e809d1aaba6c5773ba6e62526d94e5856f` |
| 223 | `apps/storefront/src/features/cart/components/cart-skeleton.tsx` | 2164 | `fa033e5ea6b8993acbc8406da37831d98a0917f0d039f083222ada6584806cca` |
| 224 | `apps/storefront/src/features/cart/graphql.ts` | 3437 | `23310fcd2ee8eed8f8a1aa1ae9c1dbf96ad30e30130ac4c207973a6180d51033` |
| 225 | `apps/storefront/src/features/cart/messages.ts` | 206 | `d909683d70e38d5ffa00a699ecfe654f69b8e5a86fe2f04dff30f69f8824c491` |
| 226 | `apps/storefront/src/features/cart/messages/de.json` | 720 | `1c3bce977b50e6a0cf60c2ca470dc8045d976e7fa7c6da3bf663dd17bdeaae51` |
| 227 | `apps/storefront/src/features/cart/messages/en.json` | 673 | `f045fa7e2177c85ca02a0fcee89b2224e5ae68368c487be89e07a236db9f2a39` |
| 228 | `apps/storefront/src/features/cart/routes/actions.ts` | 1440 | `3f8ae72f591f4c4ef021b5f3c51abc1b0ca5d2b64fbe653774614d2cfccdd570` |
| 229 | `apps/storefront/src/features/cart/routes/cart-items.tsx` | 7632 | `3506a0f49e057591ee6cc3b9d60b5c7ffc4473a392f63cb86cc42abb3bca8610` |
| 230 | `apps/storefront/src/features/cart/routes/cart.tsx` | 1310 | `72f6763747c448c62bb4207d4e502817b7d01bb13bbf591f999685656fb0c358` |
| 231 | `apps/storefront/src/features/cart/routes/loading.tsx` | 312 | `4f87dba9684caf037833ed4459e467c14d26dca474a67e8cd440d9e4fa3898ca` |
| 232 | `apps/storefront/src/features/cart/routes/order-summary.tsx` | 3215 | `ef38616be3f5fb27758db0bd100ecd8e0449e3e3dd75e0c5ce43f1366bb4b60e` |
| 233 | `apps/storefront/src/features/cart/routes/page.tsx` | 1013 | `9ed227e5c126e3907ca7f3edb0a9111b53fc8a58c4ed84822fcb56edd63a8d03` |
| 234 | `apps/storefront/src/features/cart/routes/promotion-code.tsx` | 2913 | `8298863af8e083f6eef3267b826b34a3d099ea7c3ab7f34ec4356855862f7b49` |
| 235 | `apps/storefront/src/features/checkout/countries.ts` | 440 | `49eafb65cc8709fb90d9c6ef0b4a02930af68f2914284b4fe7d472c20611328a` |
| 236 | `apps/storefront/src/features/checkout/graphql.ts` | 6788 | `6b66c2d7f4216eda76fccbd55eb34a8ca31cc22d229f052d78cf7298a174b232` |
| 237 | `apps/storefront/src/features/checkout/messages.ts` | 210 | `d1756e4d038cdbfb96233a1ae14141d82a7a0f149d5ac53f0b10abeebac59569` |
| 238 | `apps/storefront/src/features/checkout/messages/de.json` | 3727 | `661297dcafe3e686949491bc5a78ed6b180bec3cdcb1dc034d46f709c56610cb` |
| 239 | `apps/storefront/src/features/checkout/messages/en.json` | 3413 | `5f6d1690ce7688ed80644bdc4e5c00c51194e2674ef8c2d5d13b02a32ed71c52` |
| 240 | `apps/storefront/src/features/checkout/routes/actions.ts` | 5795 | `50cf88491f1d64e4b9082023500ae9fc02edfd9bd5ecdf143d2302ec297538ce` |
| 241 | `apps/storefront/src/features/checkout/routes/checkout-flow.tsx` | 11007 | `15447c5a53b3a28a81b96043f5b91dbf0c12d2ceb2bd9b9931a35f33356914af` |
| 242 | `apps/storefront/src/features/checkout/routes/checkout-provider.tsx` | 2358 | `a035aab3888afd28cc8177c189c33185b390ade01ed5fe126dfaf5e5696548e7` |
| 243 | `apps/storefront/src/features/checkout/routes/loading.tsx` | 4352 | `c7c5fba8990d65c41bc65baac3a8d5d3efcb39866736c75b767590d30f2a71ba` |
| 244 | `apps/storefront/src/features/checkout/routes/order-summary.tsx` | 5643 | `ac1a631c86cb9e7096fe4a0770d50a69ed86391811f270aec040aa4f88858282` |
| 245 | `apps/storefront/src/features/checkout/routes/page.tsx` | 3129 | `5a5432dd0b6f5a9cfbce81f6ef2975a71a828661aaf4235ee990478ffcc78e3e` |
| 246 | `apps/storefront/src/features/checkout/routes/steps/contact-step.tsx` | 4608 | `b6f81d884fff53525dda1bd183b842924792dc71484fcb19077e0d73b58daabe` |
| 247 | `apps/storefront/src/features/checkout/routes/steps/delivery-step.tsx` | 3602 | `4728de947cf9609b8989378712f2bba0d1dcad8c4cbe24e02711c4cc8d81b3ae` |
| 248 | `apps/storefront/src/features/checkout/routes/steps/payment-step.tsx` | 2119 | `08f12dfbf28f52631a6b6d9ccf557aea4196c4cd0d6bc4961e7b93808178dce3` |
| 249 | `apps/storefront/src/features/checkout/routes/steps/review-step.tsx` | 6720 | `a31619370cba9aaf819db032a61276556ba077e3db896e11ef077499efc09f5c` |
| 250 | `apps/storefront/src/features/checkout/routes/steps/shipping-address-step.tsx` | 21639 | `88126d1e98d5be7d114927ab887722e5390424e265d9ed72614e76df8ed6b92c` |
| 251 | `apps/storefront/src/features/checkout/routes/types.ts` | 419 | `84b082d4307381e3e4c40e6c7e3db22be5945e77f35a18d058efee7405511422` |
| 252 | `apps/storefront/src/features/collections/data.ts` | 418 | `fb7ae8fe8b76a6bec0f671057e0b9e0fbfb768417fb4d1b29bac607b773580b8` |
| 253 | `apps/storefront/src/features/collections/graphql.ts` | 871 | `140bd7ae1339b886316109ec7d43d942f419acba0fbb80a29d0704151add098f` |
| 254 | `apps/storefront/src/features/collections/messages.ts` | 213 | `68add1ddc10ade7f38621ef06b08d44da8d5ad26a7b2644a7fc30b12c0a87e26` |
| 255 | `apps/storefront/src/features/collections/messages/de.json` | 188 | `e9e7327f7e72138e5c84326555886f66743de6e3835a0da701659b4ab7ed4219` |
| 256 | `apps/storefront/src/features/collections/messages/en.json` | 167 | `6344d1742bc2eb7e7d71332cd06468ab19d91c2807de656c2f2dfe256847d242` |
| 257 | `apps/storefront/src/features/collections/routes/loading.tsx` | 675 | `f8426ac27bc58625a9c529ffe6717a04b061f1336b0f2f6756388328f1bb7e8b` |
| 258 | `apps/storefront/src/features/collections/routes/page.tsx` | 5936 | `6689ef9c839ab8a89c9c4a1c95a11233e7a95f065387eeafc178ce68a280dacc` |
| 259 | `apps/storefront/src/features/currency/currency-server.ts` | 637 | `4cc0014de8a37bc1a89e3efa94b9817fb91ef5923945e0f90bfbe189273f0f7d` |
| 260 | `apps/storefront/src/features/currency/currency.ts` | 501 | `87d952eb5708c699c26569ec2a51461baa016ab9dd104274452540cb94ca8bb7` |
| 261 | `apps/storefront/src/features/currency/switch-currency.ts` | 579 | `06433872ab2d1ea910e7677347e1440e99ba9ac5e2ce90c18e498c61ac830e76` |
| 262 | `apps/storefront/src/features/orders/messages.ts` | 208 | `3abb6dc786ec356d0a5c8682f7b68063b43fb6471d5b4483005df38966a43c2b` |
| 263 | `apps/storefront/src/features/orders/messages/de.json` | 929 | `9cab36ff432c750816c17bd3d2f4fa767a489cf722df6d43dfd52b168c410179` |
| 264 | `apps/storefront/src/features/orders/messages/en.json` | 862 | `fd0fa30c471525ca0801fc29b03918634ffbe8bd23982aee7aeca087d4c8e181` |
| 265 | `apps/storefront/src/features/orders/order-status-badge.tsx` | 1707 | `5b337b5d0a9cf97081e84e5c1fdec0f5845b2606a05cefeacc944336d05634a1` |
| 266 | `apps/storefront/src/features/orders/routes/order-confirmation.tsx` | 7430 | `0aed7e2769f302ef23976c2585ee891c51234e07fe4abc865292e90f2889b66a` |
| 267 | `apps/storefront/src/features/orders/routes/page.tsx` | 993 | `b534c73630dcf8bd03df283bd978edeecf494adcb069c6c66648eae9efb95b60` |
| 268 | `apps/storefront/src/features/pricing/price.tsx` | 533 | `c4aaf9f64c4bb238c4cf4a60d8238562d0b480d07dbbc129e3614fa1829c18b9` |
| 269 | `apps/storefront/src/features/products/add-to-cart.ts` | 1196 | `2db72aca4e219d255899bb933fbe811e9a1e9ed35d3fba7681cbc9456112b7af` |
| 270 | `apps/storefront/src/features/products/components/pagination.tsx` | 3334 | `bcb25980efc6f8ee4d2b4b5ff0eb34f44b5b42d08044433ffd8910362a203df0` |
| 271 | `apps/storefront/src/features/products/components/product-card.tsx` | 2944 | `a56d94da66a1178e0e56e70aa1576346d80b0943c850cf84ae133a00e68394f3` |
| 272 | `apps/storefront/src/features/products/components/product-carousel.tsx` | 1658 | `cb138590035211637fcbfe94d25a6e4c9de83589c99176882942f51f50e1bac3` |
| 273 | `apps/storefront/src/features/products/components/product-image-carousel.tsx` | 4235 | `0f5f26e130442bccfa46f82e010a326b84003e57dba56d7d3cda5fb505cf7371` |
| 274 | `apps/storefront/src/features/products/components/product-info.tsx` | 10026 | `a010a6a8630d4a5ed763dc486e2552cc7807754e69a3c663816acfa4ed04ea7d` |
| 275 | `apps/storefront/src/features/products/components/related-products.tsx` | 2135 | `263d4dffa436c24b6197ea1e1989e30e14d7ccbbd5fb579fed58680c6bd947d2` |
| 276 | `apps/storefront/src/features/products/featured-products.tsx` | 2244 | `4cffd460a716b8bb2a7c01a4d6116eb560087987c873084264f6ab0808be2959` |
| 277 | `apps/storefront/src/features/products/graphql.ts` | 1639 | `d327a893cc7f10b6f5a2f0a110864c00dee609db254573ff2ebcfb1632994d25` |
| 278 | `apps/storefront/src/features/products/messages.ts` | 210 | `399efb96e41f92cb164eb555286423d11dad8393783802c428d27cffeba46e70` |
| 279 | `apps/storefront/src/features/products/messages/de.json` | 2570 | `eb6da45dacf309411abed838f74c1d49c3f01994ce72e5340f2cdd25209bf484` |
| 280 | `apps/storefront/src/features/products/messages/en.json` | 2241 | `575ca398b0331570ec59cb560424320031ec6c81fd3e28f629dddfa376eb6d21` |
| 281 | `apps/storefront/src/features/products/product-grid-skeleton.tsx` | 930 | `164af2002b8b862beaaa85156d1a728bd1e9c76f15423097c25117e5381cde22` |
| 282 | `apps/storefront/src/features/products/product-grid.tsx` | 1907 | `fbe5b7bc9e257a3f030274f708f275248de7fe4163aff7d936ab284c64af45a0` |
| 283 | `apps/storefront/src/features/products/product-options.ts` | 1185 | `9994d3c7c1fe047016f510d121f1157313cff4cff56b9f613bb7effa9ec202ef` |
| 284 | `apps/storefront/src/features/products/routes/loading.tsx` | 2177 | `1b2a860036c78fec05757d6c3dc3b35e4d1357e0ba20960e45c0a79ab773d3a0` |
| 285 | `apps/storefront/src/features/products/routes/page.tsx` | 9785 | `b5e363659519eae0aa395a6998a038a36b26ee3fbade6e0b722cc5d7b7888c39` |
| 286 | `apps/storefront/src/features/search/components/search-results-skeleton.tsx` | 538 | `8824f5f3e6da5b291e20564ac4abfe00983814d28b58ae84fba2cef04dd11f3f` |
| 287 | `apps/storefront/src/features/search/facet-filters.tsx` | 7784 | `18a1f0502bd55d8173fb255e17adad2aa48f96444f128b791518752a35b9bb18` |
| 288 | `apps/storefront/src/features/search/graphql.ts` | 638 | `cd0e00e29890fb176bdb199817b604f6c51256ce00038b06f4f51b31b3a8100b` |
| 289 | `apps/storefront/src/features/search/messages.ts` | 208 | `ea8dfc12206dac70de07405c543c8bc110df1983df268a6c85e7e68c9f790dee` |
| 290 | `apps/storefront/src/features/search/messages/de.json` | 659 | `e94f4e1653907db5fdb1f5d49bc8d572fdbb37b06eaba0cd77420e33b984e460` |
| 291 | `apps/storefront/src/features/search/messages/en.json` | 625 | `97cd4932d05f718a1980ef245bcd21f7913c9f4a2fe366a05932b35644e1062a` |
| 292 | `apps/storefront/src/features/search/routes/loading.tsx` | 382 | `a68eebae0b72fd87307463ae112917f10abc6606f5632cc4fae2241af94cab4c` |
| 293 | `apps/storefront/src/features/search/routes/page.tsx` | 1644 | `c682893ddbd77ad767eb6367f509fe8243971808c4d51feb4ff089b1d1a9d322` |
| 294 | `apps/storefront/src/features/search/routes/search-results.tsx` | 1802 | `4c7963c829296aa7de71b8b3a1895f7488ebc903e0d4d141043448cebbece2d5` |
| 295 | `apps/storefront/src/features/search/routes/search-term.tsx` | 903 | `d89a6ee948f0f71441185802b2dfd6b2c44daca629372091a5a67e4e4879e047` |
| 296 | `apps/storefront/src/features/search/search-helpers.ts` | 1789 | `b5255c995d90411506f74dbc0f856067374d48069adc3f43566f7d4cb74b8029` |
| 297 | `apps/storefront/src/features/search/sort-dropdown.tsx` | 1645 | `ff5f1e0a58d90550060dfbefec9376b50ea02d2dcb18463ff82ed4fccfba8707` |
| 298 | `apps/storefront/src/graphql-env.d.ts` | 198514 | `42ff1375fa7cbcf749122c18386adc0cac19f9036c09e8bb93882f5da7c41a75` |
| 299 | `apps/storefront/src/hooks/use-mobile.ts` | 565 | `ad0936f84f1df79d3697bfbff9c18f8ad58431c1cbaf2359c6a853b0fcc9f28b` |
| 300 | `apps/storefront/src/lib/utils.ts` | 166 | `7c8c3dfc0cdd370d44932828eb067ef771c8fe7996693221d5d4b90af6d54f2d` |
| 301 | `apps/storefront/src/platform/health/handler.ts` | 838 | `ff1750319b099d6873f13095968ffe3f2e6c6eb1be6339ca75081912041ed767` |
| 302 | `apps/storefront/src/platform/i18n/format.ts` | 672 | `8f9f2d25f57206ab75afbee544b38984f2f24aa41468f167a68e442a1729a35f` |
| 303 | `apps/storefront/src/platform/i18n/locale-utils.ts` | 420 | `632d6840815f9111e19cef6715a27658508b0ac5445e7ca85e389d16227008bd` |
| 304 | `apps/storefront/src/platform/i18n/messages.ts` | 320 | `46b751d83d691f80ac31743a7247f491b0c8a3c430304507300a55075ac900f9` |
| 305 | `apps/storefront/src/platform/i18n/messages/de.json` | 1437 | `7f44175ed901fc447204188070b371eb37da40c5f1a7f32aa71667cdfdea5137` |
| 306 | `apps/storefront/src/platform/i18n/messages/en.json` | 1208 | `5922717715ba4e034cf529d8edb4e8995715a444db77f9c2d4d0a452a8c6918f` |
| 307 | `apps/storefront/src/platform/i18n/navigation.ts` | 187 | `799de934b3d5a8b1c31651dab054d3830db87258ed3fb45af41ac1b481e2ecf6` |
| 308 | `apps/storefront/src/platform/i18n/routing.ts` | 296 | `5f64807f134312a385246110b1bb006916e34cee1a1dc2af971f4a505ff43c9a` |
| 309 | `apps/storefront/src/platform/i18n/server.ts` | 678 | `3d134c58a9c056da06d0321199ff7a061016acc0ad62f10b1f7917d953eaf074` |
| 310 | `apps/storefront/src/platform/revalidation/handler.ts` | 4299 | `b2a89cc0a7de74678ddc2443cc06d985044a73dd0162252a8fccc079a408633c` |
| 311 | `apps/storefront/src/platform/vendure/api.ts` | 4071 | `d59e715234d0682df9655d77e7f1bbf50e11cb446cef1088bde780c4d0a4601c` |
| 312 | `apps/storefront/src/platform/vendure/auth-token.ts` | 566 | `0ee24817dd8b4d64f6171f34d2c9557db965054cdf3cffba43942b6f43238722` |
| 313 | `apps/storefront/src/platform/vendure/channel-graphql.ts` | 322 | `0f52d9759a39ca5640d2cb9197f4da78a9887febf3b6318b1de2e4ad024ebe22` |
| 314 | `apps/storefront/src/platform/vendure/channel.ts` | 508 | `84cca0c8fafe57b1783adeac8674044d46b0308cdcc6fb9dfd4a8356729d0a9b` |
| 315 | `apps/storefront/src/platform/vendure/graphql.ts` | 402 | `f34781f8a50844bf54c31fb68f6fa775d4a8bd742a0b0b83cafd6e4954f2b9c5` |
| 316 | `apps/storefront/src/proxy.ts` | 345 | `ecf255465a73307bd115892038bd1a3d5358a74299a0881e85a6e2a3fafe5bc2` |
| 317 | `apps/storefront/src/site/footer.tsx` | 7048 | `3a4b058809a2d62d45be8f50f3a975526f070065dbcafe854d13f3efb4465bd7` |
| 318 | `apps/storefront/src/site/home/hero-section.tsx` | 2521 | `c15e63c150126a9d86f183af45162a872d80dc31ecd381381a7472901dae1939` |
| 319 | `apps/storefront/src/site/home/messages.ts` | 206 | `edf3a83d52f6c10bcf9b8ccdc74ae8d4892789414eee1aac9239846c0c57b315` |
| 320 | `apps/storefront/src/site/home/messages/de.json` | 1134 | `9df17ab499c11f0b897bf0c9f5c531f68486d37cf50083a3d686dad9f867247e` |
| 321 | `apps/storefront/src/site/home/messages/en.json` | 1017 | `f77f407e904429e17fcfd1c4bd98046b4bddf532aa12e8e5100b165d7b436a92` |
| 322 | `apps/storefront/src/site/home/page.tsx` | 3057 | `e530d62d2d632e007c2d523ba6d72dc4144ff2790cb9b738a0a4d9d0accd0843` |
| 323 | `apps/storefront/src/site/i18n/messages.ts` | 2126 | `48facc8df235f7d37fd02419b39493260e89cf7017bf73b0792087c797871e52` |
| 324 | `apps/storefront/src/site/i18n/request.ts` | 475 | `5b32b858020bf3e39e4ea3dcb38f713c024c4d56add2f67da1456436db214eaa` |
| 325 | `apps/storefront/src/site/locale-layout.tsx` | 3297 | `fef6911c054980564a26eba4c9b3c81775bd70ea04ad45ca2f5de8b37483f17a` |
| 326 | `apps/storefront/src/site/messages.ts` | 206 | `fa1397c1c1007eaa0c888175803a75e9e0a6682b7ac4c2d72460addbd5247d61` |
| 327 | `apps/storefront/src/site/messages/de.json` | 808 | `69aca9c8087eaba0b6eadf9adf090cf9d2ea3fd0da9b380ec1ae57dfadba1c22` |
| 328 | `apps/storefront/src/site/messages/en.json` | 782 | `5fc96756b20593d6ee7179ece566a9a2ef7ecfc9222aad2bbec0f7e312297510` |
| 329 | `apps/storefront/src/site/navigation/messages.ts` | 212 | `d5090207a9606fc82ae1f8d60c8f79000593e243c8ed9ecb063241933c95343a` |
| 330 | `apps/storefront/src/site/navigation/messages/de.json` | 500 | `69aa5fcdb4c84bf26569dceffecbe6f44d3910102cef396509985b223106d84d` |
| 331 | `apps/storefront/src/site/navigation/messages/en.json` | 486 | `328ced2c430af42164891096ca84227f90a0ade0b064f1caa30780ec49675fc1` |
| 332 | `apps/storefront/src/site/navigation/navbar.tsx` | 2878 | `9aab1892be10fe692c158152bb726c89e63ba2e138a22836bdc3837876edb050` |
| 333 | `apps/storefront/src/site/navigation/navbar/cart-icon.tsx` | 930 | `cb4216b68466aac4760b71280fd5d523f69645472590c15bf7a24d07f7ae64d8` |
| 334 | `apps/storefront/src/site/navigation/navbar/currency-picker-wrapper.tsx` | 665 | `ccda416072bf806714edd6b8667adb99e02f4ad2d602dda7d7ef928addcb6a35` |
| 335 | `apps/storefront/src/site/navigation/navbar/currency-picker.tsx` | 1934 | `5bf5316027d5de4510955b5a2f3ee37fea85b18e0c3b93099b66ad91b109b643` |
| 336 | `apps/storefront/src/site/navigation/navbar/language-picker.tsx` | 1524 | `4bf4eca81d77245db04232353379f14d94b2cf27025dab57e90606ca750b5a8d` |
| 337 | `apps/storefront/src/site/navigation/navbar/login-button.tsx` | 992 | `bfc9605f1dc599c6d01f0ed9e8ca24eb0515d9385f3b6fb2e002e068ebc41cf0` |
| 338 | `apps/storefront/src/site/navigation/navbar/mobile-nav-wrapper.tsx` | 508 | `01a64e879ef5628c2b97345fca8c3b0f3c2332afa92b4ee39c7f224c628fa23b` |
| 339 | `apps/storefront/src/site/navigation/navbar/mobile-nav.tsx` | 7019 | `7c265ae68ac2f1e9eea6ee977edd76d050ae0b9d48bce4541399bf606abd4527` |
| 340 | `apps/storefront/src/site/navigation/navbar/navbar-cart.tsx` | 601 | `6efc163c78d0981854c2c750fcaa92defbeba2519ef5d0749123f1f12205c560` |
| 341 | `apps/storefront/src/site/navigation/navbar/navbar-collections.tsx` | 1061 | `8e773b4bf308fb5c9488c8437440ab40ab6a11e6311f00b41b9051030c8a444e` |
| 342 | `apps/storefront/src/site/navigation/navbar/navbar-link.tsx` | 854 | `f7314e1a7c8a630f9987ba8085fd082f4e74b955680216693390bc402efc2d13` |
| 343 | `apps/storefront/src/site/navigation/navbar/navbar-user.tsx` | 1574 | `341160aaf5a894d602a687e5c2dd79e4364f5686ca46d2fc6d72f1ae3d363a93` |
| 344 | `apps/storefront/src/site/navigation/navbar/theme-switcher.tsx` | 2153 | `a7cea297b141f0369472eb3771dc690d89006a6c764b910143a01f418552c7e0` |
| 345 | `apps/storefront/src/site/navigation/navigation-link.tsx` | 869 | `2fb57bad95a62e5faa3c5b4a5678c16a3e093d0d5749d207cc567a10a210a9eb` |
| 346 | `apps/storefront/src/site/navigation/search-input.tsx` | 1455 | `a9c23ee22607713a3c19ec8dc9cf398f0eb7d0cc603790ea3fb29fd2f11f9909` |
| 347 | `apps/storefront/src/site/navigation/skeletons/navbar-user-skeleton.tsx` | 226 | `a8a69ffc61c3cdc5764e82642d74d185512f72391101b7e53eaa6b97a02a8bdd` |
| 348 | `apps/storefront/src/site/navigation/skeletons/search-input-skeleton.tsx` | 158 | `2e7bd49e0737996aa479c610b3b7730d2d4b14536aabe27bbb18e9a84d70fec3` |
| 349 | `apps/storefront/src/site/not-found.tsx` | 3091 | `dc574f967614229e6ac395792cb94ba1410f33b1c513093b36dcd6a1e761dbe7` |
| 350 | `apps/storefront/src/site/providers/theme-provider.tsx` | 394 | `ce5081998d2ccc5b1fceee280c8172478c813c987e3a5784e932c476faadaf16` |
| 351 | `apps/storefront/tests/architecture/boundaries.test.mjs` | 5301 | `93bf0383c52c546f6e9776265533cffe6c4daf185f66347408091c7124cd7d22` |
| 352 | `apps/storefront/tests/i18n/messages.test.mjs` | 5667 | `65af654204e2bc3f38d9b0253e92d723fb716b36f30b934a046e6004844737e2` |
| 353 | `apps/storefront/tests/upgrade/protocol.test.mjs` | 13505 | `c7c781b930a503fa8787f16de48ae33e85b84b182d9a3c9b488b68e7908b877b` |
| 354 | `apps/storefront/tests/upgrade/validation.test.mjs` | 11524 | `67ed2b439342ef0b50e020a86d868a571ed8a0713905f79eb2c25958f00f3bc1` |
| 355 | `apps/storefront/tsconfig.json` | 874 | `c81af0126a740f41a3ec061731cd2f0562455c2125d784cdae154a613dbb6dc7` |
| 356 | `docs/adr/ADR-0001-payment-provider.md` | 1361 | `ae3b82583bae84bc6a3df833cc6d76c5aff182521c05e114d1f7b006c5b6876a` |
| 357 | `docs/adr/ADR-0002-email-sms-provider.md` | 1278 | `e42783a153b66b05da460df987dc168b3c9b38f636e867d772915ec4c121f8e1` |
| 358 | `docs/adr/ADR-0003-object-storage-provider.md` | 1020 | `f78cecd57b35c28cc73d899174466be4bf6893b8e5713b449c808437ef16d6bf` |
| 359 | `docs/adr/ADR-0004-opensearch-hosting.md` | 923 | `d0be007a409b42d54d7f752124f5ae6bf3e032b150dafbea8b8c38e3886e9e70` |
| 360 | `docs/adr/ADR-0005-llm-model-provider.md` | 1436 | `09889f1a39f7b6bd3d302407c9d917b2877de65cac1dce09db02ff98f420c13b` |
| 361 | `docs/adr/ADR-0006-mfa-implementation-approach.md` | 2280 | `f3e6872b33aadaa0e8f555aaa7ba8ca34d5a7c0ca60a38691cd96905d927d8cc` |
| 362 | `docs/adr/ADR-0007-mobile-app-strategy.md` | 1753 | `bea7878234db8080c4688e4c780ba1f4b33a2698bfd07b66b72877be13228de2` |
| 363 | `docs/adr/ADR-0008-social-login-integration-pattern.md` | 1407 | `520e61a747d1a4bfac20138c750114c4a103b6c416c41ef7cc97c4695e09a531` |
| 364 | `docs/adr/ADR-0009-hosting-provider.md` | 1423 | `57ed393f952d4b74a3509782c23f4505c07bc59c746fa45a185f1ad3325528b2` |
| 365 | `docs/adr/ADR-0010-aeo-strategy.md` | 1101 | `965b228c11d5fc48fdbf628180fce1d3e235daaed68f9848fe8eb692a4762a39` |
| 366 | `docs/adr/ADR-0011-theming-token-ownership.md` | 1021 | `e0b8121841213681985edc4df7d9c3693d5468651cc7a2b6ccfef68e108b036e` |
| 367 | `docs/adr/ADR-0012-typescript-version-pin.md` | 5514 | `415caea86c5616ddd4524e2015463adc292350718a9e1b15ee039f53ded34e2c` |
| 368 | `docs/adr/ADR-0013-dashboard-extension-colocation.md` | 5007 | `e1012de7d7349a12ff8f4d7eb4498b55fe49326ea6f32ca088317957a70425e9` |
| 369 | `docs/api/admin-api-extensions.md` | 677 | `9b288500fd907e8f5e04ba719935b283d28b6340ac06a702377903b3ec5d3d15` |
| 370 | `docs/api/storefront-graphql.md` | 976 | `148339e784706404def6d9b38429094b26aa6460e48f8b131e8bfea9dddd5c3e` |
| 371 | `docs/architecture/CURRENT_REPOSITORY_ASSESSMENT.md` | 22208 | `51251fe8190e4dc62c2a888049f6926f321d5498a4b38fea46be1d14318974e8` |
| 372 | `docs/architecture/GAP_ANALYSIS.md` | 28209 | `b7c05d4ad78dbcd1d23a9f3c456c0eaf5ddaf28c9385121fcee013e05c1089b0` |
| 373 | `docs/architecture/TARGET_REPOSITORY_STRUCTURE.md` | 21026 | `35f796c10e6ec399bee069272d6de3858f2b109b2616d06ecec0a08327b284e7` |
| 374 | `docs/architecture/ai-architecture.md` | 1544 | `30f7b8307dee6beff6d6f399764b7901c799474739b0f83520a4f196fc515fae` |
| 375 | `docs/architecture/data-model.md` | 2489 | `0ae637fe9692eda5d9687e20b7dbfbe4ee366a25c9b94bd4219ce26aac19e3d1` |
| 376 | `docs/architecture/deployment-topology.md` | 10324 | `ca462f831059f8e1c00739852a0e0f9314191ab22f302d3db4cb4a9a5b814061` |
| 377 | `docs/architecture/domain-boundaries.md` | 2762 | `972c26353ed22b7bcaa84e0de3c9b0f4a44493f1cc26f02bf0320fd0dcb23f75` |
| 378 | `docs/architecture/event-model.md` | 1164 | `1d4e8e481ab7a6a72117cde9f5d9cb02c8bc47f406e91db7a62943938dcf4295` |
| 379 | `docs/architecture/security-architecture.md` | 7063 | `d91e7c6f49c9451d304788005fe89d9c2e01f41a5955be651dce3ad776f0040d` |
| 380 | `docs/architecture/storefront-architecture.md` | 10326 | `44f5f2207dff64ad8b58007e4e073bac1c57ca9b757c086eae49ef5abb7a66fc` |
| 381 | `docs/architecture/system-overview.md` | 4089 | `ceb7ec6bcbd4658e559f8c77fe5fdc4e0daf8485471fafd1b44c5697b3c9a704` |
| 382 | `docs/implementation/ADR_BACKLOG.md` | 23064 | `5536110291c7da27e49dec85bff94fa759c38ed86b256ea4bade1c3043dcfa7a` |
| 383 | `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md` | 31902 | `37b992f909e99a90e88ecba2765679fc8552c39ce9c5b8092ccd2f340d030ed2` |
| 384 | `docs/implementation/DOCUMENTATION_MAP.md` | 22776 | `171b3d5bb4c7fdb80579b2232833c780e7bf2a7c11e089ea55733d4794ed71c0` |
| 385 | `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` | 174528 | `034c912ce07d64de5e1df185fb98eb646c9bfdae016357d9a1b6ae2e197f9aa1` |
| 386 | `docs/implementation/SIBLING_PROJECT_SECURITY_FINDINGS.md` | 10020 | `1f0325ddedd6955743128844a5e81c1b3532d38ccf3571af4725db207edf3e2d` |
| 387 | `docs/implementation/dependency-register.md` | 14206 | `94337d7cfb3f93e8111bc30e70a2015f5bdf8a0a490c653478b035cd7c3d819c` |
| 388 | `docs/implementation/environment-variables.md` | 7020 | `648991cc4e55709fb4dd6696f0e2f3c1953bf9fd618c800818bc25ede71760ae` |
| 389 | `docs/implementation/migrations.md` | 4077 | `b17c82449a38303bd6dc7352d7dc21e70366572e7118da5e4c4e136a0e73b934` |
| 390 | `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` | 104100 | `bf6712c9251c4a2c21e3229022075c38ff8cf6bc8b7f5c29ec665c8d44eaf105` |
| 391 | `docs/internal/Lipek Fashion Product & Service Categories.docx` | 17128 | `d9bc74467dbbaa25394fbb89403e1cd47f34392e1a16a2902e9d62c5e8b8f030` |
| 392 | `docs/testing/accessibility.md` | 610 | `7186278516cc891dae1bf0080ddf15c2c7213a86e66baea41bbd429779564a94` |
| 393 | `docs/testing/performance.md` | 519 | `a606e740a394fc75cc2c8408cd351872262bc49cc64d4ca43ddfb8ded021a680` |
| 394 | `docs/testing/strategy.md` | 1991 | `0bad783674ac13531e7d471628186e605ff2b0c26a8de2b1669eff4399a34171` |
| 395 | `docs/testing/test-matrix.md` | 659 | `ab123125bda3465079da1f495aae908e280ac2ab59a68ce95a6155bb0885314b` |
| 396 | `infra/README.md` | 347 | `009bcc0a9c5e1a353a377c0a808238beb9291477b68c340f2e09fd7745c73cc4` |
| 397 | `package.json` | 705 | `8bfe5d850c021699d58a358853f4e668bc83b3ba79ff55091e29267c4e2912f3` |
| 398 | `packages/config/README.md` | 817 | `48fc2f61b70a7c4b55d91a456cb72dca6995b8d471fbf9534d9c2edd94d871ef` |
| 399 | `packages/graphql/README.md` | 258 | `fcb07fe29a2aeb9ab804ca92159473eea1f8c6300fef80ccb944b53a44cc030c` |
| 400 | `packages/schemas/README.md` | 236 | `9546f745a4824abf0ddee7cacb5555ade5936359124dd7c234e112624ddb9930` |
| 401 | `packages/shared/README.md` | 179 | `564123a440e46bfff2db76dc4bbca9adf53282f8f5cab94a739f790cb81b999d` |
| 402 | `packages/testing/fixtures/content/blog/agbada-guide.json` | 1323 | `c8534e769501c8e6965f1e58aed6f6aa6f5826037e8d82766356dcd1377b0777` |
| 403 | `packages/testing/fixtures/content/blog/building-capsule-wardrobe.json` | 1348 | `265f6114a05222300f0dbe067d912ca2305e51d74d0fa28d79af0be1088b7e78` |
| 404 | `packages/testing/fixtures/content/blog/caring-for-silk-lace.json` | 1345 | `c9731a61a52f82fadf51f018772a8ca9e3014081fea85fd014c53ec1c3c7bd3a` |
| 405 | `packages/testing/fixtures/content/blog/dressing-for-your-build.json` | 1251 | `067165c66349813b8833f39e6346440988c34e38f9ef4e64e2fb6a4544663f96` |
| 406 | `packages/testing/fixtures/content/blog/five-signs-suit-fits.json` | 1509 | `9af55a916063b51536ec2948bc019ea4618dd07e33cabdcc024850489602d4b4` |
| 407 | `packages/testing/fixtures/content/blog/history-of-ankara.json` | 1400 | `d3be9ff1abe94ecd4ed218b479db7f9d7b6c8fbd712f7dee5ff516afca601012` |
| 408 | `packages/testing/fixtures/content/blog/lapel-styles-explained.json` | 1248 | `27a0e4dc2876bd60da14e8861528150bdd8843989c8bc6bb2f4c5f6983769808` |
| 409 | `packages/testing/fixtures/content/blog/wool-suit-off-season-storage.json` | 1226 | `3c24bc86e1003934ba66f43ab89690052529c3c6cb4979a2c79c492cd3a09d96` |
| 410 | `packages/testing/fixtures/content/data/business.json` | 1563 | `42db2bbc73845d0e728a08a6857694f83b53a63e51322624e1a545a7e0912c4e` |
| 411 | `packages/testing/fixtures/content/faq/care-faq.json` | 1359 | `761fc197ef7420bfc84520ffea91a569d9da049aa1b8bc5e634b2acd79f71e81` |
| 412 | `packages/testing/fixtures/content/faq/pricing-faq.json` | 1507 | `e37292159d40698f46d72edfb5043dd9cac79d9c2fe7fe048658812d862b728f` |
| 413 | `packages/testing/fixtures/content/faq/tailoring-faq.json` | 1566 | `5d9a225b993f6bd4dba3e641c53ea2be76fbf06a78da7120d01ce1b963e43f13` |
| 414 | `packages/testing/fixtures/content/gallery/casual.json` | 462 | `7dc2f1702e9a489f9f7356788bcf59285557d91088faf547f4cf199ef489da71` |
| 415 | `packages/testing/fixtures/content/gallery/corporate.json` | 553 | `bdecafe3dcbe87ef56a78f4dcfa7c99858d6ccad70133a0cffd77f744d77ba6a` |
| 416 | `packages/testing/fixtures/content/gallery/traditional.json` | 591 | `f801dfd26f28c8ddb748de6595b8cee380dda5bf45ad56604f7e427a66b53875` |
| 417 | `packages/testing/fixtures/content/gallery/weddings.json` | 642 | `0027a506c988bfd4fe0397ba99ecbb972ac889c367838d41816870f54ef3e313` |
| 418 | `packages/testing/fixtures/content/legal/privacy-policy.json` | 1580 | `f38e0a546c04e54cac0d1f1614ca1d776731ef47f95b10bade35e86ab6b6ea03` |
| 419 | `packages/testing/fixtures/content/legal/refund-policy.json` | 1175 | `781853a054181491e82700cb42e04af134f900e7aa34039bd4d5e4da9c5573df` |
| 420 | `packages/testing/fixtures/content/legal/shipping-policy.json` | 1197 | `e1d5e88bc144881c8daedc847b75c9b7749ebe4cdf4a17cab80f119dc695d442` |
| 421 | `packages/testing/fixtures/content/legal/terms-of-use.json` | 1550 | `2d16fe536b1acb611ef6447ffcc553b9e02cb18ff7e93f9204721713a25a798d` |
| 422 | `packages/testing/fixtures/content/process/consultation.json` | 1004 | `d34ea1bafb48482fe10acda7a46f1a4dcf834ee636aa5e8f5ced000fb98186b3` |
| 423 | `packages/testing/fixtures/content/process/delivery.json` | 888 | `2eb6a811d416318aba034b107204a6d25945888f84f8721cc022654258a0c5e6` |
| 424 | `packages/testing/fixtures/content/process/measurement.json` | 923 | `dcf830cf2cada2de8dd2b51b6875171e5ca96f0e6dc0f62c8212f6b2d802981d` |
| 425 | `packages/testing/fixtures/content/process/tailoring.json` | 870 | `98da6975f833c87e30f9fcddcce4fd18bda1d00eca5a2a74f273af1694e7e9a6` |
| 426 | `packages/testing/fixtures/content/services/alterations.json` | 1305 | `72c671a1ecc1c1a58a05f08eceaac5dffc94f15ced51c4c61af5089b171429f6` |
| 427 | `packages/testing/fixtures/content/services/custom-tailoring/african-fashion.json` | 1477 | `a1157091d5b44125ef2ff74d05359dcbbf1a5b819e523f7bb852274d7bad5e04` |
| 428 | `packages/testing/fixtures/content/services/custom-tailoring/casual-modern.json` | 1357 | `be9f23a8608f74b204760ae2cf5cd51ca6fe0fc530b114a8b2d67d3eae3393a5` |
| 429 | `packages/testing/fixtures/content/services/custom-tailoring/index.json` | 1231 | `95e5e68435480de796ba32448099d5019128bb11ec448fe68a7e879b1372a344` |
| 430 | `packages/testing/fixtures/content/services/custom-tailoring/shirts-tops.json` | 1383 | `b6afe5fc4d63391a5fa2f4bd6ac739d7b9ae7088e66e75efb5bc23f8f37f01fa` |
| 431 | `packages/testing/fixtures/content/services/custom-tailoring/special-occasion.json` | 1441 | `4732a42c419a7e3678ad7b9faeccdd7c9d4f16e06598e5a0f40fc29e00200cd4` |
| 432 | `packages/testing/fixtures/content/services/custom-tailoring/suits-formal.json` | 1497 | `966e90c83594a2c58c2666e5e55d442e742f772e1753b8880a453e6f49928c85` |
| 433 | `packages/testing/fixtures/content/services/custom-tailoring/trousers-bottoms.json` | 1308 | `5d937863477f203fc6e53dfa07b1d051c854a8c7974a0ee9e460aff9f0e1ade4` |
| 434 | `packages/testing/fixtures/content/services/custom-tailoring/womens-tailoring.json` | 1374 | `b59961c9a3d7c3c64e3e6ba7c02be3ac9fe52a49bc17a6ecd0543327855e1857` |
| 435 | `packages/testing/fixtures/content/services/laundry.json` | 1291 | `9c0d4cfe7f9325c0c5bf5d4eab4e765d7df0a2a14075cc29205b5dfd3aa8f93e` |
| 436 | `packages/testing/fixtures/content/shop/accessories.json` | 1359 | `cd5dda9844f6052dadfdb8d4e52f544cc2a9fbd6ece05ff6769aaebd6ea4780a` |
| 437 | `packages/testing/fixtures/content/shop/ready-to-wear.json` | 1480 | `f9f1736157d1e30ae5322518719c76341e50e35334643b8e27926fb033a497da` |
| 438 | `packages/testing/fixtures/content/testimonials/testimonials.json` | 1644 | `442de5a2e7da0f45455df3e2c63792ba1d52454646fa73063b4a7cbc933da4b1` |
| 439 | `packages/ui/src/primitives/Badge.tsx` | 311 | `05a97ecf31d54d8e4fe07eed05f8d0976bf3d95b012c39f02f28a34969ae7b3f` |
| 440 | `packages/ui/src/primitives/Card.tsx` | 348 | `eee90164ebf27b2eccebf5112ec68fd7f134bfb534af364331fa9bd4e61332bc` |
| 441 | `packages/ui/src/primitives/Container.tsx` | 239 | `206e52e505f60d2c452a6b164b0e7600d8369b205af97c165a13570cfbcaed27` |
| 442 | `packages/ui/src/primitives/Cta.tsx` | 866 | `046216df2cfb74cb2c5e1368cb273ba94ed896e46e1d5d424946fe58cce6daa5` |
| 443 | `packages/ui/src/primitives/Section.tsx` | 516 | `c69a0de15816ef8a4ad471d2e97aad7eface24528e18d75844739d89d2b23553` |
| 444 | `packages/ui/src/primitives/index.ts` | 226 | `2d52ce6b3eb4de9b9b741c9094705689b91661fb0794ed97788863a73b3e76fc` |
| 445 | `packages/ui/src/tokens/legacy-variables.css` | 1356 | `ffa9a345386804530860731de53d457c4df7663507068453fbea7b12ae43b26c` |
| 446 | `pnpm-lock.yaml` | 535717 | `c8ad97c08fb61e620123c76e113d1e93c47dc0e344c3521cbd3a8170642c4402` |
| 447 | `pnpm-workspace.yaml` | 667 | `ef8b3426a13c87219ecde063b445c8cd409cee5c83d77d262a40d168644dd0a0` |
| 448 | `scripts/README.md` | 170 | `3c894ec524f6bc13314a251cbccad5bc0bd27d451d51a00048965a7744f6cc2c` |
| 449 | `scripts/generate-manifest.mjs` | 4147 | `e74e58a907b27dd15b61924393ad9e0efa8064e366be826475cb26fbca0872fd` |
| 450 | `scripts/manifest-lib.mjs` | 3753 | `61658e35ac2deaf7d6fb1f16fc0010e41cb1235e783e68f3cdec57ce578c958b` |
| 451 | `scripts/verify-manifest.mjs` | 2574 | `04752350ee249a0bcf55438d2c4584e5f127f3cf5caec2300856e95259e3c7d4` |

<!-- END:repo-manifest -->


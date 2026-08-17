<!--
LIPEK INTERNAL MASTER SOURCE OF TRUTH
Do not provide this technical version to the client unless explicitly requested.
AI CODING AGENTS: READ THE ENTIRE FILE BEFORE IMPLEMENTATION.
-->

# LIPEK Intelligent Fashion Commerce & Services Platform
## INTERNAL TECHNICAL SOURCE OF TRUTH & IMPLEMENTATION BLUEPRINT

**Document Purpose:** Canonical internal source of truth for human engineers and AI coding agents (Claude Code, OpenAI Codex and equivalent agents)  
**Authority:** This document supersedes the client-facing blueprint for technical implementation decisions. The client-facing document remains valid for business intent, while this file contains the full implementation architecture.  
**Platform Scope:** Fashion Commerce, Custom Tailoring, Alterations, Laundry & Dry Cleaning, Customer Experience, CRM, AI-Assisted Commerce, Operations, Content Management, Analytics & Platform Engineering  
**Primary Stack:** Next.js 16/App Router, React, TypeScript, Vendure Core 3.x, NestJS, Vendure React Dashboard, PostgreSQL, GraphQL, Mastra, Redis/BullMQ, pgvector, PWA and modular/event-driven architecture  
**Package Manager:** pnpm  
**Runtime Baseline:** Node.js 24 LTS (Vendure supports Node 20/22/24; use the exact supported version recorded in the repository toolchain files)  
**Last Technical Review:** 17 August 2026

---

# Executive Summary

LIPEK should not be developed as a conventional online fashion store. The long-term opportunity is to build an **intelligent fashion commerce and services platform** that connects retail shopping, custom tailoring, alterations, laundry and dry cleaning, customer relationship management, logistics, payments, analytics, and AI-assisted customer service within one ecosystem.

The platform should launch with a strong, reliable commerce foundation while being architected from the beginning for advanced modules that can be introduced progressively without rebuilding the core system.

The guiding principle is:

> **Future-proof the architecture, not the feature count.**

The first release must already feel modern, fast, trustworthy and professional. Future releases can then add customer intelligence, advanced personalization, CRM, AI-powered styling, conversational commerce, operational reasoning, and automation.

The objective is to create a platform capable of competing not merely as a local fashion website, but as a **globally competitive digital fashion business platform**.

For implementation, the platform is specifically anchored on **Vendure Core as the commerce engine, NestJS as the backend framework through Vendure, the React-based Vendure Dashboard as the client's operational backend, Next.js as the customer storefront, PostgreSQL as the transactional database, and Mastra as the AI agent framework**.

A second non-negotiable principle is:

> **The client must be able to operate the platform from the backend. Products, categories, facets/tags, variants, inventory, collections, promotions, services, site content, navigation, policies, SEO fields and other routine business data must be editable without source-code changes.**

---

# 0. Source-of-Truth Rules for Claude Code, Codex & Human Engineers

This file is the **authoritative internal project specification**. Every coding agent and engineer must read it before planning, scaffolding, installing dependencies or modifying the architecture.

## 0.1 Precedence

When implementation artifacts disagree, use this order:

1. **This master source-of-truth document** — business intent, product scope, mandatory architecture and non-negotiable requirements.
2. **Accepted Architecture Decision Records (ADRs)** — approved technical changes or refinements.
3. **Domain/implementation documentation** generated from this source.
4. **Tests and schemas**.
5. **Current code**.

Code is not allowed to silently redefine the product. If implementation reality requires a change to this document, create an ADR, explain the trade-off, obtain approval and update the source of truth.

## 0.2 Coding-agent operating rules

Claude Code, Codex and other agents must:

- Read this entire file before making an implementation plan.
- Do not invent missing business requirements.
- Do not remove requirements simply because they are difficult.
- Do not replace a locked technology without an ADR.
- Verify unstable technical details against **official current documentation** before installation.
- Use the official Vendure documentation/MCP or current markdown docs when changing Vendure architecture.
- Use the official Mastra, Next.js, NestJS and PostgreSQL documentation for framework decisions.
- Never use the deprecated Vendure Angular Admin UI.
- Never build a duplicate generic NestJS commerce backend beside Vendure.
- Never put customer-facing business data directly in React/Next.js source when staff should be able to edit it.
- Never perform production schema changes using `synchronize: true`; create and review migrations.
- Never put secrets, credentials or API keys in source control.
- Never give the AI agent direct unrestricted SQL/database tools.
- Implement phases sequentially with explicit acceptance criteria.
- Run relevant tests after every phase and stop on regressions.
- Keep documentation synchronized with code.
- Keep a dependency register that states package name, purpose, version, license, owner/module and upgrade notes.
- Prefer boring, maintainable solutions for core commerce reliability; reserve experimental technology for isolated, reversible modules.

## 0.3 Technical decision status

| Decision | Status | Rule |
|---|---|---|
| Next.js App Router storefront | **LOCKED** | Use official Vendure Next.js starter as the initial storefront foundation |
| TypeScript end-to-end | **LOCKED** | Strict typing across apps/packages |
| Vendure Core | **LOCKED** | Commerce system of record |
| NestJS | **LOCKED** | Backend framework through Vendure and custom plugins |
| Vendure React Dashboard | **LOCKED** | Unified staff/admin backend |
| PostgreSQL | **LOCKED** | Primary transactional database |
| Mastra | **LOCKED** | AI agent/orchestration framework |
| GraphQL Shop/Admin APIs | **LOCKED** | Primary commerce API contracts |
| pnpm workspace | **LOCKED** | Package manager/workspace |
| Redis + BullMQ for production queues | **PLANNED** | Introduce before production load/horizontal scaling |
| pgvector for AI RAG | **PLANNED** | Enable with AI implementation |
| OpenSearch | **PLANNED** | Introduce when advanced/hybrid search phase begins |
| S3-compatible object storage | **PLANNED** | Provider selected during infrastructure ADR |
| Stripe as first payment target | **PROVISIONAL** | Confirm client merchant eligibility/country requirements; payment architecture must remain provider-extensible |
| Email/SMS provider | **UNDECIDED** | Choose via integration ADR |
| Final hosting/cloud provider | **UNDECIDED** | Choose after capacity, region, cost and operational review |

## 0.4 Version policy

Do not blindly pin versions from this document months later.

At initial bootstrap:

1. Confirm the current Vendure Core supported Node.js versions.
2. Use Node.js 24 LTS unless the current official compatibility matrix requires otherwise.
3. Bootstrap Vendure with the current stable **Vendure 3.x** release supported by the official `@vendure/create` CLI.
4. Use the official Vendure-supported Next.js storefront release (currently the official starter targets Next.js 16).
5. Install current compatible Mastra packages.
6. Commit the exact package versions and `pnpm-lock.yaml`.
7. Record them in `docs/implementation/dependency-register.md`.
8. Major upgrades require an ADR and regression testing.

---

# 0A. Repository & Monorepo Architecture

The project should be organized as a single TypeScript monorepo so the storefront, commerce backend, AI service and shared contracts remain coordinated while still being independently deployable.

```text
lipek-platform/
│
├── apps/
│   ├── server/                 # Vendure Core + NestJS plugins + Vendure Dashboard
│   │   └── src/
│   │       ├── plugins/
│   │       │   ├── lipek-content/
│   │       │   ├── tailoring/
│   │       │   ├── alterations/
│   │       │   ├── laundry/
│   │       │   ├── crm/
│   │       │   ├── loyalty/
│   │       │   ├── documents/
│   │       │   ├── appointments/
│   │       │   ├── customer-experience/
│   │       │   ├── analytics-events/
│   │       │   └── integrations/
│   │       ├── vendure-config.ts
│   │       └── ...
│   │
│   ├── storefront/             # Next.js 16 App Router storefront/PWA
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── ...
│   │
│   └── ai/                     # Mastra service
│       ├── src/mastra/
│       │   ├── agents/
│       │   ├── tools/
│       │   ├── workflows/
│       │   ├── memory/
│       │   ├── rag/
│       │   ├── evals/
│       │   └── index.ts
│       └── ...
│
├── packages/
│   ├── ui/                     # Shared design system where genuinely reusable
│   ├── shared/                 # Shared domain-neutral utilities
│   ├── schemas/                # Zod/shared validation contracts
│   ├── graphql/                # Generated GraphQL types/documents if extracted
│   ├── config/                 # Shared lint/TS/build configuration
│   └── testing/                # Shared fixtures/test helpers
│
├── docs/
│   ├── architecture/
│   ├── domains/
│   ├── api/
│   ├── implementation/
│   ├── operations/
│   ├── testing/
│   └── adr/
│
├── infra/
│   ├── docker/
│   ├── compose/
│   └── deployment/
│
├── scripts/
├── AGENTS.md
├── CLAUDE.md
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

### Monorepo rule

The initial Vendure scaffold may generate `apps/server` and `apps/storefront`. Preserve that official structure unless there is a documented reason to change it. Add the Mastra application and shared packages around it rather than fighting the official starter.

---

# 0B. Backend-First / No-Code Business Administration Requirement

A central product requirement is that **LIPEK staff must be able to operate and update the business from the backend without touching code for routine work**.

The storefront should be treated as a renderer of business data. Day-to-day commercial and editorial changes must be persisted in the backend and exposed through the Vendure Dashboard or LIPEK custom Dashboard extensions.

## 0B.1 What staff must be able to manage without code

| Domain | Editable from backend |
|---|---|
| Products | Name, slug, descriptions, SKUs, variants, prices, options, stock, tax class, assets, publish state |
| Categories | Full hierarchical category tree |
| Tags & Filters | Brand, material, occasion, style, gender, fit, season and other structured facets |
| Collections | New Arrivals, Best Sellers, Wedding, Sale, African Fashion and curated groups |
| Product Media | Images, videos/references and alt text/metadata |
| Inventory | Stock by variant and stock location |
| Promotions | Coupons, campaigns, discounts and date ranges |
| Homepage | Hero slides, headings, copy, CTAs, featured collections, product blocks, service blocks, promotional sections |
| Navigation | Header menus, mega menus, footer navigation and links |
| Site Identity | Logos, favicon references, business name, contacts, social links |
| Store Locations | Addresses, hours, phone numbers, pickup rules |
| Services | Tailoring, alteration and laundry service definitions, descriptions, pricing, duration, images and active status |
| Service Categories | Tailoring, alteration and laundry taxonomies |
| FAQs | Question, answer, category and publish state |
| Policies | Returns, shipping, privacy, terms, tailoring and laundry policies |
| Blog / Editorial | Articles, guides, categories, authors, assets and publish state |
| SEO | Page title, meta description, canonical override, index/noindex, Open Graph fields, structured-data inputs where appropriate |
| Announcement Bars | Text, CTA, schedule, channel and active state |
| Banners | Image, message, CTA, start/end schedule |
| Testimonials | Customer quote, author, rating/reference, publish state |
| Loyalty | Tier names, thresholds, earning rules and selected benefits where safe |
| Customer Support Content | Help topics and AI knowledge sources |
| Email Template Content | Approved editable portions of transactional templates |
| Staff | Administrators, roles and permissions |
| Channels/Regions | Supported currencies/languages/channel configuration where operationally safe |

## 0B.2 Vendure catalog mapping

LIPEK agents must use Vendure's native catalog model correctly:

| LIPEK concept | Vendure implementation |
|---|---|
| Product | `Product` |
| Purchasable SKU | `ProductVariant` |
| Size / Color when they create separate SKUs | `ProductOptionGroup` + `ProductOption` + variants |
| Category hierarchy | **Nested `Collection` tree** |
| Tags / structured attributes / filters | **`Facet` + `FacetValue`** |
| Product media | `Asset` |
| Stock | `StockLevel` / `StockLocation` |
| Region/storefront | `Channel` |
| Customer group | `CustomerGroup` |
| Promotions | Vendure Promotions |
| Internal/product-specific extra fields | Vendure custom fields |

**Do not create a duplicate category/tag system** unless an approved domain requirement cannot be represented by Collections and Facets.

## 0B.3 LIPEK Content Management Plugin

Vendure is the commerce engine, but LIPEK also needs editor-managed website content. Build a dedicated `LipekContentPlugin` using:

- Vendure custom entities
- Admin API extensions
- React Dashboard extensions
- Vendure Assets
- Vendure custom fields
- Vendure Settings Store for global/config-like values

Proposed content entities:

| Entity | Purpose |
|---|---|
| `ContentPage` | General editable storefront pages |
| `PageSection` | Ordered typed content blocks used by pages |
| `NavigationMenu` | Header/footer/mega-menu definitions |
| `NavigationItem` | Nested links and collection/page references |
| `Banner` | Promotional and announcement content |
| `FaqItem` | Customer FAQs |
| `PolicyDocument` | Store/service policies |
| `Article` | Blog/editorial content |
| `ArticleCategory` | Editorial taxonomy |
| `StoreLocation` | Physical locations and service information |
| `Testimonial` | Approved testimonial content |
| `ServiceDefinition` | Customer-facing service catalog configuration |
| `SeoMetadata` or SEO custom fields | Page-specific SEO control where not already on a native entity |

Global configuration such as support phone, social URLs, company details, default SEO values and feature settings should use the **Vendure Settings Store** where appropriate.

### Content publishing states

At minimum:

```text
DRAFT
  ↓
SCHEDULED (optional)
  ↓
PUBLISHED
  ↓
ARCHIVED
```

The storefront must never expose drafts to public users.

## 0B.4 Storefront cache invalidation

Routine backend edits must not require a developer deployment.

```text
Staff edits product/content in Vendure Dashboard
                ↓
Vendure mutation succeeds
                ↓
Domain/content event emitted
                ↓
Revalidation job/webhook
                ↓
Secure Next.js revalidation endpoint/tag invalidation
                ↓
Updated content visible on storefront
```

The implementation must use the revalidation/cache APIs supported by the installed Next.js version. The architecture requirement is **event-driven invalidation**, not a specific deprecated API name.

## 0B.5 Backend-editability acceptance tests

Before the administration phase is accepted, a non-developer test user must be able to:

1. Create a new Men/Women/Children category and see it appear in the appropriate storefront navigation without a code deployment.
2. Create a product, upload media, create size/color variants, price it, assign stock and publish it.
3. Create and assign facets/tags such as Brand, Material, Style and Occasion.
4. Create a curated Collection and feature it on the homepage.
5. Change the homepage hero copy/image/CTA and publish it without code.
6. Add or edit a tailoring/laundry/alteration service and update its price/description.
7. Update business hours and contact details.
8. Publish an FAQ/policy/article.
9. Change SEO metadata for an editable page.
10. Schedule or enable a promotional banner.
11. Change inventory and see storefront availability update.
12. Manage staff roles/permissions within authorized boundaries.

If any routine operation above requires editing source code, the administration requirement is not complete.

---

# 0C. Vendure Plugin / Domain Boundaries

Use Vendure plugins as modular bounded contexts. Do not create one plugin for every tiny helper, but do not place the entire LIPEK domain into one giant plugin either.

| Plugin / Context | Core responsibilities |
|---|---|
| `LipekContentPlugin` | Pages, sections, menus, FAQs, policies, articles, site settings, content SEO |
| `TailoringPlugin` | Measurements, custom configurations, tailoring jobs, production stages, fittings |
| `AlterationsPlugin` | Alteration requests, assessment, quotes, work states |
| `LaundryPlugin` | Garment items, cleaning jobs, pickup/delivery states, recurring plans |
| `AppointmentsPlugin` | Appointment resources, slots, bookings, fitting/service appointments |
| `CrmPlugin` | Leads, opportunities, customer notes, support cases, follow-ups |
| `LoyaltyPlugin` | Points, tiers, rewards and earning events |
| `DocumentsPlugin` | Receipts, invoices, quotes, measurement sheets, delivery notes |
| `CustomerExperiencePlugin` | Wishlist, reviews, saved looks and related customer experience extensions |
| `AnalyticsEventsPlugin` | Canonical event publication and analytics bridge |
| `IntegrationsPlugin` | External provider adapters where a dedicated provider plugin is not preferable |

## Service-to-commerce relationship

Retail purchases remain native Vendure Orders.

Custom service workflows should have dedicated domain entities **linked to Vendure Customer and Vendure Order/Payment records** rather than attempting to force all production state into a normal retail order state.

Example:

```text
Vendure Order / Payment
        │
        ├── TailoringJob
        │     ├── TailoringConfiguration
        │     ├── MeasurementProfile
        │     ├── FittingAppointment[]
        │     └── ProductionTimeline
        │
        ├── AlterationJob
        │     ├── Garment
        │     ├── Assessment
        │     └── WorkTimeline
        │
        └── LaundryJob
              ├── GarmentItem[]
              ├── CleaningInstructions
              ├── PickupDelivery
              └── ServiceTimeline
```

This keeps payments/financial order records inside the commerce engine while allowing LIPEK-specific operational workflows to evolve independently.

---

# 0D. Required Documentation Before Full Feature Implementation

The first AI coding-agent assignment is **not** “build everything.” It is to turn this source of truth into an executable engineering plan and repository documentation.

The agent must create and maintain at least:

```text
README.md
AGENTS.md
CLAUDE.md

docs/
├── architecture/
│   ├── system-overview.md
│   ├── deployment-topology.md
│   ├── domain-boundaries.md
│   ├── data-model.md
│   ├── event-model.md
│   ├── admin-content-architecture.md
│   ├── storefront-architecture.md
│   ├── ai-architecture.md
│   ├── search-architecture.md
│   ├── security-architecture.md
│   └── integration-map.md
│
├── domains/
│   ├── commerce.md
│   ├── catalog-taxonomy.md
│   ├── tailoring.md
│   ├── alterations.md
│   ├── laundry.md
│   ├── crm.md
│   ├── loyalty.md
│   ├── documents.md
│   └── content-management.md
│
├── api/
│   ├── storefront-graphql.md
│   ├── admin-api-extensions.md
│   ├── ai-tools.md
│   └── integration-contracts.md
│
├── implementation/
│   ├── phased-plan.md
│   ├── dependency-register.md
│   ├── environment-variables.md
│   ├── local-development.md
│   ├── migrations.md
│   └── feature-flags.md
│
├── testing/
│   ├── strategy.md
│   ├── test-matrix.md
│   ├── performance.md
│   ├── accessibility.md
│   └── ai-evals.md
│
├── operations/
│   ├── deployment.md
│   ├── monitoring.md
│   ├── incident-response.md
│   ├── backup-recovery.md
│   └── runbook.md
│
└── adr/
    └── ADR-0001-*.md
```

Each document must state whether it is **authoritative**, **derived**, **provisional** or **operational**.

---

# 0E. AI Coding-Agent Bootstrap Sequence

Claude Code/Codex must execute the project in this order:

```text
1. READ THIS SOURCE OF TRUTH
            ↓
2. AUDIT LOCAL ENVIRONMENT & EXISTING REPOSITORY
            ↓
3. VERIFY CURRENT OFFICIAL FRAMEWORK DOCUMENTATION
            ↓
4. CREATE ARCHITECTURE / DOMAIN / SECURITY / TEST DOCUMENTATION
            ↓
5. PRODUCE DEPENDENCY REGISTER + INSTALL PLAN
            ↓
6. SCAFFOLD / NORMALIZE MONOREPO
            ↓
7. INSTALL & LOCK DEPENDENCIES
            ↓
8. BOOT POSTGRES + REDIS DEV INFRASTRUCTURE
            ↓
9. RUN BASELINE VENDURE + NEXT.JS + DASHBOARD
            ↓
10. ADD MASTRA SERVICE SKELETON
            ↓
11. CREATE PHASED IMPLEMENTATION PLAN WITH ACCEPTANCE GATES
            ↓
12. IMPLEMENT ONE PHASE AT A TIME
            ↓
13. TEST + DOCUMENT + COMMIT AT EACH GATE
```

Agents must not start advanced AI, CRM or custom-service implementation until the foundation and administration model are stable.

---

# 0F. Dependency & Bootstrap Requirements

## 0F.1 Core bootstrap

Use the official Vendure scaffold rather than manually recreating its server.

The Vendure CLI currently supports Node 20, 22 and 24 and can scaffold PostgreSQL plus the official Next.js storefront. The project should use PostgreSQL from the start.

Typical bootstrap approach (exact commands must be verified against current official docs at execution time):

```bash
corepack enable
pnpm dlx @vendure/create lipek-platform
```

Select:

- PostgreSQL
- Official Next.js storefront
- No demo architecture decisions that conflict with this file

After bootstrap, normalize the project into the documented pnpm workspace and commit a clean baseline before custom features.

## 0F.2 Production queue packages

Before production-scale asynchronous workloads:

```text
@vendure/job-queue-plugin
bullmq
Redis service
```

Use the BullMQ strategy rather than database polling when the platform has multiple custom queues and/or horizontal workers.

## 0F.3 AI packages

Expected Mastra packages include:

```text
@mastra/core
@mastra/memory
@mastra/rag
@mastra/pg
@mastra/mcp
@mastra/client-js   # only where a client SDK is actually needed
```

Do not install an AI package merely because it exists. Record the exact package purpose in the dependency register.

## 0F.4 Testing baseline

Preferred testing stack unless the scaffold provides an equivalent standard:

- Vitest for unit/integration tests where suitable
- Playwright for end-to-end storefront/admin journeys
- axe integration for automated accessibility checks
- k6 or equivalent for load/performance tests
- Vendure testing utilities for commerce/plugin integration tests
- Mastra evals/scorers for AI quality regression tests

## 0F.5 Development infrastructure

Local development should be reproducible through Docker Compose or equivalent:

```text
PostgreSQL
Redis
Object-storage emulator/local asset volume as needed
OpenSearch profile (disabled until search phase if resource-heavy)
```

AI development may use PostgreSQL/pgvector once the AI phase begins.

---

# 0G. Official Technical References for Coding Agents

Agents should prefer these official sources over memory or secondary tutorials:

| Technology | Official source |
|---|---|
| Vendure Core | https://docs.vendure.io/current/core |
| Vendure installation | https://docs.vendure.io/current/core/getting-started/installation |
| Vendure architecture | https://docs.vendure.io/current/core/developer-guide/overview |
| Vendure plugins | https://docs.vendure.io/current/core/developer-guide/plugins |
| Vendure Dashboard extensions | https://docs.vendure.io/current/core/extending-the-dashboard/extending-overview |
| Vendure catalog management | https://docs.vendure.io/current/core/user-guide/catalog |
| Vendure Collections | https://docs.vendure.io/current/core/core-concepts/collections |
| Vendure Settings Store | https://docs.vendure.io/current/core/developer-guide/settings-store |
| Vendure search | https://docs.vendure.io/current/core/core-concepts/search |
| Vendure workers/queues | https://docs.vendure.io/current/core/developer-guide/worker-job-queue |
| Vendure CLI | https://docs.vendure.io/current/core/developer-guide/cli |
| Vendure docs MCP | https://docs.vendure.io/mcp |
| Next.js App Router | https://nextjs.org/docs/app |
| Next.js production guide | https://nextjs.org/docs/app/guides/production-checklist |
| Next.js PWA guide | https://nextjs.org/docs/app/guides/progressive-web-apps |
| NestJS | https://docs.nestjs.com |
| Mastra | https://mastra.ai |
| Mastra tools/MCP | https://mastra.ai/docs/agents/mcp-guide |
| Mastra RAG | https://mastra.ai/rag-pipeline |
| PostgreSQL | https://www.postgresql.org/docs/ |
| OpenTelemetry | https://opentelemetry.io/docs/ |

Where supported, configure the official Vendure docs MCP in the coding environment so Claude/Codex can query current documentation rather than relying on stale model memory.

---

# 1. Platform Vision

## 1.1 Strategic Positioning

LIPEK will combine four major business experiences:

| Business Area | Customer Value |
|---|---|
| Fashion Commerce | Shop clothing, footwear, jewelry, watches, bags and accessories for men, women and children |
| Custom Tailoring | Configure, order and track made-to-measure garments |
| Alterations | Request, quote, schedule and track garment adjustments |
| Laundry & Dry Cleaning | Book garment care, pickup/delivery and recurring cleaning services |

These experiences will be supported by shared capabilities:

- Customer accounts
- Payments
- Receipts and invoices
- Order and service tracking
- Notifications
- CRM
- Inventory
- Loyalty
- Search
- Analytics
- AI assistance
- Administrative and operational dashboards
- Security and access control
- Future mobile applications

## 1.2 Platform Definition

> **LIPEK is an intelligent fashion commerce and services platform connecting shopping, custom tailoring, alterations, garment care and AI-assisted personal styling through one unified customer experience.**

---

# 2. High-Level Architecture

```text
                         LIPEK PLATFORM
                                │
        ┌───────────────────────┴────────────────────────┐
        │                                                │
 CUSTOMER EXPERIENCE                              STAFF EXPERIENCE
        │                                                │
 Next.js Web Store                                  Vendure React Dashboard
 PWA / Future Mobile App                            CRM Dashboard
 Customer Account                                  Operations Dashboard
 AI Assistant                                      Inventory Dashboard
 Order Tracking                                    Analytics Dashboard
        │                                                │
        └────────────────────────┬───────────────────────┘
                                 │
                         PLATFORM API LAYER
                      Vendure Core / NestJS + LIPEK Plugins
                                 │
     ┌──────────────┬────────────┼────────────┬───────────────┐
     │              │            │            │               │
 Vendure       Tailoring    Alterations     Laundry          CRM
 Core            Plugin        Plugin         Plugin         Plugin
     │              │            │            │               │
     └──────────────┴────────────┼────────────┴───────────────┘
                                 │
                            PostgreSQL + pgvector
                                 │
          ┌──────────────────────┼───────────────────────┐
          │                      │                       │
      Search Layer         Mastra AI Service        Analytics/Event Layer
```

---

# 3. Technology Architecture

## 3.1 Frontend

| Technology | Role | Decision |
|---|---|---|
| **Next.js 16 / App Router** | Customer-facing storefront, SSR/RSC, SEO, account area, service flows and PWA | Start from the official Vendure Next.js storefront starter. Do not independently jump major versions without an ADR and compatibility check. |
| **React** | Interactive customer UI | Use the React version bundled/supported by the selected Next.js release. |
| **TypeScript** | Type safety across storefront and shared packages | Strict mode required. |
| **Tailwind CSS** | Storefront styling foundation | The official Vendure Next.js starter includes Tailwind; keep styling tokenized and component-driven. |
| **GraphQL typed client** | Communication with Vendure Shop API | Use generated GraphQL types/documents; prefer server-side requests where practical. |
| **PWA** | Installable web experience and future push capabilities | Web-first; native applications come later and reuse platform APIs. |
| **WCAG 2.2 AA target** | Accessibility | Accessibility is a release gate, not a post-launch patch. |

### Storefront architectural rule

The Next.js application is the **customer experience layer**, not the system of record. Product data, categories, tags/facets, prices, services, content, policies, promotions and operational state must come from backend APIs. Routine business content must **not** be hard-coded into storefront components.

## 3.2 Commerce & Backend

| Technology | Role | Decision |
|---|---|---|
| **Vendure Core 3.x** | Headless commerce engine | Minimum baseline 3.5.2; bootstrap with the current stable compatible 3.x release using `@vendure/create`, then lock exact versions in the pnpm lockfile. |
| **NestJS** | Backend framework under Vendure | Vendure itself is a NestJS application. Do **not** create a duplicate general-purpose NestJS commerce backend. Custom business logic belongs in Vendure plugins unless a later ADR explicitly extracts a service. |
| **Vendure Shop GraphQL API** | Customer commerce API | Products, collections, search, cart, checkout, customer account and storefront operations. |
| **Vendure Admin GraphQL API** | Back-office API | Used by the Vendure Dashboard and LIPEK custom admin extensions. |
| **Vendure React Dashboard (`@vendure/dashboard`)** | Unified staff backend | Use the current React Dashboard only. Do not use the deprecated legacy Angular Admin UI. |
| **PostgreSQL** | Primary transactional database | Authoritative persistent data store. Use migrations; never rely on production schema synchronization. |
| **Vendure Worker** | Asynchronous backend worker | Email, search indexing, receipts, document generation, integration retries and custom jobs. |
| **Redis + BullMQ** | Production queue/cache foundation | Use Vendure BullMQ job queue strategy for scalable push-based background processing. |
| **GraphQL + selective REST/internal endpoints** | API contracts | GraphQL for Vendure domain APIs; REST/internal endpoints only where integrations or streaming use cases justify them. |
| **Vendure EventBus / domain events** | Loose coupling | Modules publish and react to business events instead of creating tight cross-module dependencies. |

## 3.3 AI Architecture

| Technology | Role | Decision |
|---|---|---|
| **Mastra** | AI agent framework/orchestration | Canonical AI framework for LIPEK. |
| **`@mastra/core`** | Agents, tools and orchestration | Required AI foundation. |
| **`@mastra/memory`** | Conversation/thread memory | Customer-isolated memory only; never mix resources across customers. |
| **`@mastra/rag`** | Knowledge ingestion, chunking, embeddings and retrieval | Used for policies, FAQs, service knowledge, editorial knowledge and other approved sources. |
| **`@mastra/pg` + pgvector** | Production AI storage/vector retrieval | Reuse PostgreSQL infrastructure while keeping AI schemas logically isolated. |
| **`@mastra/mcp`** | MCP integration | Optional/approved external tools and future agent interoperability. |
| **Mastra observability/evals** | AI quality assurance | Tool calls, traces, latency, model cost and evaluation datasets must be observable before autonomous actions are expanded. |
| **Provider-agnostic LLM configuration** | Reasoning model layer | Model provider is configuration, not domain architecture. Do not couple LIPEK business logic to a single model vendor. |

The AI service must access LIPEK business information through **authorized tools/APIs**, never unrestricted direct database access.

## 3.4 Search Architecture

| Phase | Technology | Purpose |
|---|---|---|
| Launch / early catalog | **Vendure `DefaultSearchPlugin` + PostgreSQL** | Full-text search, facets, collections and price filtering with minimal infrastructure. |
| Scale / advanced discovery | **OpenSearch via a custom Vendure search plugin/adapter** | Fuzzy search, relevance tuning, high-scale indexing, semantic/vector and hybrid search. |
| AI knowledge retrieval | **pgvector through Mastra** | RAG over LIPEK policies, FAQs, service documents and approved knowledge. |

**Search abstraction rule:** the storefront should consume the Vendure search contract rather than call OpenSearch directly. This keeps the storefront stable when the search engine is upgraded.

## 3.5 Supporting Infrastructure

| Layer | Technology / Direction | Purpose |
|---|---|---|
| Object Storage | S3-compatible production storage | Product assets, customer uploads, receipts, invoices and generated documents |
| Local Asset Storage | Vendure AssetServerPlugin during local development | Local developer convenience only |
| Cache / Queue | Redis + BullMQ | Queueing, scaling and selected cache use cases |
| AI Vector Store | PostgreSQL + pgvector | RAG and semantic memory |
| Advanced Catalog Search | OpenSearch (later phase) | Hybrid catalog search and discovery |
| Observability | OpenTelemetry + Mastra traces/evals + chosen monitoring backend | Logs, metrics, traces, errors and agent behavior |
| CI/CD | Automated pipeline | Lint, tests, builds, migrations, security checks and smoke tests |
| Containers | Docker / Docker Compose | Reproducible local infrastructure and deployment packaging |
| Backups | Database + object storage backup strategy | Disaster recovery |

---

# 4. Commerce Foundation — Non-Negotiable

The commerce foundation must work extremely well before advanced AI or automation is considered complete.

| Area | Required Capability |
|---|---|
| Catalog | Products, variants, sizes, colors, materials, brands |
| Navigation | Men → Women → Children → category → subcategory |
| Collections | New Arrivals, African Fashion, Wedding, Formal, Casual, Sale |
| Inventory | Real-time stock by product variant |
| Multi-location Inventory | Store, warehouse and future locations |
| Search | Fast search, autocomplete, filtering and sorting |
| Cart | Persistent cart across sessions |
| Checkout | Guest and registered customer checkout |
| Payments | Cards, digital wallets and supported local methods |
| Promotions | Coupons, percentage discounts, fixed discounts, bundles |
| Shipping | Methods, zones, pricing, pickup and delivery options |
| Customer Accounts | Profile, addresses, orders, wishlist, documents |
| Order Tracking | Full customer-facing order progress |
| Notifications | Order, payment, shipment and service updates |
| Receipts | Automatic branded payment receipts |
| Returns | Return and exchange workflow |
| Refunds | Full and partial refunds |
| Admin | Catalog, orders, customers, promotions and inventory |
| Permissions | Role-based staff access |
| Audit History | Record important administrative actions |

---

## 4.1 Vendure-native catalog administration

The customer's requested ability to add products, categories and tags from the backend is a **native architectural requirement**, not a later convenience.

The Vendure Dashboard already provides administration for Products, ProductVariants, Collections, Facets, Assets, Orders, Customers, Promotions, stock locations, channels, roles and related commerce data. LIPEK custom Dashboard extensions will add the non-native business domains.

### Required staff catalog flow

```text
Dashboard
   ↓
Create Product
   ↓
Add Product Options (Size / Color / etc.)
   ↓
Generate/Edit Product Variants
   ↓
Add SKU / Price / Stock
   ↓
Upload Assets
   ↓
Assign Collections (categories)
   ↓
Assign Facet Values (tags/filters)
   ↓
Assign Channel / Availability
   ↓
Publish
   ↓
Storefront cache revalidation
   ↓
Product visible to customers
```

### Bulk operations

The implementation plan must include product import/export for operational efficiency. Bulk import must validate records, assets, categories/facets and variant data before committing large batches.

---

# 5. Fashion Store Structure

The retail store should be organized primarily around **Men, Women and Children**, with cross-store collections available for discovery.

## 5.1 Men

| Category | Subcategories |
|---|---|
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

## 5.2 Women

| Category | Subcategories |
|---|---|
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

## 5.3 Children

| Category | Subcategories |
|---|---|
| Boys' Clothing | Shirts, T-Shirts, Polos, Trousers, Jeans, Shorts, Suits, Blazers, Tracksuits, Jackets, Sleepwear |
| Girls' Clothing | Dresses, Tops, Skirts, Trousers, Jeans, Shorts, Jumpsuits, Two-Piece Sets, Jackets, Sleepwear |
| Baby Clothing | Bodysuits, Rompers, Sets, Dresses, Sleepsuits, Jackets, Baby Accessories |
| African Wear | Kids' Agbada, Ankara Dresses, Kaftans, Kente Outfits, Traditional Sets, Matching Family Wear |
| Formal Wear | Boys' Suits, Girls' Occasion Dresses, Wedding Outfits, Birthday Outfits, Religious Ceremony Wear |
| Shoes | Sneakers, Formal Shoes, Sandals, Boots, School Shoes, Slippers |
| Accessories | Caps, Hats, Belts, Ties, Bow Ties, Hair Accessories, Sunglasses, Socks |
| Jewelry | Children's Bracelets, Earrings, Necklaces, Watches |
| School & Everyday | Backpacks, Lunch Bags, School Accessories, Casual Clothing |

## 5.4 Cross-Store Collections

- New Arrivals
- African Fashion
- Wedding Collection
- Formal Wear
- Casual Wear
- Shoes
- Jewelry
- Watches
- Bags & Leather Goods
- Accessories
- Matching Family Sets
- Gift Ideas
- Sale
- Gift Cards

---

## 5A. Storefront Composition Must Be Backend-Driven

The homepage and merchandising pages must use backend-defined composition.

Examples:

```text
Homepage
├── Hero (backend-managed)
├── Featured Collection (backend reference)
├── New Arrivals (collection reference)
├── Shop Men/Women/Children cards (collection/page references)
├── Tailoring CTA (service/page reference)
├── Promotional Banner (backend-managed)
├── Shop the Look (curated product references)
├── Testimonials (backend-managed)
├── Editorial Feature (article reference)
└── Newsletter/CTA settings
```

The code defines **section component types and rendering rules**. Staff choose content, order, references, visibility and scheduling from the Dashboard.

This keeps design quality controlled while empowering the client to operate content without code.

---

# 6. Product Detail Experience

Product pages should support modern fashion-commerce capabilities.

| Feature | Example |
|---|---|
| Color Swatches | Black / Navy / Burgundy |
| Variant Photography | Product imagery changes with selected color |
| Size Selection | XS–5XL |
| Dynamic Size Guides | Guides based on brand or garment |
| Fit | Slim / Regular / Relaxed |
| Material | Wool / Cotton / Linen |
| Product Video | Model wearing the item |
| 360° Media | Examine garment from multiple angles |
| Model Information | Height and size worn |
| Care Instructions | Wash, dry-clean or specialist care |
| Availability | Online or store stock |
| Delivery Estimate | Estimated arrival date |
| Back-in-Stock Alert | Notify customer when available |
| Low-Stock Indicator | “Only 2 remaining” |
| Wishlist | Save for later |
| Recently Viewed | Continue previous browsing |
| Similar Items | Related recommendations |
| Complete the Look | Shoes, belt, jewelry, watch |
| Shop the Look | Purchase a complete outfit |
| Product Reviews | Ratings, text and photos |
| Sharing | Share product through supported channels |

---

## 6A. Storefront API & Session Rules

- The storefront consumes Vendure's **Shop GraphQL API** for commerce/customer operations.
- Use cookie-based Vendure sessions for browser flows unless an ADR identifies a reason to prefer bearer tokens.
- Never expose Admin API credentials to the storefront.
- Server Components/server-side functions should be preferred for sensitive data fetching where appropriate.
- Client-side calls must carry only customer-authorized credentials.
- Generated GraphQL types must be refreshed when custom plugin schemas change.
- The AI chat endpoint must propagate authenticated customer identity to server-side tools without exposing privileged credentials to the browser.

---

# 7. Customer Account — “My LIPEK”

The customer account should become a **fashion identity and service hub**, not merely a list of orders.

```text
MY LIPEK

Overview

Commerce
├── My Orders
├── Returns & Exchanges
├── Wishlist
├── Saved Looks
└── Recently Viewed

Services
├── My Tailoring
├── My Alterations
├── My Laundry
├── My Appointments
└── My Pickup/Delivery Requests

My Style
├── Size Profile
├── Body Measurements
├── Shoe Size
├── Preferred Fits
├── Favorite Colors
├── Favorite Categories
└── Style Preferences

Documents
├── Receipts
├── Invoices
├── Quotes
├── Measurement Sheets
└── Delivery Notes

Relationship
├── Rewards
├── Gift Cards
├── Referrals
├── Support Cases
└── AI Conversations

Account
├── Addresses
├── Payment Methods
├── Communication Preferences
└── Security
```

---

# 8. Universal Customer Tracking

Customers should be able to track every LIPEK transaction from one interface.

```text
YOUR LIPEK ACTIVITY

────────────────────────────────
Three-Piece Suit
CUSTOM TAILORING
First Fitting — August 24
────────────────────────────────

Order #LPK-3912
ONLINE SHOP
Out for Delivery — Arriving Today
────────────────────────────────

Laundry #LPK-L1208
DRY CLEANING
Pressing — Ready Tomorrow
────────────────────────────────

Alteration #LPK-A183
ALTERATION
Quality Check
────────────────────────────────
```

This creates one unified customer relationship across retail and services.

---

# 9. Retail Order Tracking

```text
Order Confirmed
      ↓
Payment Received
      ↓
Processing
      ↓
Packed
      ↓
Shipped
      ↓
Out for Delivery
      ↓
Delivered
```

Tracking should include:

- Order number
- Items
- Payment status
- Shipment status
- Carrier
- Tracking number
- Estimated delivery
- Delivery events
- Support access

---

## 9A. Service Workflow Implementation Principle

Tailoring, Alterations and Laundry require explicit state machines and domain events.

Do not represent operational progress as free-text status strings.

Each transition should:

- validate allowed previous state
- validate permissions
- record timestamp/actor
- emit a domain event
- optionally trigger customer notification
- optionally enqueue downstream work

State labels may be localized/editor-friendly, but transition rules remain controlled business logic.

---

# 10. Custom Tailoring — Flagship Service Module

Custom tailoring should be treated as a dedicated digital experience.

## 10.1 Suit Configuration

```text
BUILD YOUR SUIT

01 STYLE
   Two Piece
   Three Piece
   Tuxedo

02 FIT
   Slim
   Regular
   Relaxed

03 FABRIC
   Wool
   Linen
   Cotton
   Premium Blend

04 COLOR

05 LAPEL
   Notch
   Peak
   Shawl

06 BUTTONS

07 LINING

08 MONOGRAM

09 MEASUREMENTS
   Use Saved Measurements
   Enter Measurements
   Book Measurement Appointment

10 FITTING

11 DELIVERY DATE

12 REVIEW

13 DEPOSIT / PAYMENT
```

## 10.2 Tailoring Workflow

```text
Order Confirmed
      ↓
Measurements Taken
      ↓
Fabric Confirmed
      ↓
Pattern Created
      ↓
Cutting
      ↓
Sewing
      ↓
First Fitting
      ↓
Adjustments
      ↓
Final Fitting
      ↓
Quality Control
      ↓
Ready for Pickup / Delivery
      ↓
Completed
```

## 10.3 Tailoring Capabilities

- Customer measurement profiles
- Saved measurements
- Fabric selection
- Style configuration
- Design notes
- Reference image uploads
- Tailor assignment
- Fitting appointments
- Progress tracking
- Deposits
- Partial payments
- Remaining balance
- Tailoring quotes
- Measurement sheets
- Production notes
- Estimated completion date
- Pickup/delivery
- Customer notifications

---

# 11. Custom Tailoring Categories

| Main Category | Services |
|---|---|
| Men's Custom Tailoring | Two-Piece Suits, Three-Piece Suits, Business Suits, Wedding Suits, Tuxedos, Dinner Jackets, Blazers, Sport Coats, Dress Shirts, Casual Shirts, Tailored Trousers, Chinos, Waistcoats, Shorts, Jackets |
| Women's Custom Tailoring | Dresses, Evening Gowns, Cocktail Dresses, Wedding Dresses, Bridesmaid Dresses, Skirts, Blouses, Tailored Trousers, Women's Suits, Blazers, Jumpsuits, Two-Piece Sets, Formal Wear, Casual Wear |
| Children's Custom Tailoring | Boys' Suits, Girls' Dresses, Traditional Wear, Formal Wear, Wedding Outfits, Birthday Outfits, Matching Family Outfits |
| African Men's Wear | Agbada, Senator Wear, Kaftan, Dashiki, Boubou, Babban Riga, Isi Agu, Ankara Shirts, Ankara Suits, Kente Outfits, Aso-Oke Outfits, African Print Sets, Traditional Wedding Attire |
| African Women's Wear | Ankara Dresses, Kente Dresses, African Print Gowns, Wrapper & Blouse Sets, Boubou/Gown Styles, Peplum Outfits, Two-Piece Sets, Jumpsuits, Traditional Wedding Attire, Aso-Oke Styles |
| African Children's Wear | Ankara Kids' Outfits, Mini Agbada, Kids' Kaftans, Kente Outfits, Traditional Dresses, Matching Family Wear |
| Wedding & Bridal | Bridal Gowns, Groom Suits, Groom Traditional Wear, Bridesmaid Dresses, Groomsmen Suits, Traditional Wedding Attire, Reception Outfits |
| Corporate Tailoring | Business Suits, Corporate Shirts, Corporate Dresses, Blazers, Executive Wear, Staff Uniforms |
| Special Occasion | Birthday Outfits, Prom Wear, Graduation Outfits, Gala Wear, Red-Carpet Looks, Religious Ceremony Outfits, Cultural Festival Wear |
| Bespoke Design | Made-to-Measure Clothing, Fully Bespoke Garments, Fabric Selection, Personalized Embroidery, Monograms, Custom Details |
| Uniform Tailoring | Corporate, School, Hospitality, Medical, Security, Church/Choir and Event Uniforms |
| Matching & Group Outfits | Couples, Families, Wedding Parties, Corporate Groups, Cultural Groups, Event Teams |

---

# 12. Alterations Module

Customers should be able to begin an alteration digitally.

## 12.1 Customer Flow

```text
Select Garment
      ↓
Select Alteration Required
      ↓
Upload Photos
      ↓
Describe Requirement
      ↓
Receive Estimate / Request Quote
      ↓
Choose Drop-Off or Pickup
      ↓
Select Date
      ↓
Pay Deposit / Full Amount
      ↓
Track Work
```

## 12.2 Alteration Tracking

```text
Received
   ↓
Assessment
   ↓
Quote Approved
   ↓
In Alteration
   ↓
Quality Check
   ↓
Ready for Pickup
   ↓
Completed
```

## 12.3 Alteration Categories

| Category | Services |
|---|---|
| Trouser Alterations | Hemming, Waist Adjustment, Tapering, Lengthening, Shortening, Seat Adjustment |
| Suit Alterations | Jacket Waist, Sleeve Length, Shoulder Adjustment, Trouser Fit, Jacket Length |
| Dress Alterations | Hemming, Taking In/Out, Strap Adjustment, Waist Adjustment, Reshaping |
| Shirt Alterations | Sleeve Adjustment, Body Tapering, Collar Adjustment, Length |
| Skirt Alterations | Waist Adjustment, Hemming, Reshaping |
| Zippers & Fasteners | Zipper Repair/Replacement, Buttons, Hooks, Snaps |
| Repairs | Tears, Seam Repairs, Patches, Reinforcement |
| Restyling | Garment Resizing, Modernization, Style Transformation |
| Wedding Alterations | Bridal Gowns, Groom Suits, Bridesmaids, Formal Wear |
| Traditional Wear Alterations | African Clothing Resizing, Repairs and Adjustments |

---

# 13. Laundry & Dry Cleaning Module

Laundry should feel like an application rather than a contact form.

## 13.1 Booking Flow

```text
Choose Service
      ↓
Choose Garments
      ↓
Enter Quantity
      ↓
Select Pickup Address
      ↓
Choose Pickup Date/Time
      ↓
Choose Delivery Preference
      ↓
Review Price
      ↓
Payment
      ↓
Track Order
```

## 13.2 Laundry Tracking

```text
Order Received
      ↓
Garments Collected
      ↓
Inspection
      ↓
Cleaning / Dry Cleaning
      ↓
Stain Treatment
      ↓
Pressing
      ↓
Quality Check
      ↓
Packaging
      ↓
Out for Delivery
      ↓
Delivered
```

## 13.3 Laundry Categories

| Category | Services |
|---|---|
| Laundry | Wash & Fold, Wash & Iron, Individual Garment Laundry |
| Dry Cleaning | Suits, Dresses, Shirts, Trousers, Coats, Traditional Wear |
| Pressing | Ironing, Steam Pressing, Suit Pressing |
| Specialty Cleaning | Delicate Fabrics, Wedding Dresses, Formal Wear, African Fabrics |
| Stain Treatment | Spot Cleaning, Stain Removal |
| Household Textiles | Curtains, Bedsheets, Blankets, Comforters |
| Express | Same-Day / Priority where available |
| Bulk Laundry | Family, Corporate and Hospitality Laundry |
| Pickup & Delivery | Home or Office Collection and Delivery |

## 13.4 Recurring Laundry

Future subscriptions can support:

- Weekly
- Every two weeks
- Monthly
- Custom schedule

---

## 13A. Payment Integration Architecture

The initial payment provider target is **Stripe, subject to merchant eligibility and the client's operating-country requirements**. Do not couple domain code directly to Stripe-specific objects.

Use Vendure's payment abstraction/provider mechanism so additional gateways can be added later.

```text
Checkout
   ↓
Vendure Payment Method
   ↓
Payment Provider Adapter
   ↓
Stripe / Future Provider
   ↓
Webhook
   ↓
Verified + Idempotent Payment State Update
   ↓
Order State / Receipt / Notification Events
```

Requirements:

- provider abstraction
- webhook signature verification
- idempotency
- payment failure recovery
- refunds
- partial payment/deposit support for service workflows
- no raw card storage
- automatic receipt generation after settled payment

---

# 14. Payments

The payment experience must be simple, reliable and flexible.

## 14.1 Payment Capabilities

- Credit/debit cards
- Digital wallets
- Fast checkout
- Saved payment methods
- Gift cards
- Store credit
- Deposits
- Partial payments
- Remaining balance payments
- Refunds
- Multiple currencies in future regions

## 14.2 Tailoring Payment Example

```text
Custom Suit Total        $800
Deposit                   $300
Remaining Balance         $500
```

The service workflow should understand that the order is valid after the required deposit while still tracking the outstanding balance.

---

## 14A. DocumentsPlugin Technical Flow

Implement receipt/invoice generation in a dedicated `DocumentsPlugin` with a background queue.

```text
PaymentSettledEvent
       ↓
Idempotency Check
       ↓
Documents Job Queue
       ↓
Generate Branded PDF
       ↓
Store PDF in Object Storage
       ↓
Persist DocumentRecord
       ↓
Email Customer
       ↓
Expose in My LIPEK → Documents
```

The exact PDF rendering library must be selected during implementation and recorded in the dependency register/ADR. The business requirement is stable; the rendering package is replaceable.

---

# 15. Automatic Receipts, Invoices & Documents

Successful payments should automatically trigger branded documents.

## 15.1 Documents

- Payment Receipt
- Order Confirmation
- Invoice
- Refund Receipt
- Tailoring Quote
- Tailoring Order Sheet
- Measurement Sheet
- Alteration Quote
- Laundry Receipt
- Delivery Note

## 15.2 Receipt Workflow

```text
Payment Successful
       ↓
Payment Event
       ↓
Receipt Number Generated
       ↓
LIPEK Branded Receipt Created
       ↓
Stored in Customer Account
       ↓
Email / Notification Sent
```

## 15.3 Customer Access

**My LIPEK → Documents**

Customers can view or download historical receipts and service documents.

---

# 16. Returns & Exchanges

Returns should be a first-class digital experience, particularly because fashion purchases frequently involve size exchanges.

```text
My Order
   ↓
Return / Exchange
   ↓
Select Item
   ↓
Select Reason
   ↓
Refund OR Choose Replacement Size
   ↓
Choose Return Method
   ↓
Generate Instructions
   ↓
Track Return
```

Capabilities should include:

- Item-level returns
- Size exchanges
- Exchange inventory validation
- Full refunds
- Partial refunds
- Store credit
- Return status
- Customer notifications

---

# 16A. Search Implementation Progression

Search will evolve without changing the storefront's fundamental API contract.

```text
PHASE 1
Next.js
   ↓
Vendure Search GraphQL
   ↓
DefaultSearchPlugin
   ↓
PostgreSQL Search Index

PHASE 2+
Next.js
   ↓
Vendure Search GraphQL
   ↓
LIPEK Search Plugin / Adapter
   ↓
OpenSearch
   ├── Full-text
   ├── Fuzzy matching
   ├── Relevance tuning
   ├── Facets
   ├── Semantic/vector search
   └── Hybrid ranking
```

The storefront must not become directly coupled to OpenSearch query syntax.

---

# 17. Search, Discovery & Merchandising

Search should become one of the platform's strongest capabilities.

## 17.1 Search Features

- Autocomplete
- Typo tolerance
- Synonyms
- Faceted filtering
- Sorting
- Search suggestions
- Recent searches
- Trending searches
- Keyword search
- Semantic search
- Vector search
- Visual search in future

## 17.2 Filters

- Gender
- Category
- Brand
- Price
- Size
- Color
- Material
- Fit
- Style
- Occasion
- Availability
- Rating
- Collection
- Discount

## 17.3 Natural-Language Search

The system should eventually understand:

> “Black wedding shoes”

and also:

> “Something elegant to wear with a navy suit.”

or:

> “A loose African outfit for a summer wedding.”

---

# 18. Personalization & Fashion Relationship

Beyond a simple wishlist, the platform should support:

- Wishlist
- Favorites
- Saved Looks
- Recently Viewed
- Follow Brand
- Back-in-Stock Alerts
- Price Drop Alerts
- New Collection Alerts
- Personalized recommendations
- Complete-the-Look recommendations
- Shop-the-Look bundles

---

# 19. Loyalty, Membership & Referrals

```text
LIPEK REWARDS

Member
Silver
Gold
Platinum
```

Customers can earn rewards through:

- Fashion purchases
- Tailoring
- Alterations
- Laundry
- Referrals
- Reviews
- Birthdays
- Promotional campaigns

Benefits may include:

- Discounts
- Priority tailoring
- Free pressing
- Free pickup/delivery thresholds
- Exclusive collections
- Birthday rewards
- Early sale access
- VIP support

---

## 19A. CRM Technical Direction

CRM will begin as a **Vendure plugin/domain with Dashboard extensions**, not as a separate SaaS dependency.

This ensures commerce and service context can be presented in a unified Customer 360 while preserving explicit domain boundaries.

Proposed CRM entities include:

- `Lead`
- `Opportunity`
- `CustomerNote`
- `SupportCase`
- `FollowUpTask`
- `CustomerInteraction`
- `CustomerSegmentDefinition` (or derived segment configuration)

The CRM must reference Vendure Customers rather than creating a second independent customer identity system.

If CRM complexity eventually outgrows the Vendure Dashboard, a separate staff application may be introduced through an ADR while keeping the same APIs/domain data.

---

# 20. CRM & Customer 360

The platform should evolve into a complete customer relationship system.

## 20.1 Customer 360 Profile

```text
CUSTOMER 360

Identity
├── Contact Information
├── Communication Preferences
└── Customer Since

Commerce
├── Orders
├── Returns
├── Average Order Value
├── Lifetime Value
└── Favorite Products

Fashion Profile
├── Sizes
├── Measurements
├── Shoe Size
├── Colors
├── Brands
├── Fits
├── Styles
└── Interests

Services
├── Tailoring
├── Alterations
├── Laundry
└── Appointments

Engagement
├── Wishlist
├── Reviews
├── Searches
├── Marketing Interactions
└── AI Conversations

CRM
├── Leads
├── Follow-Ups
├── Opportunities
├── Support Cases
├── Activities
└── Internal Notes

Loyalty
├── Tier
├── Points
├── Rewards
└── Referrals
```

## 20.2 Sales Pipeline

```text
New Lead
   ↓
Contacted
   ↓
Consultation Booked
   ↓
Measurements Taken
   ↓
Quote Sent
   ↓
Customer Approved
   ↓
Production
   ↓
Fitting
   ↓
Completed
   ↓
Follow-Up
```

This becomes especially useful for:

- Weddings
- Corporate uniforms
- Family outfits
- Large custom orders
- VIP clients
- Group tailoring
- Wholesale or business accounts

---

# 20A. Unified Admin Architecture — Vendure Dashboard

The **Vendure React Dashboard is the primary LIPEK back office** for the first major platform releases.

Do not build a separate generic admin application for catalog/content/operations unless a later ADR demonstrates that the unified Dashboard has become a constraint.

Vendure Dashboard extensions allow LIPEK plugins to add:

- custom routes/pages
- navigation sections
- list tables
- detail forms
- widgets
- page blocks
- action buttons
- alerts
- custom field editors
- custom history/timeline entries
- toolbar actions

Therefore Tailoring, Alterations, Laundry, CRM, Content, Documents, Loyalty and AI review/approval interfaces should be surfaced inside the same staff experience.

```text
LIPEK STAFF
    ↓
Vendure React Dashboard
    │
    ├── Native Vendure Admin Pages
    │     ├── Products / Variants
    │     ├── Collections
    │     ├── Facets
    │     ├── Assets
    │     ├── Orders
    │     ├── Customers
    │     ├── Promotions
    │     ├── Stock Locations
    │     ├── Channels
    │     ├── Roles / Administrators
    │     └── Settings
    │
    └── LIPEK Dashboard Extensions
          ├── Content
          ├── Tailoring
          ├── Alterations
          ├── Laundry
          ├── Appointments
          ├── CRM
          ├── Loyalty
          ├── Documents
          ├── AI Escalations / Approvals
          └── Analytics / Operations
```

### Admin design principle

A staff member should not need to know whether a screen comes from Vendure core or a LIPEK plugin. The backend should feel like **one LIPEK operating system**.

---

# 21. Client / Staff Backend

The client's operational backend is a critical part of the project. The customer website is only one side of the platform.

The staff backend should allow LIPEK employees to operate the business without accessing the database or relying on developers for routine tasks.

## 21.1 Backend Navigation

```text
LIPEK ADMIN

Dashboard

Commerce
├── Products
├── Categories
├── Collections
├── Brands
├── Pricing
├── Promotions
├── Inventory
├── Orders
├── Returns
└── Refunds

Services
├── Tailoring
├── Alterations
├── Laundry
├── Appointments
├── Pickup & Delivery
└── Service Tracking

Customers
├── Customer 360
├── Leads
├── Opportunities
├── Support Cases
├── Loyalty
└── Segments

Operations
├── Tailor Workload
├── Production Queue
├── Laundry Queue
├── Quality Control
├── Deliveries
└── Delays / Exceptions

Content
├── Homepage
├── Collections
├── Promotional Banners
├── Editorial Content
└── SEO

AI & Automation
├── AI Conversations
├── Escalations
├── Recommendations
├── Automation Rules
└── Approval Queue

Analytics
├── Sales
├── Customers
├── Inventory
├── Services
├── Marketing
├── AI Performance
└── Operational Performance

Administration
├── Staff
├── Roles
├── Permissions
├── Settings
├── Integrations
└── Audit Logs
```

## 21.2 Executive Dashboard

The client's management dashboard should surface:

- Revenue today / week / month
- Orders awaiting processing
- Orders at risk
- Tailoring jobs at risk of missing deadlines
- Alterations waiting for approval
- Laundry orders in progress
- Deliveries due
- Low-stock products
- High-value customers requiring follow-up
- Conversion rate
- Average order value
- Return rate
- Customer lifetime value
- Top categories
- Top products
- Service profitability
- AI-assisted revenue
- Support escalations

## 21.3 Order Management

Staff should be able to:

- View complete order
- Verify payment
- View customer profile
- Allocate inventory
- Update fulfillment
- Add tracking details
- Contact customer
- Cancel orders
- Process returns
- Issue refunds
- Re-send receipts
- Add internal notes
- Review timeline/history

## 21.4 Tailoring Operations Dashboard

```text
TAILORING ORDER #LPK-T2048

Customer: John Smith
Service: Three-Piece Suit
Tailor: James
Due Date: September 14

✓ Measurements
✓ Fabric Selected
✓ Pattern Created
→ Cutting
○ Sewing
○ First Fitting
○ Adjustments
○ Final Fitting
○ Quality Control
○ Ready

[View Measurements]
[View Reference Images]
[Update Stage]
[Schedule Fitting]
[Message Customer]
[Add Internal Note]
```

Staff should see:

- Tailor workload
- Jobs by stage
- Jobs by due date
- Overdue jobs
- Upcoming fittings
- Material requirements
- Outstanding balances
- Quality-control queue

## 21.5 Laundry Operations Dashboard

Staff should manage:

- Pickup schedule
- Garments received
- Inspection notes
- Cleaning method
- Stain-treatment notes
- Pressing status
- Quality control
- Packaging
- Delivery schedule
- Customer communication

## 21.6 CRM Backend

Staff should manage:

- Leads
- Customers
- Sales opportunities
- Follow-ups
- Quotes
- Support cases
- Loyalty
- Customer segments
- Notes
- Communication history
- Customer lifetime value

---

# 22. Staff Roles & Permissions

Access should be granted according to responsibility.

| Role | Typical Access |
|---|---|
| Super Administrator | Full platform administration |
| Store Manager | Orders, products, customers, operations, reporting |
| E-commerce Manager | Catalog, pricing, promotions, inventory, orders |
| Customer Service | Customers, orders, support, tracking, approved refunds |
| Tailoring Manager | Tailoring queue, measurements, fittings, tailors |
| Tailor | Assigned jobs, measurements, production status |
| Laundry Manager | Laundry workflow, pickups, cleaning, delivery |
| Delivery Staff | Assigned pickups/deliveries only |
| Marketing | Promotions, customers segments, campaigns, content |
| Finance | Payments, refunds, invoices, financial reports |
| Analyst | Read-only analytics access |

All important staff actions should be auditable.

---

# 23. Inventory & Procurement

The platform should eventually manage more than retail stock.

## 23.1 Inventory Types

- Retail products
- Product variants
- Fabrics
- Threads
- Buttons
- Zippers
- Packaging
- Laundry chemicals
- Tailoring supplies
- Consumables

## 23.2 Future Procurement Flow

```text
Low Stock
   ↓
Purchase Request
   ↓
Supplier Quote
   ↓
Purchase Order
   ↓
Goods Received
   ↓
Inventory Updated
```

Future capabilities can include:

- Suppliers
- Purchase orders
- Reorder levels
- Safety stock
- Lead times
- Cost history
- Stock transfers

---

# 23A. Mastra AI Service — Technical Boundary

The AI layer will be implemented as a dedicated **Mastra TypeScript service** rather than embedding uncontrolled model calls throughout storefront components.

```text
Next.js AI Chat UI
        ↓
Authenticated AI Endpoint / BFF
        ↓
Mastra Agent
   ┌────┼───────────────┐
   │    │               │
Memory  RAG        Authorized Tools
   │    │               │
Postgres/pgvector       Vendure Shop API
                        LIPEK Service APIs
                        CRM APIs
```

## 23A.1 What belongs in RAG

Suitable RAG sources:

- FAQs
- returns/shipping/service policies
- tailoring guides
- laundry care guidance
- service descriptions
- editorial content
- store information
- approved product knowledge
- approved internal support playbooks for staff agents

Do **not** place private customer order histories into a shared vector knowledge index.

Customer-specific live information must be obtained through authorized tools at runtime.

## 23A.2 Memory isolation

Every conversation/thread must be scoped to an authenticated or anonymous session resource. Logged-in customer memory must be keyed to the customer identity and authorization boundary.

No agent may retrieve another customer's conversation, measurements, orders or support history.

## 23A.3 Tool authorization

Tool execution has two security layers:

1. **Agent permission** — is this tool available to this agent?
2. **User authorization** — may this authenticated user perform/read this operation on this resource?

A tool being available to the AI does **not** imply that the user is authorized to use it.

## 23A.4 AI quality gates

Before production rollout, maintain:

- scripted support question dataset
- product discovery dataset
- order-status tool tests
- prompt-injection/adversarial tests
- authorization isolation tests
- hallucination/groundedness evaluations
- latency targets
- cost metrics
- human escalation tests
- tool approval tests

AI behavior must be observable through Mastra traces/evals and the platform monitoring stack.

---

# 24. AI Customer Service Assistant

The AI assistant should not be a basic FAQ chatbot. It should become a controlled digital customer-service agent capable of answering questions, using live business data and reasoning over the customer's situation.

## 24.1 Knowledge Areas

The AI should understand:

- Products
- Categories
- Sizes
- Colors
- Availability
- Tailoring services
- Measurements
- Fitting processes
- Alterations
- Laundry
- Pickup/delivery
- Shipping
- Returns
- Refunds
- Payment policies
- Promotions
- Loyalty
- Locations
- Opening hours
- FAQs
- Customer policies

## 24.2 AI Tools

```text
searchProducts()
recommendProducts()
checkInventory()
getProductDetails()

getCustomerSizes()
getMeasurements()

getOrderStatus()
trackShipment()

getTailoringStatus()
getAlterationStatus()
getLaundryStatus()

getAppointmentAvailability()

searchPolicies()
searchKnowledgeBase()

createSupportTicket()
prepareReturn()
prepareAppointment()
addItemsToCart()
```

The AI should access business data through secure platform APIs—not directly through the database.

---

# 25. AI Permission Model

AI actions should be divided into three permission classes.

## READ — Can execute autonomously

- Search products
- Check stock
- Read order status
- Read shipment status
- Read tailoring status
- Read alteration status
- Read laundry status
- Search policies
- Check appointments

## PREPARE — Can prepare but not finalize

- Prepare return
- Prepare exchange
- Prepare appointment
- Prepare support case
- Prepare cart
- Prepare alteration request
- Prepare tailoring consultation

## ACTION — Requires explicit customer or staff confirmation

- Cancel order
- Change appointment
- Submit return
- Modify shipping address
- Place order
- Make payment
- Issue refund
- Change sensitive customer information

---

# 26. AI Customer Service Example

Customer:

> Where is my suit?

System flow:

```text
Customer Question
       ↓
AI Identifies Intent
       ↓
Secure Tool Call
       ↓
Tailoring Module
       ↓
Current Stage + Appointment + ETA
       ↓
AI Explains Result
```

Example response:

> Your navy three-piece suit is currently in the sewing stage. Your first fitting is scheduled for August 21 at 2:00 PM. No action is required from you at this time.

---

# 27. AI Fashion Stylist

The AI should eventually become a shopping concierge.

Customer:

> “I have a wedding next month. I want something African-inspired but modern. My budget is $700.”

The AI can reason across:

- Customer measurements
- Style preferences
- Product catalog
- Available fabrics
- Inventory
- Tailoring capacity
- Shoes
- Accessories
- Budget
- Event date

Example:

```text
YOUR LIPEK LOOK

Modern Ankara-Accent Suit      $420
Brown Leather Loafers          $145
Gold Cufflinks                  $40
Pocket Square                   $25

TOTAL                          $630

[View Outfit]
[Modify Look]
[Add All to Cart]
```

---

# 28. Fashion-Specific AI Features

| Feature | Purpose |
|---|---|
| AI Stylist | Build outfits from customer needs |
| Complete-the-Look AI | Match shoes, jewelry and accessories |
| Conversational Search | Search using natural language |
| Size Assistant | Help customers navigate sizing |
| Measurement Assistant | Guide measurement collection |
| Visual Search | Upload an image to find similar products |
| AI Customer Support | Answer service and policy questions |
| AI Order Assistant | Explain order status |
| AI Tailoring Assistant | Explain fitting and customization |
| AI Laundry Assistant | Recommend cleaning service |
| AI Gift Assistant | Find gifts by person and budget |
| AI Review Summaries | Summarize reviews |
| AI CRM Assistant | Identify customers needing follow-up |
| AI Inventory Assistant | Flag shortages and trends |
| AI Merchandising Assistant | Recommend collections and bundles |
| AI Operations Assistant | Highlight delays and risks |

---

# 29. AI Reasoning for Management

Management could ask:

> “What needs my attention today?”

The AI could summarize:

```text
OPERATIONS BRIEF

3 tailoring orders are at risk of missing deadlines.

2 customers are waiting for fitting confirmation.

Black wool inventory may fall below safety stock within 6 days.

14 laundry orders are ready for delivery.

3 VIP customers have abandoned carts above $500.

Yesterday's revenue increased 18% compared with last Monday.
```

The AI should assist decision-making while sensitive actions remain controlled.

---

# 30. Human Handoff

The AI must know when to escalate.

```text
Customer Issue
      ↓
AI Detects Escalation
      ↓
Conversation Summarized
      ↓
Support Case Created
      ↓
Assigned to Human Staff
```

The support agent should receive:

- Customer
- Order/service reference
- Issue summary
- Conversation transcript
- Urgency
- Recommended next action

---

# 31. AI Architecture Principle

AI should sit **above** the business systems.

```text
                  AI MODULE
                      │
               Authorized Tools
                      │
          ┌───────────┼────────────┐
          │           │            │
       Commerce      CRM       Operations
          │           │            │
          └───────────┼────────────┘
                      │
                  PostgreSQL
```

The AI should never be given unrestricted database access.

---

# 32. Marketing Automation

CRM events can trigger customer journeys.

Examples:

```text
Customer Buys Suit
       ↓
Wait 30 Days
       ↓
Recommend Matching Shoes
```

```text
Customer Buys Agbada
       ↓
Recommend Accessories
```

```text
Wedding Customer
       ↓
Offer Groomsmen Package
```

```text
Laundry Customer Inactive 60 Days
       ↓
Send Return Offer
```

Automation should support:

- Segmentation
- Email
- SMS
- Push notification
- Personalized offers
- Birthday campaigns
- Abandoned cart
- Back-in-stock
- Price drops
- Win-back campaigns

---

# 33. Omnichannel & Multi-Location Future

The system should be architected for future growth such as:

```text
Houston Store
Dallas Store
New York
London
Online US
Online Europe
Online Africa
```

Future capabilities:

- Buy Online, Pick Up In Store
- Buy Online, Return In Store
- Store stock visibility
- Ship from nearest location
- Stock transfers
- Regional catalogs
- Regional pricing
- Multiple currencies
- Regional payment methods
- Regional tax rules
- Regional shipping methods

---

# 34. Internationalization

Do not hard-code a single currency, language or region.

Design for:

- Languages
- Currencies
- Countries
- Tax zones
- Shipping zones
- Regional pricing
- Regional catalogs
- Regional payment methods
- Regional warehouses
- Localized content
- Localized SEO

---

# 35. PWA & Future Mobile Applications

The initial website should be a **Progressive Web App** where practical.

Benefits:

- Installable on supported devices
- Fast repeat visits
- App-like navigation
- Push notifications where supported
- Single web codebase initially
- Lower early development cost

Future native iOS and Android apps can reuse the same backend APIs.

---

# 36. SEO & Content Architecture

SEO must be part of the platform architecture.

Example URLs:

```text
/men
/men/suits
/men/suits/three-piece
/women/dresses
/women/african-wear
/children/boys
/custom-tailoring
/alterations
/laundry-dry-cleaning
```

Every product/category should support:

- SEO title
- Meta description
- Canonical URL
- Structured data
- Open Graph
- Alt text
- Breadcrumbs
- Product schema
- Price
- Availability
- Reviews

Editorial commerce should include guides such as:

- How to Style an Agbada
- Wedding Suit Guide
- How a Suit Should Fit
- Best Shoes for Navy Suits
- African Wedding Style Guide
- Care Guides
- Tailoring Guides

---

# 37. Accessibility

The platform should target a strong accessibility standard such as WCAG 2.2 AA.

Requirements include:

- Keyboard navigation
- Visible focus states
- Screen-reader support
- Sufficient contrast
- Accessible forms
- Clear errors
- Accessible checkout
- Accessible modals
- Appropriate touch targets
- Accessible AI chat

---

# 38. Security

Security must be built into the platform from the beginning.

| Security Area | Requirement |
|---|---|
| Admin | Strong authentication |
| Authorization | Role-based access control |
| APIs | Rate limiting and authorization |
| Secrets | Never stored in source code |
| Sessions | Secure session management |
| Webhooks | Signature validation |
| Uploads | File type and size validation |
| Database | Restricted/private access |
| Backups | Encrypted |
| Logs | Avoid sensitive data leakage |
| AI | Restricted tools and permissions |
| Infrastructure | Firewall/WAF where appropriate |
| Dependencies | Automated security scanning |
| Admin Actions | Audit trail |
| Payments | Keep raw card data outside LIPEK systems where possible |

---

## 38A. Vendure Worker, Redis & BullMQ

Vendure's Worker process is a first-class production component.

For early local development, the scaffolded/default queue may be acceptable. Before production with multiple LIPEK queues, configure the **Vendure BullMQJobQueuePlugin backed by Redis**.

Expected queues include:

- transactional email
- receipt generation
- invoice/document generation
- search indexing
- cache revalidation
- CRM event processing
- loyalty updates
- marketing event dispatch
- image/media processing
- AI knowledge ingestion
- embeddings/re-indexing
- external integration retries
- analytics exports

Queue jobs must be:

- idempotent where practical
- retryable with bounded retries
- observable
- assigned clear priority
- safe against duplicate execution

---

# 39. Background Jobs

Checkout should not wait for secondary tasks.

Example:

```text
PAYMENT SUCCESS
       ↓
Order Confirmed Immediately
       ↓
────────────────────────────
Background Jobs:
- Receipt Generation
- Confirmation Email
- CRM Update
- Analytics Event
- Loyalty Points
- Search Index Update
- AI Classification
```

This improves resilience and customer experience.

---

# 40. Event-Driven Platform

Modules should communicate through business events.

Example events:

```text
CustomerCreated
CustomerRegistered

OrderCreated
PaymentSettled
OrderCancelled
OrderFulfilled
OrderDelivered

ReturnRequested
RefundCompleted

TailoringStarted
FittingScheduled
TailoringCompleted

LaundryCollected
LaundryCompleted
LaundryDelivered

AlterationStarted
AlterationCompleted
```

This allows future modules to respond without tightly coupling the platform together.

---

# 41. Analytics & Business Intelligence

The platform should collect meaningful commerce and service events.

## 41.1 Events

```text
product_viewed
search_performed
filter_applied
product_added
cart_abandoned
checkout_started
payment_completed
return_started
wishlist_added
ai_recommendation_clicked
tailoring_started
appointment_booked
laundry_ordered
```

## 41.2 KPIs

- Conversion rate
- Average order value
- Customer lifetime value
- Repeat purchase rate
- Return rate
- Revenue by category
- Revenue by channel
- Revenue by customer segment
- AI-assisted revenue
- Search-to-purchase conversion
- Tailoring profitability
- Laundry repeat rate
- Alteration turnaround time
- Fulfillment time
- Refund rate
- Stock turnover
- Customer acquisition cost
- Loyalty participation

---

# 42. Observability & Monitoring

A global-class platform must be diagnosable.

```text
Browser Request
     ↓
Next.js Frontend
     ↓
Platform API
     ↓
Commerce / Service Module
     ↓
Payment / Shipping Integration
     ↓
Database
     ↓
Background Worker
     ↓
Email / Notification
```

The engineering team should be able to trace failures across the full journey.

Monitor:

- Application errors
- API latency
- Checkout failures
- Payment failures
- Search latency
- Database health
- Queue failures
- Email delivery
- AI tool errors
- AI response latency
- Infrastructure resource usage

---

# 43. Testing Strategy

Before production, testing should include:

- Unit tests
- Integration tests
- API tests
- End-to-end storefront tests
- Checkout tests
- Payment webhook tests
- Permission tests
- AI tool tests
- Inventory concurrency tests
- Performance tests
- Accessibility tests
- Backup restoration tests

Critical automated journey:

```text
Search Product
   ↓
Select Variant
   ↓
Add to Cart
   ↓
Checkout
   ↓
Payment
   ↓
Order Created
   ↓
Receipt Generated
   ↓
Track Order
   ↓
Return / Refund
```

If this fails, deployment should stop.

---

# 44. CI/CD & Environments

Never develop directly against production.

```text
LOCAL
  ↓
DEVELOPMENT
  ↓
STAGING
  ↓
PRODUCTION
```

Deployment pipeline:

```text
Code Push
   ↓
Lint
   ↓
Tests
   ↓
Build
   ↓
Security Checks
   ↓
Migration Validation
   ↓
Deploy
   ↓
Health Check
   ↓
Smoke Test
```

---

# 45. Backup & Disaster Recovery

The platform must assume failures can occur.

Required:

- Database backups
- Object-storage backups/versioning
- Off-site backups
- Retention policy
- Restore procedure
- Disaster recovery procedure
- Recovery testing

The team should regularly prove that backups can actually be restored.

---

# 46. Feature Flags

Future features should be controlled using feature flags.

```text
AI_STYLIST = true
VIRTUAL_TRY_ON = false
LOYALTY = true
EU_STORE = false
SUBSCRIPTIONS = false
```

This allows controlled release to:

- Staff
- Beta users
- VIP customers
- Houston customers
- Percentage-based user groups

---

# 47. Features to Architect for but Not Build Immediately

| Capability | Reason to Delay |
|---|---|
| Microservices | Premature complexity at launch |
| Kubernetes | Unnecessary until scale demands it |
| Blockchain | No immediate business value |
| Metaverse Store | No immediate business need |
| Full ERP | Extremely broad scope |
| Full Accounting Suite | Integrate with specialist software first |
| Native iOS/Android on Day One | PWA first |
| Complex Multi-Agent Organization | Build one reliable AI agent first |
| Virtual Try-On | High technical complexity |
| Marketplace | Not required initially |
| Global Warehouses | Architecture first |
| Fully Autonomous AI | Build trust progressively |

---

# 48. Client Backend Must-Have Summary

The platform is not complete unless the client can operate it independently.

The backend must enable LIPEK staff to:

1. Create and update products.
2. Manage categories and collections.
3. Manage pricing and promotions.
4. Manage stock.
5. View and process orders.
6. Confirm payments.
7. Update shipment tracking.
8. Process returns and refunds.
9. Manage tailoring jobs.
10. View customer measurements.
11. Assign tailors.
12. Schedule fittings.
13. Manage alteration requests.
14. Manage laundry jobs.
15. Manage pickup/delivery.
16. View customer profiles.
17. Manage CRM leads.
18. Handle support cases.
19. Manage loyalty.
20. Review AI escalations.
21. View reports and analytics.
22. Manage staff.
23. Assign permissions.
24. Review audit logs.
25. Configure platform settings.

---

# 48A. Mandatory Engineering Phases for Claude/Codex

The four business releases later in this document are the client/product roadmap. The coding agents must translate them into the following engineering execution phases.

## Phase 0 — Discovery, Documentation & Baseline

**Goal:** establish a reproducible, documented foundation before custom features.

Tasks:

- Read this file in full
- Audit repository/workstation
- Verify Node/pnpm/Docker/Git
- Verify current Vendure/Next.js/Mastra official docs
- Produce architecture docs and ADR baseline
- Produce dependency register
- Produce environment-variable inventory
- Define route map and catalog taxonomy
- Define initial entity/domain model
- Define testing matrix
- Define deployment assumptions
- Create phased implementation plan with effort/risk/dependencies
- Create `AGENTS.md` and `CLAUDE.md`

**Gate:** no custom commerce feature implementation before the architecture/docs baseline exists.

## Phase 1 — Monorepo & Commerce Foundation

- Scaffold current Vendure Core with PostgreSQL
- Include official Next.js storefront
- Convert/normalize to pnpm workspace
- Set Node toolchain
- Establish env management
- Run Vendure server, worker, Dashboard and storefront
- Set migrations policy
- Add health checks
- Add CI baseline
- Establish test baseline
- Commit clean foundation

**Acceptance:** one-command local startup and documented environment.

## Phase 2 — Admin-First Catalog & Content Management

- Configure Men/Women/Children collection hierarchy
- Configure facets/taxonomy
- Configure product/variant custom fields
- Build `LipekContentPlugin`
- Add content entities/dashboard extensions
- Add site settings/navigation/menu management
- Add service definition administration
- Add SEO fields
- Add storefront revalidation flow
- Add backend-editability tests

**Acceptance:** client can create/edit products, categories, tags/facets, collections, homepage content, services and SEO without code.

## Phase 3 — Storefront Experience

- Brand UI/design system
- Homepage driven entirely by backend content
- Men/Women/Children catalog experiences
- Product details
- Faceted search/filter
- Wishlist/recently viewed where scheduled
- Account authentication
- Customer profile
- Responsive/PWA foundation
- SEO/schema
- Accessibility baseline
- Performance budget

## Phase 4 — Checkout, Payments, Fulfillment & Documents

- Cart/checkout hardening
- Shipping
- Payment provider integration
- Webhook idempotency
- Order confirmation
- Customer order history
- Tracking
- Returns/exchanges
- Refunds
- Receipt/invoice generation
- Email notifications
- Staff order management

## Phase 5 — Tailoring

- Measurement profiles
- Custom garment configuration
- Tailoring jobs
- State machine
- Tailor assignment
- Fittings/appointments
- Deposits/remaining balances
- Customer tracking
- Staff production dashboard
- Documents and notifications

## Phase 6 — Alterations + Laundry/Dry Cleaning

- Alteration request/quote/workflow
- Garment uploads
- Laundry jobs/items
- Pickup/delivery
- Recurring services design
- Unified service tracking
- Staff queues/quality control

## Phase 7 — CRM, Customer 360 & Loyalty

- Leads/opportunities
- Support cases
- Customer notes
- Customer 360 aggregation
- Segmentation
- Loyalty/rewards
- Referral model
- Marketing event hooks
- Operational dashboards

## Phase 8 — Search & Personalization Upgrade

- Search relevance baseline measurement
- OpenSearch infrastructure when justified
- Custom Vendure search adapter/plugin
- Typo/fuzzy/relevance tuning
- Semantic/hybrid search
- Complete-the-look/personalization services
- Back-in-stock and price-drop event flows

## Phase 9 — Mastra AI Customer Service

- Scaffold `apps/ai`
- Postgres storage + pgvector
- RAG ingestion
- Customer-service agent
- Read-only tools first
- Authentication/authorization propagation
- Human handoff
- Mastra tracing/evals
- Prompt injection and access-control testing
- Website chat UI
- Production pilot behind feature flag

## Phase 10 — AI Commerce & Internal Copilots

- AI stylist
- Conversational product search
- Size/measurement assistant
- AI CRM assistant
- AI operations assistant
- AI inventory assistant
- Tool approval for write actions
- Management summaries
- Agentic workflows only after proven safety

## Phase 11 — Production Hardening & Global Readiness

- Redis/BullMQ production queues
- Horizontal scaling readiness
- S3-compatible assets
- WAF/rate limits
- complete observability
- backup/restore test
- load testing
- accessibility certification pass
- Core Web Vitals tuning
- security review
- data retention/privacy review
- incident-response runbook
- internationalization/channel readiness

### Phase completion rule

Every phase must produce:

```text
CODE
+ MIGRATIONS
+ TESTS
+ DOCUMENTATION
+ ADMIN COVERAGE
+ SECURITY REVIEW
+ ACCEPTANCE EVIDENCE
```

No phase is “done” because the UI merely appears to work.

---

# 49. Recommended Release Plan

## Release 1 — Commerce Foundation

**Objective:** Build a stable, global-quality fashion store.

Features:

- Catalog
- Men / Women / Children
- Categories
- Products and variants
- Search and filters
- Cart
- Checkout
- Payments
- Customer accounts
- Inventory
- Shipping
- Orders
- Tracking
- Receipts
- Returns
- Wishlist
- Reviews
- Admin
- SEO
- Security
- Analytics
- PWA foundation

## Release 2 — LIPEK Services

**Objective:** Digitize LIPEK's service businesses.

Features:

- Custom tailoring
- Measurements
- Appointments
- Fittings
- Tailoring production tracking
- Alterations
- Laundry
- Pickup/delivery
- Service payments
- Unified tracking
- Unified customer dashboard

## Release 3 — Customer Intelligence

**Objective:** Turn customer data into stronger relationships and repeat revenue.

Features:

- Customer 360
- CRM
- Loyalty
- Gift cards
- Referrals
- Segmentation
- Marketing automation
- Advanced search
- Semantic search
- Personalized recommendations
- Multi-channel foundations
- Advanced analytics

## Release 4 — Intelligent Commerce

**Objective:** Add AI-assisted commerce and business intelligence.

Features:

- AI Customer Service
- AI Stylist
- AI Search
- AI Order Assistant
- AI Tailoring Assistant
- AI Laundry Assistant
- AI CRM Assistant
- AI Merchandising
- AI Inventory
- Visual Search
- Agentic workflows
- Human handoff
- AI observability
- Approval-based AI actions

---

# 50. Platform Readiness Definition

LIPEK 1.0 should not be considered complete merely because the homepage is finished.

It is ready when:

> A customer can discover LIPEK through search, find the right product quickly, understand it, choose the correct variation, add it to cart, pay securely, automatically receive confirmation and a receipt, track the order without calling anyone, receive the item, request an exchange if necessary, contact support immediately, and complete the entire journey smoothly even on a low-cost mobile device and average internet connection.

At the same time:

> LIPEK staff can see the order, payment, customer, inventory allocation and fulfillment status; process the order; communicate with the customer; update tracking; issue refunds; review history; manage services; and diagnose routine problems without touching the database or requesting developer intervention.

---

# 51. Strategic Success Principles

A global-class platform is not impressive because it contains hundreds of features.

It is impressive because:

- Search feels instant.
- Checkout is dependable.
- Payments reconcile correctly.
- Inventory is accurate.
- Customers know where their orders are.
- Staff know what to do next.
- Receipts arrive automatically.
- Returns are easy.
- Service workflows are transparent.
- Customer information is unified.
- The website is fast.
- The system survives failures.
- The backend is easy for staff to operate.
- AI helps rather than creates confusion.
- Security is designed in from the beginning.
- The architecture can grow without constant rewrites.

---

# 52. Long-Term LIPEK Platform Vision

The platform can progressively evolve into:

```text
LIPEK INTELLIGENT FASHION OPERATING PLATFORM

Commerce
├── Men
├── Women
├── Children
├── Products
├── Orders
├── Payments
├── Shipping
└── Returns

Fashion Services
├── Custom Tailoring
├── Alterations
├── Laundry
├── Dry Cleaning
├── Pickup & Delivery
├── Appointments
└── Measurements

Customer Experience
├── My LIPEK
├── Order Tracking
├── Service Tracking
├── Receipts
├── Loyalty
├── Recommendations
└── Support

Business Operations
├── Inventory
├── Procurement
├── Production
├── Quality Control
├── Delivery
└── Workforce Queues

Customer Intelligence
├── CRM
├── Customer 360
├── Leads
├── Segmentation
├── Marketing Automation
└── Loyalty

Artificial Intelligence
├── Customer Service Agent
├── Fashion Stylist
├── Conversational Search
├── Order Assistant
├── Tailoring Assistant
├── CRM Assistant
├── Inventory Assistant
├── Merchandising Assistant
└── Management Intelligence

Platform Engineering
├── Security
├── Analytics
├── Observability
├── CI/CD
├── Backups
├── Search
├── Event Bus
├── Background Jobs
└── Feature Flags
```

---

# 52A. Runtime / Deployment Topology Target

A mature deployment should separate independently scalable concerns:

```text
                         INTERNET
                            │
                      CDN / WAF / TLS
                            │
              ┌─────────────┴─────────────┐
              │                           │
       Next.js Storefront             Public AI Route
              │                           │
              │                       Mastra Service
              │                           │
              └──────────────┬────────────┘
                             │
                     Vendure Shop API
                             │
                 ┌───────────┴───────────┐
                 │                       │
          Vendure Server           Vendure Worker(s)
                 │                       │
                 └───────────┬───────────┘
                             │
          ┌──────────────────┼───────────────────┐
          │                  │                   │
     PostgreSQL           Redis/BullMQ      Object Storage
     + pgvector                               S3-compatible
          │
       OpenSearch
       (advanced
        search phase)
```

The Vendure Admin API/Dashboard must be protected more strongly than the public Shop API and should not be unnecessarily exposed through the same public edge policy.

---

# 52B. Data & Migration Rules

- PostgreSQL is the source of truth for transactional/domain data.
- Every schema change must use reviewed migrations.
- Production must not use automatic destructive schema synchronization.
- Seed scripts are for deterministic baseline/reference data, not live business content.
- Customer-editable content lives in the database/admin system.
- File objects live in object storage; database stores metadata/references.
- No service is allowed to silently create shadow copies of core customer/order data without a defined synchronization contract.
- AI vector indexes are derived data and must be rebuildable from canonical sources.
- Search indexes are derived data and must be rebuildable.
- Analytics warehouses/event sinks are derived from canonical business events.

---

# 52C. Security Requirements Specific to AI & Commerce

In addition to the general security section:

## Commerce

- Payment webhook signatures must be verified.
- Payment/order mutations must be idempotent.
- Raw payment-card data must never be stored by LIPEK.
- Customer order access must always be scoped to authenticated ownership.
- Admin actions must be permission-gated.
- Sensitive admin endpoints must be rate-limited and monitored.

## Customer measurements

Body measurements are private customer profile data.

- Restrict access to the customer and authorized tailoring staff.
- Audit staff access where feasible.
- Never expose measurements in public URLs or analytics payloads.
- Do not place raw customer measurements in shared AI RAG indexes.

## AI

- Tool allowlists per agent.
- Customer authorization checked inside every customer-data tool.
- No arbitrary SQL tools.
- No unrestricted HTTP fetch tool in production customer agent.
- Treat retrieved content as untrusted input.
- Defend against prompt injection in product/content data.
- Confirmation gate for irreversible/write actions.
- Human escalation for high-risk/ambiguous cases.
- Redact sensitive data from AI logs/traces where required.
- Feature-flag AI write actions independently from AI read actions.

---

# 52D. Technical Definition of Backend Independence

The client has achieved backend independence when normal business operations no longer require a developer.

Examples:

```text
NEW PRODUCT?
Client uses Dashboard.

NEW CATEGORY?
Client uses Collections.

NEW TAG/FILTER?
Client uses Facets.

NEW HOMEPAGE PROMOTION?
Client edits Content/Banner in Dashboard.

PRICE CHANGE?
Client edits variant/service price.

NEW TAILORING SERVICE?
Client creates ServiceDefinition.

BLOG ARTICLE?
Client publishes Article.

POLICY UPDATE?
Client edits PolicyDocument.

STORE HOURS CHANGE?
Client edits StoreLocation/Site Settings.

SEO TITLE CHANGE?
Client edits SEO fields.

ORDER STATUS?
Authorized staff update workflow.

NEW STAFF MEMBER?
Administrator creates role/account.
```

Code changes remain necessary for **new capabilities, new workflow logic, new component types, new integrations or structural design changes**—not routine business administration.

---

# 52E. Coding-Agent “Do Not” List

Claude/Codex must not:

- hard-code catalog categories in navigation components
- hard-code product tags/filter lists
- hard-code homepage promotions that staff should edit
- bypass Vendure and write commerce tables directly
- expose Vendure Admin API credentials to the browser
- query PostgreSQL directly from the public AI agent
- use the legacy Vendure Angular Admin UI
- duplicate customer/order/payment truth across unrelated services
- create a microservice for every small feature
- add OpenSearch before the catalog/search requirements justify it
- make AI write actions autonomous on day one
- use `any` as a shortcut across core domain boundaries
- install dependencies without recording why they exist
- upgrade framework majors without compatibility checks
- mark a phase complete without tests and documentation
- implement client-facing content that cannot be managed from the backend when this document says it must be editable

---

# 52F. Technical Sources / Verification Notes

This internal document restores implementation technology names intentionally removed from the client-facing version.

Key currently verified facts as of **17 August 2026**:

- Vendure Core is an open-source headless commerce framework using TypeScript, NestJS and GraphQL.
- Vendure exposes separate Shop and Admin GraphQL APIs and includes a Worker for background tasks.
- Current Vendure projects use the React-based `@vendure/dashboard`; the legacy Angular Admin UI should not be used for new development.
- Vendure Dashboard is extensible through plugin-provided routes, navigation, forms, tables, widgets and page extensions.
- Vendure `Collection`s can represent nested storefront category trees.
- Vendure `Facet`/`FacetValue` data provides structured product labeling/filtering.
- Vendure plugins can add custom entities, API extensions, events, integrations and background jobs.
- Vendure's Settings Store can persist scoped configuration-like values.
- Vendure's default search can launch on PostgreSQL and the search contract is pluggable for future external engines.
- Vendure provides a BullMQ job queue strategy backed by Redis for larger/multi-worker workloads.
- The official Vendure storefront starter targets Next.js 16 at the time of this review.
- Mastra is the selected TypeScript AI framework and provides agents, tools, memory, RAG, workflows, human/tool approval patterns and observability/evaluation capabilities.

Because these ecosystems evolve, coding agents must **re-verify exact APIs and package versions against official docs before implementation**, while preserving the architectural intent unless an ADR changes it.

---

# Conclusion

The proposed LIPEK platform is designed to begin as a robust Vendure-powered fashion commerce system with a Next.js storefront and unified Vendure Dashboard, while creating a clear technical path toward a much broader Mastra-assisted intelligent fashion operating platform.

The architecture intentionally separates:

- customer experience,
- commerce,
- tailoring,
- alterations,
- laundry,
- CRM,
- operations,
- search,
- AI,
- analytics,
- and administrative control.

This modular separation is what allows LIPEK to grow without rebuilding the entire platform whenever a new capability is introduced.

The immediate objective is therefore not to build every future feature at once. The objective is to establish a **strong architectural foundation, excellent commerce experience, reliable operational backend and unified customer model**, and then progressively introduce the capabilities that create competitive advantage.

The result is a platform capable of supporting LIPEK's current business while preparing the company for future expansion into new locations, new markets, mobile applications, intelligent customer experiences, advanced CRM, omnichannel commerce, automation and AI-assisted operations.

> **The ambition is not simply to put LIPEK online. The ambition is to build the digital operating foundation for the future of the LIPEK business.**

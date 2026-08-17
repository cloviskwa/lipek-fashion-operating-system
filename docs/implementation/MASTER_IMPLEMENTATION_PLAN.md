# LIPEK Platform — Master Implementation Plan

**Status:** Authoritative
**Precedence:** Subordinate to `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` ("the SOT") per SOT §0.1. This plan translates the SOT's business/product roadmap (§48A, §49) into an executable engineering program, and adds this engagement's explicit extra requirements: most-advanced-practice MFA, Google/Apple/email account creation, security hardening, Android/iOS/PWA app-readiness for customers/delivery/staff, dark/light theming, and SEO+AEO. Where this plan is silent, the SOT governs. Where this plan makes a call the SOT left open, it is logged in [`ADR_BACKLOG.md`](ADR_BACKLOG.md).
**Companion documents:** [`CURRENT_REPOSITORY_ASSESSMENT.md`](../architecture/CURRENT_REPOSITORY_ASSESSMENT.md) · [`GAP_ANALYSIS.md`](../architecture/GAP_ANALYSIS.md) · [`TARGET_REPOSITORY_STRUCTURE.md`](../architecture/TARGET_REPOSITORY_STRUCTURE.md) · [`DEPENDENCY_INSTALLATION_PLAN.md`](DEPENDENCY_INSTALLATION_PLAN.md) · [`ADR_BACKLOG.md`](ADR_BACKLOG.md) · [`DOCUMENTATION_MAP.md`](DOCUMENTATION_MAP.md) · [`SIBLING_PROJECT_SECURITY_FINDINGS.md`](SIBLING_PROJECT_SECURITY_FINDINGS.md)
**Repository note (2026-08-17):** this plan and its companion documents were authored during the audit of the prior `LIPEK FASHION` prototype repository and then carried into this clean-start repository (`lipek-platform`, at `C:\Users\KWA\dev\lipek Fashion Operating System`) as its founding documentation. References below to "the current repository"/"this repository" in the Current-State/Gap-Analysis sections describe that prior repository's state at audit time, not this one — this repository was scaffolded fresh per `docs/architecture/TARGET_REPOSITORY_STRUCTURE.md`, with reusable assets already ported in (see `FOUND-004`/`FOUND-020` status below).
**Progress:** Phase 0 is **complete** and committed (`git log` — "Phase 0: clean-start LIPEK platform monorepo baseline"). Phase 1 has not started — `apps/server`/`apps/storefront` are not yet bootstrapped, no dependency is installed, no database exists. All tasks from `FOUND-013` onward remain `NOT STARTED`.

---

## 1. Executive Engineering Summary

LIPEK is to be built as a modular, Vendure-Core-anchored commerce and services platform — not a conventional online store — with a Next.js storefront, a unified Vendure React Dashboard staff backend, dedicated domain plugins for tailoring/alterations/laundry/CRM/loyalty/documents/content, and a Mastra-based AI layer introduced only after the commerce and administration foundation is proven. The repository today is a single-package Next.js marketing-site prototype with no backend, no database, no authentication, and no admin capability of any kind (see Current-State Summary below); the platform build starts from an architectural blank slate and re-uses only the prototype's design tokens, route/IA structure, and SEO pattern.

This plan adds four requirements beyond the SOT's own text, all treated as first-class, not bolted on: (1) **MFA built to the most advanced current practice** (WebAuthn/passkeys primary, TOTP fallback, backup codes) plus **Google/Apple/email account creation**, implemented server-authoritatively inside a new `lipek-security` Vendure plugin; (2) **security hardening** carried forward from proven patterns found in sibling repositories (rate limiting, origin/CORS allow-listing, expanded security headers/CSP); (3) **app-readiness for three audiences** — customer, delivery/courier, and staff/admin — on Android, iOS, and as an installable PWA; (4) **dark/light theming** as a first-class design-system concern; and (5) **SEO + AEO** (answer-engine optimization) so the platform is discoverable by both traditional search and AI answer engines.

The plan is organized into **12 phases (Phase 0–11)** carrying **168 executable tasks** across 15 domain-prefixed task families (`FOUND`, `SEC`, `CONTENT`, `ADMIN`, `THEME`, `COM`, `MOBILE`, `SEO`, `TAILOR`, `ALTER`, `LAUNDRY`, `CRM`, `SEARCH`, `AI`, `OPS`), mapped onto the SOT's four business releases (§49). Every phase closes only when it produces **code + migrations + tests + documentation + admin coverage + security review + acceptance evidence** (SOT §48A "Phase completion rule") — a UI that merely appears to work is not a completed phase.

## 2. Current-State Summary

Full detail: [`CURRENT_REPOSITORY_ASSESSMENT.md`](../architecture/CURRENT_REPOSITORY_ASSESSMENT.md), [`GAP_ANALYSIS.md`](../architecture/GAP_ANALYSIS.md).

The repository contains one static-content Next.js 15/React 19 marketing site (App Router, Tailwind v4, TypeScript strict) reading placeholder business copy from local JSON at build time. It has: reusable design tokens, a sound route/IA structure (About, Services + sub-categories, Process, Gallery, FAQ, Legal, Testimonials, Blog, Contact), a working SEO/JSON-LD pattern, and a reasonable security-headers baseline. It has: no database, no commerce engine, no admin backend, no authentication of any kind, no AI, no CRM, no test suite, no CI, and a disconnected Capacitor mobile scaffold (`mobile-wrapper/`). The SOT document itself is currently misplaced under `public/docs/`, making it web-servable — flagged as a P0 exposure item, task `FOUND-004`. The working tree also has an uncommitted diff (old scaffold deleted, new app untracked) that must be committed as a clean baseline before any restructuring.

## 3. Target Architecture Summary

Full detail: [`TARGET_REPOSITORY_STRUCTURE.md`](../architecture/TARGET_REPOSITORY_STRUCTURE.md).

A pnpm monorepo: `apps/server` (Vendure Core + NestJS plugins + the aggregate Vendure Dashboard build), `apps/storefront` (Next.js, bootstrapped from the official Vendure starter), `apps/mobile/{customer,delivery,staff}`, `apps/ai` (Mastra), `packages/{ui,shared,schemas,graphql,config,testing}`, `docs/`, `infra/`, `scripts/`. Commerce, content, tailoring, alterations, laundry, appointments, CRM, loyalty, documents, customer-experience, analytics-events, and integrations are each a bounded-context Vendure plugin **with its Dashboard extension colocated inside it** (`apps/server/src/plugins/<name>/dashboard/`), per the official Vendure Dashboard extension model (verified against current docs during the pre-Phase-1 architecture normalization pass — see `ADR-0013`) — there is no separate `apps/staff-console-extensions` app. MFA/social-login/RBAC live in a new `lipek-security` plugin. Dark/light theme tokens live once in `packages/ui` with a thin per-renderer bridge. AEO lives in the storefront's SEO layer over backend-owned content — no new service required.

---

## 4. Implementation Phases Overview

| Phase | Name | Release mapping (SOT §49) | Task families in this phase |
|---|---|---|---|
| 0 | Discovery, Documentation & Baseline | Pre-release | `FOUND-001`–`FOUND-012` |
| 1 | Monorepo, Commerce Foundation & Identity/Security Foundation — executed as sub-phases 1A–1E, see §6 | Release 1 (foundation) | `FOUND-013`–`FOUND-023`, `SEC-001`–`SEC-011`, `COM-001`–`COM-005` |
| ↳ 1A | Platform Bootstrap | — | `FOUND-013`–`FOUND-015` |
| ↳ 1B | Engineering Foundation | — | `FOUND-016`–`FOUND-023` |
| ↳ 1C | Identity Foundation | — | `SEC-001`–`SEC-006` |
| ↳ 1D | External Identity & Security | — | `SEC-007`–`SEC-011` |
| ↳ 1E | Commerce Catalog Foundation | — | `COM-001`–`COM-005` |
| 2 | Admin-First Catalog & Content Management | Release 1 | `CONTENT-001`–`CONTENT-010`, `ADMIN-001`–`ADMIN-006`, `THEME-001` |
| 3 | Storefront Experience (incl. PWA, theming, SEO/AEO) | Release 1 | `COM-006`–`COM-012`, `THEME-002`–`THEME-003`, `MOBILE-001`–`MOBILE-002`, `SEO-001`–`SEO-005` |
| 4 | Checkout, Payments, Fulfillment & Documents | Release 1 | `COM-013`–`COM-023`, `OPS-001`–`OPS-003`, `OPS-006` |
| 5 | Tailoring (flagship service) | Release 2 | `TAILOR-001`–`TAILOR-011` |
| 6 | Alterations + Laundry/Dry Cleaning | Release 2 | `ALTER-001`–`ALTER-007`, `LAUNDRY-001`–`LAUNDRY-008`, `MOBILE-003` |
| 7 | CRM, Customer 360 & Loyalty | Release 3 | `CRM-001`–`CRM-012`, `OPS-004`–`OPS-005` |
| 8 | Search & Personalization Upgrade | Release 3 | `SEARCH-001`–`SEARCH-008` |
| 9 | Mastra AI Customer Service | Release 4 | `AI-001`–`AI-012`, `SEO-006` |
| 10 | AI Commerce & Internal Copilots | Release 4 | `AI-013`–`AI-016` |
| 11 | Production Hardening & Global Readiness | Cross-release gate | `SEC-012`, `THEME-004`, `MOBILE-004`–`MOBILE-006`, `OPS-007`–`OPS-016` |

Total: **168 tasks**. No task is marked complete; this document is the plan, not a status report.

---

## 5. Dependency & Parallelization Model

### 5.1 Phase dependency diagram

```text
Phase 0 — Discovery, Docs & Baseline
        ↓
Phase 1A — Platform Bootstrap
        ↓
Phase 1B — Engineering Foundation
        ↓
Phase 1C — Identity Foundation
        ↓
Phase 1D — External Identity & Security
        ↓
Phase 1E — Commerce Catalog Foundation  (no real dependency on 1C/1D — see §5.3)
        ↓
Phase 2 — Admin-First Catalog & Content Management
        ↓
Phase 3 — Storefront Experience (PWA / Theming / SEO+AEO)
        ↓
Phase 4 — Checkout / Payments / Fulfillment / Documents
        ↓
Phase 5 — Services
 ┌────────────────────┼────────────────────┐
 ↓                     ↓                    ↓
Tailoring          Alterations           Laundry
(Phase 5)            (Phase 6)            (Phase 6)
 └────────────────────┼────────────────────┘
                       ↓
Phase 7 — Customer 360 / CRM / Loyalty
                       ↓
Phase 8 — Advanced Search / Personalization
                       ↓
Phase 9 — AI Customer Service
                       ↓
Phase 10 — AI Commerce / Internal Copilots
                       ↓
Phase 11 — Production Hardening / Global Readiness
```

Alterations and Laundry are shown as parallel to each other (both Phase 6, independent plugins, both depend only on Phase 4's payment/document/appointment foundation) but Tailoring is drawn as its own phase (5) ahead of them because it is the SOT's explicitly designated **flagship module** (SOT §10) with the deepest dependency surface (measurement profiles, fitting appointments, production state machine) that Alterations partially reuses (shared `AppointmentsPlugin`, shared deposit/balance pattern from `COM-022`). Teams with enough capacity may run Tailoring and the Alterations/Laundry pair concurrently once Phase 4 closes — see §5.3.

### 5.2 Cross-cutting tracks (do not block the spine, but must land before their consuming phase closes)

```text
SEC track:      SEC-001…006 (Phase 1C) → SEC-007…011 (Phase 1D) ──► SEC-012 (Phase 11)
THEME track:    THEME-001 (Phase 2) → THEME-002…003 (Phase 3) ──► THEME-004 (Phase 11)
MOBILE track:   MOBILE-001…002 (Phase 3) ─────────► MOBILE-003 (Phase 6) ─► MOBILE-004…006 (Phase 11)
SEO/AEO track:  SEO-001…005 (Phase 3) ────────────────────────────► SEO-006 (Phase 9, pending ADR-0010)
OPS track:      OPS-001…003 (Phase 4) → OPS-004…006 (Phase 7) ──► OPS-007…016 (Phase 11)
```

### 5.3 Parallelization opportunities

| Can run in parallel | Cannot start until |
|---|---|
| `CONTENT-*` (Phase 2) and `SEC-007`/`SEC-008` social login (Phase 1D) | Both depend only on `FOUND-013`–`FOUND-016` (monorepo + Vendure bootstrap), not on each other |
| Phase 1E (`COM-001`–`COM-005`) and Phases 1C/1D (`SEC-*`) | Both depend only on 1A/1B closing, not on each other — catalog configuration has no real dependency on identity/security work; this plan sequences 1E last for narrative clarity only (see 1E's card) |
| `TAILOR-*` (Phase 5) and `ALTER-*`/`LAUNDRY-*` (Phase 6) | Both depend on Phase 4 closing (payments/documents/appointments foundation); teams may split here if staffed for it |
| `SEARCH-*` (Phase 8) and early `AI-001`–`AI-003` scaffolding (Phase 9) | `AI-001`–`AI-003` only need Postgres/pgvector + RAG source content (available once Phase 2/CONTENT closes); they do not need Search to be upgraded first, though `AI-004`'s `searchProducts()` tool should target whichever search backend is current at integration time |
| `THEME-002`/`THEME-003` (storefront + Dashboard theming) | Independent of each other once `THEME-001` tokens exist; can be split across two engineers |
| `MOBILE-001`/`MOBILE-002` (customer PWA/app) and `SEO-*` (Phase 3) | Independent workstreams within Phase 3, both gated only on `COM-006`–`COM-008` (storefront pages existing to theme/optimize/package) |
| `OPS-009` (OpenTelemetry) and `OPS-013` (feature flags) | Both Phase 11, independent of each other, both only need `apps/server` to exist |

Everything on the **phase spine** in §5.1 is sequential by design — each phase's acceptance criteria are the prerequisite for the next (SOT §48A "no custom commerce feature implementation before the architecture/docs baseline exists," and equivalent gates per phase).

---

## 6. Phase-by-Phase Plan

Each phase card states: Objective, Prerequisites, Architecture Work, Backend Work, Client Backend (Admin/Dashboard) Work, Storefront Work, Database Work, Infrastructure, Security, Testing, Documentation, Acceptance Criteria, Dependencies, Risks, Completion Gate — followed by its task table.

Task table columns: **ID · Title · Objective · Files/Modules · Depends On · Tests Required · Acceptance Criteria**. Implementation notes for each task are embedded in the Objective/Files columns; documentation required for every task is **always** the corresponding entry in [`DOCUMENTATION_MAP.md`](DOCUMENTATION_MAP.md) (domain doc + API doc, kept current as part of the task, not a separate deliverable) unless a task explicitly produces its own named document.

---

### PHASE 0 — Discovery, Documentation & Baseline

- **Objective:** Establish a reproducible, fully documented foundation before any custom feature work begins.
- **Prerequisites:** None (this is the entry point).
- **Architecture Work:** Read SOT in full (done, this document is downstream evidence); audit repository (done, see `CURRENT_REPOSITORY_ASSESSMENT.md`); produce initial architecture doc skeletons.
- **Backend Work:** None yet — documentation and verification only.
- **Client Backend Work:** None yet.
- **Storefront Work:** None yet.
- **Database Work:** None yet.
- **Infrastructure:** Verify Node/pnpm/Docker/Git present and correct versions locally.
- **Security:** None yet beyond flagging the SOT public-exposure risk (`FOUND-004`).
- **Testing:** Define the testing strategy document (no tests written yet).
- **Documentation:** This entire phase *is* documentation — `docs/architecture/*`, `docs/implementation/*` skeletons, `AGENTS.md`/`CLAUDE.md`.
- **Acceptance Criteria:** All Phase 0 documents exist, are internally consistent, and cite SOT section numbers rather than duplicating SOT text.
- **Dependencies:** None.
- **Risks:** Rushing past this phase (SOT explicitly warns against "build everything" as the first assignment, §0D).
- **Completion Gate:** No Phase 1 task may start until every `FOUND-001`–`FOUND-012` task below is complete.

### Phase 0 status (2026-08-17)

| Task | Status | Evidence |
|---|---|---|
| `FOUND-001` | **DONE** | Node v24.18.0, pnpm 11.9.0, Docker 29.6.2, Git 2.55.0 verified; recorded in `environment-variables.md` |
| `FOUND-002` | **DONE** | Vendure Core current stable confirmed as 3.7.0; official Next.js starter confirmed on Next.js 16/React 19; recorded in `system-overview.md` and `dependency-register.md` |
| `FOUND-003` | **DONE** | `AGENTS.md`, `CLAUDE.md` created at repo root |
| `FOUND-004` | **DONE** | Repository re-scaffolded clean at `C:\Users\KWA\dev\lipek Fashion Operating System`; SOT document and product `.docx` quarantined to `docs/internal/` (never under a `public/`-servable path in this repository) |
| `FOUND-005` | **DONE** | `system-overview.md`, `domain-boundaries.md`, `storefront-architecture.md`, `ai-architecture.md` skeletons written |
| `FOUND-006` | **DONE** | `dependency-register.md`, `environment-variables.md` created with verified toolchain/version data |
| `FOUND-007` | **DONE** | `storefront-graphql.md`, `admin-api-extensions.md` skeletons + route map drafted |
| `FOUND-008` | **DONE** | `data-model.md` skeleton (Vendure catalog mapping + custom entity stubs per plugin) |
| `FOUND-009` | **DONE** | `strategy.md`, `test-matrix.md`, `performance.md`, `accessibility.md` skeletons written |
| `FOUND-010` | **DONE** | `deployment-topology.md` drafted, explicitly provisional pending `ADR-0009` |
| `FOUND-011` | **DONE** | This document |
| `FOUND-012` | **DONE** | `README.md` rewritten for the platform monorepo |

All ADRs in the backlog have also been resolved — see `docs/implementation/ADR_BACKLOG.md` Resolution Summary and `docs/adr/ADR-0001`–`ADR-0013` (13 total: the original 11, plus `ADR-0012` TypeScript version pin and `ADR-0013` Dashboard extension colocation, both added during the pre-Phase-1 architecture normalization pass on 2026-08-17). **Phase 0 is complete.** Phase 1 — now executed as sub-phases **1A Platform Bootstrap → 1B Engineering Foundation → 1C Identity Foundation → 1D External Identity & Security → 1E Commerce Catalog Foundation** (see §6) — has not started: `apps/server` and `apps/storefront` have not been bootstrapped via `@vendure/create`, no Vendure/NestJS/Next.js dependency has been installed, and no line of application code exists yet. The monorepo skeleton (`apps/*`, `packages/*`, `infra/*`, `scripts/*` directories) and reusable assets from the prior prototype (design tokens, UI primitives, content fixtures, the Capacitor mobile scaffold) have been pre-positioned in their target locations to make 1A/1B faster, but positioning a file is not the same as completing its task — each task from `FOUND-013` onward remains `NOT STARTED` until its own acceptance criteria are met. **Phase 1A has not been started and will not begin without separate approval.**

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `FOUND-001` | Verify local toolchain | Confirm Node 24 LTS, pnpm, Docker, Git versions match SOT §0.4 baseline | `.node-version`, `package.json engines` | — | `node -v`, `pnpm -v`, `docker -v` succeed | Versions recorded in `docs/implementation/environment-variables.md` prelude |
| `FOUND-002` | Verify current official framework docs | Re-check Vendure/Next.js/NestJS/Mastra/PostgreSQL current docs against SOT §0G references before any bootstrap decision | N/A (research task) | `FOUND-001` | N/A | Findings recorded in `docs/architecture/system-overview.md` "verified as of" note |
| `FOUND-003` | Create `AGENTS.md` and `CLAUDE.md` | Restate SOT §0.2 operating rules + §52E "Do Not" list as a standing operating contract for any future coding-agent session | repo root `AGENTS.md`, `CLAUDE.md` | `FOUND-002` | N/A | Both files exist, cite SOT §0.1 precedence explicitly, do not duplicate full SOT text |
| `FOUND-004` | Commit clean baseline & quarantine SOT document | (a) Stage and commit the current uncommitted diff (old scaffold deletions + new Next.js app) as its own reviewable commit; (b) move `public/docs/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` and stray `.docx`/`~$...docx` files out of any `public/`-servable path (e.g. to `docs/internal/`) | repo root, `public/docs/*` | `FOUND-001` | `git status` clean after commit; verify no `public/` path resolves the SOT doc | P0 — must land before any deploy of any kind; commit message documents the quarantine explicitly |
| `FOUND-005` | Write core architecture doc skeletons | Draft `system-overview.md`, `domain-boundaries.md`, `storefront-architecture.md`, `ai-architecture.md` skeletons citing SOT §2, §0C, §3.1, §23A | `docs/architecture/*` | `FOUND-002` | N/A | Each doc declares its authority level per `DOCUMENTATION_MAP.md` |
| `FOUND-006` | Create dependency register & env-var inventory | Initialize `dependency-register.md` (empty, structured) and `environment-variables.md` from `DEPENDENCY_INSTALLATION_PLAN.md` | `docs/implementation/dependency-register.md`, `environment-variables.md` | `FOUND-002` | N/A | Both files exist with the correct column structure per SOT §0.2 |
| `FOUND-007` | Define route map, catalog taxonomy draft, API doc skeletons | Draft `storefront-graphql.md`, `admin-api-extensions.md` skeletons + initial route map (Men/Women/Children URL structure per SOT §36) | `docs/api/*` | `FOUND-005` | N/A | Route map matches SOT §5/§36 examples |
| `FOUND-008` | Define initial entity/domain model | Draft `data-model.md` mapping SOT §0B.2 Vendure catalog concepts + planned custom entities per plugin | `docs/architecture/data-model.md` | `FOUND-007` | N/A | Every plugin listed in SOT §0C has at least a stub entity list |
| `FOUND-009` | Define testing strategy & matrix | Draft `docs/testing/strategy.md`, `test-matrix.md`, `performance.md`, `accessibility.md` per SOT §0F.4/§43 | `docs/testing/*` | `FOUND-005` | N/A | Strategy names Vitest/Playwright/axe/k6/Vendure testing utilities/Mastra evals explicitly |
| `FOUND-010` | Define deployment assumptions | Draft provisional deployment topology (pre-ADR-0009) so Phase 1 infra work has a target shape | `docs/architecture/deployment-topology.md` (provisional) | `FOUND-005` | N/A | Explicitly marked provisional, references ADR-0009 |
| `FOUND-011` | Produce phased implementation plan | This document | `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` | `FOUND-001`–`FOUND-010` | N/A | **Delivered by this engagement** |
| `FOUND-012` | Rewrite `README.md` | Replace the current prototype-only `Readme.md` with a platform-level overview once the monorepo shape is known (may land at the start of Phase 1 in practice) | repo root `README.md` | `FOUND-011` | N/A | Describes the monorepo, not just the storefront prototype |

---

### PHASE 1 — Monorepo, Commerce Foundation & Identity/Security Foundation

- **Objective:** Stand up the real monorepo, bootstrap Vendure + the official Next.js storefront starter, and build customer/staff identity (including MFA and social login) as a foundational capability rather than a bolt-on.
- **Prerequisites:** Phase 0 complete.
- **Dependencies:** Phase 0. ADR-0006 (MFA approach) and ADR-0008 (social login pattern) must be resolved before `SEC-002`/`SEC-007`/`SEC-008` start — both are already resolved (see `ADR_BACKLOG.md`).
- **Risks:** See Risk Register §12, items R-1, R-2, R-5.
- **Completion Gate:** No Phase 2 content-management task may start until every sub-phase below (1A–1E) passes its own acceptance gate.

Phase 1 is executed as five explicit, independently gated sub-phases rather than one undifferentiated block. Task IDs (`FOUND-*`, `SEC-*`, `COM-*`) are unchanged from the original Phase 1 task system — sub-phases only regroup them into safer, independently reviewable and independently stoppable units of work. No sub-phase after 1A may begin until the prior sub-phase's acceptance gate has actually passed, not merely been attempted.

```text
1A Platform Bootstrap
        ↓
1B Engineering Foundation
        ↓
1C Identity Foundation
        ↓
1D External Identity & Security
        ↓
1E Commerce Catalog Foundation
```

---

#### PHASE 1A — Platform Bootstrap

- **Objective:** Get a real, running, minimal Vendure + Next.js monorepo checked out locally — the single highest-risk step in Phase 1 (first real package installs, first real scaffolding tool run), isolated from every other concern so it can be verified and committed on its own before anything is built on top of it.
- **Prerequisites:** Phase 0 complete; Node 24.x, pnpm, Docker, Git available locally (already verified — see `environment-variables.md`); local Postgres reachable (Docker Compose acceptable, formal Compose file lands in 1B's `FOUND-018`/infra work — a bare `docker run postgres` is sufficient to unblock `FOUND-014`'s bootstrap).
- **Tasks:** `FOUND-013`, `FOUND-014`, `FOUND-015`.
- **Expected file changes:** New `apps/server/`, `apps/storefront/` (fully generated by `@vendure/create`, not hand-written); `pnpm-workspace.yaml` gains real `packages:` globs; root `package.json` pnpm/toolchain pins updated to the reverified versions (`pnpm` 11.22.0, `@vendure/core`/`@vendure/dashboard` 3.7.2, `next` 16.3.1 — see `dependency-register.md`); `packages/config` gains its first real shared TS/ESLint config, consumed by the two new apps.
- **Tests:** `pnpm install` resolves cleanly; generated `apps/server` boots and serves its GraphQL Admin/Shop APIs and Dashboard locally; generated `apps/storefront` boots and renders its default page; `pnpm lint`/`pnpm typecheck` run clean across both new apps against the shared `packages/config`.
- **Acceptance gate:** All three tasks' individual acceptance criteria pass **and** a single fresh `git clone` + `pnpm install` + documented start commands bring up server, worker, Dashboard, and storefront with no manual patching. This is the literal "one-command local startup" bar `local-development.md` will document in 1B.
- **Commit boundary:** One commit for `FOUND-013` (workspace shell only, no generated code yet) — small and trivially revertable. One commit for `FOUND-014` immediately after a successful `@vendure/create` run, committing the scaffold **exactly as generated**, before any hand-editing, so there is a clean diff-able baseline to compare all later customization against. One commit for `FOUND-015` once shared tooling is wired in. Do not squash these three into one commit — each is independently useful to bisect against if something breaks later.
- **Stop condition:** Stop and escalate (do not proceed to 1B) if: `@vendure/create` fails to scaffold cleanly against Node 24.x; the generated Next.js storefront is not actually on the Next.js 16 line reverified in this pass (a scaffold drift from what was verified is itself a signal to re-verify, not to proceed on stale assumptions); any step would require committing a real secret or credential to get the scaffold running; or `FOUND-002`'s reverified Vendure/Next.js versions are more than a few days stale by the time this actually executes — re-run the registry check first.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `FOUND-013` | Scaffold monorepo shell | Create `pnpm-workspace.yaml` package globs, `apps/`, `packages/`, `infra/`, `scripts/` at repo root | repo root | `FOUND-004` | `pnpm install` resolves an empty workspace | Workspace structure matches `TARGET_REPOSITORY_STRUCTURE.md` §1 |
| `FOUND-014` | Bootstrap `apps/server` + `apps/storefront` | Run `@vendure/create` (verified current stable 3.7.2, PostgreSQL, official Next.js starter verified at `next` 16.3.1) into `apps/`, per `FOUND-002`'s reverification | `apps/server`, `apps/storefront` | `FOUND-013` | Scaffold boots locally | Server + storefront + Dashboard all start via generated scripts |
| `FOUND-015` | Normalize pnpm workspace & Node toolchain | Align every app/package to the shared TS/ESLint/Prettier config in `packages/config` (TypeScript pinned to the 5.9.x line per `ADR-0012` — do not accept a `latest` resolution to 7.x) | `packages/config`, all `apps/*` | `FOUND-014` | `pnpm lint`, `pnpm typecheck` pass across workspace | Single lint/format/typecheck command covers all apps |

---

#### PHASE 1B — Engineering Foundation

- **Objective:** Turn the bare bootstrap from 1A into a repository that's actually safe and pleasant to build on: environment/secrets discipline, migration policy, health checks, ported security baseline, the asset pipeline, the event-bus convention, CI, and retirement of the legacy prototype.
- **Prerequisites:** 1A's acceptance gate passed.
- **Tasks:** `FOUND-016`, `FOUND-017`, `FOUND-018`, `FOUND-019`, `FOUND-020`, `FOUND-021`, `FOUND-022`, `FOUND-023`.
- **Expected file changes:** `apps/*/.env.example` (new); `docs/implementation/environment-variables.md`, `migrations.md`, `deployment-topology.md`, `event-model.md`, `integration-map.md` (from skeleton → real content); `apps/storefront/next.config.mjs` (security headers/CSP), `apps/server/src/plugins/lipek-security` (origin allow-list, rate-limit middleware scaffold — auth-specific application of it is 1C's `SEC-005`); `apps/storefront` gains ported design tokens/routes/SEO pattern from `_reference/legacy-prototype/`, which is then deleted; `apps/server/src/vendure-config.ts` gains asset-pipeline config; `.github/workflows/*` (new CI pipeline).
- **Tests:** Secret-scan CI check on an empty repo; migration dry-run check; `/health` endpoint integration tests for server + storefront; security-header presence test + rate-limit trip test; visual smoke test of every migrated storefront route; asset upload/read integration test; sample event publish/subscribe test; full CI pipeline green on a trivial PR.
- **Acceptance gate:** All eight tasks' acceptance criteria pass; `docs/implementation/local-development.md` exists and a fresh clone can follow it verbatim to a running local stack; `_reference/legacy-prototype/` no longer exists (fully retired per `FOUND-020`, not left behind "just in case"); CI blocks a deliberately broken trivial PR.
- **Commit boundary:** One commit per task is the default (eight commits), except `FOUND-020` which should itself be split into at least two — (a) port assets into their new homes, verified working, and (b) delete `_reference/legacy-prototype/` — so the deletion is a reviewable, revertable step distinct from the port. Do not combine `FOUND-019` (security headers/rate-limiting) with any unrelated task's commit — security-relevant diffs should be easy to isolate in history.
- **Stop condition:** Stop and escalate if: retiring `_reference/legacy-prototype/` would delete any route/content not yet actually ported (verify parity before deleting, per `FOUND-020`'s own ordering); the CI pipeline cannot be made to actually fail on a broken PR (a CI baseline that always passes is worse than no CI); or any `.env.example` entry would need a real secret value to be meaningful (placeholder values only, ever).

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `FOUND-016` | Establish environment management | Create `.env.example` per app, document every var in `environment-variables.md`, confirm `.env*` stays gitignored | `apps/*/.env.example`, `docs/implementation/environment-variables.md` | `FOUND-014` | Secret-scan CI check passes on an empty repo | No real secret ever committed; every var has a documented purpose |
| `FOUND-017` | Set migrations policy | Document and enforce "no `synchronize: true` in production," migration review process | `apps/server/src/vendure-config.ts`, `docs/implementation/migrations.md` | `FOUND-014` | A migration dry-run/CI check | Migrations are reviewed artifacts, not implicit schema sync |
| `FOUND-018` | Draft deployment topology & health checks | Concretize `deployment-topology.md` for local/dev; add `/health` endpoints for server + storefront | `apps/server`, `apps/storefront` | `FOUND-010`, `FOUND-014` | Health endpoint integration test | Health checks return structured status for DB/queue connectivity |
| `FOUND-019` | Port security headers, rate limiting, origin allow-list | Apply the `digital2moro-platform`-derived patterns from `SIBLING_PROJECT_SECURITY_FINDINGS.md` §3.2 to `apps/storefront` (`next.config.mjs` headers, CSP report-only) and `apps/server` (origin/CORS allow-list, rate-limit middleware) | `apps/storefront/next.config.mjs`, `apps/server/src/plugins/lipek-security` | `FOUND-014` | Header presence test, rate-limit trip test | Headers match the fuller set in the findings doc; CSP starts report-only |
| `FOUND-020` | Port reusable presentation assets; retire root prototype | Migrate design tokens → `packages/ui`, IA/routes → `apps/storefront`, SEO/JSON-LD pattern → `apps/storefront/lib/seo`, `src/content/*.json` → seed fixtures (already pre-positioned in `packages/ui`/`packages/testing/fixtures` — this task wires them into the *new* `apps/storefront`, not the root prototype); delete `_reference/legacy-prototype/` once parity is verified | `_reference/legacy-prototype/*` → `apps/storefront/*`, `packages/ui/*` | `FOUND-014` | Visual smoke test of migrated pages | Root-level prototype fully retired; no duplicate storefront app remains |
| `FOUND-021` | Configure local asset pipeline | Wire `AssetServerPlugin` for local dev; define the S3-compatible interface boundary pending ADR-0003 | `apps/server/src/vendure-config.ts` | `FOUND-014` | Asset upload/read integration test | Local asset upload/serve works end to end |
| `FOUND-022` | Define canonical event catalog & EventBus conventions | Expand `event-model.md` from SOT §40's example list; establish naming/versioning convention for domain events | `docs/architecture/event-model.md`, `apps/server` EventBus wiring | `FOUND-014` | Sample event publish/subscribe test | Convention doc exists before any plugin publishes its first real event |
| `FOUND-023` | CI baseline & integration map | GitHub Actions (or equivalent) pipeline: lint → test → build → migration check; draft `integration-map.md` | `.github/workflows/*`, `docs/architecture/integration-map.md` | `FOUND-015`, `FOUND-017` | CI green on a trivial PR | Pipeline blocks merge on lint/test/build/migration failure |

---

#### PHASE 1C — Identity Foundation

- **Objective:** Build LIPEK's own native customer/staff identity — email+password, WebAuthn/TOTP MFA, RBAC — as original engineering work inside `lipek-security`, per `ADR-0006`. This is the largest genuinely new engineering effort in Phase 1.
- **Prerequisites:** 1B's acceptance gate passed (needs `FOUND-019`'s rate-limit pattern and `FOUND-022`'s event conventions).
- **Tasks:** `SEC-001`, `SEC-002`, `SEC-003`, `SEC-004`, `SEC-005`, `SEC-006`.
- **Expected file changes:** `apps/server/src/plugins/lipek-security/` gains real substance for the first time — entities (WebAuthn credentials, TOTP secrets, backup codes, staff role/permission extensions), the native `AuthenticationStrategy`, enrollment/verification resolvers, migrations for all of the above; `apps/storefront` gains login/register/MFA-challenge UI; `integrations` plugin gains its first real consumer (`SEC-004`'s recovery email, pending `ADR-0002`).
- **Tests:** Login/logout/session integration tests; WebAuthn enrollment + login E2E test; TOTP enrollment/verify test + backup-code single-use test; recovery-flow E2E test; brute-force simulation test against auth endpoints; privileged-login-without-WebAuthn-denied test.
- **Acceptance gate:** All six tasks' acceptance criteria pass; a test customer can register via email, enroll a passkey, and log back in with it; a test staff account seeded with a privileged role cannot complete login without a WebAuthn factor once enforcement mode is turned on — this is Phase 1's headline acceptance criterion from the original (undifferentiated) Phase 1 card, now scoped precisely to this sub-phase.
- **Commit boundary:** One commit per task (six commits) is appropriate here — each task is independently testable and the sequence (native auth → WebAuthn → TOTP → recovery → rate limiting → RBAC/enforcement) should read clearly in history since a future security review will likely walk this exact commit sequence.
- **Stop condition:** Stop and escalate if: the exact current Vendure `AuthenticationStrategy` API shape differs materially from what was assumed when `ADR-0006` was written (re-verify against current docs before implementing `SEC-001`, per `AGENTS.md`); a chosen WebAuthn/TOTP library version has a known unpatched vulnerability at install time; or `SEC-006`'s enforcement mode cannot be built to fail closed for privileged accounts without a plausible lockout path — do not ship a "privileged accounts require WebAuthn" claim that isn't actually enforced.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `SEC-001` | Native email+password authentication | Wire Vendure's native `AuthenticationStrategy` for customer + staff accounts inside `lipek-security` | `apps/server/src/plugins/lipek-security` | `FOUND-014` | Login/logout/session integration tests | Customer and staff can register/login with email+password |
| `SEC-002` | WebAuthn/passkey MFA (primary factor) | Implement enrollment + verification using a current WebAuthn library (reverified: `@simplewebauthn/server` 13.3.2 / `@simplewebauthn/browser` 13.3.0), per ADR-0006 decision | `apps/server/src/plugins/lipek-security`, `apps/storefront` auth UI | `SEC-001`, ADR-0006 accepted | Enrollment + login-with-passkey E2E test | A registered passkey authenticates a returning session |
| `SEC-003` | TOTP fallback + backup codes | RFC 6238 TOTP as fallback factor (reverified: `otplib` 13.4.1, actively maintained); single-use hashed backup/recovery codes | `apps/server/src/plugins/lipek-security` | `SEC-002` | TOTP enrollment/verify test, backup-code single-use test | TOTP works when no platform authenticator is available; backup codes are single-use and regenerable |
| `SEC-004` | Recovery/email OTP channel | Secondary recovery channel via transactional email, pending ADR-0002 provider | `apps/server/src/plugins/lipek-security`, `integrations` plugin | `SEC-001`, ADR-0002 | Recovery-flow E2E test | Locked-out user can recover access without staff intervention, safely |
| `SEC-005` | Rate limiting & abuse protection on auth endpoints | Apply `FOUND-019`'s rate-limit pattern specifically to login/MFA/recovery endpoints; generic error messages that never reveal account existence | `apps/server/src/plugins/lipek-security` | `FOUND-019`, `SEC-001` | Brute-force simulation test | Repeated failed attempts throttle without leaking account existence |
| `SEC-006` | RBAC extension & privileged-account WebAuthn enforcement | Implement SOT §22 staff role catalog on top of Vendure's native Role/Permission model; require WebAuthn specifically for privileged roles, borrowing the enforcement-mode design from `SIBLING_PROJECT_SECURITY_FINDINGS.md` §3.1 | `apps/server/src/plugins/lipek-security` | `SEC-002`, `SEC-003` | Privileged-login-without-WebAuthn-denied test | A Super Administrator cannot complete login without a WebAuthn factor once enforcement is enabled |

---

#### PHASE 1D — External Identity & Security

- **Objective:** Layer external identity (Google/Apple OAuth) and broader security hardening (audit logging, secrets rotation, dependency scanning) on top of the native identity substrate 1C just built.
- **Prerequisites:** 1C's acceptance gate passed (OAuth bridges into the same Vendure session `SEC-001` establishes; audit logging covers actions RBAC in `SEC-006` just defined).
- **Tasks:** `SEC-007`, `SEC-008`, `SEC-009`, `SEC-010`, `SEC-011`.
- **Expected file changes:** `apps/server/src/plugins/lipek-security` gains `ExternalAuthenticationStrategy` implementations for Google and Apple, the audit-log entity/writer, and secrets-rotation documentation; `apps/storefront` gains OAuth redirect handling UI; `.github/workflows/*` gains a dependency/vulnerability scan job.
- **Tests:** OAuth redirect + session-creation E2E test for Google and for Apple; audit-entry-created test on each covered action; CI secret-scan test; CI job that actually fails the build on a high/critical dependency finding (verify this with a deliberately vulnerable test dependency, then remove it).
- **Acceptance gate:** All five tasks' acceptance criteria pass; a customer can complete registration/login via Google and via Apple end to end; every `SEC-009`-covered staff action produces a queryable audit record; CI genuinely blocks on a high/critical vulnerability, not just reports one.
- **Commit boundary:** One commit per task (five commits). `SEC-007`/`SEC-008` may be squashed into a single "OAuth (Google + Apple)" commit only if they were implemented together against the same shared strategy scaffold — do not squash if they were built as genuinely separate efforts, since Apple's OAuth flow has enough platform-specific quirks (private email relay, name-only-on-first-login) to be worth its own reviewable diff.
- **Stop condition:** Stop and escalate if: Google/Apple developer console credentials/app registration are not yet available (this task needs real OAuth client IDs/secrets to test against, which are an operational prerequisite this plan cannot supply — flag as a blocker rather than stubbing with fake credentials); or the current Vendure `ExternalAuthenticationStrategy` API shape (assumed in `ADR-0008`) differs materially from official docs at implementation time.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `SEC-007` | Google OAuth (customer) | Server-authoritative `ExternalAuthenticationStrategy` integration, per ADR-0008 | `apps/server/src/plugins/lipek-security`, `apps/storefront` | `SEC-001`, ADR-0008 accepted | OAuth redirect + session-creation E2E test | A customer can register/login via Google end to end |
| `SEC-008` | Apple OAuth (customer) | Same pattern as `SEC-007` for Sign in with Apple | `apps/server/src/plugins/lipek-security`, `apps/storefront` | `SEC-007` | OAuth redirect + session-creation E2E test | A customer can register/login via Apple end to end |
| `SEC-009` | Audit logging | Record staff/admin security-relevant actions (login, role change, MFA reset, permission grant) | `apps/server/src/plugins/lipek-security` | `SEC-006` | Audit-entry-created test on each covered action | Every covered action produces a queryable audit record |
| `SEC-010` | Secrets management hardening | Confirm no secret is ever logged/committed; document rotation policy for OAuth/webhook secrets | `docs/implementation/environment-variables.md`, CI secret scan | `FOUND-016` | CI secret-scan test | Documented rotation policy exists; scan passes |
| `SEC-011` | Dependency/vulnerability scanning in CI | `pnpm audit` (or equivalent) + GitHub-native scanning wired into `FOUND-023`'s pipeline | `.github/workflows/*` | `FOUND-023` | CI job runs and fails the build on high/critical findings | Scan is part of every PR check, not a manual step |

---

#### PHASE 1E — Commerce Catalog Foundation

- **Objective:** Configure Vendure's native catalog model (Collections, Facets, custom fields) to match LIPEK's Men/Women/Children taxonomy, so Phase 2's content/admin work and Phase 3's storefront work have real catalog structure to build against.
- **Prerequisites:** 1A's acceptance gate passed (only needs `apps/server` to exist — does not depend on 1B/1C/1D's identity/security work, though it runs after them in this plan's default sequence; see the parallelization note below).
- **Tasks:** `COM-001`, `COM-002`, `COM-003`, `COM-004`, `COM-005`.
- **Expected file changes:** Vendure Collections/Facets configuration and seed scripts (no new plugin required for the tree/taxonomy itself — native Vendure entities); `apps/server/src/vendure-config.ts` gains product/variant custom field definitions; `apps/server/src/plugins/lipek-content` (or a dedicated import module, per `COM-005`'s own ambiguity) gains the bulk import/export validation pipeline.
- **Tests:** Collection-tree integration test (nested Men/Women/Children structure); facet-assignment test; custom-field CRUD test; collection-membership test for cross-store collections; bulk-import validation test that rejects a deliberately malformed batch.
- **Acceptance gate:** All five tasks' acceptance criteria pass; the full SOT §5.1–§5.4 category/collection tree exists and is queryable via the Admin API; no ad-hoc parallel tag/category system was created alongside Vendure's native Collections/Facets (SOT §0B.2 rule, directly checked).
- **Commit boundary:** One commit per task is reasonable, though `COM-001`/`COM-004` (collection hierarchy + cross-store collections) may be combined into one commit if authored together, since they're both pure Collections configuration with no independent risk profile. Keep `COM-005` (bulk import/export) as its own commit — it is the most code-heavy task in this sub-phase.
- **Stop condition:** Stop and escalate if: representing any part of the SOT §5 taxonomy would require a feature Vendure's native Collection/Facet model genuinely cannot express (expected to not happen, per SOT §0B.2's explicit mapping table — if it does, that is itself a signal requiring an ADR, not a workaround). Note: **1E has no dependency on 1C/1D's identity work** and, if resourcing allows, may run in parallel with 1C/1D once 1B closes — this plan sequences it last only for narrative clarity, not because of a real technical dependency; see §5.3 Parallelization Opportunities.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `COM-001` | Men/Women/Children collection hierarchy | Configure the SOT §5 category tree as nested Vendure `Collection`s | `apps/server` Collections config/seed | `FOUND-014` | Collection-tree integration test | Nested tree matches SOT §5.1–§5.4 |
| `COM-002` | Facets/taxonomy configuration | Brand, Material, Occasion, Style, Gender, Fit, Season as `Facet`/`FacetValue` | `apps/server` Facets config/seed | `COM-001` | Facet-assignment test | No duplicate ad-hoc tag system created (SOT §0B.2) |
| `COM-003` | Product/variant custom fields | Fit, material, care instructions, model info, size-guide reference as Vendure custom fields | `apps/server/src/vendure-config.ts` | `COM-002` | Custom-field CRUD test | Fields editable via Dashboard without code |
| `COM-004` | Cross-store collections | New Arrivals, African Fashion, Wedding, Formal, Casual, Sale, Bags & Leather Goods, etc. (SOT §5.4) | `apps/server` Collections config/seed | `COM-001` | Collection membership test | All SOT §5.4 collections exist and are assignable |
| `COM-005` | Bulk import/export validation pipeline | Product/variant/asset/category/facet bulk import with pre-commit validation (SOT §4.1) | `apps/server/src/plugins/lipek-content` or dedicated import module | `COM-003` | Bulk-import validation test (reject malformed batch) | Large batch import validates before committing |

---

### PHASE 2 — Admin-First Catalog & Content Management

- **Objective:** Make every routine business change (SOT §0B.1 table, §48 25-item list) possible from the Dashboard, with zero code deployment.
- **Prerequisites:** Phase 1 complete (commerce foundation + identity).
- **Architecture Work:** `LipekContentPlugin` entity design; unified Dashboard navigation principle (SOT §20A).
- **Backend Work:** Content entities, publishing state machine, Settings Store usage, revalidation webhook.
- **Client Backend Work:** Dashboard extensions for every content entity; staff role seeding; executive dashboard shell; MFA enrollment enforcement UI; audit log viewer.
- **Storefront Work:** None substantial yet (storefront consumption of this content happens in Phase 3) beyond a revalidation endpoint.
- **Database Work:** Migrations for all `LipekContentPlugin` entities.
- **Infrastructure:** None new.
- **Security:** Dashboard content-editing permissions scoped by role (`SEC-006` RBAC applied to content operations).
- **Testing:** The 12-item backend-editability acceptance test suite from SOT §0B.5.
- **Documentation:** `admin-content-architecture.md`, `content-management.md`.
- **Acceptance Criteria:** All 12 SOT §0B.5 acceptance tests pass with a non-developer test user.
- **Dependencies:** Phase 1.
- **Risks:** R-3 (staff usability), R-6 (content model over-engineering).
- **Completion Gate:** No Phase 3 storefront task may render content that isn't yet backend-driven.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `CONTENT-001` | `LipekContentPlugin` entities | Implement `ContentPage`, `PageSection`, `NavigationMenu`, `NavigationItem`, `Banner`, `FaqItem`, `PolicyDocument`, `Article`, `ArticleCategory`, `StoreLocation`, `Testimonial`, `ServiceDefinition` | `apps/server/src/plugins/lipek-content` | `COM-005` | Entity CRUD integration tests | Every entity in SOT §0B.3 table exists with migrations |
| `CONTENT-002` | Dashboard extensions for content entities | List/detail/form screens for every entity in `CONTENT-001` | `apps/server/src/plugins/lipek-content/dashboard` | `CONTENT-001` | Dashboard E2E test per entity | Staff can create/edit/publish each entity type |
| `CONTENT-003` | Publishing state machine | DRAFT → SCHEDULED → PUBLISHED → ARCHIVED, enforced server-side | `apps/server/src/plugins/lipek-content` | `CONTENT-001` | State-transition unit tests | Storefront never receives DRAFT content (SOT §0B.3) |
| `CONTENT-004` | Homepage backend-driven composition | Section component types + ordering/visibility/scheduling per SOT §5A | `apps/server/src/plugins/lipek-content` (incl. `dashboard/`) | `CONTENT-003` | Section-ordering integration test | Staff can reorder/hide homepage sections without code |
| `CONTENT-005` | Navigation menu management | Replace hard-coded `NAV_LINKS`/footer groups with `NavigationMenu`/`NavigationItem` | `apps/server/src/plugins/lipek-content` | `CONTENT-002` | Nav CRUD + rendering test | A new category appears in nav without a deploy (SOT §0B.5 item 1) |
| `CONTENT-006` | SEO fields per entity | `SeoMetadata`/custom fields on content entities, products, collections | `apps/server/src/plugins/lipek-content` | `CONTENT-001`, `COM-003` | SEO-field save/read test | Editable per SOT §0B.5 item 9 |
| `CONTENT-007` | Storefront cache invalidation | Event-driven revalidation: mutation → domain event → job → secure Next.js revalidation endpoint (SOT §0B.4) | `apps/server` (event listener), `apps/storefront` (revalidation route) | `FOUND-022`, `CONTENT-003` | Edit-then-revalidate E2E test | Published edit appears on storefront without a deploy |
| `CONTENT-008` | Site settings via Settings Store | Contact info, social links, business hours as Settings-Store-backed config | `apps/server/src/plugins/lipek-content` | `CONTENT-001` | Settings read/write test | SOT §0B.5 item 7 passes |
| `CONTENT-009` | Seed migration of prototype content | Load `src/content/*.json` (now in `packages/testing` fixtures) into the CMS as seed data | `scripts/seed-content.ts` | `CONTENT-001` | Seed-idempotency test | Seed script is rerunnable without duplication |
| `CONTENT-010` | Backend-editability acceptance suite | Automate the 12 items in SOT §0B.5 as a Playwright suite run by a non-developer persona | `apps/storefront` E2E suite | `CONTENT-002`–`CONTENT-009` | All 12 items pass | Phase 2 cannot close without this suite green |
| `ADMIN-001` | Dashboard build/shell configuration | Configure the aggregate Dashboard Vite build (`vendureDashboardPlugin`) so native Vendure pages + every plugin's colocated `dashboard/` extension read as one system (SOT §20A) — per the official Vendure Dashboard extension model, this is inherent to the single aggregate build, not a separate app | `apps/server/vite.config.mts`, `apps/server/tsconfig.dashboard.json` | `CONTENT-002` | Navigation smoke test | A staff member cannot tell which screens are "native" vs "custom"; single `pnpm --filter server build:dashboard` produces one unified SPA |
| `ADMIN-002` | Staff role/permission seeding | Seed the SOT §22 role table (Super Admin, Store Manager, E-commerce Manager, Customer Service, Tailoring Manager, Tailor, Laundry Manager, Delivery Staff, Marketing, Finance, Analyst) | `apps/server` seed script | `SEC-006` | Role-permission-boundary test per role | Every SOT §22 role exists with correct scoped access |
| `ADMIN-003` | Executive dashboard shell | Base widget layout for SOT §21.2 metrics (populated fully in Phase 7/`OPS-004`) | `apps/server/src/plugins/analytics-events/dashboard` | `ADMIN-001` | Widget render test | Shell exists and is extensible per metric |
| `ADMIN-004` | Staff onboarding + MFA enrollment enforcement UI | New staff accounts are guided through MFA enrollment before first privileged action | `apps/server/src/plugins/lipek-security/dashboard` | `SEC-006` | Onboarding-flow E2E test | No privileged staff account remains without MFA past first login |
| `ADMIN-005` | Audit log viewer | Dashboard screen surfacing `SEC-009`'s audit records, filterable by actor/action/date | `apps/server/src/plugins/lipek-security/dashboard` | `SEC-009` | Audit-viewer filter test | Authorized staff can review security-relevant history |
| `ADMIN-006` | Bulk import/export tooling UI | Dashboard-side upload/validation-report UI for `COM-005` | `apps/server/src/plugins/lipek-content/dashboard` (or `COM-005`'s dedicated import module's own `dashboard/`) | `COM-005` | Bulk-upload UI test | Staff can bulk-import products without developer help |
| `THEME-001` | Dark/light design tokens | Extend `src/styles/variables.css`'s token pattern into `packages/ui` with paired light/dark values | `packages/ui/tokens` | `FOUND-020` | Token snapshot test | Every color/spacing/type token has both a light and dark value |

---

### PHASE 3 — Storefront Experience

- **Objective:** A fast, accessible, backend-driven, themeable, SEO/AEO-optimized, installable customer storefront.
- **Prerequisites:** Phase 2 complete.
- **Architecture Work:** `storefront-architecture.md` finalized against real implementation.
- **Backend Work:** None beyond Phase 1/2 APIs already existing; storefront consumes, does not add commerce logic.
- **Client Backend Work:** None new.
- **Storefront Work:** Homepage, Men/Women/Children browse, PDP, account shell, PWA shell, theming, performance/a11y baseline.
- **Database Work:** None new.
- **Infrastructure:** CDN/edge caching strategy drafted (finalized with ADR-0009).
- **Security:** Client-side credential handling review (only customer-authorized tokens ever reach the browser, SOT §6A).
- **Testing:** Playwright critical-journey tests begin; axe accessibility suite; Lighthouse/Core Web Vitals budget.
- **Documentation:** `storefront-architecture.md`, `commerce.md` (storefront half).
- **Acceptance Criteria:** WCAG 2.2 AA pass 1; PWA installable; dark/light toggle functional; Core Web Vitals within budget on a simulated low-cost mobile device/average connection (SOT §50).
- **Dependencies:** Phase 2.
- **Risks:** R-4 (performance regressions from AI/theme code), R-7 (accessibility debt).
- **Completion Gate:** No Phase 4 checkout task may ship without the account shell and PDP from this phase.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `COM-006` | Homepage implementation | Render `CONTENT-004`'s backend-driven sections | `apps/storefront/app/page.tsx` | `CONTENT-004` | Visual regression + section-order test | Homepage fully backend-composed, zero hard-coded promo content |
| `COM-007` | Catalog browse experience | Men/Women/Children category pages, faceted filter UI (SOT §17.2) | `apps/storefront/app/(shop)/*` | `COM-004`, `COM-002` | Filter-combination test | All SOT §17.2 filters function against Vendure search |
| `COM-008` | Product detail page | Variants/swatches, size guide, stock/availability, wishlist, related/complete-the-look placeholders (full AI version in Phase 10) | `apps/storefront/app/(shop)/products/[slug]` | `COM-007` | PDP interaction E2E test | SOT §6 feature table items present at MVP fidelity |
| `COM-009` | "My LIPEK" account shell | Overview/Commerce/Services/My Style/Documents/Relationship/Account sections (SOT §7), wired to `SEC-001`–`SEC-008` auth | `apps/storefront/app/(account)/*` | `SEC-008` | Auth-gated route test | Only authenticated customers reach account routes; login/MFA/social login all functional entry points |
| `COM-010` | Responsive/PWA foundation | Service worker, offline shell, install prompt, real manifest icons (supersedes the placeholder `manifest.ts`) | `apps/storefront/app/manifest.ts`, service worker | `COM-006` | Lighthouse PWA audit | App is installable; offline shell renders without network |
| `COM-011` | Performance budget | Core Web Vitals thresholds enforced in CI | `apps/storefront`, CI | `COM-008` | Lighthouse CI budget check | Budget defined in `docs/testing/performance.md` and enforced |
| `COM-012` | Accessibility baseline pass 1 | WCAG 2.2 AA across homepage/catalog/PDP/account | `apps/storefront` | `COM-009` | axe automated + manual keyboard/screen-reader pass | Zero critical/serious axe violations |
| `THEME-002` | Storefront theme provider | `prefers-color-scheme` detection, manual toggle, persisted preference, CSS custom-property bridge to `THEME-001` tokens | `apps/storefront/lib/theme` | `THEME-001` | Theme-switch visual test | Every storefront page renders correctly in both themes |
| `THEME-003` | Dashboard theming bridge | Apply `THEME-001` tokens to the aggregate Dashboard build (global styles entry consumed by every plugin's `dashboard/` extension) | `packages/ui`, `apps/server/vite.config.mts` (theme entry) | `THEME-001` | Theme-switch visual test | Every plugin's Dashboard extension respects the same token set without redefining it |
| `MOBILE-001` | Resolve ADR-0007 proof-of-concept | Capacitor customer-app shell revived from `mobile-wrapper/`, wrapping `apps/storefront`'s PWA | `apps/mobile/customer` | ADR-0007 accepted, `COM-010` | Native build smoke test (Android + iOS simulators) | App launches, loads storefront, session persists |
| `MOBILE-002` | Customer app store readiness | Icons, splash screens, signing config, push-notification stub, store-listing draft | `apps/mobile/customer` | `MOBILE-001` | Store-validation checklist | Passes Play Console/App Store Connect pre-submission checks |
| `SEO-001` | Per-page SEO fields wired | Storefront metadata builder reads `CONTENT-006` fields instead of static values | `apps/storefront/lib/seo` | `CONTENT-006` | Metadata snapshot test | Title/meta/canonical/OG editable per page without code |
| `SEO-002` | Structured data | Port `buildLocalBusinessSchema`/FAQ/Article/Breadcrumb JSON-LD builders from the prototype, now sourced from CMS/catalog data | `apps/storefront/lib/schema` | `SEO-001` | JSON-LD validation test | Schema.org validator passes for Product/FAQ/Article/Breadcrumb/LocalBusiness |
| `SEO-003` | Live sitemap/robots | `sitemap.ts`/`robots.ts` generated from live catalog + content, not static routes | `apps/storefront/app/sitemap.ts`, `robots.ts` | `SEO-001` | Sitemap completeness test | Every published page/product/collection appears |
| `SEO-004` | Editorial content publishing | Guides (How to Style an Agbada, Wedding Suit Guide, etc.) as `Article` entities, rendered on the blog route | `apps/storefront/app/blog/*` | `CONTENT-001` | Article render test | At least the SOT §36 example guides are publishable |
| `SEO-005` | Technical SEO/Core Web Vitals audit pass | Full audit against SOT §36 requirements | `apps/storefront` | `COM-011`, `SEO-003` | Lighthouse SEO score check | No critical technical SEO gaps remain |

---

### PHASE 4 — Checkout, Payments, Fulfillment & Documents

- **Objective:** A dependable, secure, fully trackable retail commerce transaction from cart to receipt to return.
- **Prerequisites:** Phase 3 complete.
- **Architecture Work:** Payment provider abstraction (SOT §13A), `DocumentsPlugin` job-queue design (SOT §14A).
- **Backend Work:** Checkout hardening, payment adapter + webhook handling, shipping config, returns/refunds, document generation, staff order management.
- **Client Backend Work:** Staff order management screens (verify payment, allocate inventory, fulfillment, refunds, notes, history).
- **Storefront Work:** Cart/checkout flow, order confirmation/history/tracking UI, returns UX.
- **Database Work:** Order/payment/document entities and migrations (mostly native Vendure, `DocumentRecord` custom entity for `DocumentsPlugin`).
- **Infrastructure:** Background job queue (receipts, email) begins here even if BullMQ/Redis production migration waits for Phase 11.
- **Security:** Webhook signature verification, payment/order mutation idempotency, no raw card storage (SOT §13A, §52C).
- **Testing:** Full critical-path E2E (SOT §43 "Search → Variant → Cart → Checkout → Payment → Order → Receipt → Track → Return"); payment webhook tests; inventory concurrency tests.
- **Documentation:** `commerce.md` (checkout/payments half), `documents.md`.
- **Acceptance Criteria:** The SOT §43 critical journey passes end to end in CI; a failed run blocks deployment.
- **Dependencies:** Phase 3, ADR-0001 (payment provider), ADR-0002 (email/SMS).
- **Risks:** R-1 (payment integration risk), R-8 (webhook reliability).
- **Completion Gate:** No Phase 5 (Tailoring) deposit/balance work may start until `COM-022` exists.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `COM-013` | Cart/checkout hardening | Guest + registered checkout, persistent cart across sessions | `apps/storefront/app/(shop)/checkout` | `COM-009` | Checkout E2E test (guest + registered) | Both paths complete reliably |
| `COM-014` | Payment provider adapter abstraction | Vendure payment-method + provider-agnostic interface (SOT §13A diagram) | `apps/server/src/plugins/integrations` | `COM-013` | Adapter unit tests with a mock provider | No domain code couples directly to one provider's SDK objects |
| `COM-015` | Primary payment provider integration | Stripe (or ADR-0001 outcome) integration, webhook signature verification, idempotency | `apps/server/src/plugins/integrations` | `COM-014`, ADR-0001 | Webhook signature/idempotency tests | Duplicate webhook delivery does not double-process a payment |
| `COM-016` | Shipping methods/zones/pickup | Shipping config incl. store pickup option | `apps/server` shipping config | `COM-013` | Shipping-method selection test | Matches SOT §9/§13.3 pickup & delivery expectations |
| `COM-017` | Order confirmation, history, tracking UI | Storefront order confirmation + `/account/orders` + tracking timeline (SOT §9) | `apps/storefront/app/(account)/orders` | `COM-015` | Order-tracking E2E test | Full SOT §9 tracking stage list renders correctly |
| `COM-018` | Returns/exchanges workflow | Item-level returns, size exchange, refunds, store credit (SOT §16) | `apps/server`, `apps/storefront` | `COM-017` | Return-flow E2E test | Exchange inventory validation prevents invalid swaps |
| `COM-019` | Transactional notifications | Order/payment/shipment/service email wiring, pending ADR-0002 | `apps/server/src/plugins/integrations` | `COM-015`, ADR-0002 | Notification-sent assertion test | Every state change in SOT §9 triggers the correct notification |
| `COM-020` | `DocumentsPlugin` generation pipeline | Receipt/invoice/quote/delivery-note PDF generation on `PaymentSettledEvent`, per SOT §14A flow | `apps/server/src/plugins/documents` | `FOUND-021`, `COM-015` | Idempotent-generation test | Re-firing the same settled-payment event does not duplicate a document |
| `COM-021` | Staff order management screens | Verify payment, allocate inventory, update fulfillment, add tracking, cancel, refund, notes, timeline (SOT §21.3) — extends Vendure's native Order admin screens | `apps/server/src/plugins/documents/dashboard` (receipt/refund/notes actions; native Vendure Order screens cover the base case) | `COM-018` | Staff order-action E2E test | All SOT §21.3 staff actions available and permission-gated |
| `COM-022` | Deposits/partial payment support | Deposit + remaining-balance model reusable by Tailoring/Alterations (SOT §14.2) | `apps/server/src/plugins/documents` or a shared `payments` module | `COM-015` | Deposit/balance calculation test | Order remains valid post-deposit while balance is tracked |
| `COM-023` | Full commerce critical-path E2E | Automate the SOT §43 journey end to end | `apps/storefront` + `apps/server` E2E suite | `COM-013`–`COM-022` | The suite itself | Green run required before any Phase 4 sign-off |
| `OPS-001` | EventBus canonical events (commerce) | Publish `OrderCreated`, `PaymentSettled`, `OrderCancelled`, `OrderFulfilled`, `OrderDelivered`, `ReturnRequested`, `RefundCompleted` per SOT §40 | `apps/server` plugins | `FOUND-022`, `COM-015` | Event-published assertion tests | Every listed event actually fires at the right point |
| `OPS-002` | `AnalyticsEventsPlugin` capture pipeline | Capture SOT §41.1 events (`product_viewed`, `checkout_started`, `payment_completed`, etc.) | `apps/server/src/plugins/analytics-events` | `OPS-001` | Event-capture integration test | Events land in the analytics sink |
| `OPS-003` | Background job queue (initial) | Receipts, email, search indexing, cache revalidation off the checkout critical path (SOT §39) | `apps/server` job queue config | `COM-020`, `CONTENT-007` | Async-job-completion test | Checkout does not block on secondary tasks |
| `OPS-006` | Integrations plugin adapters | Shared adapter pattern for payment/email/SMS/shipping providers | `apps/server/src/plugins/integrations` | `COM-014`, `COM-019` | Adapter contract test | New provider addable without touching domain plugins |

---

### PHASE 5 — Custom Tailoring (Flagship Service)

- **Objective:** Digitize LIPEK's flagship service end to end — configuration, measurement, production tracking, fittings, deposits.
- **Prerequisites:** Phase 4 complete.
- **Architecture Work:** `TailoringPlugin` boundary (SOT §0C), state machine design (SOT §9A, §10.2).
- **Backend Work:** Domain entities, state machine + events, `AppointmentsPlugin` shared resource/slot model.
- **Client Backend Work:** Tailor assignment, workload view, production dashboard (SOT §21.4).
- **Storefront Work:** Suit/garment configurator (SOT §10.1), measurement capture, customer tracking UI.
- **Database Work:** `TailoringJob`, `TailoringConfiguration`, `MeasurementProfile`, `FittingAppointment`, `ProductionTimeline` entities + migrations.
- **Infrastructure:** None new beyond existing job queue.
- **Security:** Measurement data access restricted to customer + authorized tailoring staff, never in public URLs/analytics/AI RAG (SOT §52C "Customer measurements").
- **Testing:** State-machine transition tests, measurement-access authorization tests, configurator E2E.
- **Documentation:** `tailoring.md`.
- **Acceptance Criteria:** A test order progresses through every SOT §10.2 stage with correct events/notifications; staff dashboard reflects live stage.
- **Dependencies:** Phase 4 (`COM-022` deposits).
- **Risks:** R-9 (measurement privacy), R-10 (state-machine complexity).
- **Completion Gate:** No Phase 6 Alterations task may reuse `AppointmentsPlugin` until `TAILOR-005` proves it out.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `TAILOR-001` | `TailoringPlugin` domain entities | `TailoringJob`, `TailoringConfiguration`, `MeasurementProfile`, `FittingAppointment`, `ProductionTimeline` | `apps/server/src/plugins/tailoring` | `COM-022` | Entity CRUD + relation tests | Entities linked to Vendure Order/Payment per SOT §0C diagram |
| `TAILOR-002` | Production state machine | Order Confirmed → … → Completed (SOT §10.2), each transition validates prior state, permissions, records actor/timestamp, emits event (SOT §9A) | `apps/server/src/plugins/tailoring` | `TAILOR-001`, `FOUND-022` | Illegal-transition-rejected test | No free-text status strings anywhere in this plugin |
| `TAILOR-003` | Suit configurator UI | Style/Fit/Fabric/Color/Lapel/Buttons/Lining/Monogram/Measurements/Fitting/Delivery/Review/Deposit flow (SOT §10.1) | `apps/storefront/app/(services)/tailoring/configure` | `TAILOR-001` | Configurator E2E test | All 13 SOT §10.1 steps present and functional |
| `TAILOR-004` | Measurement profile capture | Saved measurements, manual entry, book-measurement-appointment option | `apps/storefront`, `apps/server/src/plugins/tailoring` | `TAILOR-003` | Measurement save/retrieve authorization test | Restricted to customer + authorized staff only (SOT §52C) |
| `TAILOR-005` | Fitting appointment scheduling | `AppointmentsPlugin` resource/slot/booking model, first consumer | `apps/server/src/plugins/appointments` | `TAILOR-001` | Slot-conflict test | No double-booking of a tailor/resource |
| `TAILOR-006` | Tailor assignment & workload view | Staff can assign/reassign tailors, see workload by tailor | `apps/server/src/plugins/tailoring/dashboard` | `TAILOR-002` | Assignment E2E test | Workload view matches SOT §21.4 |
| `TAILOR-007` | Deposit/remaining-balance integration | Wire `COM-022` into tailoring checkout | `apps/server/src/plugins/tailoring` | `COM-022`, `TAILOR-003` | Deposit-calculation test | SOT §14.2 example reproduced correctly |
| `TAILOR-008` | Customer tailoring tracking UI | "My Tailoring" in My LIPEK, live stage + fitting schedule | `apps/storefront/app/(account)/tailoring` | `TAILOR-002` | Tracking-display test | Matches SOT §21.4-style stage checklist, customer-facing |
| `TAILOR-009` | Staff production dashboard | Stage checklist, due dates, overdue jobs, material requirements, QC queue (SOT §21.4) | `apps/server/src/plugins/tailoring/dashboard` | `TAILOR-002` | Dashboard data-accuracy test | Overdue jobs correctly flagged |
| `TAILOR-010` | Tailoring documents | Quotes, order sheets, measurement sheets via `DocumentsPlugin` | `apps/server/src/plugins/documents` | `COM-020`, `TAILOR-001` | Document-generation test | Documents appear in My LIPEK → Documents |
| `TAILOR-011` | Stage-transition notifications | Customer/staff notifications on each state change | `apps/server/src/plugins/tailoring` | `TAILOR-002`, `COM-019` | Notification-sent test | SOT §9A "optionally trigger customer notification" implemented |

---

### PHASE 6 — Alterations + Laundry & Dry Cleaning

- **Objective:** Digitize both remaining service lines with independent but structurally consistent workflows.
- **Prerequisites:** Phase 5 complete (or run in parallel per §5.3 if staffed separately — both only truly require Phase 4).
- **Architecture Work:** `AlterationsPlugin`/`LaundryPlugin` boundaries.
- **Backend Work:** Domain entities + state machines for both.
- **Client Backend Work:** Staff queues, quality-control screens, pickup/delivery scheduling.
- **Storefront Work:** Alteration request flow (SOT §12.1), laundry booking flow (SOT §13.1), unified tracking surface (SOT §8).
- **Database Work:** `AlterationJob`/`Garment`/`Assessment`/`WorkTimeline`, `GarmentItem`/`CleaningInstructions`/`PickupDelivery`/`ServiceTimeline` entities.
- **Infrastructure:** None new.
- **Security:** Photo uploads (garment condition) validated for type/size (SOT §38 "Uploads").
- **Testing:** State-machine tests for both plugins, photo-upload validation tests, unified-tracking aggregation test.
- **Documentation:** `alterations.md`, `laundry.md`.
- **Acceptance Criteria:** Both services progress through their full SOT §12.2/§13.2 stage lists with correct events; "Your LIPEK Activity" (SOT §8) shows all four transaction types (retail, tailoring, laundry, alteration) in one view.
- **Dependencies:** Phase 4; delivery scheduling depends on `MOBILE-003` for the courier app (may land after, tracked as a known gap until then).
- **Risks:** R-11 (delivery logistics without a native courier app initially).
- **Completion Gate:** No Phase 7 CRM task starts until service-line data exists to aggregate into Customer 360.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `ALTER-001` | `AlterationsPlugin` domain entities | `AlterationJob`, `Garment`, `Assessment`, `WorkTimeline` | `apps/server/src/plugins/alterations` | `COM-022` | Entity CRUD test | Linked to Order/Payment per SOT §0C |
| `ALTER-002` | Alteration state machine | Received → Assessment → Quote Approved → In Alteration → QC → Ready → Completed (SOT §12.2) | `apps/server/src/plugins/alterations` | `ALTER-001`, `FOUND-022` | Illegal-transition-rejected test | Matches SOT §9A rule |
| `ALTER-003` | Customer alteration request flow | Select garment → select alteration → upload photos → describe → estimate/quote (SOT §12.1) | `apps/storefront/app/(services)/alterations` | `ALTER-001` | Upload validation + flow E2E test | Photo upload type/size validated |
| `ALTER-004` | Drop-off/pickup scheduling | Reuse `TAILOR-005`'s `AppointmentsPlugin` | `apps/server/src/plugins/appointments` | `TAILOR-005`, `ALTER-001` | Slot-conflict test | No duplicate booking logic written |
| `ALTER-005` | Deposit/quote-approval payment flow | Reuse `COM-022` | `apps/server/src/plugins/alterations` | `COM-022`, `ALTER-002` | Payment-gated transition test | Work cannot start before quote approval + payment per policy |
| `ALTER-006` | Staff alteration queue & QC screen | Assessment queue, quality-control checklist | `apps/server/src/plugins/alterations/dashboard` | `ALTER-002` | Queue-accuracy test | Matches SOT §21 operations expectations |
| `ALTER-007` | Customer alteration tracking UI | "My Alterations" in My LIPEK | `apps/storefront/app/(account)/alterations` | `ALTER-002` | Tracking-display test | Live stage visible to customer |
| `LAUNDRY-001` | `LaundryPlugin` domain entities | `GarmentItem`, `CleaningInstructions`, `PickupDelivery`, `ServiceTimeline` | `apps/server/src/plugins/laundry` | `COM-022` | Entity CRUD test | Linked to Order/Payment per SOT §0C |
| `LAUNDRY-002` | Laundry state machine | Received → Collected → Inspection → Cleaning/Dry Cleaning → Stain Treatment → Pressing → QC → Packaging → Out for Delivery → Delivered (SOT §13.2) | `apps/server/src/plugins/laundry` | `LAUNDRY-001`, `FOUND-022` | Illegal-transition-rejected test | Matches SOT §9A rule |
| `LAUNDRY-003` | Booking flow | Service → garments → quantity → pickup address/date → delivery preference → price review → payment (SOT §13.1) | `apps/storefront/app/(services)/laundry` | `LAUNDRY-001` | Booking flow E2E test | Matches SOT §13.1 sequence exactly |
| `LAUNDRY-004` | Pickup/delivery scheduling & assignment | Assign delivery staff to pickup/delivery tasks | `apps/server/src/plugins/laundry` (incl. `dashboard/`) | `LAUNDRY-003` | Assignment test | Ready for `MOBILE-003` courier app consumption |
| `LAUNDRY-005` | Recurring laundry data model | Weekly/biweekly/monthly/custom recurrence definition (data model only; billing automation is future per SOT §13.4) | `apps/server/src/plugins/laundry` | `LAUNDRY-001` | Recurrence-rule validation test | Model supports SOT §13.4 options without committing to subscription billing yet |
| `LAUNDRY-006` | Staff laundry operations dashboard | Pickup schedule, inspection notes, cleaning method, stain notes, pressing/QC/packaging/delivery status (SOT §21.5) | `apps/server/src/plugins/laundry/dashboard` | `LAUNDRY-002` | Dashboard data-accuracy test | Matches SOT §21.5 list |
| `LAUNDRY-007` | Customer laundry tracking UI | "My Laundry" in My LIPEK | `apps/storefront/app/(account)/laundry` | `LAUNDRY-002` | Tracking-display test | Live stage visible to customer |
| `LAUNDRY-008` | Unified service tracking surface | "Your LIPEK Activity" aggregating retail + tailoring + alteration + laundry (SOT §8) | `apps/storefront/app/(account)/activity` | `TAILOR-008`, `ALTER-007`, `LAUNDRY-007`, `COM-017` | Cross-domain aggregation test | All four transaction types render in one chronological view |
| `MOBILE-003` | Delivery/courier native app | Proof-of-delivery camera flow, background location, pickup/delivery task list, per ADR-0007's native recommendation for this audience | `apps/mobile/delivery` | ADR-0007, `LAUNDRY-004` | Native build smoke test | Courier can complete a pickup/delivery task end to end |

---

### PHASE 7 — CRM, Customer 360 & Loyalty

- **Objective:** Turn accumulated commerce/service data into a unified customer relationship system.
- **Prerequisites:** Phase 6 complete (needs real service-line data to aggregate).
- **Architecture Work:** `CrmPlugin`/`LoyaltyPlugin` boundaries (SOT §19A).
- **Backend Work:** Lead/opportunity/support-case/note/interaction entities, pipeline stages, loyalty tiers/points/rewards, segmentation.
- **Client Backend Work:** Full CRM backend (SOT §21.6), executive dashboard now fully populated (`OPS-004`/`OPS-005`).
- **Storefront Work:** Loyalty/rewards display, referral flow, gift cards.
- **Database Work:** `Lead`, `Opportunity`, `CustomerNote`, `SupportCase`, `FollowUpTask`, `CustomerInteraction`, loyalty entities.
- **Infrastructure:** Marketing-event dispatch begins riding the job queue.
- **Security:** CRM data access scoped by role; support cases carry the same PII-handling care as measurements.
- **Testing:** Pipeline-transition tests, segmentation-accuracy tests, Customer 360 aggregation test.
- **Documentation:** `crm.md`, `loyalty.md`.
- **Acceptance Criteria:** A Customer 360 view renders every SOT §20.1 section correctly for a seeded test customer with commerce + service + CRM + loyalty history.
- **Dependencies:** Phase 6.
- **Risks:** R-12 (segmentation logic complexity), R-13 (marketing automation misfires).
- **Completion Gate:** No Phase 9 AI human-handoff (`AI-007`) work starts until `CRM-004` support cases exist to hand off into.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `CRM-001` | `CrmPlugin` domain entities | `Lead`, `Opportunity`, `CustomerNote`, `SupportCase`, `FollowUpTask`, `CustomerInteraction` | `apps/server/src/plugins/crm` | Phase 6 complete | Entity CRUD test | Reference Vendure `Customer`, no shadow identity (SOT §19A) |
| `CRM-002` | Sales pipeline stages | New Lead → Contacted → Consultation Booked → Measurements Taken → Quote Sent → Approved → Production → Fitting → Completed → Follow-Up (SOT §20.2) | `apps/server/src/plugins/crm` | `CRM-001` | Pipeline-transition test | Matches SOT §20.2 exactly |
| `CRM-003` | Customer 360 aggregation view | Identity/Commerce/Fashion Profile/Services/Engagement/CRM/Loyalty sections (SOT §20.1) | `apps/server/src/plugins/crm/dashboard` | `CRM-001`, `LAUNDRY-008` | Aggregation-accuracy test | Every SOT §20.1 branch populates from real data |
| `CRM-004` | Support case management | Case creation, assignment, resolution tracking; becomes the AI human-handoff target | `apps/server/src/plugins/crm` | `CRM-001` | Case lifecycle test | Ready to receive AI-created cases in Phase 9 |
| `CRM-005` | Customer segmentation | `CustomerSegmentDefinition` or derived segment config (SOT §19A) | `apps/server/src/plugins/crm` | `CRM-001` | Segment-membership accuracy test | Segments recompute correctly on data change |
| `CRM-006` | Staff CRM backend screens | Leads, opportunities, follow-ups, quotes, notes, communication history, LTV (SOT §21.6) | `apps/server/src/plugins/crm/dashboard` | `CRM-002` | Screen E2E test | Matches SOT §21.6 |
| `CRM-007` | Segment-driven filtering/reporting | Reporting views built on `CRM-005` | `apps/server/src/plugins/crm/dashboard` | `CRM-005` | Report-accuracy test | Numbers match underlying data |
| `CRM-008` | `LoyaltyPlugin` | Tiers (Member/Silver/Gold/Platinum), points, earning rules, rewards, referrals, gift cards (SOT §19) | `apps/server/src/plugins/loyalty` | `CRM-001` | Earning-rule calculation test | Matches SOT §19 benefit list |
| `CRM-009` | Marketing automation event hooks | Journey scaffolding on the job queue (SOT §32 examples: post-purchase recommend, win-back, wedding groomsmen offer) | `apps/server/src/plugins/crm` | `OPS-003`, `CRM-005` | Trigger-fires-correctly test | At least the SOT §32 example journeys are implementable |
| `CRM-010` | Email/SMS marketing dispatch | Wire `CRM-009` to the provider chosen in ADR-0002 | `apps/server/src/plugins/integrations` | `CRM-009`, ADR-0002 | Dispatch-sent assertion test | Campaigns actually deliver |
| `CRM-011` | CRM acceptance tests | Pipeline transitions, segment accuracy, support-case SLA tracking | `apps/server` test suite | `CRM-002`–`CRM-010` | The suite itself | Green before Phase 7 sign-off |
| `CRM-012` | Wholesale/VIP/group account handling | Corporate uniforms, family outfits, large custom orders, VIP clients, wholesale accounts (SOT §20.2 use cases) | `apps/server/src/plugins/crm` | `CRM-002` | Group-account flow test | At least one full SOT §20.2 use case demonstrable end to end |
| `OPS-004` | KPI dashboard | Conversion, AOV, LTV, repeat rate, return rate, revenue by category/channel/segment (SOT §41.2) | `apps/server/src/plugins/analytics-events/dashboard` | `OPS-002`, `CRM-003` | KPI-calculation accuracy test | Matches SOT §41.2 list |
| `OPS-005` | Operations dashboard | Tailor workload, laundry queue, deliveries due, low stock, at-risk orders, VIP follow-ups (SOT §21.2) | `apps/server/src/plugins/analytics-events/dashboard` | `TAILOR-009`, `LAUNDRY-006` | Dashboard data-accuracy test | Matches SOT §21.2 list fully — this is `ADMIN-003`'s shell, now fully populated |

---

### PHASE 8 — Search & Personalization Upgrade

- **Objective:** Evolve search relevance and discovery without breaking the storefront's search contract.
- **Prerequisites:** Phase 7 complete (enough catalog + behavioral data to justify the relevance-measurement gate).
- **Architecture Work:** Confirm `DefaultSearchPlugin` baseline still holds or trigger the OpenSearch decision gate (`SEARCH-004`, ADR-0004).
- **Backend Work:** Search adapter/plugin if the gate is passed; personalization/recommendation service.
- **Client Backend Work:** Search analytics visibility for merchandising staff (extends `OPS-004`).
- **Storefront Work:** Autocomplete/typo-tolerance/synonym UX, complete-the-look surfaces, alert subscriptions.
- **Database Work:** Search-index schema (derived data, rebuildable per SOT §52B) if OpenSearch is introduced.
- **Infrastructure:** OpenSearch only if `SEARCH-004`'s gate passes (SOT §52E "do not add OpenSearch before justified").
- **Security:** No new customer PII enters the search index beyond what's already public-facing.
- **Testing:** Relevance regression tests, filter-completeness tests.
- **Documentation:** `search-architecture.md`.
- **Acceptance Criteria:** Search remains within the Vendure search GraphQL contract regardless of backend (SOT §16A); relevance measurably improves if OpenSearch is introduced.
- **Dependencies:** Phase 7; ADR-0004 for `SEARCH-005` onward.
- **Risks:** R-14 (premature infra cost if OpenSearch is added without justification — explicitly guarded against by the gate task).
- **Completion Gate:** No Phase 9 AI `searchProducts()` tool work is blocked by this phase — it targets whatever search backend is current at integration time.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `SEARCH-001` | Baseline relevance/performance verification | Measure `DefaultSearchPlugin` on the full production-scale catalog | `apps/server` | `COM-004` | Relevance benchmark test | Documented baseline numbers exist |
| `SEARCH-002` | Faceted filter completeness | Ensure SOT §17.2's full filter list works against the current search backend | `apps/storefront/app/(shop)` | `SEARCH-001` | Filter-combination test | All SOT §17.2 filters function |
| `SEARCH-003` | Autocomplete/typo/synonym baseline | Evaluate current-backend capability against SOT §17.1 | `apps/storefront` | `SEARCH-001` | Query-variant test | Documented gap list if `DefaultSearchPlugin` falls short |
| `SEARCH-004` | Relevance decision gate | Formal go/no-go on OpenSearch, referencing ADR-0004 | `docs/architecture/search-architecture.md` | `SEARCH-001`–`SEARCH-003` | N/A | Explicit documented decision, not a default drift into new infra |
| `SEARCH-005` | OpenSearch adapter (if gated in) | Custom Vendure search plugin/adapter behind the same contract | `apps/server/src/plugins/integrations` | `SEARCH-004` gate passed, ADR-0004 | Adapter parity test vs. `DefaultSearchPlugin` | Storefront code unchanged (SOT §16A) |
| `SEARCH-006` | Hybrid/semantic search | Vector search bridging into pgvector | `apps/server` | `SEARCH-005` | Semantic-relevance test | Natural-language queries (SOT §17.3 examples) return sensible results |
| `SEARCH-007` | Complete-the-look/personalization service | Recommendation service feeding PDP/cart | `apps/server/src/plugins/customer-experience` | `SEARCH-001` | Recommendation-relevance test | SOT §6/§18 "Complete the Look" functional |
| `SEARCH-008` | Back-in-stock / price-drop alert flows | Event-driven customer alert subscriptions | `apps/server/src/plugins/customer-experience` | `OPS-001` | Alert-fires-correctly test | Matches SOT §18 |

---

### PHASE 9 — Mastra AI Customer Service

- **Objective:** A controlled, read-first AI customer-service agent with proper authorization, memory isolation, and human handoff.
- **Prerequisites:** Phase 8 complete (a stable search/data surface for the AI to query); Phases 4–7 provide the tool targets.
- **Architecture Work:** `apps/ai` scaffold, `ai-architecture.md` finalized.
- **Backend Work:** RAG ingestion, read-only tool endpoints exposed by `apps/server` for the AI to call (never raw SQL).
- **Client Backend Work:** AI Escalations queue in the Dashboard.
- **Storefront Work:** AI chat UI (feature-flagged BFF route).
- **Database Work:** pgvector schema, logically isolated from commerce schema.
- **Infrastructure:** LLM provider config per ADR-0005.
- **Security:** Full SOT §23A/§52C AI security requirements — tool allowlists, per-user authorization inside every tool, no arbitrary SQL, no unrestricted fetch tool, prompt-injection defense, redaction in logs.
- **Testing:** Prompt-injection/adversarial tests, authorization-isolation tests, groundedness evals, latency/cost metrics, escalation tests.
- **Documentation:** `ai-architecture.md`, `ai-tools.md`, `ai-evals.md`.
- **Acceptance Criteria:** All SOT §23A.4 quality gates pass before the feature-flagged pilot goes live to any real user segment.
- **Dependencies:** Phase 8, ADR-0005.
- **Risks:** R-15 (AI hallucination/authorization leakage — highest-severity risk in the register).
- **Completion Gate:** No Phase 10 write-capable AI action ships until Phase 9's read-only pilot has run cleanly with observability proving no isolation or hallucination incidents.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `AI-001` | Scaffold `apps/ai` | Mastra service scaffold, provider-agnostic model config (ADR-0005) | `apps/ai` | `SEARCH-008`, ADR-0005 | Boot smoke test | Service starts, no model coupling in domain code |
| `AI-002` | Postgres/pgvector schema | Logically isolated AI schema | `apps/ai` | `AI-001` | Schema-isolation test | AI schema cannot read commerce tables directly |
| `AI-003` | RAG ingestion pipeline | Ingest FAQs, policies, tailoring guides, laundry care, service descriptions, editorial content — explicitly excluding private order histories/measurements (SOT §23A.1) | `apps/ai/src/mastra/rag` | `AI-002`, `CONTENT-001` | Ingestion-excludes-private-data test | No customer PII enters the shared vector index |
| `AI-004` | Read-only tool set | `searchProducts`, `checkInventory`, `getOrderStatus`, `trackShipment`, `getTailoringStatus`, `getAlterationStatus`, `getLaundryStatus`, `searchPolicies`, `checkAppointments` (SOT §24.2, §25 READ class) | `apps/ai/src/mastra/tools` | `AI-003`, Phase 5–7 APIs | Per-tool authorization test | Every tool checks user authorization on the specific resource, not just agent permission (SOT §23A.3) |
| `AI-005` | Auth propagation from storefront BFF | Authenticated customer identity flows to server-side tools without exposing privileged credentials to the browser (SOT §6A) | `apps/storefront` BFF route, `apps/ai` | `AI-004`, `SEC-001` | Identity-propagation test | No credential ever reaches client JS |
| `AI-006` | Memory isolation | Thread/conversation memory scoped per customer/session, no cross-customer leakage (SOT §23A.2) | `apps/ai/src/mastra/memory` | `AI-002` | Cross-customer-isolation test | An agent cannot retrieve another customer's data under any tested prompt |
| `AI-007` | Human handoff | Escalation detection → conversation summary → `SupportCase` creation → staff assignment (SOT §30) | `apps/ai`, `apps/server/src/plugins/crm` | `CRM-004`, `AI-004` | Escalation-trigger test | Support agent receives customer/order ref/summary/transcript/urgency/recommended action |
| `AI-008` | Tracing/evals wiring | Mastra traces/evals connected to observability (full stack lands `OPS-009`) | `apps/ai` | `AI-001` | Trace-completeness test | Every tool call is traceable |
| `AI-009` | Prompt-injection & authorization-isolation test suite | Adversarial test dataset per SOT §23A.4 | `apps/ai` test suite | `AI-004`–`AI-006` | The suite itself | No successful injection/isolation break in the suite |
| `AI-010` | Eval datasets | Support Q&A, product discovery, order-status tool tests (`docs/testing/ai-evals.md`) | `apps/ai/src/mastra/evals` | `AI-004` | Eval run against dataset | Documented pass threshold met |
| `AI-011` | Storefront AI chat UI | Feature-flagged chat interface calling the BFF route | `apps/storefront/app/(ai)/chat` | `AI-005` | Chat E2E test | Flag-gated, off by default |
| `AI-012` | Production pilot | Behind `AI_STYLIST`-style feature flag (SOT §46), rolled out to staff/beta/VIP first | `apps/ai`, `apps/storefront` | `AI-009`, `AI-010`, `OPS-013` | Pilot-cohort monitoring | No isolation/hallucination incident during pilot window before wider rollout |
| `SEO-006` | AEO surface | `llms.txt` + machine-readable FAQ/Q&A endpoints, pending ADR-0010 | `apps/storefront` | `SEO-005`, ADR-0010 | Endpoint validation test | Content matches published CMS state, never drifts from it |

---

### PHASE 10 — AI Commerce & Internal Copilots

- **Objective:** Extend the proven read-only AI foundation into PREPARE/ACTION-class capabilities and internal staff copilots, only after Phase 9 demonstrates safety.
- **Prerequisites:** Phase 9's pilot has run cleanly (Completion Gate above).
- **Architecture Work:** Approval-queue design for ACTION-class tools (SOT §25).
- **Backend Work:** PREPARE/ACTION tool implementations with confirmation gates.
- **Client Backend Work:** AI Escalations/Approvals Dashboard screen (SOT §21.1 "AI & Automation" section).
- **Storefront Work:** AI stylist UI (SOT §27), conversational search.
- **Database Work:** Approval-queue entity.
- **Infrastructure:** None new.
- **Security:** Confirmation gate for every irreversible/write action (SOT §52C "AI"), independent feature flag for AI write actions vs. read actions.
- **Testing:** Approval-flow tests, stylist-recommendation-quality evals.
- **Documentation:** `ai-architecture.md` updated with PREPARE/ACTION sections.
- **Acceptance Criteria:** No ACTION-class tool executes without explicit customer or staff confirmation, verified by test.
- **Dependencies:** Phase 9.
- **Risks:** R-15 (continued), R-16 (over-automation eroding trust — SOT §51 "AI helps rather than creates confusion").
- **Completion Gate:** Feeds directly into Phase 11's production hardening; no phase after this in the roadmap.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `AI-013` | PREPARE-class tools | `prepareReturn`, `prepareAppointment`, `prepareSupportCase`, `prepareCart`, `prepareAlterationRequest`, `prepareTailoringConsultation` (SOT §25) with explicit confirmation gate before any finalize step | `apps/ai/src/mastra/tools` | `AI-012` | Confirmation-required test | Nothing finalizes without the gate |
| `AI-014` | ACTION-class tools + approval queue | Cancel order, change appointment, submit return, modify address, place order, make payment, issue refund, change sensitive info (SOT §25 ACTION class) with Dashboard approval queue | `apps/ai`, `apps/server/src/plugins/crm/dashboard` (approval queue surfaces alongside support cases/escalations) | `AI-013`, ADR-0005 production confirmation | Unauthorized-action-blocked test | Every ACTION tool requires explicit customer or staff confirmation |
| `AI-015` | AI Stylist | Complete-the-look reasoning over measurements/preferences/catalog/inventory/budget/event date (SOT §27) | `apps/ai/src/mastra/agents`, `apps/storefront/app/(ai)/stylist` | `AI-004`, `SEARCH-007` | Recommendation-budget-compliance test | Example SOT §27 scenario reproducible |
| `AI-016` | Internal copilots (CRM/Ops/Inventory/Merchandising) + management summary | "What needs my attention today?" style briefs (SOT §29), CRM/inventory/merchandising assistants (SOT §28) | `apps/ai/src/mastra/agents`, `apps/server/src/plugins/analytics-events/dashboard` and `apps/server/src/plugins/crm/dashboard` (summary surfaces span both) | `OPS-004`, `OPS-005`, `CRM-007` | Summary-accuracy test | SOT §29 example brief reproducible from real data |

---

### PHASE 11 — Production Hardening & Global Readiness

- **Objective:** Everything required to responsibly operate LIPEK at production scale, across regions, indefinitely.
- **Prerequisites:** All prior phases complete.
- **Architecture Work:** Finalize deployment topology per ADR-0009; internationalization/channel readiness review (SOT §33–§34).
- **Backend Work:** Redis/BullMQ production migration, S3 cutover, full observability instrumentation, feature flag system.
- **Client Backend Work:** Delivery/staff app store readiness; audit-log/monitoring visibility for ops staff.
- **Storefront Work:** Dashboard/mobile theming parity finalized; performance re-validation at scale.
- **Database Work:** Backup/restore procedure verified with an actual restoration drill (SOT §45).
- **Infrastructure:** Redis, S3-compatible storage, OpenTelemetry backend, WAF/rate-limit tuning, load testing.
- **Security:** Full security review (SOT §38/§52C), penetration-test pass, `SEC-012` gate.
- **Testing:** Load testing (k6) against the critical commerce path, accessibility certification pass, backup-restoration test.
- **Documentation:** `deployment.md`, `monitoring.md`, `incident-response.md`, `backup-recovery.md`, `runbook.md`.
- **Acceptance Criteria:** SOT §50 "Platform Readiness Definition" holds true end to end for both the customer journey and the staff operational journey.
- **Dependencies:** All prior phases; ADR-0003, ADR-0009.
- **Risks:** See full Risk Register §12.
- **Completion Gate:** This is the platform go-live gate — see §13 Production-Readiness Gates below.

| ID | Title | Objective | Files/Modules | Depends On | Tests Required | Acceptance Criteria |
|---|---|---|---|---|---|---|
| `SEC-012` | Production security review | Full review against SOT §38/§52C, WAF/rate-limit tuning, penetration-test pass | `apps/server`, `apps/storefront`, infra | `SEC-011`, all prior `SEC-*` | Pen-test report, security checklist | No unresolved critical/high finding at go-live |
| `THEME-004` | Mobile theming bridge | Apply `THEME-001` tokens to `apps/mobile/*` shells | `apps/mobile/*` | `THEME-002`, `THEME-003`, `MOBILE-001` | Theme-switch visual test | Consistent theming across web, dashboard, mobile |
| `MOBILE-004` | Staff/admin tablet validation | Confirm Vendure Dashboard usability on tablet form factors for on-the-go admin use, per ADR-0007 outcome | `apps/server` (aggregate Dashboard build — validates the whole SPA, not one plugin) | ADR-0007 | Tablet usability test | No blocking usability gap for staff mobile use |
| `MOBILE-005` | Push notification service integration | FCM/APNs (or equivalent) across customer + delivery apps | `apps/mobile/customer`, `apps/mobile/delivery` | `MOBILE-001`, `MOBILE-003` | Push-delivery test | Notifications delivered reliably on both platforms |
| `MOBILE-006` | App store submission readiness | Signing, listings, privacy labels for customer + delivery apps | `apps/mobile/customer`, `apps/mobile/delivery` | `MOBILE-002`, `MOBILE-005` | Store pre-submission checklist | Both apps pass Play Console/App Store Connect review requirements |
| `OPS-007` | Redis + BullMQ production migration | Move from default/dev queue strategy to `BullMQJobQueuePlugin` | `apps/server` | `OPS-003` | Queue-failover test | Matches SOT §38A queue list |
| `OPS-008` | S3-compatible storage cutover | Move from local `AssetServerPlugin` storage to production object storage | `apps/server` | `FOUND-021`, ADR-0003 | Asset-migration integrity test | No asset loss during cutover |
| `OPS-009` | OpenTelemetry instrumentation | Full-stack tracing across server/storefront/AI (SOT §42) | `apps/server`, `apps/storefront`, `apps/ai` | — | Trace-completeness test | Failures traceable across the full SOT §42 journey diagram |
| `OPS-010` | Monitoring backend integration | Error tracking, latency, uptime, queue-failure, email-delivery, AI-error monitoring | infra | `OPS-009` | Alert-fires-correctly test | Every SOT §42 "Monitor" item covered |
| `OPS-011` | `monitoring.md` + alerting thresholds | Operational runbook | `docs/operations/monitoring.md` | `OPS-010` | N/A | Thresholds documented and actionable |
| `OPS-012` | Load testing | k6 against the critical commerce path at target scale | CI/infra | `COM-023` | Load-test report | No unacceptable degradation under target load |
| `OPS-013` | Feature flag system | Settings-Store-backed flags (SOT §46 example flags) | `apps/server`, `apps/storefront` | `CONTENT-008` | Flag-toggle test | AI/beta features controllable per SOT §46 rollout groups |
| `OPS-014` | Deployment pipeline finalization | Full CI/CD per SOT §44, pending ADR-0009 | `.github/workflows/*`, `infra/deployment` | ADR-0009 | Full pipeline dry run | Code Push → Lint → Tests → Build → Security → Migration Validation → Deploy → Health Check → Smoke Test all automated |
| `OPS-015` | Incident response runbook | `docs/operations/incident-response.md` | — | `OPS-010` | N/A | Runbook exists and is exercised at least once (tabletop) |
| `OPS-016` | Backup/restore drill | Actual restoration test, not just a backup existing (SOT §45) | infra | `OPS-008` | Restoration test | A real restore from backup succeeds and is documented |

---

## 7. AI Implementation Roadmap (summary)

`AI-001`→`AI-012` (Phase 9) establish the read-only foundation: isolated pgvector schema, RAG over approved non-private sources only, a strictly READ-class tool set (SOT §25), server-authoritative authorization propagation, per-customer memory isolation, human handoff into `CRM-004` support cases, full tracing/evals, and a feature-flagged pilot rolled out to staff/beta/VIP before general availability. `AI-013`→`AI-016` (Phase 10) only begin once that pilot proves clean: PREPARE-class tools with mandatory confirmation, ACTION-class tools with a staff/customer approval queue, the AI Stylist, and internal copilots for CRM/Ops/Inventory/Merchandising plus management summaries. This sequencing directly implements SOT §51's "AI helps rather than creates confusion" principle and §47's explicit deferral of "Fully Autonomous AI."

## 8. CRM Implementation Roadmap (summary)

`CRM-001`→`CRM-012` (Phase 7) build entirely as a Vendure plugin/Dashboard extension (SOT §19A) — no external CRM SaaS — referencing Vendure `Customer` records directly rather than a shadow identity system. Sequence: domain entities → sales pipeline → Customer 360 aggregation → support cases (the future AI handoff target) → segmentation → staff screens → loyalty/rewards/referrals → marketing automation hooks (riding the existing job queue, not a new service) → acceptance tests → wholesale/VIP/group account handling. Only if a later ADR demonstrates the Dashboard has become a genuine constraint would a separate CRM staff application be considered (SOT §19A).

## 9. Search Roadmap (summary)

Launch on Vendure's `DefaultSearchPlugin` + PostgreSQL (already included from Phase 1's bootstrap). Phase 8 (`SEARCH-001`–`SEARCH-004`) formally measures relevance/performance and filter completeness before deciding — via ADR-0004 and an explicit go/no-go gate — whether OpenSearch is justified (SOT §52E explicitly forbids adding it prematurely). If justified, `SEARCH-005`–`SEARCH-006` introduce a custom Vendure search adapter and hybrid/semantic search behind the *same* storefront search contract (SOT §16A), so the storefront never couples to OpenSearch query syntax. `SEARCH-007`–`SEARCH-008` add complete-the-look personalization and back-in-stock/price-drop alerts, independent of the search-backend decision.

## 10. Security Roadmap (summary, incl. MFA)

Security is not a Phase 11 afterthought — the foundation (`SEC-001`–`SEC-011`) lands in **Phase 1**, specifically sub-phases **1C (Identity Foundation)** and **1D (External Identity & Security)**, before any content or commerce feature work, because customer/staff identity underlies everything else. Sequence: native email+password auth (1C) → WebAuthn/passkey MFA (primary, "most advanced practice") → TOTP fallback + backup codes → email recovery channel (pending ADR-0002) → auth-endpoint rate limiting → RBAC with mandatory WebAuthn for privileged staff roles → **[1C acceptance gate]** → Google OAuth (1D) → Apple OAuth → audit logging → secrets-rotation policy → dependency/vulnerability scanning in CI → **[1D acceptance gate]**. `SEC-012` in Phase 11 is the production security review and penetration-test gate, not the first time security is considered. Every decision here traces to `ADR-0006`/`ADR-0008` and the concrete findings in `SIBLING_PROJECT_SECURITY_FINDINGS.md` (no sibling project had working MFA/social login to copy — this is confirmed as original build work, not integration work). See §6 Phase 1C/1D cards for exact file changes, tests, commit boundaries, and stop conditions.

## 11. Backend / Admin, Storefront, Database, Infrastructure & Integration Requirements (summary)

- **Backend/Admin:** Every module in SOT §0C gets a Vendure plugin; every plugin gets Dashboard coverage before its phase closes (see each phase's "Client Backend Work" line above) — this plan never treats admin coverage as optional or deferred, per this engagement's explicit instruction to protect backend operability for every feature.
- **Storefront:** `apps/storefront` is a renderer, never a system of record (SOT §3.1) — every storefront task in this plan reads from a backend API, never from hard-coded/static content, matching the Gap Analysis `CONFLICT` findings this plan corrects.
- **Database:** PostgreSQL is authoritative; every entity introduction in this plan ships with a reviewed migration (`FOUND-017` policy), never `synchronize: true` in production.
- **Infrastructure:** Docker Compose from Phase 1; Redis/BullMQ and S3-compatible storage introduced when load/asset-volume actually justifies them (Phase 11, or pulled forward only with a documented reason), matching SOT §52E's anti-premature-infrastructure rule.
- **Integrations:** Payment (ADR-0001), email/SMS (ADR-0002), object storage (ADR-0003), OAuth providers (ADR-0008), LLM provider (ADR-0005) — all routed through the `integrations` plugin's adapter pattern (`OPS-006`), never hard-coded into domain plugins.

## 12. Risk Register

| ID | Risk | Phase(s) affected | Mitigation |
|---|---|---|---|
| R-1 | Payment provider eligibility/integration risk (Stripe country/merchant constraints) | 4 | Provider-agnostic adapter (`COM-014`) built before provider selection finalizes; ADR-0001 resolved before go-live only, not before scaffolding |
| R-2 | MFA/social-login build risk — no sibling project has a working reference implementation | 1 | Scoped as original engineering work with a concrete recommended design (ADR-0006/0008), not assumed to be a quick integration |
| R-3 | Staff usability — Dashboard extensions feel bolted-on rather than unified | 2, 7 | `ADMIN-001` unified-navigation task treated as its own acceptance item, not incidental |
| R-4 | Performance regressions from theme/AI/PWA code added on top of the storefront | 3, 9 | Performance budget (`COM-011`) enforced in CI before those features land, and re-validated in `OPS-012` |
| R-5 | Uncommitted working-tree state / SOT document public exposure discovered during this audit | 0–1 | `FOUND-004` treated as P0, sequenced before any other Phase 0/1 work, independent of phase gating |
| R-6 | Content-model over-engineering in `LipekContentPlugin` (too many entity types too early) | 2 | Entity list scoped directly from SOT §0B.3's table, no invented entities |
| R-7 | Accessibility debt accumulating silently across phases | 3, 11 | `COM-012` pass 1 in Phase 3, full certification pass in Phase 11 (`OPS` testing), not a single end-of-project check |
| R-8 | Payment webhook reliability/duplicate processing | 4 | Idempotency required by design (`COM-015` acceptance criteria), tested explicitly |
| R-9 | Customer measurement data privacy | 5 | Access restriction + audit + RAG exclusion enforced at the plugin level (`TAILOR-004`), not left to convention |
| R-10 | State-machine complexity across three service plugins (Tailoring/Alterations/Laundry) diverging in implementation quality | 5, 6 | Common pattern established by `TAILOR-002` first, explicitly reused (not reinvented) by `ALTER-002`/`LAUNDRY-002` |
| R-11 | Delivery logistics depend on a native courier app (`MOBILE-003`) that may lag the laundry/alteration backend work | 6 | Backend pickup/delivery scheduling (`LAUNDRY-004`) does not block on the app; staff can operate manually via Dashboard until `MOBILE-003` lands |
| R-12 | Segmentation logic complexity/accuracy | 7 | Explicit segment-membership accuracy test (`CRM-005`) |
| R-13 | Marketing automation misfires (SOT §32 journeys firing incorrectly) | 7 | Trigger-fires-correctly tests per journey (`CRM-009`) before `CRM-010` dispatch goes live |
| R-14 | Premature OpenSearch infrastructure cost | 8 | Explicit go/no-go gate (`SEARCH-004`) with ADR-0004, not a default upgrade |
| R-15 | AI hallucination / authorization isolation failure — highest-severity platform risk | 9, 10 | Read-only-first rollout, mandatory adversarial test suite (`AI-009`) before any pilot, PREPARE/ACTION gating in Phase 10 only after Phase 9 proves clean |
| R-16 | Over-automation eroding customer/staff trust in AI features | 10 | Confirmation gates mandatory on every ACTION tool (`AI-014`); feature-flagged, staged rollout throughout |
| R-17 | Hosting decision (ADR-0009) delayed, blocking production infra work | 11 | Docker Compose parity maintained from Phase 1 so the eventual hosting choice is a lift-and-shift, not a rewrite |

## 13. ADR Requirements

Every open decision referenced throughout this plan is tracked in [`ADR_BACKLOG.md`](ADR_BACKLOG.md): payment provider (ADR-0001), email/SMS provider (ADR-0002), object storage provider (ADR-0003), OpenSearch hosting (ADR-0004), LLM model provider(s) (ADR-0005), **MFA implementation approach (ADR-0006)**, mobile/native app strategy (ADR-0007), **social login integration pattern (ADR-0008)**, hosting/cloud provider (ADR-0009), AEO strategy (ADR-0010), theming token ownership (ADR-0011). No task in this plan that depends on an unresolved MUST-DECIDE-BEFORE-IMPLEMENTATION ADR may start; tasks gated on MUST-DECIDE-BEFORE-PRODUCTION ADRs may scaffold against the abstraction layer but must not go live until the ADR resolves.

## 14. Production-Readiness Gates

Before Phase 11 is considered closed and the platform goes live, all of the following must hold simultaneously:

1. Every phase 0–10 Completion Gate has been satisfied in order — no phase was skipped or partially closed.
2. `SEC-012`'s production security review is clean (no unresolved critical/high finding).
3. `OPS-016`'s backup/restore drill has actually succeeded, not merely been scheduled.
4. `COM-023`'s full commerce critical-path E2E test is green in CI on the release candidate.
5. `CONTENT-010`'s 12-item backend-editability acceptance suite is green.
6. `AI-009`'s adversarial/authorization-isolation suite is green and `AI-012`'s pilot ran without an isolation or hallucination incident.
7. `OPS-012`'s load test shows no unacceptable degradation at target scale.
8. `MOBILE-002`/`MOBILE-006` app-store readiness checklists pass for both customer and delivery apps (or are explicitly deferred by a documented decision, not silently dropped).
9. `THEME-002`/`THEME-003`/`THEME-004` confirm dark/light theming works consistently across storefront, Dashboard, and mobile.
10. All MUST-DECIDE-BEFORE-PRODUCTION ADRs (0001, 0002, 0003, 0005, 0009) are resolved and reflected in `docs/adr/`.

## 15. Final Platform Completion Criteria

LIPEK 1.0 (through Release 4 / Phase 10) is complete only when both halves of SOT §50 hold simultaneously, extended by this engagement's added requirements:

> A customer can discover LIPEK through search or an AI answer engine, find the right product or service quickly, understand it, choose the correct variation, authenticate securely (including via passkey/TOTP MFA or Google/Apple sign-in) if registering, add it to cart or configure a service, pay securely, automatically receive confirmation and a receipt, track the order or service without calling anyone, receive the item or completed service, request an exchange or alteration if necessary, contact support (human or AI, with clean handoff between them) immediately, and complete the entire journey smoothly on a low-cost mobile device, an installed PWA, or a native customer app, over an average internet connection, in either light or dark theme.

> At the same time, LIPEK staff — including delivery/courier staff on their own native app — can see the order, payment, customer, inventory allocation, and fulfillment or service status; process the transaction; communicate with the customer; update tracking; issue refunds; review history; manage every service line; operate behind properly enforced MFA; review AI escalations and approve AI-proposed actions; and diagnose routine problems without touching the database or requesting developer intervention.

This is the same bar the SOT sets in §50 and §51 — this plan's job was to make it executable, not to lower it.

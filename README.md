\
# LIPEK Platform

The LIPEK Intelligent Fashion Commerce & Services Platform — a Vendure Core + NestJS commerce backend, a Next.js customer storefront, a unified Vendure React Dashboard staff backend, dedicated tailoring/alterations/laundry/CRM/loyalty domain plugins, and a Mastra-based AI layer, organized as a single pnpm monorepo.

This repository replaces the earlier `LIPEK FASHION` static-prototype repository as the platform build. See [`docs/implementation/MASTER_IMPLEMENTATION_PLAN.md`](docs/implementation/MASTER_IMPLEMENTATION_PLAN.md) for why and how.

## Start here

1. [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) — operating contract for anyone (human or agent) working in this repo
2. [`docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md`](docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md) — the authoritative product/architecture specification (internal only — never move this into a `public/`-servable path)
3. [`docs/implementation/MASTER_IMPLEMENTATION_PLAN.md`](docs/implementation/MASTER_IMPLEMENTATION_PLAN.md) — 12 phases, 168 tasks, current status
4. [`docs/implementation/ADR_BACKLOG.md`](docs/implementation/ADR_BACKLOG.md) and [`docs/adr/`](docs/adr/) — architecture decisions, open and resolved

## Status

**Phase 0 (Discovery, Documentation & Baseline) in progress.** No application code has been scaffolded yet — that is Phase 1 (`FOUND-013`–`FOUND-023`), which bootstraps `apps/server` and `apps/storefront` from the official `@vendure/create` scaffold. See the [Phase 0 completion checklist](docs/implementation/MASTER_IMPLEMENTATION_PLAN.md#phase-0--discovery-documentation--baseline) for exact task status.

## Repository layout

```text
apps/
  server/                    Vendure Core + NestJS plugins + Dashboard (bootstrapped in FOUND-014)
  storefront/                Next.js customer storefront (bootstrapped in FOUND-014)
  staff-console-extensions/  LIPEK Vendure Dashboard extensions
  mobile/
    customer/                Capacitor customer app shell (seeded from the prior prototype's mobile-wrapper)
    delivery/                Native delivery/courier app (Phase 6, MOBILE-003)
    staff/                   Staff/admin mobile shell (Phase 11, pending ADR-0007 outcome review)
  ai/                        Mastra AI service (Phase 9, AI-001)
packages/
  ui/                        Shared design system: tokens, primitives (seeded from the prior prototype)
  shared/                    Domain-neutral utilities
  schemas/                   Shared Zod validation contracts
  graphql/                   Generated GraphQL types/documents (Shop + Admin API)
  config/                    Shared lint/TS/build configuration
  testing/                   Shared fixtures/test helpers (incl. seed content fixtures)
docs/
  internal/                  The source of truth (never public)
  architecture/ domains/ api/ implementation/ operations/ testing/ adr/
infra/                       Docker Compose, deployment manifests
scripts/                     Repo-level automation
_reference/legacy-prototype/ The prior static Next.js prototype, kept for reference during FOUND-020 porting only — not a live app
```

## Locked technology decisions

Vendure Core, NestJS, the Vendure React Dashboard, PostgreSQL, Mastra, GraphQL Shop/Admin APIs, and pnpm are **locked** per the source of truth — see `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §0.3. Everything else is tracked as an ADR; see `docs/implementation/ADR_BACKLOG.md` and `docs/adr/`.

## Development

Local development setup (`pnpm install`, Docker Compose for Postgres/Redis, one-command startup) is documented in `docs/implementation/local-development.md` once Phase 1 (`FOUND-020`) produces it. There is nothing to run yet in Phase 0.

# CLAUDE.md

This is the Claude Code entry point for the LIPEK platform monorepo. The full operating contract — precedence rules, where things live, operating rules, the do-not list, and phase discipline — lives in [`AGENTS.md`](AGENTS.md) and applies identically here; this file exists only because Claude Code looks for it by name.

**Read in this order before doing anything else:**

1. [`AGENTS.md`](AGENTS.md) — operating contract (this session's ground rules)
2. [`docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md`](docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md) — the authoritative product/architecture specification
3. [`docs/implementation/MASTER_IMPLEMENTATION_PLAN.md`](docs/implementation/MASTER_IMPLEMENTATION_PLAN.md) — the phase/task breakdown; find the current phase and pick up the next `NOT STARTED` task in order
4. [`docs/implementation/ADR_BACKLOG.md`](docs/implementation/ADR_BACKLOG.md) and [`docs/adr/`](docs/adr/) — check whether the task you're about to start is gated on an unresolved decision before writing any code

## Quick facts

- Package manager: pnpm (workspace monorepo)
- Commerce engine: Vendure Core (current: 3.7.x) — never bypass it to write commerce tables directly
- Storefront: Next.js (official Vendure starter, targets Next.js 16 / React 19) — bootstrapped fresh in `FOUND-014`, not yet scaffolded
- AI: Mastra, in `apps/ai`, scaffolded in Phase 9 (`AI-001`) — do not start AI work before Phase 9
- Current status: **Phase 0 in progress.** See `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` §6 for exact task status.

Do not re-read the entire source of truth from scratch every single message once it is already in context for this session — but never proceed on an assumption about it either; re-check the specific section when a task touches it.

# ADR-0013: Vendure Dashboard Extension Colocation Model

**Status:** Accepted — supersedes the `apps/staff-console-extensions` design in the original `TARGET_REPOSITORY_STRUCTURE.md`
**Date:** 2026-08-17

## Context

The original target architecture (written during the Phase 0 audit) proposed `apps/staff-console-extensions` as a standalone monorepo app holding all LIPEK-authored Vendure Dashboard extensions, "kept as its own app for independent review/testing" but "still built and served as part of the Dashboard bundle."

During the pre-Phase-1 architecture normalization pass, this was checked against the current official Vendure Dashboard extension model (`docs.vendure.io/guides/extending-the-dashboard/*`, reverified 2026-08-17):

- A plugin declares its Dashboard extension via a `dashboard` property pointing at a colocated file, conventionally `./dashboard/index.tsx` **inside the plugin's own directory** — the official `vendure` CLI scaffolds this automatically per plugin.
- `vendureDashboardPlugin` (the Vite plugin that builds the Dashboard) **scans the Vendure configuration to find which plugins declare dashboard extensions**, introspects the GraphQL schema, and generates shared types at a configurable output path with a resolve alias "that allows all plugins to reference a shared set of GraphQL types from a central location."
- The reference `tsconfig.dashboard.json` pattern shown in the official docs is `"src/plugins/**/dashboard/*"` — i.e. the expected layout is dashboard source nested inside each plugin folder, not a separate application.
- The Dashboard itself builds as **one aggregate Vite SPA** (`vite build` → `dist/dashboard`), served either by Vendure's own `DashboardPlugin` alongside the server or hosted standalone as static assets — there is exactly one Dashboard build per Vendure server, not one per plugin and not a separate deployable "staff console app."

No concrete technical reason was found for deviating from this model. A separate `apps/staff-console-extensions` app would fight the framework's own tooling (the Vite plugin, the shared-types alias, the CLI scaffolding) rather than use it, for no compensating benefit — "independent review/testing" is achievable with per-plugin `dashboard/` folders exactly as well as with a separate app, since each plugin's dashboard extension is already a self-contained unit reviewable/testable on its own.

## Decision

Adopt the official colocated model. **Remove `apps/staff-console-extensions` entirely.** Each domain plugin under `apps/server/src/plugins/<name>/` owns its own Dashboard extension at `apps/server/src/plugins/<name>/dashboard/`, e.g.:

```text
apps/server/src/plugins/tailoring/dashboard/
apps/server/src/plugins/laundry/dashboard/
apps/server/src/plugins/crm/dashboard/
apps/server/src/plugins/lipek-content/dashboard/
apps/server/src/plugins/lipek-security/dashboard/
apps/server/src/plugins/analytics-events/dashboard/
apps/server/src/plugins/alterations/dashboard/
apps/server/src/plugins/documents/dashboard/
```

The aggregate Dashboard build lives at the `apps/server` root: `apps/server/vite.config.mts` (configuring `vendureDashboardPlugin` against `vendure-config.ts`) and `apps/server/tsconfig.dashboard.json` (including `src/plugins/**/dashboard/*`). Genuinely cross-plugin shell concerns (global branding, the dark/light theme bridge entry point) live alongside this build config, not in a plugin and not in a separate app.

If a genuine need for shared Dashboard _components_ (not shell config) emerges across multiple plugins' extensions, those may live in a shared package (e.g. an addition to `packages/ui` or a new `packages/dashboard-ui`) — deferred until a real duplication problem appears, not created speculatively now.

## Consequences

- `docs/architecture/TARGET_REPOSITORY_STRUCTURE.md`, `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md`, `docs/architecture/system-overview.md`, `docs/api/admin-api-extensions.md`, `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md`, and `README.md` are updated to remove every `apps/staff-console-extensions` reference and reassign each affected task's Files/Modules to the correct colocated plugin path (see the master plan's task table for the full mapping).
- `apps/staff-console-extensions/` (an empty placeholder directory with only a README, no real code) is deleted from the repository — nothing of substance is lost.
- Every future Dashboard-extension task's acceptance criteria should reference the specific plugin's `dashboard/` folder, not a shared app.
- This is exactly the kind of architecture correction the source of truth's own process anticipates (§0.1: "if implementation reality requires a change to this document, create an ADR, explain the trade-off, obtain approval and update the source of truth") — applied here one level down, to this repository's own target-structure document rather than the SOT itself, since the SOT does not mandate a specific Dashboard-extension file layout.

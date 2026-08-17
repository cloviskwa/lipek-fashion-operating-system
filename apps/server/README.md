# apps/server

Not yet scaffolded. Bootstrapped by task `FOUND-014` via `@vendure/create` (Vendure Core — verified 3.7.2 during the pre-Phase-1 architecture normalization pass, 2026-08-17; re-verify at bootstrap time per `AGENTS.md`), selecting PostgreSQL and the official Next.js storefront starter.

Will host: Vendure Core, NestJS plugins (`lipek-content`, `lipek-security`, `tailoring`, `alterations`, `laundry`, `appointments`, `crm`, `loyalty`, `documents`, `customer-experience`, `analytics-events`, `integrations`), and **the aggregate Vendure Dashboard build**.

**Dashboard extensions are colocated per plugin, not a separate app.** Each plugin that has staff-facing screens owns its own `dashboard/` subfolder (e.g. `src/plugins/tailoring/dashboard/`), auto-discovered by `vendureDashboardPlugin` via `vite.config.mts` at this app's root, per the official Vendure Dashboard extension model. There is no `apps/staff-console-extensions` — see `docs/adr/ADR-0013-dashboard-extension-colocation.md`.

See `docs/architecture/TARGET_REPOSITORY_STRUCTURE.md` §2 for the full responsibility matrix.

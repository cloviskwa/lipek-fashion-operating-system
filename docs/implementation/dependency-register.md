# Dependency Register

**Status:** Provisional (live record — updated every time a package is actually installed, per `AGENTS.md`)
**Source plan:** `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md`

No package has been installed yet — this repository has no `node_modules`, no app-level `package.json` beyond the workspace root, and Phase 1 (`FOUND-014`) has not run. This register starts filling in the moment `@vendure/create` bootstraps `apps/server`/`apps/storefront`.

| Package | Version | Purpose | Owning module | Type | License | Added in task |
|---|---|---|---|---|---|---|
| *(none yet)* | | | | | | |

## Verified current versions (Phase 0 audit, 2026-08-17 — re-verify before bootstrap if this date is stale)

| Package | Verified current version |
|---|---|
| `@vendure/core` | 3.7.0 |
| Official Vendure Next.js storefront starter | Next.js 16 / React 19 (`vendurehq/nextjs-starter-vendure`) |

Every future row in this table must state exact version, purpose, owning module, license, and the task that introduced it — no package is added "because it exists" (source of truth §52E).

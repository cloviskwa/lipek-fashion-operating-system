# Dependency Register

**Status:** Provisional (live record — updated every time a package is actually installed, per `AGENTS.md`)
**Source plan:** `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md`

No package has been installed yet — this repository has no `node_modules`, no app-level `package.json` beyond the workspace root, and Phase 1 (`FOUND-014`) has not run. This register starts filling in the moment `@vendure/create` bootstraps `apps/server`/`apps/storefront`.

| Package | Version | Purpose | Owning module | Type | License | Added in task |
|---|---|---|---|---|---|---|
| *(none yet)* | | | | | | |

## Verified current versions

Two verification passes so far. **Registry/version numbers drift fast — re-verify again immediately before `FOUND-014` actually runs if any time has passed since the second pass below.**

| Package | Phase 0 (2026-08-17) | Phase 1 pre-flight reverification (2026-08-17, same day, registry-sourced) | Delta / action |
|---|---|---|---|
| `@vendure/core` | 3.7.0 | **3.7.2** (npm registry) | Patch bump — use 3.7.2 |
| `@vendure/dashboard` | not recorded | **3.7.2** (npm registry) — "standalone application that can be extended," built via Vite, served by `@vendure/core`'s `DashboardPlugin` or hosted standalone | New row — matches `@vendure/core` version, as expected for an in-lockstep Vendure package |
| Official Vendure Next.js storefront starter (`next`) | Next.js 16 / React 19 (unspecified patch) | **`next` 16.3.1** (npm registry) | Confirmed major, patched to exact version |
| `pnpm` | 11.9.0 (pinned in root `package.json`) | **11.22.0** (npm registry) | Root `package.json`/`packageManager` field needs updating before `FOUND-013`/`FOUND-015` |
| Node.js | 24.x LTS | **v24.19.0 is the latest Active LTS point release; Node 26 is "Current," not yet promoted to LTS** (nodejs.org release table) | No change — 24.x remains the correct locked baseline; optional local patch bump from the installed 24.18.0 |
| TypeScript | Assumed 5.9.x (matches the prior prototype's `^5.9.3` pin, still in `_reference/legacy-prototype/package.json`) | **npm `latest` dist-tag is now 7.0.2** (TypeScript 7 — native Go compiler, GA 2026-07-08) — **deliberately NOT adopted**, see `docs/adr/ADR-0012-typescript-version-pin.md` | Pin to the latest 5.9.x line, not `latest`/7.x. Root `package.json`'s `"typescript": "^5.9.3"` already caret-bounded below the 7.0 major, so it will **not** accidentally resolve to 7.x — verified safe as currently written, no change needed to that file, but do not blindly `pnpm add -D typescript@latest` anywhere in Phase 1. |
| `tailwindcss` | v4 (unspecified patch), matches prototype's CSS-first v4 usage | **4.3.3** (npm registry) | Confirmed major, patched to exact version |
| `@simplewebauthn/server` | Referenced by name only in `ADR-0006`, no version | **13.3.2** (npm registry) | New row, for `SEC-002` (Phase 1C) |
| `@simplewebauthn/browser` | Referenced by name only in `ADR-0006`, no version | **13.3.0** (npm registry) | New row, for `SEC-002` (Phase 1C) |
| `otplib` | Referenced by name only in `ADR-0006`, no version | **13.4.1** (npm registry), actively maintained — modern tooling (TS 5.9.3, Vitest 4.1.5), no deprecation notices | New row, for `SEC-003` (Phase 1C) |

### Why TypeScript is pinned to 5.9.x and not `latest` (7.0.2)

TypeScript 7.0 (GA 2026-07-08, roughly six weeks before this reverification) replaces the compiler with a native Go binary and is a genuine breaking change, not a routine bump:
- No stable programmatic compiler API until TypeScript 7.1 ("several months away" per Microsoft's own messaging) — this breaks any tool built on the old `ts.*` API surface.
- `typescript-eslint` explicitly closed a TS7-support request as **"not planned"** on GA day (2026-07-08) specifically because of the missing programmatic API.
- Tools like `ts-morph` are reported completely broken against the 7.0 native preview.
- The documented interim workaround (running 7.0 for `tsc` while pinning a separate 6.0 compatibility package just for ESLint) is not a workable foundation for a Phase 1 CI baseline (`FOUND-023`) that must lint, typecheck, and test consistently across `apps/server`, `apps/storefront`, and every `packages/*`.

This is exactly the class of "unstable technical detail" `AGENTS.md`/source-of-truth §0.2 requires verifying rather than assuming — the correct call here is explicitly *not* to chase `latest`. Tracked as `ADR-0012`; revisit once `typescript-eslint` and the rest of the toolchain (Next.js, NestJS/Vendure, GraphQL codegen) confirm TypeScript 7.1+ compatibility.

Every future row in this table must state exact version, purpose, owning module, license, and the task that introduced it — no package is added "because it exists" (source of truth §52E).

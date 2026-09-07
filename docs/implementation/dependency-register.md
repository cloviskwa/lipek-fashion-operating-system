# Dependency Register

**Status:** Provisional (live record — updated every time a package is actually installed, per `AGENTS.md`)
**Source plan:** `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md`

Phase 1A (`FOUND-013`–`FOUND-015`) is complete. `apps/server` and `apps/storefront` are real, installed, pnpm-workspace-managed applications. This table now reflects actual resolved versions (from `pnpm list`/the lockfile), not registry-`latest` lookups.

## Installed packages

### `apps/server` (`@lipek/server`)

| Package                        | Version           | Purpose                                       | Type    | License                                                          | Added in task                                                                      |
| ------------------------------ | ----------------- | --------------------------------------------- | ------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `@vendure/core`                | 3.7.2             | Commerce engine                               | runtime | Vendure license (GPL-3.0/MIT dual — see package for exact terms) | `FOUND-014`                                                                        |
| `@vendure/asset-server-plugin` | 3.7.2             | Local/dev asset storage                       | runtime | Vendure license                                                  | `FOUND-014`                                                                        |
| `@vendure/dashboard`           | 3.7.2             | Staff Dashboard (aggregate Vite build)        | runtime | Vendure license                                                  | `FOUND-014`                                                                        |
| `@vendure/email-plugin`        | 3.7.2             | Transactional email (dev mailbox in dev mode) | runtime | Vendure license                                                  | `FOUND-014`                                                                        |
| `@vendure/graphiql-plugin`     | 3.7.2             | GraphiQL Admin/Shop explorer                  | runtime | Vendure license                                                  | `FOUND-014`                                                                        |
| `dotenv`                       | 17.4.2            | `.env` loading                                | runtime | BSD-2-Clause                                                     | `FOUND-014`                                                                        |
| `pg`                           | 8.23.0            | PostgreSQL driver                             | runtime | MIT                                                              | `FOUND-014`                                                                        |
| `@vendure/cli`                 | 3.7.2             | `vendure dev`/`vendure build` task runner     | dev     | Vendure license                                                  | `FOUND-014`                                                                        |
| `ts-node`                      | 10.9.2            | TS execution for CLI tasks                    | dev     | MIT                                                              | `FOUND-014`                                                                        |
| `typescript`                   | **5.8.2** (exact) | Type safety                                   | dev     | Apache-2.0                                                       | `FOUND-014`; see `ADR-0012` amendment — kept as generated, not forced to 5.9.x/6.x |
| `vite`                         | 7.3.6             | Dashboard build engine                        | dev     | MIT                                                              | `FOUND-014`                                                                        |
| `@nestjs/common`               | 11.2.1            | Nest DI/decorators for plugin services (peer of `@vendure/core`) | runtime | MIT                                           | `CONTENT-005`                                                                      |
| `@nestjs/graphql`              | 13.1.0            | `@Resolver`/`@Query`/`@Mutation` decorators for plugin API extensions | runtime | MIT                                   | `CONTENT-005`                                                                      |
| `typeorm`                      | 0.3.31            | Entity/column decorators and migrations for plugin entities | runtime | MIT                                                | `CONTENT-005`                                                                      |
| `graphql`                      | 16.14.2           | GraphQL runtime (peer of the Nest GraphQL stack) | runtime | MIT                                                            | `CONTENT-005`                                                                      |
| `graphql-tag`                  | 2.12.7            | `gql` template tag for plugin schema extensions | runtime | MIT                                                             | `CONTENT-005`                                                                      |
| `@vendure/common`              | 3.7.2             | Shared `ID`/`DeepPartial` types used by entities | runtime | GPL-3.0-or-later                                               | `CONTENT-005`                                                                      |
| `reflect-metadata`             | 0.2.2             | Decorator metadata reflection required by Nest/TypeORM | runtime | Apache-2.0                                               | `CONTENT-005`                                                                      |
| `otplib`                       | 13.4.1            | RFC 6238 TOTP generation/verification for the MFA fallback factor (version re-verified against the npm registry at install time; 13.5.0 available — minor bump left for a later pass) | runtime | MIT | `R-04` (`SEC-003`) |
| `@simplewebauthn/server`       | 13.3.2            | WebAuthn/passkey registration + assertion verification for the primary MFA factor (version pinned to the master plan's re-verified release; 14.0.1 exists — major bump needs its own compat check per the do-not list) | runtime | MIT | `R-04` (`SEC-002`) |
| `@simplewebauthn/browser`      | 13.3.0            | Browser-side WebAuthn ceremonies for the Dashboard's passkey UI | dev | MIT | `R-04` (`SEC-002`) |


> **Why these seven were added (`CONTENT-005`).** They are the standard Vendure
> plugin-authoring peer set. `@vendure/core` depends on all of them, but pnpm's
> strict `node_modules` layout means a *plugin in `apps/server`* cannot import
> them transitively — they must be direct dependencies of the app that writes
> plugin code. Each version is pinned to the range `@vendure/core@3.7.2` itself
> declares, so no second copy of Nest, TypeORM or GraphQL is introduced.

### `apps/storefront` (`@lipek/storefront`)

| Package                                                                                                        | Version                   | Purpose                                                                                 | Type    | License     | Added in task                                                                         |
| -------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------- | ------- | ----------- | ------------------------------------------------------------------------------------- |
| `next`                                                                                                         | 16.3.1                    | Storefront framework                                                                    | runtime | MIT         | `FOUND-014`                                                                           |
| `react` / `react-dom`                                                                                          | 19.2.8                    | UI runtime                                                                              | runtime | MIT         | `FOUND-014`                                                                           |
| `graphql`                                                                                                      | 16.14.2                   | GraphQL client runtime                                                                  | runtime | MIT         | `FOUND-014`                                                                           |
| `gql.tada`                                                                                                     | 1.11.3                    | Typed GraphQL queries against the Shop API                                              | runtime | MIT         | `FOUND-014`                                                                           |
| `next-intl`                                                                                                    | 4.13.6                    | i18n (en/de locales generated)                                                          | runtime | MIT         | `FOUND-014`                                                                           |
| `next-themes`                                                                                                  | 0.4.6                     | Dark/light theme provider (pre-wired by the official starter — relevant to `THEME-002`) | runtime | MIT         | `FOUND-014`                                                                           |
| `zod`                                                                                                          | 4.4.3                     | Schema validation                                                                       | runtime | MIT         | `FOUND-014`                                                                           |
| (23 more UI/form/utility packages — `@base-ui/react`, `react-hook-form`, `recharts`, `shadcn`, `sonner`, etc.) | various                   | Official starter's own UI toolkit                                                       | runtime | various OSS | `FOUND-014`                                                                           |
| `eslint`                                                                                                       | 9.39.5                    | Linting                                                                                 | dev     | MIT         | `FOUND-014`                                                                           |
| `eslint-config-next`                                                                                           | 16.3.1                    | Next.js lint rules (matches installed `next`)                                           | dev     | MIT         | `FOUND-014`                                                                           |
| `tailwindcss`                                                                                                  | 4.3.3                     | Styling (CSS-first v4, matches SOT's prior Tailwind v4 usage)                           | dev     | MIT         | `FOUND-014`                                                                           |
| `typescript`                                                                                                   | **6.0.3** (via `^6.0.3`)  | Type safety                                                                             | dev     | Apache-2.0  | `FOUND-014`; see `ADR-0012` amendment — official starter's own pin, kept as generated |
| `@types/node`, `@types/react`, `@types/react-dom`                                                              | 26.2.0 / 19.2.18 / 19.2.4 | Type definitions                                                                        | dev     | MIT         | `FOUND-014`                                                                           |

### Workspace root (`lipek-platform`)

| Package      | Version              | Purpose                                                                                     | Type | License    | Added in task                                               |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------- | ---- | ---------- | ----------------------------------------------------------- |
| `prettier`   | 3.9.6                | Formatting (docs, root/packages/scripts/infra — scoped via `.prettierignore`, not `apps/*`) | dev  | MIT        | Phase 0, confirmed `FOUND-015`                              |
| `typescript` | 5.9.3 (via `^5.9.3`) | Root-level type safety for future `packages/*` and `scripts/*` code                         | dev  | Apache-2.0 | Phase 0; unrelated to either app's own pin — see `ADR-0012` |

### Infrastructure (not npm packages)

| Component  | Version                                                                                  | Purpose                                                                        | Added in task |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------- |
| PostgreSQL | `postgres:16-alpine` (Docker)                                                            | Primary database, via `apps/server/docker-compose.yml`'s `postgres_db` service | `FOUND-014`   |
| pnpm       | 11.9.0 (locally installed; registry `latest` is 11.22.0 — not yet bumped, tracked below) | Package manager/workspace                                                      | Phase 0       |
| Node.js    | 24.18.0 (locally installed; 24.19.0 is latest Active LTS point release)                  | Runtime                                                                        | Phase 0       |
| Docker     | 29.6.2                                                                                   | Local Postgres container                                                       | Phase 0       |

## Known deltas from latest registry versions (not yet acted on)

| Package | Installed | Registry latest (as of 2026-08-17) | Action                                                                                                        |
| ------- | --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm`  | 11.9.0    | 11.22.0                            | Deferred — not a blocker for Phase 1A; bump opportunistically in a later phase, re-verify compatibility first |
| Node.js | 24.18.0   | 24.19.0 (still 24.x LTS line)      | Deferred — patch-level only, no urgency                                                                       |

## `ADR-0012` summary (TypeScript — see the ADR for full reasoning)

**Platform-wide rule:** never adopt the TypeScript 7.x native compiler until `typescript-eslint`/Next.js/NestJS-Vendure toolchains confirm compatibility. **Per-app:** each app keeps its own official scaffold's TypeScript pin rather than being forced to a single monorepo-wide version — `apps/server` on 5.8.2, `apps/storefront` on ^6.0.3, workspace root on ^5.9.3. This was amended during `FOUND-014` after discovering the official Next.js starter itself requires TypeScript 6.x, which the original "5.9.x everywhere" draft of this ADR hadn't accounted for.

## Approved native/postinstall build scripts (`pnpm-workspace.yaml` `allowBuilds`)

Approved during `FOUND-014`'s `pnpm install` (pnpm blocks these by default): `@apollo/protobufjs`, `@parcel/watcher`, `@swc/core`, `bcrypt`, `esbuild`, `msw`, `sharp`, `unrs-resolver`. All are mainstream dependencies of the official Vendure server and Next.js storefront scaffolds themselves, not something LIPEK added independently — see the comment in `pnpm-workspace.yaml` for the per-package rationale.

## Known gap (not a Phase 1A blocker, flagged for later)

`apps/server` has no ESLint configuration — the official Vendure scaffold does not include one by default (unlike the Next.js starter, which ships a sophisticated architecture-enforcing `eslint.config.mjs`). Root `pnpm lint`/`pnpm run lint` currently runs cleanly by gracefully skipping `apps/server` (via `pnpm -r --if-present lint`), which satisfies `FOUND-015`'s "single command covers all apps" criterion without inventing a possibly-premature lint ruleset. Revisit when the first real backend plugin code lands in `apps/server` (Phase 1C `lipek-security` onward) — a shared Node/TypeScript ESLint preset in `packages/config` is the natural place for it then, not created speculatively now.

Every future row in this table must state exact version, purpose, owning module, license, and the task that introduced it — no package is added "because it exists" (source of truth §52E).

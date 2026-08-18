# Environment Variables

**Status:** Provisional (live record — updated as each integration lands)
**Source plan:** `docs/implementation/DEPENDENCY_INSTALLATION_PLAN.md`, `docs/implementation/ADR_BACKLOG.md`

## Local toolchain (verified this Phase 0 audit, 2026-08-17)

| Tool    | Verified local version |
| ------- | ---------------------- |
| Node.js | v24.18.0               |
| pnpm    | 11.9.0                 |
| Docker  | 29.6.2                 |
| Git     | 2.55.0                 |

## Environment variable inventory

Populated in `FOUND-016`. Each app has its own `.env.example` (placeholder values only) alongside a real, gitignored `.env`/`.env.local`. This table grows with every future integration (payment, email/SMS, object storage, OAuth, LLM provider).

### `apps/server`

| Variable                                                                        | Purpose                                                                                                | Required from task | Notes                                                                                                                                                                                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_ENV`                                                                       | `dev`/`production` switch — controls Vendure's dev-only conveniences (GraphQL debug info, dev mailbox) | `FOUND-014`        | Set by the scaffold; keep `dev` locally                                                                                                                                                           |
| `VENDURE_SERVER_PORT`                                                           | Port the server listens on                                                                             | `FOUND-014`        | `src/vendure-config.ts` prefers a hosting-injected `PORT` over this if both are present                                                                                                           |
| `COOKIE_SECRET`                                                                 | Signs session cookies                                                                                  | `FOUND-014`        | Scaffold-generated random value; rotate per environment, never share across environments                                                                                                          |
| `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD`                                   | Bootstrap admin account, created on first boot if absent                                               | `FOUND-014`        | Scaffold default is `superadmin`/`superadmin` — the server itself warns on boot that this is insecure; change before any shared environment (tracked for real in `SEC-006`'s RBAC work, Phase 1C) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` / `DB_SCHEMA` | PostgreSQL connection                                                                                  | `FOUND-014`        | Local dev target is `apps/server/docker-compose.yml`'s `postgres_db` service, port `6543` (deliberately non-default to avoid colliding with any other local Postgres)                             |
| `VENDURE_DISABLE_TELEMETRY`                                                     | Opt out of Vendure's anonymous usage telemetry                                                         | Optional           | Commented out by default in `.env.example`; set `true` to disable                                                                                                                                 |

### `apps/storefront`

| Variable                                                                                   | Purpose                                             | Required from task | Notes                                                                                                                             |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `VENDURE_SHOP_API_URL`                                                                     | Shop API endpoint the storefront queries            | `FOUND-014`        | Server-side only by default (`NEXT_PUBLIC_` variant available if a client-side call genuinely needs it)                           |
| `VENDURE_CHANNEL_TOKEN`                                                                    | Vendure channel to query                            | `FOUND-014`        | Defaults to `__default_channel__`; becomes meaningful once multi-channel/region work lands (SOT §33)                              |
| `NEXT_PUBLIC_SITE_URL`                                                                     | Canonical site URL for metadata/SEO                 | `FOUND-014`        | Update once a real domain exists; currently `http://localhost:3001`                                                               |
| `REVALIDATION_SECRET`                                                                      | Authenticates calls to `/api/revalidate`            | `FOUND-014`        | Required for `CONTENT-007`'s event-driven cache invalidation (Phase 2); generate a real random value per environment, never reuse |
| `NEXT_PUBLIC_SITE_NAME`                                                                    | Site name for metadata/SEO                          | Optional           | Commented out; defaults to "Vendure Store" until LIPEK branding lands                                                             |
| `VENDURE_AUTH_TOKEN_COOKIE` / `VENDURE_AUTH_TOKEN_HEADER` / `VENDURE_CHANNEL_TOKEN_HEADER` | Cookie/header names for the Shop API session bridge | Optional           | Defaults are fine; only override if a hosting platform's edge layer needs different names                                         |

## Rules

Binding, source of truth §0.2/§38: no secret is ever committed; every `.env*` beyond `.env.example` stays gitignored (root `.gitignore` covers `.env`/`.env.*` with an `!.env.example` exception, confirmed via `git check-ignore` for both apps during `FOUND-014`/`FOUND-016`); every variable added here has a documented purpose and owner task; `.env.example` files carry placeholder values only, never real credentials — verified via `dependency-register.md`'s secret-safety checks and `FOUND-023`'s CI secret-scan job.

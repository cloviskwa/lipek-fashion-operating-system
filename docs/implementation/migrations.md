# Migrations Policy

**Status:** Operational (binding policy + how-to)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §0.2 ("Never perform production schema changes using `synchronize: true`; create and review migrations"), §52B ("Every schema change must use reviewed migrations. Production must not use automatic destructive schema synchronization").

## The rule

**`dbConnectionOptions.synchronize` is `false` in `apps/server/src/vendure-config.ts` and must stay `false` in every environment that holds data worth keeping — including local development, once real content exists.** Schema changes happen exclusively through committed, reviewed migration files. This is not a production-only rule enforced by a deploy gate; it's a repository convention enforced by never setting it to `true` in source, so there is no environment-specific toggle to misconfigure.

The scaffold's own generated `README.md` documents an opt-in `synchronize: true` shortcut for early, no-data-to-lose development. LIPEK does not use it — every entity/customField change, from the very first plugin, goes through a real migration. This is a deliberate, stricter-than-default choice: it keeps the migration habit correct from day one rather than retrofitting discipline once "the app has real data now."

## How it works (as generated, unmodified — verified `FOUND-017`)

```text
Change customFields / add or change an entity in a plugin
                ↓
npx vendure migrate --generate <descriptive-name>
                ↓
Review the generated file in apps/server/src/migrations/
                ↓
Commit it to source control
                ↓
Next server start: runMigrations(config) runs pending migrations
before bootstrap(config) — wired in apps/server/src/index.ts, generated as-is
                ↓
Schema updated deterministically, reviewable in git history
```

Verified during `FOUND-017`: `npx vendure migrate --generate baseline-check` against the live local database correctly reported **"No changes in database schema were found, so no migration was generated"** — confirming the tooling works end to end and, just as importantly, does not fabricate an empty migration file when there is nothing to capture. No file was committed by this check.

## Review requirements

Every migration file, before merge:

1. **Read the generated SQL**, not just the filename. TypeORM's auto-generated migrations are usually correct but not infallible — a renamed column can generate as a drop + add (data loss) instead of a rename unless reviewed and hand-corrected.
2. **Confirm it is additive/non-destructive where the underlying change is additive.** A migration that drops a column or table must be an explicit, deliberate decision recorded in the PR description, not an accident of generation.
3. **Never hand-edit a migration's `up()` after it has been run in any shared environment.** If a mistake is found post-merge, write a new migration to fix it forward.
4. **One migration per logical schema change**, not one giant migration per feature branch — makes review and, if ever necessary, targeted revert (`npx vendure migrate --revert`) tractable.

## CI enforcement

`FOUND-023`'s CI pipeline runs a migration check (`npx vendure migrate --generate ci-check` against a fresh ephemeral database seeded only from committed migrations, verifying it reports no pending changes) so a schema/entity change without a corresponding committed migration fails the build rather than silently drifting. See `docs/architecture/integration-map.md` and the CI workflow itself for the exact job.

## What this does not cover

- **Seed data** (reference/demo data) is not a migration concern — SOT §52B: "Seed scripts are for deterministic baseline/reference data, not live business content." Seed scripts live in `scripts/` (per `TARGET_REPOSITORY_STRUCTURE.md`), separate from schema migrations.
- **Search indexes and AI vector indexes are derived data**, rebuildable from canonical sources (SOT §52B) — they are not migrated, they are reindexed.

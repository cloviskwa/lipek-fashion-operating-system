# LIPEK Platform — Backend Rebuild Plan

**Status:** Authoritative — this is the decision record for the post-incident backend rebuild program.
**Precedence:** Subordinate to `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` per SOT §0.1, and to accepted ADRs. Where this plan is silent, [`MASTER_IMPLEMENTATION_PLAN.md`](MASTER_IMPLEMENTATION_PLAN.md) governs.
**Created:** 7 September 2026, after the forensic assessment recorded in §2.
**Companion documents:** [`MASTER_IMPLEMENTATION_PLAN.md`](MASTER_IMPLEMENTATION_PLAN.md) · [`migrations.md`](migrations.md) · [`dependency-register.md`](dependency-register.md) · [`../architecture/event-model.md`](../architecture/event-model.md)

> **Agents: read §4 before writing any entity code.** The rebuild inverts the
> normal order of work — the database schema already exists and is authoritative
> over your entity definitions, not the other way round. Following the standard
> "design entity, generate migration" flow here will corrupt a live schema.

---

## 1. Why this plan exists

Between 26 and 29 August 2026 the platform's backend was built out through Phase 10. That work was committed locally and **never pushed**. The repository was re-cloned on 6 September 2026, destroying the local commits. The PostgreSQL database was never touched, so everything those commits' migrations wrote is still present.

The result is an unusual failure mode: **the schema survived; the code did not.**

This is not a re-run of Phases 1–10. The design decisions those phases made are recoverable by reading the live schema. What must be rebuilt is the TypeScript layer over it, plus the behaviour that was never expressed in the schema at all (§3).

## 2. Forensic findings (closed)

Local recovery avenues are exhausted and negative. Recorded here so they are not re-investigated:

| Avenue | Result |
| --- | --- |
| All four LIPEK git repos on the machine | Only `lipek-fashion-operating-system` is the platform; the other three are the February 2026 static prototypes |
| Branches, tags, PRs on GitHub | `main` @ `469947d` only — no other refs, no pull requests |
| `git fsck` dangling objects | 0 |
| `git stash`, reflog | Reflog shows clone → checkout → 1 commit; the clone post-dates the loss |
| Recycle Bin, shadow copies, OneDrive, archives | Nothing |
| Docker images | No server image was ever built — the server ran via `vendure dev` on the host |
| Cline / Codex / Claude Code transcripts | All local sessions post-date the loss; plugin names appear only in quoted documentation |

**One avenue remains open and is not checkable from this machine:** ChatGPT/Codex **cloud** task history for 28–29 August 2026. If those diffs exist they can usually be re-pushed as a branch, which would reduce this entire plan to a merge. Check before investing in §5.

## 3. What survived, and the one thing that did not

**Survived —** 72 custom tables, 734 columns, with primary keys, indexes and foreign-key cascades; the ledger of 21 applied migrations, which fixes the build order; content data (23 navigation items, 14 FAQs, 8 articles, 6 testimonials, 5 pages, 4 policies, 3 service definitions, 2 store locations); operational data (`search_index_item` 492 rows, `audit_log_entry` 425 rows); and all architecture documentation.

**Lost —** every entity class, service and resolver; all Dashboard extensions; the `customFields` declarations; and all state-machine logic.

### 3.1 The service workflow state machines are *partly* recoverable

**Corrected 2026-09-07.** An earlier revision of this section claimed the stage
vocabularies were lost and had to be re-decided with the client. That was wrong,
and the error is worth recording: the sequences are written in the SOT as ASCII
flow diagrams (§10.2 Tailoring Workflow, §12.2 Alteration Tracking, §13.2
Laundry Tracking) that contain none of the words a keyword search for "stage" or
"state machine" would find. **Read those three sections before assuming anything
about this area.** They are transcribed into canonical identifiers in
[`ADR-0014`](../adr/ADR-0014-service-workflow-stage-vocabularies.md).

What remains genuinely undecided is narrower, and is what `R-03` resolves: the
serialization of `stageTimestamps`/`stageActorIds`, whether transitions may skip
or loop, how cancellation relates to the sequence, which table owns the laundry
stage across `service_timeline` and `pickup_delivery`, per-transition permissions,
and the full event set.

The service workflows are **event-sourced through timeline tables**, not status columns. `production_timeline`, `alteration_work_timeline` and `service_timeline` each carry a `currentStage` column that is a plain `varchar` with **no enum type, no CHECK constraint, and zero rows**. The stage vocabulary is therefore absent from the database.

It is also absent from the documentation. SOT §9A specifies only the *principle* every transition must follow:

- validate allowed previous state
- validate permissions
- record timestamp/actor
- emit a domain event
- optionally trigger customer notification
- optionally enqueue downstream work

[`event-model.md`](../architecture/event-model.md) carries a seed list of eight events (`TailoringStarted`, `FittingScheduled`, `TailoringCompleted`, `LaundryCollected`, `LaundryCompleted`, `LaundryDelivered`, `AlterationStarted`, `AlterationCompleted`) and states explicitly that each state machine's full event set would be recorded "as each plugin's `*-002` state-machine task lands". Those tasks landed only in the lost commits.

**Consequence:** the *names* come from the SOT; the *rules* do not. `R-03` transcribes the former and decides the latter, and still blocks `R-06`, `R-08` and `R-09`.

`stageTimestamps` and `stageActorIds` remain undocumented `text` columns with no rows, so their serialization is a genuine `R-03` decision.

---

## 4. Method — how to rebuild against a live schema

**These rules exist because the database is authoritative here. Violating them risks a schema that no longer matches its own migration history.**

1. **Read the table first, then write the entity to match it.** Use `\d <table>` in psql. Column names, nullability, and types are the specification. Do not redesign.

2. **Never let TypeORM name a constraint for you in a hand-written migration.** Vendure compares live schema against entity metadata *by generated name*. Hand-chosen names such as `IDX_wishlist_item_customerId` cause a schema-mismatch warning on every boot even though the index is functionally correct. Take the generated names from the mismatch report itself (`CREATE INDEX "IDX_<hash>" ...`) and use those verbatim. Learned in `R-00`.

   **Foreign-key names are not derivable from index names.** They share a hash prefix but differ in the final character(s) — `IDX_357fa08ef2c105399118e54e68` pairs with `FK_357fa08ef2c105399118e54e681`, not `…68f`. Do not guess. Write the migration without the foreign keys, boot once, and copy the exact `ADD CONSTRAINT "FK_…"` statements the mismatch report prints. Guessing cost a full extra migration cycle in `R-02`.

3. **Guard every migration for tables that already exist.** Use `CREATE TABLE IF NOT EXISTS` and, for constraints — which Postgres cannot guard directly — a `DO $$ ... IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = ...) ... $$` block. A migration must be a no-op on this database and correct on a fresh one.

4. **Use `@EntityId()` for id columns, not `@Column()`.** `ID` resolves to `Object` under TypeScript's reflection and TypeORM rejects it. Same for nullable strings: `@Column({ type: 'varchar', nullable: true })`, never bare `@Column({ nullable: true })`.

5. **Plugin authoring dependencies are already installed** in `apps/server` (`@nestjs/common`, `@nestjs/graphql`, `typeorm`, `graphql`, `graphql-tag`, `@vendure/common`, `reflect-metadata`) and recorded in [`dependency-register.md`](dependency-register.md). pnpm's strict layout means a plugin cannot import them transitively.

6. **Verify with the boot check, not by inspection.** Start the server and read its schema comparison. Silence is the pass condition. `docs/implementation/migrations.md` governs migration policy generally.

7. **Regenerate storefront types after adding Shop API surface.** `pnpm exec gql-tada generate output` in `apps/storefront`, whose gql.tada schema points at `http://localhost:3000/shop-api`.

8. **Respect the SOT's plugin boundaries** (§0C). Do not create a plugin per entity, and do not merge domains into one plugin because it is convenient.

A completed reference implementation exists: `apps/server/src/plugins/lipek-content` (navigation) and `apps/server/src/plugins/customer-experience` (wishlist), both written against pre-existing tables, plus `apps/server/src/migrations/1788728508566-navigation-and-wishlist.ts`. **Read these before starting a new plugin.**

---

## 5. Rebuild tasks

Effort is order-of-magnitude sizing for one engineer fluent in Vendure plugin authoring, covering entities, services, GraphQL, Dashboard screens and tests. The only measured anchor is `R-00` (2 tables, 17 columns, ~half a day). State-machine tasks carry the widest error bars because specification precedes coding.

| ID | Task | Tables | Cols | Effort | Status |
| --- | --- | ---: | ---: | ---: | --- |
| `R-00` | Navigation + wishlist (reference implementation) | 3 | 22 | — | **DONE** (6 Sep) |
| `R-01` | Declare surviving `customFields` | — | 28 | 0.5 d | **DONE** (7 Sep) |
| `R-02` | `LipekContentPlugin` — remaining content entities | 10 | 102 | 5–8 d | **DONE** (7 Sep) |
| `R-03` | **Specify service stage vocabularies + timeline serialization (ADR)** | — | — | 1–2 d | **DRAFTED** (7 Sep) — [`ADR-0014`](../adr/ADR-0014-service-workflow-stage-vocabularies.md) proposed; awaiting sign-off on 6 open questions |
| `R-04` | `LipekSecurityPlugin` — TOTP, WebAuthn, MFA recovery, audit log | 6 | 44 | 5–8 d | **DONE** (7 Sep) — server side. Auth ceremonies per `ADR-0006` implemented, live-E2E-verified; browser-side MFA UI remains the `SEC-002`/`SEC-006` storefront/Dashboard half (Phase 1C) |
| `R-05` | `AppointmentsPlugin` — resources, slots, bookings | 3 | 27 | 3–5 d | **DONE** (7 Sep) — live-E2E-verified; Dashboard booking-management UX beyond the rosters is follow-up polish |
| `R-06` | `TailoringPlugin` — jobs, configurations, measurements, production timeline, fittings | 6 | 73 | 8–12 d | NOT STARTED |
| `R-07` | Commerce operations & `DocumentsPlugin` — returns, gift cards, documents, payment webhooks | 5 | 58 | 4–6 d | NOT STARTED |
| `R-08` | `AlterationsPlugin` — jobs, assessment, garments, work timeline | 4 | 47 | 5–8 d | NOT STARTED |
| `R-09` | `LaundryPlugin` — jobs, garments, cleaning, recurring plans, pickup/delivery | 6 | 74 | 7–10 d | NOT STARTED |
| `R-10` | `CrmPlugin` — leads, opportunities, cases, notes, interactions, segments | 10 | 100 | 6–9 d | NOT STARTED |
| `R-11` | `LoyaltyPlugin` — accounts, ledger, earning rules, rewards, referrals | 5 | 42 | 4–6 d | NOT STARTED |
| `R-12` | Search & personalisation — index, synonyms, benchmarks, recommendations | 7 | 86 | 6–9 d | NOT STARTED |
| `R-13` | `CustomerExperiencePlugin` — product alerts | 2 | 22 | 2–3 d | NOT STARTED |
| `R-14` | `AnalyticsEventsPlugin` — canonical event record | 1 | 6 | 1–2 d | NOT STARTED |
| `R-15` | AI action approvals (Phase 9/10 gated) | 1 | 13 | 2–3 d | NOT STARTED |
| | **Remaining total** | **66** | **694** | **56–87 d** | |

**Scope correction (7 Sep):** `api_key`, `api_key_translation` and
`api_key_channels_channel` are **Vendure 3.7 core entities**, not LIPEK ones —
core ships them with its own Dashboard screens. They were wrongly counted in
`R-04`, which is 6 tables and 44 columns, not 9 and 62.

### 5.1 Sequencing

Ordered by dependency rather than by original phase number. The phases were numbered for a greenfield build; this is not one.

1. `R-01` — cheapest possible win, and it silences the boot warning that currently masks real schema drift.
2. `R-02` — its data survived, so every entity has real rows to validate against. Cheapest confirmation that the transcribe-from-schema method scales.
3. `R-03` — a specification task that blocks three of the four most expensive items. Doing it early converts the program's biggest unknown into a decision.
4. `R-04` — gates every authenticated surface; `audit_log_entry` already holds 425 rows, so something was writing to it before the loss.
5. `R-05` then `R-06` — fittings *are* appointment bookings; building tailoring first would mean stubbing them and reworking.
6. `R-08` then `R-09` — both reuse the job → timeline → notification pattern `R-06` establishes; the third implementation is far cheaper than the first. `R-09` also needs `R-05`.
7. `R-07` — independent of the service modules. A good parallel track for a second engineer, or filler while `R-03` is pending.
8. `R-10`, `R-11` — feed on customer and order history, so they benefit from the service modules emitting events first.
9. `R-12`, `R-14`, `R-15` — search indexes content that must exist first; analytics is only meaningful once plugins emit; AI is phase-gated by `AGENTS.md`.

### 5.2 Notes per task

- **`R-04` is the highest risk per column.** `AGENTS.md` records MFA and social login as original engineering work with no reference implementation available, gated on `ADR-0006`/`ADR-0008`. Do not treat the surviving tables as permission to skip that design work.
- **`R-12` is the best-evidenced module.** 492 live rows in a 25-column `search_index_item` reveal the indexed document shape directly. Still gated on `ADR-0004` (OpenSearch hosting).
- **`R-11` is small but correctness-sensitive** — a points ledger must balance. Earning-rule semantics need re-deciding with the client.
- **`R-15` must not start before Phase 9 opens**, per the phase discipline in `AGENTS.md` and the SOT's rule against autonomous AI writes on day one.

---

## 5.3 Known gaps carried forward

- **Dashboard extensions are verified by the Vite build, not by `tsc`.** `@vendure/dashboard` ships raw `.tsx` source rather than built `.d.ts` (its package `exports` point at `src/lib/index.ts`), so pointing `tsc` at a dashboard extension pulls the whole library source into the program, where `skipLibCheck` does not apply because the files are not declarations. `pnpm --filter @lipek/server check:dashboard` runs `vendure build dashboard` instead, which is the real build path. The peer types the extensions need (`react`, `react-dom`, `react-hook-form`, `@tanstack/react-router`, `lucide-react`, `gql.tada`) are now direct devDependencies of `apps/server` so editors resolve them.
- **Most content is still `DRAFT`** — all 14 FAQs, all 4 policy documents, and 4 of 5 pages. They are correctly invisible to the storefront and can now be published from the Dashboard.

## 6. Environment facts the rebuild depends on

- The running Postgres container's password **differs from the value committed in `apps/server/docker-compose.yml`**. `apps/server/.env` is set to the live value. Reconcile before anyone runs `docker compose down -v` — the volume holds everything described in §3.
- The Dashboard in development is served by **Vite on `http://localhost:5173/dashboard`**, not by `apps/server` on `:3000`. `:3000/dashboard` serves from `dist/dashboard`, which requires `pnpm --filter @lipek/server build:dashboard`.
- The Dashboard's dev origin is allow-listed for CORS in `apps/server/src/plugins/lipek-security/origin-allow-list.ts` under `APP_ENV=dev` only. If Vite falls back off port 5173, add the origin via `LIPEK_ALLOWED_ORIGINS`.

---

## 7. Change log

| Date | Change |
| --- | --- |
| 2026-09-07 | `R-05` completed — `AppointmentsPlugin`. Entities transcribed 1:1 from the surviving schema, including its hand-named constraints: explicit `@Index` names and TypeORM's `foreignKeyConstraintName` pin the FK names, so the boot check passes with zero schema-mismatch warnings and no migration. Semantics recovered from the schema: `activeSlotId` (nullable, UNIQUE) is the double-booking guard — the database has the final word, the service's occupancy pre-check only makes the error readable — while `slotId` preserves the originally booked slot across reschedules; `resourceId` is denormalised onto the booking; `customerId`/`subjectType`/`subjectId` carry no FKs on purpose (bookings outlive subjects; tailoring fittings book through the polymorphic pair). Status vocabulary decided (`CONFIRMED`/`CANCELLED`/`COMPLETED` — the schema fixes only the default), transitions terminal-state-safe, all four lifecycle events published and recorded in `event-model.md`. Shop API: `availableSlots` (public), `bookAppointment`/`myAppointmentBookings`/`cancelMyAppointmentBooking` (ownership-scoped). Admin API: resource/slot CRUD, staff booking, cancel/reschedule/complete. Dashboard: Resources (list + detail) and a bookings roster. Verified: typecheck clean, 8 unit tests on the pure booking rules, live-server E2E (`tests/appointments/appointments-live.e2e.mjs`, 10 checks — double-book guard, reschedule semantics, freed-slot rebooking, cancel/complete), clean boot. |
| 2026-09-07 | `R-04` completed (server side) — the authentication ceremonies. A single MFA-aware strategy replaces the native `AuthenticationStrategy` under the same `'native'` name on both APIs (keeping the stock strategy registered would be a complete MFA bypass); WebAuthn passkey registration/assertion with single-use challenges and counter-monotonicity; RFC 6238 TOTP with single-use time steps and AES-256-GCM-encrypted secrets (envelope-embedded `enrolled` flag instead of a schema column — the surviving schema is authoritative); hashed single-use backup codes; expiring support-issued recovery codes with a fail-closed re-enrollment ceremony (password + recovery code registers a *new* passkey, never a session); privileged-account WebAuthn-specific enforcement with recovery-code re-enrollment as the plausible lockout path and `LIPEK_MFA_ENFORCEMENT=off` as break-glass; auth-specific rate limiting on anonymous ceremony endpoints; full audit hooks; Dashboard audit-log viewer (`ReadAuditLog`-gated). Entities realigned to the surviving schema (`totp_credential`/`mfa_recovery_code` UNIQUE(userId), `web_authn_credential` UNIQUE(credentialId) with no userId index and FK without `ON DELETE`). Verified: typecheck clean, 17 unit tests, a live-server E2E (`tests/security/totp-live.e2e.mjs`, 11 checks including single-use replay rejection and audit-trail assertions), clean boot with zero schema-mismatch warnings, dashboard Vite build passing. |
| 2026-09-07 | `R-02` completed — Admin API CRUD for all ten entities behind a new `Content` CRUD permission, plus colocated Dashboard screens (9 nav entries, list + detail, generated from one resource table). Fixed the recovered `page-section-config-input.tsx`, which had been committed with transcript line-number prefixes on all 112 lines and had therefore never compiled. |
| 2026-09-07 | `R-02` storefront half — 10 content entities, guarded migration `1788772145966-content-entities.ts`, read-only Shop API, and a static test pinning the published-only guarantee. |
| 2026-09-07 | Plan created. `R-01` completed — 28 custom field declarations restored in `apps/server/src/custom-fields.ts`. |
| 2026-09-06 | `R-00` completed — navigation and wishlist rebuilt as the reference implementation. |

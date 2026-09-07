# ADR-0014: Service Workflow Stage Vocabularies and Timeline Serialization

**Status:** Accepted — 2026-09-07. The six questions in §5 were decided as proposed; each now records the decision and its rationale.
**Date:** 2026-09-07
**Rebuild task:** `R-03` (see [`BACKEND_REBUILD_PLAN.md`](../implementation/BACKEND_REBUILD_PLAN.md))

## Context

The Tailoring, Alterations and Laundry modules were built between 26–29 August 2026 and lost with unpushed commits. Their database schema survived; their TypeScript did not.

Those workflows are event-sourced through timeline tables rather than status columns. `production_timeline`, `alteration_work_timeline` and `service_timeline` each hold a `currentStage` column that is a plain `varchar` with **no enum type, no CHECK constraint, and zero rows**. Nothing about the permitted values is recoverable from the database.

SOT §9A states the principle every transition must satisfy — validate the previous state, validate permissions, record timestamp and actor, emit a domain event, optionally notify the customer, optionally enqueue downstream work — but not the values themselves.

**However, the sequences *are* documented.** SOT §10.2, §12.2 and §13.2 each give the full ordered list as an ASCII flow diagram. This was initially missed because those diagrams contain none of the terms a search for "stage" or "state machine" matches. The vocabularies therefore need transcribing, not inventing.

What the SOT does *not* settle is how those sequences behave: whether stages may be skipped or revisited, how cancellation relates to them, how the timeline columns serialize, or who may perform each transition.

## Decision

### 1. Stage identifiers are transcribed from the SOT

Stored in `currentStage` as the `SCREAMING_SNAKE_CASE` identifier. Display labels stay in the presentation layer — SOT §9A permits localized labels while keeping transition rules as controlled business logic, so the stored value must be the stable identifier, never the label.

**Tailoring** — `production_timeline.currentStage`, from SOT §10.2:

| # | Identifier | SOT label |
| --- | --- | --- |
| 1 | `ORDER_CONFIRMED` | Order Confirmed |
| 2 | `MEASUREMENTS_TAKEN` | Measurements Taken |
| 3 | `FABRIC_CONFIRMED` | Fabric Confirmed |
| 4 | `PATTERN_CREATED` | Pattern Created |
| 5 | `CUTTING` | Cutting |
| 6 | `SEWING` | Sewing |
| 7 | `FIRST_FITTING` | First Fitting |
| 8 | `ADJUSTMENTS` | Adjustments |
| 9 | `FINAL_FITTING` | Final Fitting |
| 10 | `QUALITY_CONTROL` | Quality Control |
| 11 | `READY_FOR_HANDOVER` | Ready for Pickup / Delivery |
| 12 | `COMPLETED` | Completed |

**Alterations** — `alteration_work_timeline.currentStage`, from SOT §12.2:

| # | Identifier | SOT label |
| --- | --- | --- |
| 1 | `RECEIVED` | Received |
| 2 | `ASSESSMENT` | Assessment |
| 3 | `QUOTE_APPROVED` | Quote Approved |
| 4 | `IN_ALTERATION` | In Alteration |
| 5 | `QUALITY_CHECK` | Quality Check |
| 6 | `READY_FOR_PICKUP` | Ready for Pickup |
| 7 | `COMPLETED` | Completed |

**Laundry** — `service_timeline.currentStage`, from SOT §13.2:

| # | Identifier | SOT label |
| --- | --- | --- |
| 1 | `ORDER_RECEIVED` | Order Received |
| 2 | `GARMENTS_COLLECTED` | Garments Collected |
| 3 | `INSPECTION` | Inspection |
| 4 | `CLEANING` | Cleaning / Dry Cleaning |
| 5 | `STAIN_TREATMENT` | Stain Treatment |
| 6 | `PRESSING` | Pressing |
| 7 | `QUALITY_CHECK` | Quality Check |
| 8 | `PACKAGING` | Packaging |
| 9 | `OUT_FOR_DELIVERY` | Out for Delivery |
| 10 | `DELIVERED` | Delivered |

Two labels are collapsed deliberately. "Ready for Pickup / Delivery" is one stage, `READY_FOR_HANDOVER`, because the garment's production state is identical either way; how it reaches the customer is a fulfilment concern. "Cleaning / Dry Cleaning" is one stage, `CLEANING`, because the distinction is a property of the service purchased, not of the job's progress.

### 2. The vocabulary is enforced in the application layer

The columns stay `varchar`. No Postgres enum, no CHECK constraint. This matches the surviving schema, avoids a migration every time a stage is added, and keeps SOT §9A's "transition rules remain controlled business logic" true. Each plugin exports a `const` union and validates on transition, exactly as `ContentStatus` does in `LipekContentPlugin`.

### 3. Timeline serialization

`stageTimestamps` and `stageActorIds` are `text` columns holding JSON objects keyed by stage identifier:

```jsonc
// stageTimestamps
{ "ORDER_CONFIRMED": "2026-09-07T09:12:44.000Z", "MEASUREMENTS_TAKEN": "2026-09-08T14:03:10.000Z" }

// stageActorIds — the Administrator id that performed each transition
{ "ORDER_CONFIRMED": "1", "MEASUREMENTS_TAKEN": "7" }
```

Keys are only present for stages actually reached, which makes the object itself the audit trail and lets a skipped stage be distinguished from a pending one. Entities map them with TypeORM's `simple-json`, the same as `PageSection.config`.

### 4. Cancellation is not a stage

All three job tables carry a nullable `cancelledAt`, and none of the SOT sequences contains a cancelled state. Cancellation is therefore recorded as a timestamp on the job, orthogonal to `currentStage`, which preserves the stage the job had reached when it was cancelled. A job with `cancelledAt` set accepts no further transitions.

## 5. Decisions on the six open questions

**Decided 2026-09-07.** Each was resolved as proposed.

1. **Stages may be skipped forward.** `STAIN_TREATMENT` does not apply to every laundry job and `ADJUSTMENTS` is unnecessary when a first fitting passes cleanly, so requiring every stage would force staff to record fictions. A skip is recorded by the absence of that key in `stageTimestamps`, which keeps "skipped" and "not yet reached" distinguishable. Backward skips are rejected.

2. **Exactly one backward transition exists: `FINAL_FITTING` → `ADJUSTMENTS`.** A failed final fitting genuinely returns the garment to the bench, and modelling that as a new job would break the link to its measurements and deposit. Every other transition is forward-only. Re-entering `ADJUSTMENTS` overwrites its `stageTimestamps` entry with the later time, because the operational question staff ask is "when did this last enter adjustments".

3. **`service_timeline.currentStage` is canonical for all ten laundry stages.** `pickup_delivery` holds logistics facts only — addresses, scheduled and completed times, proof-of-delivery assets. Splitting the stage across two tables would make "where is this job" a two-table question with no single ordering, and the customer-facing tracker needs one answer.

4. **Transitions require the module's Update permission; operational stages additionally require that the actor is the assigned staff member, an unassigned job, or a supervisor.** An assigned tailor may not advance another tailor's job, because `stageActorIds` is an accountability record and shared advancement would make it meaningless. Supervisors are exempt so that absence never blocks a job.

5. **Customer notifications fire on `READY_FOR_HANDOVER`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY` and `DELIVERED` only.** These are the transitions that require the customer to *do* something or that complete the service. Intermediate production stages are visible in tracking but do not notify, which keeps cost proportionate and avoids training customers to ignore messages.

6. **`READY_FOR_HANDOVER` is adopted for Tailoring.** The garment's production state is identical whether it is collected or delivered; the difference is a fulfilment concern already carried by the order. Alterations keeps the SOT's `READY_FOR_PICKUP` because that module has no delivery option.

## Consequences

- `R-06`, `R-08` and `R-09` gain a fixed vocabulary and can be estimated properly; the schedule risk in those tasks drops from "undefined behaviour" to "defined behaviour, unwritten code".
- [`event-model.md`](../architecture/event-model.md) must grow from its eight seed events to one event per transition — 29 across the three machines — as each plugin lands. That document already anticipates this.
- The `varchar` choice means a typo can be persisted. Every module must validate on write, as `ContentAdminService.assertValidStatus` does today; a test pinning that guarantee should accompany each plugin.
- If sign-off changes question 3 or 6, the affected entity definitions change but no migration is required — both concern which column carries a value, not the schema.

## Alternatives considered

**Postgres enum types.** Rejected: it contradicts the surviving schema, requires a migration per vocabulary change, and SOT §9A explicitly locates transition rules in business logic rather than the database.

**Deriving stages from timeline rows instead of a `currentStage` column.** Rejected: the column exists in the surviving schema and is the cheapest read for list views and customer tracking. `stageTimestamps` already provides the full history.

**Re-deciding the vocabularies with the client from scratch.** Rejected once SOT §10.2/§12.2/§13.2 were found. The SOT is authoritative per §0.1, and inventing a parallel vocabulary would put code in conflict with the product specification.

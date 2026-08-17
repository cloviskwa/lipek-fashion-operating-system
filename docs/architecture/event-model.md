# Event Model

**Status:** Derived (skeleton — established by `FOUND-022`, expands as plugins publish real events)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §40

## Naming convention

`<Entity><PastTenseAction>` (e.g. `OrderCreated`, `PaymentSettled`), published via Vendure's EventBus. Every event carries at minimum: entity ID, actor (system/customer/staff ID), timestamp, and a schema version.

## Canonical event catalog (seed list — extend, don't fork a second event system)

```text
CustomerCreated, CustomerRegistered
OrderCreated, PaymentSettled, OrderCancelled, OrderFulfilled, OrderDelivered
ReturnRequested, RefundCompleted
TailoringStarted, FittingScheduled, TailoringCompleted
LaundryCollected, LaundryCompleted, LaundryDelivered
AlterationStarted, AlterationCompleted
```

Each state-machine transition (Tailoring/Alterations/Laundry, source of truth §9A) emits its own event beyond this seed list — recorded here as each plugin's `*-002` state-machine task lands. Consumers: `CONTENT-007` (cache revalidation), `OPS-001`/`OPS-002` (analytics), `CRM-009` (marketing automation), `AI-007` (human handoff triggers).

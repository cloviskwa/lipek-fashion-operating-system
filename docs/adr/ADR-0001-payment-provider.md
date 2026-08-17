# ADR-0001: Payment Provider

**Status:** Accepted (provisional default — must be reconfirmed before production go-live)
**Date:** 2026-08-17

## Context

The source of truth marks Stripe "PROVISIONAL — confirm client merchant eligibility/country requirements" (§0.3). LIPEK's current storefront content targets Cameroon. Commerce scaffolding must not block on this, since Vendure's payment abstraction (`COM-014`) is provider-agnostic by design.

## Decision

Build `COM-014`'s payment-provider adapter first, against Vendure's native payment-method abstraction. Target **Stripe** as the default integration (`COM-015`) for development and staging. Before production go-live, explicitly reconfirm Stripe's direct merchant support and local payment-method coverage for the client's actual operating country; if unsupported, swap the concrete adapter behind the same abstraction — no domain code should need to change.

## Consequences

- `COM-014`/`COM-015` may proceed without waiting on a final vendor commitment.
- A production-readiness gate (`MASTER_IMPLEMENTATION_PLAN.md` §14, item 10) blocks go-live until this ADR's provisional status is upgraded to final.
- If a regional processor is required, a payment-orchestration layer may be needed for later multi-region expansion (source of truth §33) — tracked as a future ADR, not invented here.

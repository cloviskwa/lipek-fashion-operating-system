# ADR-0004: OpenSearch Hosting

**Status:** Deferred by design — no decision made, none needed yet
**Date:** 2026-08-17

## Context

Source of truth §3.4/§16A/§52E is explicit: do not add OpenSearch before the catalog/search requirements justify it. This is a Phase 8 concern (`SEARCH-004` relevance decision gate), not a Phase 0/1 concern.

## Decision

No decision is made now. Launch and scale on Vendure's `DefaultSearchPlugin` + PostgreSQL. `SEARCH-001`–`SEARCH-003` (Phase 8) measure real relevance/performance against the production catalog; `SEARCH-004` is the formal go/no-go gate. Only if that gate passes does this ADR get revisited with a concrete self-hosted-vs-managed decision.

## Consequences

- No infrastructure cost or operational overhead is introduced prematurely.
- `SEARCH-005` cannot start until this ADR is updated with an actual decision, which requires `SEARCH-004`'s gate to pass first.

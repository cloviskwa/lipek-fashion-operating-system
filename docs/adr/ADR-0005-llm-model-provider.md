# ADR-0005: LLM Model Provider(s) for Mastra

**Status:** Accepted (provisional default for Phase 9 pilot — must be reconfirmed before Phase 10 production/write-capable rollout)
**Date:** 2026-08-17

## Context

The source of truth explicitly decouples LIPEK's business logic from a single model vendor (§3.3) — Mastra's model layer is provider-agnostic by design. Cost, latency, function/tool-calling reliability, and data-residency terms differ by provider, and are more consequential once write-capable (ACTION-class, Phase 10) tools are involved.

## Decision

Start Phase 9's read-only pilot behind Mastra's provider-agnostic config with a single well-supported provider (Anthropic Claude, given its strong tool-calling reliability and the safety-first rollout this platform requires per source of truth §51). Do not hard-code any LIPEK domain logic against provider-specific APIs — all model access goes through Mastra's abstraction. Revisit this decision explicitly before Phase 10's ACTION-class tools go live, and again before any multi-provider routing strategy (e.g. a cheaper model for read-only lookups, a stronger model for the stylist agent) is introduced.

## Consequences

- `AI-001` can scaffold immediately against a concrete provider without blocking on further research.
- A second review is mandatory before `AI-014` (ACTION-class tools) per `MASTER_IMPLEMENTATION_PLAN.md`'s Phase 9→10 completion gate.

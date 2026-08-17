# ADR-0010: AEO (Answer-Engine Optimization) Strategy

**Status:** Accepted
**Date:** 2026-08-17

## Context

This engagement requires SEO + AEO. AEO is not addressed in the source of truth text and has no standardized spec yet (`llms.txt`/AI-crawler conventions are still forming) — over-committing early risks building against a convention that changes.

## Decision

Sequence AEO strictly after traditional SEO stabilizes, not in parallel with unstable content architecture. Ship strong technical SEO + structured data first (Phase 3, `SEO-001`–`SEO-005`), then add a `llms.txt` file plus machine-readable FAQ/Q&A endpoints sourced from the same CMS content (Phase 9, `SEO-006`) once the content model is stable enough that the AEO surface won't need to be rebuilt. Monitor emerging AI-crawler conventions and adjust rather than over-engineering now.

## Consequences

- `SEO-006` is explicitly sequenced in Phase 9, not Phase 3, avoiding wasted rework.
- No new service is introduced — AEO is a storefront rendering concern over backend-owned content, identical in shape to traditional SEO.

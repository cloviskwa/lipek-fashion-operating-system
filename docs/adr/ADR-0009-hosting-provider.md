# ADR-0009: Hosting / Cloud Provider

**Status:** Deferred by design — provisional local/dev target only
**Date:** 2026-08-17

## Context

Marked "UNDECIDED" in the source of truth (§0.3). Must support persistent Vendure Server + Worker processes, PostgreSQL, Redis, and later OpenSearch — ruling out the client's previously configured serverless/static hosts (Netlify, Vercel) for the backend. Local/dev work is unblocked regardless via Docker Compose.

## Decision

No final vendor is selected now. The only binding decision at this stage: **local development must run via Docker Compose with production-equivalent service topology** (`FOUND-018`), so that whatever hosting target is eventually chosen is a lift-and-shift, not a rewrite. Final selection — a container/VM host or managed platform close to the client's operating region, with a CDN in front for the storefront's static/edge assets — is made in Phase 11 (`OPS-014`) with real capacity/region/cost data.

## Consequences

- No infrastructure spend or lock-in decision is made prematurely.
- `FOUND-018` and all Docker Compose work must stay honest to production-equivalent topology so this ADR's eventual resolution doesn't force architecture changes.
- `netlify.toml`/`vercel.json` (deleted in the prior prototype repository) are not reintroduced until this ADR resolves, and even then only for the storefront's static/edge layer, not the backend.

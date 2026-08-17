# Deployment Topology

**Status:** Provisional — final shape depends on `docs/adr/ADR-0009-hosting-provider.md`, which is explicitly deferred to Phase 11
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §52A

## Target shape (unchanged regardless of final hosting vendor)

```text
                         INTERNET
                            │
                      CDN / WAF / TLS
                            │
              ┌─────────────┴─────────────┐
              │                           │
       Next.js Storefront             Public AI Route
              │                           │
              │                       Mastra Service (apps/ai)
              │                           │
              └──────────────┬────────────┘
                             │
                     Vendure Shop API
                             │
                 ┌───────────┴───────────┐
                 │                       │
          Vendure Server           Vendure Worker(s)
                 │                       │
                 └───────────┬───────────┘
                             │
          ┌──────────────────┼───────────────────┐
          │                  │                   │
     PostgreSQL           Redis/BullMQ      Object Storage
     + pgvector          (Phase 11, or       S3-compatible
                          earlier if load     (ADR-0003)
                          demands it)
          │
       OpenSearch
       (Phase 8, if ADR-0004 gate passes)
```

The Vendure Admin API/Dashboard must be protected more strongly than the public Shop API and must not share the same public edge policy unnecessarily.

## Local development target (binding now, unlike the production vendor choice)

Docker Compose (`infra/compose`) must run PostgreSQL + Redis (+ OpenSearch profile, disabled until Phase 8) with production-equivalent topology, so that whichever hosting vendor `ADR-0009` eventually selects is a lift-and-shift. This is set up in `FOUND-018`.

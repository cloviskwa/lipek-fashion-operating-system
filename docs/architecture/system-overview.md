# System Overview

**Status:** Derived (skeleton — expand as Phase 1 bootstrap lands)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §2–§3

## Verified-as-of note (FOUND-002)

As of this Phase 0 audit (2026-08-17): Vendure Core current stable is **3.7.0**; the official Vendure Next.js storefront starter targets **Next.js 16 / React 19** (`vendurehq/nextjs-starter-vendure`, actively maintained). Re-verify both at the moment of `FOUND-014` bootstrap — do not trust this note if more than a few weeks have passed.

## High-level architecture

```text
                         LIPEK PLATFORM
                                │
        ┌───────────────────────┴────────────────────────┐
        │                                                │
 CUSTOMER EXPERIENCE                              STAFF EXPERIENCE
        │                                                │
 Next.js Web Store (apps/storefront)                Vendure React Dashboard
 PWA / Mobile Apps (apps/mobile/*)                  + LIPEK Dashboard Extensions
 Customer Account                                   (colocated per-plugin:
 AI Assistant (Phase 9+)                              apps/server/src/plugins/*/dashboard)
        │                                                │
        └────────────────────────┬───────────────────────┘
                                 │
                         PLATFORM API LAYER
                    Vendure Core / NestJS + LIPEK Plugins (apps/server)
                                 │
     ┌──────────────┬────────────┼────────────┬───────────────┐
     │              │            │            │               │
 Vendure       Tailoring    Alterations     Laundry          CRM
 Core            Plugin        Plugin         Plugin         Plugin
     │              │            │            │               │
     └──────────────┴────────────┼────────────┴───────────────┘
                                 │
                            PostgreSQL + pgvector
                                 │
          ┌──────────────────────┼───────────────────────┐
          │                      │                       │
      Search Layer         Mastra AI Service        Analytics/Event Layer
      (apps/server)          (apps/ai, Phase 9+)      (apps/server)
```

Not yet built: everything above except this document. `apps/server` and `apps/storefront` are bootstrapped in `FOUND-014`.

## Ports/services (filled in once `FOUND-014`/`FOUND-018` land)

| Service                                | Local port | Notes                                                                                   |
| -------------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `apps/server` (Vendure Shop/Admin API) | TBD        | Set at bootstrap                                                                        |
| `apps/server` (Vendure Dashboard)      | TBD        | Set at bootstrap                                                                        |
| `apps/storefront`                      | TBD        | Set at bootstrap                                                                        |
| PostgreSQL                             | TBD        | Docker Compose, `infra/compose`                                                         |
| Redis                                  | TBD        | Docker Compose, introduced ahead of schedule if Phase 1 load requires it, else Phase 11 |

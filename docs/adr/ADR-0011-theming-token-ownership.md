# ADR-0011: Dashboard/Storefront/Mobile Theming Token Ownership Model

**Status:** Accepted
**Date:** 2026-08-17

## Context

This engagement requires dark/light theming across the storefront, the Vendure Dashboard extensions, and the mobile apps. A decision is needed on whether token *values* are owned once or duplicated per renderer.

## Decision

Single source of token values in `packages/ui` (seeded now from the prior prototype's `src/styles/variables.css`, ported to `packages/ui/src/tokens/`), with a thin per-renderer bridge: CSS custom properties for the web storefront (`THEME-002`), the Dashboard extension theming hooks (`THEME-003`), and native theming APIs for mobile (`THEME-004`). No renderer redefines a token value independently.

## Consequences

- `THEME-001` (Phase 2) establishes the paired light/dark token set once; `THEME-002`–`THEME-004` are bridge implementations only, never a second source of truth for color/spacing/type values.
- A rebrand or palette change touches exactly one place.

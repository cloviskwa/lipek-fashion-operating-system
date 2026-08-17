# ADR-0007: Mobile/Native App Strategy

**Status:** Accepted
**Date:** 2026-08-17

## Context

This engagement requires app-readiness on Android/iOS for three distinct audiences: customer, delivery/courier, and staff/admin. A disconnected Capacitor scaffold (`mobile-wrapper/`, now seeded into `apps/mobile/customer/`) already existed in the prior prototype repository but did not distinguish audiences or integrate with any real app.

## Decision

Hybrid strategy, one approach per audience, matching each audience's actual technical needs rather than forcing one framework everywhere:

1. **Customer app (`apps/mobile/customer`):** Capacitor, wrapping the Next.js PWA (`apps/storefront`) once it exists. Matches source of truth §35 ("PWA first, native apps come later and reuse platform APIs") and maximizes code reuse. Seeded now from the prior prototype's Capacitor scaffold.
2. **Delivery/courier app (`apps/mobile/delivery`):** Native (React Native/Expo), built in Phase 6 (`MOBILE-003`). Background GPS reliability, guaranteed push delivery, and a camera-heavy proof-of-delivery flow are native-API-dependent enough that a Capacitor wrapper would be a worse fit.
3. **Staff/admin (`apps/mobile/staff`):** No dedicated native app initially — the Vendure Dashboard (already a responsive React application) is validated on tablets in Phase 11 (`MOBILE-004`). Admin work is primarily desk/tablet-based; revisit only if a concrete on-the-go admin requirement emerges.

## Consequences

- `MOBILE-001` (Phase 3) can proceed immediately using the seeded `apps/mobile/customer` scaffold.
- `MOBILE-003` (Phase 6) is scoped as new native development, not a Capacitor extension.
- `apps/mobile/staff` remains a placeholder unless this ADR is revisited.

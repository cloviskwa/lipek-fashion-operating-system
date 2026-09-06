# LIPEK — uncommitted 2026-09-05 work recovered from Cline transcript

Session: 1788646162979_g3uz0  (started 2026-09-05 22:09 UTC)
Base: origin/main @ 469947d (last push 2026-08-25). The local repo at incident
time was AHEAD of origin (unpushed doc commits) — some doc edits below could not
be auto-applied because the pushed base differs. Each is listed with exact text.

---

## [1] INSERT @3 — docs/architecture/storefront-design-experience-spec.md

```
**Status:** Derived — subordinate to `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` (see SOT §5B) and to `storefront-architecture.md`
**Transferred:** 5 September 2026 (customer-provided frontend design & experience specification, content unaltered)
**Relationship to SOT:** Defines the storefront's custom visual/interaction design language. SOT §5A (backend-driven composition) governs section *content and references*; this spec governs section *design*. Backend-driven data, frontend-driven design. Framer Motion and Aceternity UI are proposed libraries — not yet locked; any adoption is recorded in `dependency-register.md` per SOT §0.2.
```

---

## [2] REPLACE — docs/implementation/DOCUMENTATION_MAP.md

OLD:
```
| `storefront-architecture.md`       | Derived       | Pending (`FOUND-005`)                                          | Operationalizes SOT §3.1/§6A                                                                                                                                                                                                                                                                                              |
```

NEW:
```
| `storefront-architecture.md`       | Derived       | Pending (`FOUND-005`)                                          | Operationalizes SOT §3.1/§6A                                                                                                                                                                                                                                                                                              |
| `storefront-design-experience-spec.md` | Derived   | **Created (transferred 2026-09-05, per SOT §5B)**              | The storefront's custom frontend design & experience language: page composition, motion, component architecture, F1–F7 implementation sequence. Subordinate to SOT §5A (backend-driven content) — governs design only                                                                                                       |
```

---

## [3] REPLACE — docs/architecture/storefront-architecture.md

OLD:
```
`apps/storefront` is a **renderer of backend-owned data**, never a system of record (source of truth §3.1). It is bootstrapped in `FOUND-014` from the official Vendure Next.js starter (Next.js 16 / React 19, verified — see `system-overview.md`), not evolved from `_reference/legacy-prototype/`.
```

NEW:
```
`apps/storefront` is a **renderer of backend-owned data**, never a system of record (source of truth §3.1). It is bootstrapped in `FOUND-014` from the official Vendure Next.js starter (Next.js 16 / React 19, verified — see `system-overview.md`), not evolved from `_reference/legacy-prototype/`.

**Frontend design language:** the storefront's custom visual/interaction design — page composition, motion language, component strategy, and the F1–F7 homepage/page redesign sequence — is governed by [`storefront-design-experience-spec.md`](storefront-design-experience-spec.md) (Derived, per SOT §5B: frontend-owned design, backend-fed content).
```

---

## [4] REPLACE — docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md

OLD:
```
This keeps design quality controlled while empowering the client to operate content without code.

---

# 6. Product Detail Experience
```

NEW:
```
This keeps design quality controlled while empowering the client to operate content without code.

## 5B. Storefront Design Is Custom Frontend-Owned, Backend-Fed

The storefront's visual and interaction design must be **custom-made by the frontend** — it must never render as a generic commerce template. Backend-driven composition (§5A) governs *content and references*; it does not govern *design*. The division of ownership is:

- **Frontend owns (design):** visual composition, section component design and rendering rules, art direction, typography treatment, spacing rhythm, grid geometry, image ratios, animation/motion choreography, hover and interaction behavior, product-card and editorial-card treatment, responsive behavior, and design-specific microcopy and structural labels.
- **Backend owns (content, where necessary):** products, prices, inventory, collections, categories, facets, promotions, campaigns, operational content, editorial records, and every piece of business data staff must be able to edit from the Dashboard without a code change.

The authoritative frontend design & experience specification is `docs/architecture/storefront-design-experience-spec.md` (Derived, subordinate to this document). It defines the homepage section grammar (§9), per-page visual character (§55), motion language (§6), component architecture (§52), and the F1–F7 implementation sequence (§56). All storefront UI work must follow it; where it appears to conflict with this SOT, the SOT wins and the spec is corrected. New UI libraries proposed by the spec (e.g. Framer Motion, Aceternity UI) are installed only with a recorded purpose in `docs/implementation/dependency-register.md` (§0.2).

---

# 6. Product Detail Experience
```

---

## [5] REPLACE — docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md

OLD:
```
**Last Technical Review:** 17 August 2026
```

NEW:
```
**Last Technical Review:** 5 September 2026
```

---

## [6] REPLACE — docs/implementation/MASTER_IMPLEMENTATION_PLAN.md

OLD:
```
**Progress:** Current implementation status as of 2026-08-29: Phase 0 through Phase 9 are implemented through their current acceptance-evidence documents. Payment, email/SMS, push notification, object-storage, OpenSearch, AI provider secrets and native app-store provider configuration remains deferred behind ADR/provider decisions per owner direction. The detailed task table below remains the authoritative execution plan and should be read as the original roadmap unless a domain document records newer acceptance evidence.
```

NEW:
```
**Progress:** Current implementation status as of 2026-08-29: Phase 0 through Phase 9 are implemented through their current acceptance-evidence documents. Payment, email/SMS, push notification, object-storage, OpenSearch, AI provider secrets and native app-store provider configuration remains deferred behind ADR/provider decisions per owner direction. The detailed task table below remains the authoritative execution plan and should be read as the original roadmap unless a domain document records newer acceptance evidence. **Update (2026-09-05):** the owner has directed the storefront frontend-design program (custom-designed pages, backend-fed content — SOT §5B) as the active frontier; the design spec is `docs/architecture/storefront-design-experience-spec.md` and its F1–F7 sequence is tracked in `PHASE_3_STOREFRONT_EXPERIENCE.md`.
```

---

## [7] REPLACE — docs/implementation/PHASE_3_STOREFRONT_EXPERIENCE.md

OLD:
```
## Known Follow-Ups

- Run real Lighthouse and axe/Playwright audits once a stable production-like preview with seeded catalog/content exists.
- Replace SVG-only manifest icons with platform-generated PNG/icon bundles before store submission if target review tooling requires PNG assets.
- Replace the local Capacitor `server.url` with the production storefront origin during release packaging.
```

NEW:
```
## Known Follow-Ups

- Run real Lighthouse and axe/Playwright audits once a stable production-like preview with seeded catalog/content exists.
- Replace SVG-only manifest icons with platform-generated PNG/icon bundles before store submission if target review tooling requires PNG assets.
- Replace the local Capacitor `server.url` with the production storefront origin during release packaging.

## Frontend Design & Experience Program (F1–F7) — In implementation

**Authority:** [`../architecture/storefront-design-experience-spec.md`](../architecture/storefront-design-experience-spec.md) (Derived, per SOT §5B — created 2026-09-05).
**Principle:** backend-driven data, frontend-driven design. Every page is custom-designed; business content (products, collections, campaigns, editorial, service content) is fetched from the backend (Shop API / backend-composed section references per SOT §5A) — never hard-coded in components.

Implementation sequence (spec §56), tracked here:

| Step | Scope | Status |
|---|---|---|
| F1 | Structural shell: utility bar, header, mega navigation, footer, sticky mobile navigation, shared motion primitives (`src/lib/motion`) | **Started 2026-09-05** — motion primitives first |
| F2 | Hero commerce zone, trust strip, featured category discovery, section rhythm | Pending |
| F3 | Commerce modules: product card system, new arrivals, limited drop, discovery tabs, recommendations | Pending |
| F4 | Editorial fashion: African Fashion story, Shop the Look, Custom Tailoring feature, accessories feature | Pending |
| F5 | Services & brand story: LIPEK Services, brands, testimonials, video, Journal | Pending |
| F6 | Intelligent/utility: AI Stylist teaser, support assistant, PWA promotion, newsletter | Pending |
| F7 | Responsive/motion/performance polish: mobile-first layouts, reduced motion, image optimization, accessibility, Core Web Vitals | Pending |

Library note: `framer-motion` installed in `apps/storefront` (recorded in `dependency-register.md`). `aceternity/ui` remains **not installed** — adopt selectively per spec §5.2, with a dependency-register entry at that time. shadcn/ui, Tailwind CSS 4 and the existing `src/components/ui` primitives are already in place and are the interaction base to restyle per spec §5.1.
```

---

## [8] REPLACE — docs/implementation/dependency-register.md

OLD:
```
| `@lipek/ui`                                                                                                    | workspace                 | Shared LIPEK storefront theme bridge and design tokens (`THEME-002`)                             | runtime | Internal    | `THEME-002` |
```

NEW:
```
| `@lipek/ui`                                                                                                    | workspace                 | Shared LIPEK storefront theme bridge and design tokens (`THEME-002`)                             | runtime | Internal    | `THEME-002` |
| `framer-motion`                                                                                                | 13.2.0 (via `^13.2.0`)    | Storefront motion language — shared reveal/stagger/parallax/crossfade primitives for the custom frontend design program (SOT §5B, `storefront-design-experience-spec.md` §6/§54, Phase 3 F1) | runtime | MIT | Phase 3 F1 (2026-09-05) |
```

---

## [9] CREATE — apps/storefront/src/lib/motion/transitions.ts

```
/**
 * LIPEK storefront motion language — shared timing and easing constants.
 *
 * Source: docs/architecture/storefront-design-experience-spec.md §6 ("LIPEK
 * Motion Language") and §54 ("Reusable Motion Components"). Governed by SOT §5B:
 * frontend owns motion design; backend owns content.
 *
 * Rules from the spec:
 * - no motion without purpose
 * - retail interactions stay fast (DURATION.fast)
 * - editorial sections may be cinematic (DURATION.slow)
 * - every consumer must respect `prefers-reduced-motion`
 *   (the primitives in this folder do this via useReducedMotion)
 */

/** Signature LIPEK ease — smooth deceleration for reveals and clip wipes. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Gentler deceleration for secondary elements. */
export const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];

/** Balanced ease for crossfades and layout transitions. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DURATION = {
  /** Retail interactions: hovers, tabs, badges, crossfades. Keep < 300ms. */
  fast: 0.25,
  /** Standard section reveals, drawer slides, accordions. */
  base: 0.55,
  /** Cinematic editorial moments: hero clips, large photography, wipes. */
  slow: 0.85,
} as const;

/** Standard fade + rise distance for text entrance (spec §6: 16–32px). */
export const RISE_DISTANCE = {
  /** Supporting text, labels, body copy. */
  text: 16,
  /** Headings and section titles. */
  heading: 24,
  /** Large editorial blocks. */
  editorial: 32,
} as const;

/** Subtle parallax travel in px (spec §6: 2–5% — never scroll-jacking). */
export const PARALLAX_RANGE = {
  subtle: 12,
  standard: 24,
} as const;

```

---

## [10] CREATE — apps/storefront/src/lib/motion/reveal.tsx

```
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DURATION, EASE_OUT_EXPO, RISE_DISTANCE } from "./transitions";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds — use for choreographed sequences (hero: label → headline → CTAs). */
  delay?: number;
  /** Rise distance in px (spec §6: fade + 16–32px rise). */
  distance?: (typeof RISE_DISTANCE)[keyof typeof RISE_DISTANCE];
  /**
   * Animate on mount instead of on scroll into view. Use for above-the-fold
   * content that is already visible at first paint (hero sequence).
   */
  animateOnMount?: boolean;
};

/**
 * Reveal — the default entrance for headings, text and blocks (spec §6:
 * "Fade + 16–32px rise"). Animates once when scrolled into view. Renders
 * statically, with no transform, when the user prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = RISE_DISTANCE.text,
  animateOnMount = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={animateOnMount ? { opacity: 1, y: 0 } : undefined}
      whileInView={animateOnMount ? undefined : { opacity: 1, y: 0 }}
      viewport={animateOnMount ? undefined : { once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: DURATION.base, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

```

---

## [11] CREATE — apps/storefront/src/lib/motion/stagger.tsx

```
"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DURATION, EASE_OUT_EXPO } from "./transitions";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_EXPO },
  },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
};

/**
 * Stagger — choreographed entrance for groups of cards (spec §6: "Stagger —
 * product/category cards"). Wrap each child in `<StaggerItem>`. Children
 * placed outside a `Stagger` container simply render statically.
 */
export function Stagger({ children, className, stagger = 0.08 }: StaggerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{ ...containerVariants, visible: { transition: { staggerChildren: stagger, delayChildren: 0.1 } } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

/** A single choreographed child of a `Stagger` container. */
export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

```

---

## [12] CREATE — apps/storefront/src/lib/motion/image-reveal.tsx

```
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DURATION, EASE_OUT_EXPO } from "./transitions";

type ImageRevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds — hero imagery may use a longer, cinematic duration. */
  delay?: number;
  /** Starting scale of the inner media (spec §6: scale 1.03 → 1). */
  scaleFrom?: number;
};

/**
 * ImageReveal — clip wipe from the top + gentle settle for hero and campaign
 * imagery (spec §6: "Clip reveal" / "Scale 1.03 → 1 for large editorial
 * photography"). Content remains fully visible for crawlers and users with
 * reduced-motion preferences.
 */
export function ImageReveal({ children, className, delay = 0, scaleFrom = 1.03 }: ImageRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn("overflow-hidden", className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: scaleFrom }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT_EXPO, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

```

---

## [13] CREATE — apps/storefront/src/lib/motion/fade-presence.tsx

```
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DURATION, EASE_IN_OUT } from "./transitions";

type FadePresenceProps = {
  children: ReactNode;
  /**
   * Changing this key crossfades the content — use the selected tab, product
   * id or variant id (spec §6: "Crossfade — product image/variant changes").
   */
  swapKey: string | number;
  className?: string;
};

/**
 * FadePresence — keyed crossfade wrapper around `AnimatePresence` (spec §6:
 * "Crossfade"; §15: product discovery tabs). Renders its children directly,
 * with no transition, when the user prefers reduced motion.
 */
export function FadePresence({ children, swapKey, className }: FadePresenceProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATION.fast, ease: EASE_IN_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

```

---

## [14] CREATE — apps/storefront/src/lib/motion/parallax-media.tsx

```
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PARALLAX_RANGE } from "./transitions";

type ParallaxMediaProps = {
  children: ReactNode;
  className?: string;
  /** Total vertical travel in px across the element's scroll journey. */
  range?: (typeof PARALLAX_RANGE)[keyof typeof PARALLAX_RANGE];
};

/**
 * ParallaxMedia — subtle scroll-linked drift for large campaign imagery
 * (spec §6: "Subtle parallax 2–5%"). Purely decorative: disabled entirely
 * under `prefers-reduced-motion`, and never blocks or slows scrolling.
 */
export function ParallaxMedia({ children, className, range = PARALLAX_RANGE.subtle }: ParallaxMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div className="h-full w-full" style={reduceMotion ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}

```

---

## [15] CREATE — apps/storefront/src/lib/motion/hover-lift.tsx

```
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DURATION, EASE_OUT_QUART } from "./transitions";

type HoverLiftProps = {
  children: ReactNode;
  className?: string;
  /** Lift distance in px on hover. */
  lift?: number;
};

/**
 * HoverLift — restrained elevation on hover for interactive cards (spec §54).
 * Keyboard focus receives the same affordance via `whileFocus` when the
 * wrapped child is focusable. No effect on touch/reduced-motion devices.
 */
export function HoverLift({ children, className, lift = 4 }: HoverLiftProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT_QUART }}
    >
      {children}
    </motion.div>
  );
}

```

---

## [16] CREATE — apps/storefront/src/lib/motion/index.ts

```
/**
 * LIPEK storefront motion primitives — the shared motion language.
 *
 * Source: docs/architecture/storefront-design-experience-spec.md §6 (motion
 * patterns and rules) and §54 (reusable motion components). Governed by
 * SOT §5B: frontend owns motion design; backend owns content.
 *
 * All primitives standardize timing/easing via ./transitions and respect
 * `prefers-reduced-motion` by rendering static content.
 */
export { Reveal } from "./reveal";
export { Stagger, StaggerItem } from "./stagger";
export { ImageReveal } from "./image-reveal";
export { FadePresence } from "./fade-presence";
export { ParallaxMedia } from "./parallax-media";
export { HoverLift } from "./hover-lift";
export {
  DURATION,
  EASE_IN_OUT,
  EASE_OUT_EXPO,
  EASE_OUT_QUART,
  PARALLAX_RANGE,
  RISE_DISTANCE,
} from "./transitions";

```

---

## [17] REPLACE — apps/storefront/src/site/messages/en.json

OLD:
```
{
  "NotFound": {
    "title": "Page Not Found",
    "message": "The page you are looking for does not exist, has been moved, or is temporarily unavailable.",
    "goHome": "Go to Home",
    "browseProducts": "Browse Products",
    "popularCollections": "Popular Collections"
  },
  "Footer": {
    "description": "A modern fashion shop for curated clothing, tailoring, alterations, laundry care, and customer-first service.",
    "categories": "Categories",
    "customer": "Customer",
    "shopAll": "Shop All",
    "orders": "Orders",
    "account": "Account",
    "copyright": "Lipek Fashion Shop. All rights reserved.",
    "poweredBy": "Powered by"
  }
}
```

NEW:
```
{
  "NotFound": {
    "title": "Page Not Found",
    "message": "The page you are looking for does not exist, has been moved, or is temporarily unavailable.",
    "goHome": "Go to Home",
    "browseProducts": "Browse Products",
    "popularCollections": "Popular Collections"
  },
  "Shell": {
    "tagline": "Premium African Fashion. Crafted for Every Moment.",
    "stickyNavLabel": "Mobile navigation",
    "home": "Home",
    "shop": "Shop",
    "search": "Search",
    "wishlist": "Wishlist",
    "bag": "Bag",
    "account": "Account"
  },
  "Footer": {
    "description": "A modern fashion shop for curated clothing, tailoring, alterations, laundry care, and customer-first service.",
    "categories": "Categories",
    "customer": "Customer",
    "shop": "Shop",
    "services": "Services",
    "tailoring": "Custom Tailoring",
    "alterations": "Alterations",
    "laundry": "Laundry & Dry Cleaning",
    "myAccount": "My LIPEK",
    "shopAll": "Shop All",
    "orders": "Orders",
    "account": "Account",
    "profile": "Profile",
    "wishlist": "Wishlist",
    "addresses": "Addresses",
    "legal": "Legal",
    "copyright": "Lipek Fashion Shop. All rights reserved.",
    "poweredBy": "Powered by"
  }
}
```

---

## [18] REPLACE — apps/storefront/src/site/messages/de.json

OLD:
```
{
  "NotFound": {
    "title": "Seite nicht gefunden",
    "message": "Die gesuchte Seite existiert nicht, wurde verschoben oder ist vorübergehend nicht verfügbar.",
    "goHome": "Zur Startseite",
    "browseProducts": "Produkte durchsuchen",
    "popularCollections": "Beliebte Kategorien"
  },
  "Footer": {
    "description": "Ein moderner Fashion-Shop für kuratierte Kleidung, Schneiderei, Änderungen, Wäschepflege und kundenorientierten Service.",
    "categories": "Kategorien",
    "customer": "Kunde",
    "shopAll": "Alle Produkte",
    "orders": "Bestellungen",
    "account": "Konto",
    "copyright": "Lipek Fashion Shop. Alle Rechte vorbehalten.",
    "poweredBy": "Powered by"
  }
}
```

NEW:
```
{
  "NotFound": {
    "title": "Seite nicht gefunden",
    "message": "Die gesuchte Seite existiert nicht, wurde verschoben oder ist vorübergehend nicht verfügbar.",
    "goHome": "Zur Startseite",
    "browseProducts": "Produkte durchsuchen",
    "popularCollections": "Beliebte Kategorien"
  },
  "Shell": {
    "tagline": "Premium afrikanische Mode. Gemacht für jeden Moment.",
    "stickyNavLabel": "Mobile Navigation",
    "home": "Start",
    "shop": "Shop",
    "search": "Suche",
    "wishlist": "Merkliste",
    "bag": "Tasche",
    "account": "Konto"
  },
  "Footer": {
    "description": "Ein moderner Fashion-Shop für kuratierte Kleidung, Schneiderei, Änderungen, Wäschepflege und kundenorientierten Service.",
    "categories": "Kategorien",
    "customer": "Kunde",
    "shop": "Shop",
    "services": "Services",
    "tailoring": "Maßschneiderei",
    "alterations": "Änderungsservice",
    "laundry": "Wäsche- & Reinigungsservice",
    "myAccount": "Mein LIPEK",
    "shopAll": "Alle Produkte",
    "orders": "Bestellungen",
    "account": "Konto",
    "profile": "Profil",
    "wishlist": "Merkliste",
    "addresses": "Adressen",
    "legal": "Rechtliches",
    "copyright": "Lipek Fashion Shop. Alle Rechte vorbehalten.",
    "poweredBy": "Powered by"
  }
}
```

---

## [19] CREATE — apps/storefront/src/site/shell/header-scroll-shell.tsx

```
'use client';

import {useMotionValueEvent, useScroll} from 'framer-motion';
import {useState, type ReactNode} from 'react';

/**
 * Sticky header shell with LIPEK's compact-on-scroll behavior
 * (design spec §8.2: "The header may become slightly more compact on
 * scroll"). Toggles `data-scrolled` once the page scrolls past a small
 * threshold; children style against it with Tailwind
 * `group-data-[scrolled=true]:` variants.
 *
 * Sticky (in-flow) rather than the starter's `fixed` header: page content
 * needs no manual top offset, and the collapse transition stays smooth.
 */
export function HeaderScrollShell({children}: {children: ReactNode}) {
    const {scrollY} = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setScrolled(latest > 32);
    });

    return (
        <header
            data-scrolled={scrolled}
            className="group sticky top-0 z-50 border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-md"
        >
            {children}
        </header>
    );
}

```

---

## [20] CREATE — apps/storefront/src/site/shell/utility-bar.tsx

```
import {Suspense} from 'react';
import {cacheLife} from 'next/cache';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {CurrencyPickerWrapper} from '@/site/navigation/navbar/currency-picker-wrapper';
import {LanguagePicker} from '@/site/navigation/navbar/language-picker';

/**
 * Utility bar — the thin top-level strip (design spec §8.1).
 *
 * The tagline is design-owned microcopy (SOT §5B / spec §48: the frontend
 * owns structural labels and design microcopy); the language and currency
 * pickers are live UI bound to the storefront's locale/currency state.
 * Collapses away on scroll via the header shell's `data-scrolled` state.
 */
export async function UtilityBar() {
    'use cache';
    cacheLife('days');

    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Shell'});

    return (
        <div className="max-h-10 overflow-hidden border-b border-border/50 transition-all duration-300 group-data-[scrolled=true]:max-h-0 group-data-[scrolled=true]:border-b-0 group-data-[scrolled=true]:opacity-0">
            <div className="container mx-auto px-4">
                <div className="flex h-9 items-center justify-between gap-4">
                    <p className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
                        {t('tagline')}
                    </p>
                    <div className="flex items-center gap-1 sm:ml-auto">
                        <Suspense>
                            <LanguagePicker />
                        </Suspense>
                        <Suspense>
                            <CurrencyPickerWrapper />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}

```

---

## [21] CREATE — apps/storefront/src/site/shell/site-header.tsx

```
import {Suspense} from 'react';
import {HeaderScrollShell} from './header-scroll-shell';
import {UtilityBar} from './utility-bar';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {MobileNavWrapper} from '@/site/navigation/navbar/mobile-nav-wrapper';
import {NavbarCart} from '@/site/navigation/navbar/navbar-cart';
import {NavbarCollections} from '@/site/navigation/navbar/navbar-collections';
import {NavbarUser} from '@/site/navigation/navbar/navbar-user';
import {NavbarWishlist} from '@/site/navigation/navbar/navbar-wishlist';
import {ThemeSwitcher} from '@/site/navigation/navbar/theme-switcher';
import {SearchInput} from '@/site/navigation/search-input';
import {NavbarUserSkeleton} from '@/site/navigation/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/site/navigation/skeletons/search-input-skeleton';

/**
 * LIPEK custom site header (design spec §7/§8 — Phase 3 F1 structural shell).
 *
 * Composition: utility bar → main header (wordmark, mega navigation,
 * search, wishlist, account, bag). All commerce/navigation content is
 * backend-fed (SOT §5A): the mega menu renders the Dashboard-managed
 * `header` NavigationMenu, the cart badge the live active order.
 * Only the visual treatment is frontend-owned (SOT §5B).
 */
export function SiteHeader() {
    return (
        <HeaderScrollShell>
            <Suspense>
                <UtilityBar />
            </Suspense>
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4 transition-[height] duration-300 md:h-20 md:group-data-[scrolled=true]:h-16">
                    <div className="flex min-w-0 items-center gap-4 lg:gap-8">
                        <Suspense>
                            <MobileNavWrapper />
                        </Suspense>
                        <NavigationLink
                            href="/"
                            className="shrink-0 text-lg font-semibold uppercase tracking-[0.35em] md:text-xl"
                        >
                            LIPEK
                        </NavigationLink>
                        <nav className="hidden items-center xl:flex" aria-label="Primary">
                            <Suspense>
                                <NavbarCollections />
                            </Suspense>
                        </nav>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="hidden lg:flex">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput />
                            </Suspense>
                        </div>
                        <Suspense>
                            <ThemeSwitcher />
                        </Suspense>
                        <Suspense>
                            <NavbarWishlist />
                        </Suspense>
                        <Suspense>
                            <NavbarCart />
                        </Suspense>
                        <Suspense fallback={<NavbarUserSkeleton />}>
                            <NavbarUser />
                        </Suspense>
                    </div>
                </div>
            </div>
        </HeaderScrollShell>
    );
}

```

---

## [22] CREATE — apps/storefront/src/site/shell/sticky-nav-items.tsx

```
'use client';

import {Heart, Home, ShoppingBag, Store, User, type LucideIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/platform/i18n/navigation';
import {cn} from '@/lib/utils';

type StickyNavItem = {
    href: '/' | '/search' | '/wishlist' | '/cart' | '/account';
    labelKey: 'home' | 'shop' | 'wishlist' | 'bag' | 'account';
    icon: LucideIcon;
    badge?: boolean;
};

/**
 * Spec §31's sticky mobile navigation, mapped onto the storefront's real IA:
 * "Shop" and "Search" both live at /search today (the search page IS the
 * shop-all surface), so the fifth slot is the wishlist.
 */
const ITEMS: readonly StickyNavItem[] = [
    {href: '/', labelKey: 'home', icon: Home},
    {href: '/search', labelKey: 'shop', icon: Store},
    {href: '/wishlist', labelKey: 'wishlist', icon: Heart},
    {href: '/cart', labelKey: 'bag', icon: ShoppingBag, badge: true},
    {href: '/account', labelKey: 'account', icon: User},
];

export function StickyNavItems({cartItemCount}: {cartItemCount: number}) {
    const t = useTranslations('Shell');
    const pathname = usePathname();

    return (
        <div className="grid h-16 grid-cols-5">
            {ITEMS.map(({href, labelKey, icon: Icon, badge}) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'relative flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                            active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <span className="relative">
                            <Icon className="size-5" aria-hidden />
                            {badge && cartItemCount > 0 && (
                                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                    {cartItemCount}
                                </span>
                            )}
                        </span>
                        {t(labelKey)}
                    </Link>
                );
            })}
        </div>
    );
}

```

---

## [23] CREATE — apps/storefront/src/site/shell/sticky-mobile-nav.tsx

```
import {cacheLife, cacheTag} from 'next/cache';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {query} from '@/platform/vendure/api';
import {GetActiveOrderQuery} from '@/features/cart/graphql';
import {StickyNavItems} from './sticky-nav-items';

/**
 * Spec §31 — sticky mobile bottom navigation: safe-area aware, blurred
 * surface, live cart badge. Cart count comes from the same backend truth
 * the header cart uses (SOT §5A) via the identically-tagged cached query,
 * so Dashboard-driven cart changes invalidate both together.
 */
export async function StickyMobileNav() {
    'use cache: private';
    cacheLife('minutes');
    cacheTag('cart');
    cacheTag('active-order');

    const locale = await getRouteLocale();
    const [orderResult, t] = await Promise.all([
        query(GetActiveOrderQuery, undefined, {
            useAuthToken: true,
            tags: ['cart'],
        }),
        getTranslations({locale, namespace: 'Shell'}),
    ]);

    const cartItemCount = orderResult.data.activeOrder?.totalQuantity || 0;

    return (
        <nav
            aria-label={t('stickyNavLabel')}
            className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        >
            <StickyNavItems cartItemCount={cartItemCount} />
        </nav>
    );
}

```

---

## [24] REPLACE — apps/storefront/src/site/locale-layout.tsx

OLD:
```
import {Toaster} from "@/components/ui/sonner";
import {Navbar} from '@/site/navigation/navbar';
import {Footer} from "@/site/footer";
```

NEW:
```
import {Toaster} from "@/components/ui/sonner";
import {SiteHeader} from '@/site/shell/site-header';
import {StickyMobileNav} from '@/site/shell/sticky-mobile-nav';
import {Footer} from "@/site/footer";
```

---

## [25] REPLACE — apps/storefront/src/site/locale-layout.tsx

OLD:
```
                        <ThemeProvider>
                            <Navbar />
                            {children}
                            <Footer/>
                            <InstallPrompt />
```

NEW:
```
                        <ThemeProvider>
                            <SiteHeader />
                            {children}
                            <Footer/>
                            {/* Spacer so the fixed sticky mobile nav never covers the footer (spec §31). */}
                            <div aria-hidden className="h-16 md:hidden" />
                            <StickyMobileNav />
                            <InstallPrompt />
```

---

## [26] REPLACE — apps/storefront/src/site/locale-layout.tsx

OLD:
```
                            <Navbar />
```

NEW:
```
                            <SiteHeader />
```

---

## [27] REPLACE — apps/storefront/src/site/locale-layout.tsx

OLD:
```
                            <Footer/>
```

NEW:
```
                            <Footer/>
                            <div aria-hidden className="h-16 md:hidden" />
                            <StickyMobileNav />
```

---

## [28] REPLACE — apps/storefront/src/site/shell/utility-bar.tsx

OLD:
```
import {Suspense} from 'react';
import {cacheLife} from 'next/cache';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {CurrencyPickerWrapper} from '@/site/navigation/navbar/currency-picker-wrapper';
import {LanguagePicker} from '@/site/navigation/navbar/language-picker';

/**
 * Utility bar — the thin top-level strip (design spec §8.1).
 *
 * The tagline is design-owned microcopy (SOT §5B / spec §48: the frontend
 * owns structural labels and design microcopy); the language and currency
 * pickers are live UI bound to the storefront's locale/currency state.
 * Collapses away on scroll via the header shell's `data-scrolled` state.
 */
export async function UtilityBar() {
    'use cache';
    cacheLife('days');

    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Shell'});
```

NEW:
```
import {Suspense} from 'react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {CurrencyPickerWrapper} from '@/site/navigation/navbar/currency-picker-wrapper';
import {LanguagePicker} from '@/site/navigation/navbar/language-picker';

/**
 * Utility bar — the thin top-level strip (design spec §8.1).
 *
 * The tagline is design-owned microcopy (SOT §5B / spec §48: the frontend
 * owns structural labels and design microcopy); the language and currency
 * pickers are live UI bound to the storefront's locale/currency state.
 * Deliberately NOT a `'use cache'` scope: the currency picker reads the
 * currency cookie (`cookies()` is illegal inside a cache scope), so this
 * composes exactly like the starter navbar did — pickers behind Suspense.
 * Collapses away on scroll via the header shell's `data-scrolled` state.
 */
export async function UtilityBar() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Shell'});
```

---

## [29] REPLACE — docs/implementation/PHASE_3_STOREFRONT_EXPERIENCE.md

OLD:
```
| F1 | Structural shell: utility bar, header, mega navigation, footer, sticky mobile navigation, shared motion primitives (`src/lib/motion`) | **Started 2026-09-05** — motion primitives first |
```

NEW:
```
| F1 | Structural shell: utility bar, header, mega navigation, footer, sticky mobile navigation, shared motion primitives (`src/lib/motion`) | **Implemented 2026-09-05** — `src/site/shell/` (utility bar, compact-on-scroll header, sticky mobile nav), redesigned footer, motion primitives; all commerce/nav content backend-fed (SOT §5A). Evidence: typecheck, full test suite (45 pass), ESLint clean, `next build` passes all routes |
```

---

## [30] CREATE — scripts/tmp-f2-patch.mjs

```
// One-off F2 patch: redesigns Hero/CategoryCards sections, adds TrustStripSection
// (spec §10–§12), wires the new section type, and extends home i18n messages.
// Deleted after use.
import {readFileSync, writeFileSync, unlinkSync} from 'node:fs';

const FILE = 'apps/storefront/src/features/content/components/home-sections.tsx';
const src = readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

function replace(oldText, newText, label) {
    if (!src.includes(oldText)) {
        throw new Error(`ANCHOR NOT FOUND: ${label}`);
    }
    return src.replace(oldText, newText);
}

// --- R1: imports -----------------------------------------------------------
let out = replace(
    `import type {ReactNode} from 'react';
import {ArrowRight, MapPin, Scissors, Shirt, Sparkles, Star} from 'lucide-react';`,
    `import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
import {
    ArrowRight,
    Headphones,
    MapPin,
    PackageSearch,
    Scissors,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Truck,
    Undo2,
} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {ImageReveal, Reveal, Stagger, StaggerItem} from '@/lib/motion';
import {cn} from '@/lib/utils';`,
    'R1 imports',
);

// --- R2: HeroSection (spec §10) ---------------------------------------------
const oldHero = `function HeroSection({section}: {section: HomeSection}) {
    const headline = asText(section.config, 'headline', 'Publish your LIPEK homepage hero');
    const subheadline = asText(
        section.config,
        'subheadline',
        'This hero is rendered from the CMS home page composition. Update the PageSection config in Dashboard to control this copy.',
    );
    const ctaLabel = asText(section.config, 'ctaLabel', 'Browse the collection');
    const ctaUrl = asText(section.config, 'ctaUrl', '/search');

    return (
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--lipek-accent-soft),transparent_34rem),linear-gradient(135deg,var(--lipek-bg),var(--lipek-bg-subtle))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="container mx-auto grid min-h-[68vh] items-center gap-10 px-4 py-28 md:grid-cols-[1.1fr_0.9fr]">
                <div className="max-w-3xl space-y-8">
                    <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 text-primary">
                        Backend-composed LIPEK storefront
                    </Badge>
                    <h1 className="text-5xl font-bold tracking-tight md:text-7xl">{headline}</h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">{subheadline}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button render={<Link href={ctaUrl} />} nativeButton={false} size="lg" className="rounded-full">
                            {ctaLabel}
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                        <Button render={<Link href="/blog" />} nativeButton={false} size="lg" variant="outline" className="rounded-full">
                            Read the style guide
                        </Button>
                    </div>
                </div>
                <div className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-[2rem] border bg-card p-4 shadow-2xl">
                    <div className="h-full rounded-[1.5rem] bg-[linear-gradient(145deg,var(--lipek-accent),var(--lipek-neutral-950))]" />
                    <div className="absolute -bottom-6 -left-6 rounded-2xl border bg-background p-5 shadow-xl">
                        <p className="text-sm text-muted-foreground">Staff-controlled</p>
                        <p className="text-2xl font-semibold">CMS live</p>
                    </div>
                </div>
            </div>
        </section>
    );
}`;

const newHero = `function HeroSection({section}: {section: HomeSection}) {
    const campaignLabel = asText(section.config, 'campaignLabel', 'New Season');
    const headline = asText(section.config, 'headline', 'Modern African Luxury');
    const subheadline = asText(
        section.config,
        'subheadline',
        'Made to be remembered. Garments, tailoring and services crafted around your body, your style and every moment.',
    );
    const ctaLabel = asText(section.config, 'ctaLabel', 'Shop the Collection');
    const ctaUrl = asText(section.config, 'ctaUrl', '/search');
    const secondaryCtaLabel = asText(section.config, 'secondaryCtaLabel', 'Explore Tailoring');
    const secondaryCtaUrl = asText(section.config, 'secondaryCtaUrl', '/tailoring');
    const imageUrl = asText(section.config, 'imageUrl', '');
    const imageAlt = asText(section.config, 'imageAlt', headline);
    const storyTitle = asText(section.config, 'storyTitle', 'The Wedding Edit');
    const storyText = asText(section.config, 'storyText', 'Dress the moment. Own the memory.');
    const storyCtaLabel = asText(section.config, 'storyCtaLabel', 'Shop Wedding');
    const storyCtaUrl = asText(section.config, 'storyCtaUrl', '/search');

    // Spec §10: Hero Commerce Zone — campaign label → headline → supporting
    // text → CTAs → imagery → featured story card, choreographed on mount.
    // All copy and the campaign image come from the PageSection config (SOT
    // §5A); the composition, motion sequence and fallbacks are design (§5B).
    return (
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--lipek-accent-soft),transparent_34rem),linear-gradient(135deg,var(--lipek-bg),var(--lipek-bg-subtle))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

```

---

## [31] CREATE — scripts/tmp-f2-patch.mjs

```
// One-off F2 patch: redesigns Hero/CategoryCards sections, adds TrustStripSection
// (spec §10–§12), wires the new section type, and extends home i18n messages.
// Deleted after use.
import {readFileSync, writeFileSync} from 'node:fs';

const FILE = 'apps/storefront/src/features/content/components/home-sections.tsx';
let src = readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

function replace(oldText, newText, label) {
    if (!src.includes(oldText)) {
        throw new Error(`ANCHOR NOT FOUND: ${label}`);
    }
    src = src.replace(oldText, newText);
}

// --- R1: imports -----------------------------------------------------------
replace(
    `import type {ReactNode} from 'react';
import {ArrowRight, MapPin, Scissors, Shirt, Sparkles, Star} from 'lucide-react';`,
    `import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
import {
    ArrowRight,
    Headphones,
    MapPin,
    PackageSearch,
    Scissors,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Truck,
    Undo2,
} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {ImageReveal, Reveal, Stagger, StaggerItem} from '@/lib/motion';
import {cn} from '@/lib/utils';`,
    'R1 imports',
);

// --- R2: HeroSection (spec §10) ---------------------------------------------
replace(
    `function HeroSection({section}: {section: HomeSection}) {
    const headline = asText(section.config, 'headline', 'Publish your LIPEK homepage hero');
    const subheadline = asText(
        section.config,
        'subheadline',
        'This hero is rendered from the CMS home page composition. Update the PageSection config in Dashboard to control this copy.',
    );
    const ctaLabel = asText(section.config, 'ctaLabel', 'Browse the collection');
    const ctaUrl = asText(section.config, 'ctaUrl', '/search');

    return (
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--lipek-accent-soft),transparent_34rem),linear-gradient(135deg,var(--lipek-bg),var(--lipek-bg-subtle))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="container mx-auto grid min-h-[68vh] items-center gap-10 px-4 py-28 md:grid-cols-[1.1fr_0.9fr]">
                <div className="max-w-3xl space-y-8">
                    <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 text-primary">
                        Backend-composed LIPEK storefront
                    </Badge>
                    <h1 className="text-5xl font-bold tracking-tight md:text-7xl">{headline}</h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">{subheadline}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button render={<Link href={ctaUrl} />} nativeButton={false} size="lg" className="rounded-full">
                            {ctaLabel}
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                        <Button render={<Link href="/blog" />} nativeButton={false} size="lg" variant="outline" className="rounded-full">
                            Read the style guide
                        </Button>
                    </div>
                </div>
                <div className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-[2rem] border bg-card p-4 shadow-2xl">
                    <div className="h-full rounded-[1.5rem] bg-[linear-gradient(145deg,var(--lipek-accent),var(--lipek-neutral-950))]" />
                    <div className="absolute -bottom-6 -left-6 rounded-2xl border bg-background p-5 shadow-xl">
                        <p className="text-sm text-muted-foreground">Staff-controlled</p>
                        <p className="text-2xl font-semibold">CMS live</p>
                    </div>
                </div>
            </div>
        </section>
    );
}`,
    `// PART2_HERO_NEW
`,
    'R2 HeroSection anchor',
);

// --- R3 anchor stub ----------------------------------------------------------
replace(
    `function CategoryCardsSection({section}: {section: HomeSection}) {
    const slugs = asList(section.config, 'collectionSlugs');
    if (!slugs.length) return null;

    const cards = slugs.map(slug => ({
        slug,
        label: slug.replace(/-/g, ' ').replace(/\\b\\w/g, char => char.toUpperCase()),
    }));

    return (
        <SectionShell tone="soft">
            <div className="container mx-auto px-4">
                <div className="mb-10 max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Catalog</p>
                    <h2 className="mt-3 text-3xl font-bold md:text-5xl">Shop by wardrobe</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map(card => (
                        <Link
                            key={card.slug}
                            href={\`/collection/\${card.slug}\`}
                            className="group rounded-3xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <Shirt className="mb-10 size-8 text-primary" />
                            <h3 className="text-2xl font-semibold">{card.label}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Browse live Lipek catalog items.</p>
                        </Link>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}`,
    `// PART3_CATEGORIES_NEW
`,
    'R3 CategoryCardsSection anchor',
);

// --- R4 anchor stub ----------------------------------------------------------
replace(
    `function ServicesSection({services, currencyCode}`,
    `// PART4_TRUST_NEW
function ServicesSe
```

---

## [32] CREATE — scripts/tmp-f2-patch.mjs

```
// One-off F2 patch: redesigns Hero/CategoryCards sections, adds TrustStripSection
// (spec §10–§12), wires the new section type, and extends home i18n messages.
// Deleted after use.
import {readFileSync, writeFileSync} from 'node:fs';

const FILE = 'apps/storefront/src/features/content/components/home-sections.tsx';
let src = readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

function replace(oldText, newText, label) {
    if (!src.includes(oldText)) {
        throw new Error(`ANCHOR NOT FOUND: ${label}`);
    }
    src = src.replace(oldText, newText);
}

// --- R1: imports -----------------------------------------------------------
replace(
    `import type {ReactNode} from 'react';
import {ArrowRight, MapPin, Scissors, Shirt, Sparkles, Star} from 'lucide-react';`,
    `import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
import {
    ArrowRight,
    Headphones,
    MapPin,
    PackageSearch,
    Scissors,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Truck,
    Undo2,
} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {ImageReveal, Reveal, Stagger, StaggerItem} from '@/lib/motion';
import {cn} from '@/lib/utils';`,
    'R1 imports',
);

// --- R2 anchor: the old HeroSection body is replaced in PART3 ---------------
replace(
    `function HeroSection({section}: {section: HomeSection}) {
    const headline = asText(section.config, 'headline', 'Publish your LIPEK homepage hero');
    const subheadline = asText(
        section.config,
        'subheadline',
        'This hero is rendered from the CMS home page composition. Update the PageSection config in Dashboard to control this copy.',
    );
    const ctaLabel = asText(section.config, 'ctaLabel', 'Browse the collection');
    const ctaUrl = asText(section.config, 'ctaUrl', '/search');

    return (
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--lipek-accent-soft),transparent_34rem),linear-gradient(135deg,var(--lipek-bg),var(--lipek-bg-subtle))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="container mx-auto grid min-h-[68vh] items-center gap-10 px-4 py-28 md:grid-cols-[1.1fr_0.9fr]">
                <div className="max-w-3xl space-y-8">
                    <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 text-primary">
                        Backend-composed LIPEK storefront
                    </Badge>
                    <h1 className="text-5xl font-bold tracking-tight md:text-7xl">{headline}</h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">{subheadline}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button render={<Link href={ctaUrl} />} nativeButton={false} size="lg" className="rounded-full">
                            {ctaLabel}
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                        <Button render={<Link href="/blog" />} nativeButton={false} size="lg" variant="outline" className="rounded-full">
                            Read the style guide
                        </Button>
                    </div>
                </div>
                <div className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-[2rem] border bg-card p-4 shadow-2xl">
                    <div className="h-full rounded-[1.5rem] bg-[linear-gradient(145deg,var(--lipek-accent),var(--lipek-neutral-950))]" />
                    <div className="absolute -bottom-6 -left-6 rounded-2xl border bg-background p-5 shadow-xl">
                        <p className="text-sm text-muted-foreground">Staff-controlled</p>
                        <p className="text-2xl font-semibold">CMS live</p>
                    </div>
                </div>
            </div>
        </section>
    );
}`,
    `// PART3_HERO_NEW
`,
    'R2 HeroSection anchor',
);

// PART3_MARKER

```

---

## [33] REPLACE — scripts/tmp-f2-patch.mjs

OLD:
```
// PART3_MARKER
```

NEW:
```
// --- R3 anchor: old CategoryCardsSection body replaced in PART4 --------------
replace(
    `function CategoryCardsSection({section}: {section: HomeSection}) {
    const slugs = asList(section.config, 'collectionSlugs');
    if (!slugs.length) return null;

    const cards = slugs.map(slug => ({
        slug,
        label: slug.replace(/-/g, ' ').replace(/\\b\\w/g, char => char.toUpperCase()),
    }));

    return (
        <SectionShell tone="soft">
            <div className="container mx-auto px-4">
                <div className="mb-10 max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Catalog</p>
                    <h2 className="mt-3 text-3xl font-bold md:text-5xl">Shop by wardrobe</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map(card => (
                        <Link
                            key={card.slug}
                            href={\`/collection/\${card.slug}\`}
                            className="group rounded-3xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <Shirt className="mb-10 size-8 text-primary" />
                            <h3 className="text-2xl font-semibold">{card.label}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Browse live Lipek catalog items.</p>
                        </Link>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}`,
    `// PART4_CATEGORIES_NEW
`,
    'R3 CategoryCardsSection anchor',
);

// --- R4 anchor stub ----------------------------------------------------------
replace(
    `function ServicesSection({services, currencyCode}`,
    `// PART4_TRUST_NEW
function ServicesSection({services, currencyCode}`,
    'R4 TrustStrip anchor',
);

// --- R5: KnownSection trustStrip case ----------------------------------------
replace(
    `        case 'hero':
            return <HeroSection section={section} />;`,
    `        case 'hero':
            return <HeroSection section={section} />;
        case 'trustStrip':
            return <TrustStripSection section={section} />;`,
    'R5 KnownSection case',
);

// PART4_MARKER

```

---

## [34] REPLACE — scripts/tmp-f2-patch.mjs

OLD:
```
// PART4_MARKER
```

NEW:
```
// --- HeroSection new body (spec §10) -----------------------------------------
src = src.replace(
    '// PART3_HERO_NEW',
    `function HeroSection({section}: {section: HomeSection}) {
    const campaignLabel = asText(section.config, 'campaignLabel', 'New Season');
    const headline = asText(section.config, 'headline', 'Modern African Luxury');
    const subheadline = asText(
        section.config,
        'subheadline',
        'Made to be remembered. Garments, tailoring and services crafted around your body, your style and every moment.',
    );
    const ctaLabel = asText(section.config, 'ctaLabel', 'Shop the Collection');
    const ctaUrl = asText(section.config, 'ctaUrl', '/search');
    const secondaryCtaLabel = asText(section.config, 'secondaryCtaLabel', 'Explore Tailoring');
    const secondaryCtaUrl = asText(section.config, 'secondaryCtaUrl', '/tailoring');
    const imageUrl = asText(section.config, 'imageUrl', '');
    const imageAlt = asText(section.config, 'imageAlt', headline);
    const storyTitle = asText(section.config, 'storyTitle', 'The Wedding Edit');
    const storyText = asText(section.config, 'storyText', 'Dress the moment. Own the memory.');
    const storyCtaLabel = asText(section.config, 'storyCtaLabel', 'Shop Wedding');
    const storyCtaUrl = asText(section.config, 'storyCtaUrl', '/search');

    // Spec §10: Hero Commerce Zone — campaign label -> headline -> supporting
    // text -> CTAs -> imagery -> featured story card, choreographed on mount.
    // All copy and the campaign image come from the PageSection config (SOT
    // §5A); the composition, motion sequence and fallbacks are design (§5B).
    return (
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--lipek-accent-soft),transparent_34rem),linear-gradient(135deg,var(--lipek-bg),var(--lipek-bg-subtle))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="container mx-auto grid min-h-[62vh] items-center gap-10 px-4 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-24">
                <div className="max-w-3xl space-y-6">
                    <Reveal animateOnMount delay={0}>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">{campaignLabel}</p>
                    </Reveal>
                    <Reveal animateOnMount delay={0.08}>
                        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">{headline}</h1>
                    </Reveal>
                    <Reveal animateOnMount delay={0.16}>
                        <p className="max-w-xl text-lg leading-8 text-muted-foreground">{subheadline}</p>
                    </Reveal>
                    <Reveal animateOnMount delay={0.24}>
                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <Button render={<Link href={ctaUrl} />} nativeButton={false} size="lg" className="rounded-full">
                                {ctaLabel}
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                            <Button
                                render={<Link href={secondaryCtaUrl} />}
                                nativeButton={false}
                                size="lg"
                                variant="outline"
                                className="rounded-full"
                            >
                                {secondaryCtaLabel}
                            </Button>
                        </div>
                    </Reveal>
                </div>
                <div className="relative">
                    <ImageReveal delay={0.15} className="aspect-[4/5] w-full rounded-[2rem] border bg-card shadow-2xl">
                        {imageUrl ? (
                            // CMS-entered image URLs may point at any staff-chosen
                            // host, so this renders as plain <img> (next/image's
                            // remotePatterns is limited to the Vendure asset hosts).
                            // Optimization moves to the asset-server host when
                            // ADR-0003 object-storage providers land.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl} alt={imageAlt} className="h-full w-full rounded-[2rem] object-cover" />
                        ) : (
                            <div className="h-full w-full rounded-[2rem] bg-[linear-gradient(145deg,var(--lipek-accent),var(--lipek-neutral-950))]" />
                        )}
                    </ImageReveal>
                    <Reveal
                        animateOnMount
                        delay={0.5}
                        className="absolute -bottom-4 left-4 max-w-[16rem] rounded-2xl border bg-background/95 p-5 shadow-xl backdrop-blur md:-left-6"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{storyTitle}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{storyText}</p>
                        <Link
                            href={storyCtaUrl}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                            {storyCtaLabel}
                            <ArrowRight className="size-4" aria-hidden />
                        </Link>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}`,
);

// PART5_MARKER

```

---

## [35] REPLACE — scripts/tmp-f2-patch.mjs

OLD:
```
// PART5_MARKER
```

NEW:
```
// --- CategoryCardsSection new body (spec §12) ---------------------------------
src = src.replace(
    '// PART4_CATEGORIES_NEW',
    `// Spec §12: mixed-size asymmetric bento — the first category is the large
// feature, the second spans wide, the rest fill single cells, the fifth (if
// present) spans wide again. Dense flow keeps the grid tight at any count.
const CATEGORY_BENTO_SPANS = [
    'sm:col-span-2 md:row-span-2',
    'md:col-span-2',
    '',
    '',
    'md:col-span-2',
] as const;

async function CategoryCardsSection({section}: {section: HomeSection}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const slugs = asList(section.config, 'collectionSlugs');
    if (!slugs.length) return null;

    const labels = asList(section.config, 'labels');
    const images = asList(section.config, 'images');

    const cards = slugs.map((slug, index) => ({
        slug,
        label: labels[index] ?? slug.replace(/-/g, ' ').replace(/\\b\\w/g, char => char.toUpperCase()),
        image: images[index] ?? '',
    }));

    return (
        <SectionShell tone="soft">
            <div className="container mx-auto px-4">
                <div className="mb-10 max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{t('categories.eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-bold md:text-5xl">{t('categories.title')}</h2>
                </div>
                <Stagger className="grid auto-rows-[minmax(11rem,auto)] grid-flow-dense gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {cards.map((card, index) => (
                        <StaggerItem
                            key={card.slug}
                            className={cn('h-full', CATEGORY_BENTO_SPANS[index % CATEGORY_BENTO_SPANS.length])}
                        >
                            <Link
                                href={\`/collection/\${card.slug}\`}
                                className="group relative flex h-full min-h-44 flex-col justify-end overflow-hidden rounded-3xl border bg-card p-6 transition-shadow duration-300 hover:shadow-xl"
                            >
                                {card.image ? (
                                    // See HeroSection: CMS-hosted imagery renders as plain <img>.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={card.image}
                                        alt=""
                                        aria-hidden
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                ) : (
                                    <div
                                        aria-hidden
                                        className="absolute inset-0 bg-[linear-gradient(145deg,var(--lipek-accent-soft),var(--lipek-bg-subtle))] transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                )}
                                <div
                                    aria-hidden
                                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
                                />
                                <div className="relative mt-auto">
                                    <h3 className="text-xl font-semibold text-white md:text-2xl">{card.label}</h3>
                                    <span className="relative mt-1 inline-flex translate-y-1 items-center gap-1 text-sm font-medium text-white/85 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        {t('categories.shopNow')}
                                        <ArrowRight className="size-4" aria-hidden />
                                    </span>
                                </div>
                            </Link>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </SectionShell>
    );
}`,
);

// --- TrustStripSection (spec §11), inserted before ServicesSection ------------
src = src.replace(
    '// PART4_TRUST_NEW',
    `type TrustItem = {
    icon: LucideIcon | null;
    label: string;
};

/**
 * Spec §11 — Trust Strip. Desktop: compact evenly-spread row; mobile:
 * horizontally scrollable. The default items are frontend-owned service
 * microcopy (SOT §5B / spec §48); a config \`items\` list lets staff
 * override them without a code change (SOT §5A).
 */
async function TrustStripSection({section}: {section: HomeSection}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const customItems = asList(section.config, 'items');
    const items: TrustItem[] = customItems.length
        ? customItems.map(label => ({icon: null, label}))
        : [
              {icon: Truck, label: t('trustStrip.freeShipping')},
              {icon: ShieldCheck, label: t('trustStrip.securePayment')},
              {icon: Undo2, label: t('trustStrip.easyReturns')},
              {icon: Scissors, label: t('trustStrip.customTailoring')},
              {icon: PackageSearch, label: t('trustStrip.orderTracking')},
              {icon: Headphones, label: t('trustStrip.support')},
              {icon: Store, label: t('trustStrip.pickupDelivery')},
          ];

    return (
        <div className="border-b border-border/60 bg-background">
            <div className="container mx-auto px-4">
                <ul className="flex gap-8 overflow-x-auto py-4 md:justify-between md:overflow-x-visible">
                    {items.map((item, index) => (
                        <li
                            key={\`\${item.label}-\${index}\`}
                            className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground"
                        >
                            {item.icon ? (
                                <item.icon className="size-4 text-primary" aria-hidden />
                            ) : (
                                <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                            )}
                            <span className="whitespace-nowrap">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}`,
);

// --- Finalize: write home-sections.tsx (LF) + home messages (BOM-free) --------
writeFileSync(FILE, src, 'utf8');

for (const [file, additions] of [
    [
        'apps/storefront/src/site/home/messages/en.json',
        {
            trustStrip: {
                freeShipping: 'Free Shipping',
                securePayment: 'Secure Payment',
                easyReturns: 'Easy Returns',
                customTailoring: 'Custom Tailoring',
                orderTracking: 'Order Tracking',
                support: '24/7 Support',
                pickupDelivery: 'Pickup & Delivery',
            },
            categories: {
                eyebrow: 'Featured Categories',
                title: 'Find Your Wardrobe',
                shopNow: 'Shop now',
            },
        },
    ],
    [
        'apps/storefront/src/site/home/messages/de.json',
        {
            trustStrip: {
                freeShipping: 'Kostenloser Versand',
                securePayment: 'Sichere Zahlung',
                easyReturns: 'Einfache Rückgaben',
                customTailoring: 'Maßschneiderei',
                orderTracking: 'Sendungsverfolgung',
                support: '24/7 Support',
                pickupDelivery: 'Abholung & Lieferung',
            },
            categories: {
                eyebrow: 'Ausgewählte Kategorien',
                title: 'Finde deinen Stil',
                shopNow: 'Jetzt kaufen',
            },
        },
    ],
] as const) {
    const json = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    json.Home = {...json.Home, ...additions};
    writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

console.log('F2 patch applied: home-sections.tsx + home messages (en/de)');

```

---

## [36] REPLACE — scripts/tmp-f2-patch.mjs

OLD:
```
// PART5_MARKER
```

NEW:
```
// --- CategoryCardsSection new body (spec §12) ---------------------------------
src = src.replace(
    '// PART4_CATEGORIES_NEW',
    `// Spec §12: mixed-size asymmetric bento — the first category is the large
// feature, the second spans wide, the rest fill single cells, the fifth (if
// present) spans wide again. Dense flow keeps the grid tight at any count.
const CATEGORY_BENTO_SPANS = [
    'sm:col-span-2 md:row-span-2',
    'md:col-span-2',
    '',
    '',
    'md:col-span-2',
] as const;

async function CategoryCardsSection({section}: {section: HomeSection}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const slugs = asList(section.config, 'collectionSlugs');
    if (!slugs.length) return null;

    const labels = asList(section.config, 'labels');
    const images = asList(section.config, 'images');

    const cards = slugs.map((slug, index) => ({
        slug,
        label: labels[index] ?? slug.replace(/-/g, ' ').replace(/\\b\\w/g, char => char.toUpperCase()),
        image: images[index] ?? '',
    }));

    return (
        <SectionShell tone="soft">
            <div className="container mx-auto px-4">
                <div className="mb-10 max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{t('categories.eyebrow')}</p>
                    <h2 className="mt-3 text-3xl font-bold md:text-5xl">{t('categories.title')}</h2>
                </div>
                <Stagger className="grid auto-rows-[minmax(11rem,auto)] grid-flow-dense gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {cards.map((card, index) => (
                        <StaggerItem
                            key={card.slug}
                            className={cn('h-full', CATEGORY_BENTO_SPANS[index % CATEGORY_BENTO_SPANS.length])}
                        >
                            <Link
                                href={\`/collection/\${card.slug}\`}
                                className="group relative flex h-full min-h-44 flex-col justify-end overflow-hidden rounded-3xl border bg-card p-6 transition-shadow duration-300 hover:shadow-xl"
                            >
                                {card.image ? (
                                    // See HeroSection: CMS-hosted imagery renders as plain <img>.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={card.image}
                                        alt=""
                                        aria-hidden
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                ) : (
                                    <div
                                        aria-hidden
                                        className="absolute inset-0 bg-[linear-gradient(145deg,var(--lipek-accent-soft),var(--lipek-bg-subtle))] transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                )}
                                <div
                                    aria-hidden
                                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
                                />
                                <div className="relative mt-auto">
                                    <h3 className="text-xl font-semibold text-white md:text-2xl">{card.label}</h3>
                                    <span className="relative mt-1 inline-flex translate-y-1 items-center gap-1 text-sm font-medium text-white/85 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        {t('categories.shopNow')}
                                        <ArrowRight className="size-4" aria-hidden />
                                    </span>
                                </div>
                            </Link>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </SectionShell>
    );
}`,
);

// PART6_MARKER

```

---

## [37] REPLACE — scripts/tmp-f2-patch.mjs

OLD:
```
// PART6_MARKER
```

NEW:
```
// --- TrustStripSection (spec §11), inserted before ServicesSection ------------
src = src.replace(
    '// PART4_TRUST_NEW',
    `type TrustItem = {
    icon: LucideIcon | null;
    label: string;
};

/**
 * Spec §11 — Trust Strip. Desktop: compact evenly-spread row; mobile:
 * horizontally scrollable. The default items are frontend-owned service
 * microcopy (SOT §5B / spec §48); a config \`items\` list lets staff
 * override them without a code change (SOT §5A).
 */
async function TrustStripSection({section}: {section: HomeSection}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    const customItems = asList(section.config, 'items');
    const items: TrustItem[] = customItems.length
        ? customItems.map(label => ({icon: null, label}))
        : [
              {icon: Truck, label: t('trustStrip.freeShipping')},
              {icon: ShieldCheck, label: t('trustStrip.securePayment')},
              {icon: Undo2, label: t('trustStrip.easyReturns')},
              {icon: Scissors, label: t('trustStrip.customTailoring')},
              {icon: PackageSearch, label: t('trustStrip.orderTracking')},
              {icon: Headphones, label: t('trustStrip.support')},
              {icon: Store, label: t('trustStrip.pickupDelivery')},
          ];

    return (
        <div className="border-b border-border/60 bg-background">
            <div className="container mx-auto px-4">
                <ul className="flex gap-8 overflow-x-auto py-4 md:justify-between md:overflow-x-visible">
                    {items.map((item, index) => (
                        <li
                            key={\`\${item.label}-\${index}\`}
                            className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground"
                        >
                            {item.icon ? (
                                <item.icon className="size-4 text-primary" aria-hidden />
                            ) : (
                                <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                            )}
                            <span className="whitespace-nowrap">{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}`,
);

// --- Finalize: write home-sections.tsx (LF) + home messages (BOM-free) --------
writeFileSync(FILE, src, 'utf8');

for (const [file, additions] of [
    [
        'apps/storefront/src/site/home/messages/en.json',
        {
            trustStrip: {
                freeShipping: 'Free Shipping',
                securePayment: 'Secure Payment',
                easyReturns: 'Easy Returns',
                customTailoring: 'Custom Tailoring',
                orderTracking: 'Order Tracking',
                support: '24/7 Support',
                pickupDelivery: 'Pickup & Delivery',
            },
            categories: {
                eyebrow: 'Featured Categories',
                title: 'Find Your Wardrobe',
                shopNow: 'Shop now',
            },
        },
    ],
    [
        'apps/storefront/src/site/home/messages/de.json',
        {
            trustStrip: {
                freeShipping: 'Kostenloser Versand',
                securePayment: 'Sichere Zahlung',
                easyReturns: 'Einfache Rückgaben',
                customTailoring: 'Maßschneiderei',
                orderTracking: 'Sendungsverfolgung',
                support: '24/7 Support',
                pickupDelivery: 'Abholung & Lieferung',
            },
            categories: {
                eyebrow: 'Ausgewählte Kategorien',
                title: 'Finde deinen Stil',
                shopNow: 'Jetzt kaufen',
            },
        },
    ],
] as const) {
    const json = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    json.Home = {...json.Home, ...additions};
    writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

console.log('F2 patch applied: home-sections.tsx + home messages (en/de)');

```

---

## [38] REPLACE — apps/server/src/plugins/lipek-content/dashboard/page-section-config-input.tsx

OLD:
```
const KNOWN_SECTION_TYPE_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
    hero: [
        { key: 'headline', label: 'Headline' },
        { key: 'subheadline', label: 'Subheadline' },
        { key: 'imageAssetId', label: 'Image asset ID' },
        { key: 'ctaLabel', label: 'CTA label' },
        { key: 'ctaUrl', label: 'CTA URL' },
    ],
    featuredCollection: [{ key: 'collectionId', label: 'Collection ID' }],
    newArrivals: [{ key: 'collectionId', label: 'Collection ID' }],
    categoryCards: [{ key: 'collectionIds', label: 'Collection IDs (comma-separated)' }],
```

NEW:
```
const KNOWN_SECTION_TYPE_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
    hero: [
        { key: 'headline', label: 'Headline' },
        { key: 'subheadline', label: 'Subheadline' },
        { key: 'campaignLabel', label: 'Campaign label' },
        { key: 'imageUrl', label: 'Image URL' },
        { key: 'imageAlt', label: 'Image alt text' },
        { key: 'ctaLabel', label: 'Primary CTA label' },
        { key: 'ctaUrl', label: 'Primary CTA URL' },
        { key: 'secondaryCtaLabel', label: 'Secondary CTA label' },
        { key: 'secondaryCtaUrl', label: 'Secondary CTA URL' },
        { key: 'storyTitle', label: 'Featured story title' },
        { key: 'storyText', label: 'Featured story text' },
        { key: 'storyCtaLabel', label: 'Featured story CTA label' },
        { key: 'storyCtaUrl', label: 'Featured story CTA URL' },
    ],
    featuredCollection: [{ key: 'collectionId', label: 'Collection ID' }],
    newArrivals: [{ key: 'collectionId', label: 'Collection ID' }],
    // `collectionSlugs` (not IDs) matches what the storefront's
    // CategoryCardsSection actually reads; `labels`/`images` are optional
    // parallel lists (spec §12's featured-category discovery).
    categoryCards: [
        { key: 'collectionSlugs', label: 'Collection slugs (comma-separated)' },
        { key: 'labels', label: 'Card labels (comma-separated, optional)' },
        { key: 'images', label: 'Card image URLs (comma-separated, optional)' },
    ],
    trustStrip: [
        {
            key: 'items',
            label: 'Items (comma-separated; leave empty for the standard LIPEK service strip)',
        },
    ],
```

---

## [39] CREATE — apps/storefront/src/features/content/messages/en.json

```
{
  "HomeSections": {
    "trustStrip": {
      "freeShipping": "Free Shipping",
      "securePayment": "Secure Payment",
      "easyReturns": "Easy Returns",
      "customTailoring": "Custom Tailoring",
      "orderTracking": "Order Tracking",
      "support": "24/7 Support",
      "pickupDelivery": "Pickup & Delivery"
    },
    "categories": {
      "eyebrow": "Featured Categories",
      "title": "Find Your Wardrobe",
      "shopNow": "Shop now"
    }
  }
}
```

---

## [40] CREATE — apps/storefront/src/features/content/messages/de.json

```
{
  "HomeSections": {
    "trustStrip": {
      "freeShipping": "Kostenloser Versand",
      "securePayment": "Sichere Zahlung",
      "easyReturns": "Einfache Rückgaben",
      "customTailoring": "Maßschneiderei",
      "orderTracking": "Sendungsverfolgung",
      "support": "24/7 Support",
      "pickupDelivery": "Abholung & Lieferung"
    },
    "categories": {
      "eyebrow": "Ausgewählte Kategorien",
      "title": "Finde deinen Stil",
      "shopNow": "Jetzt kaufen"
    }
  }
}
```

---

## [41] CREATE — apps/storefront/src/features/content/messages.ts

```
import type {MessageLoaders} from '@/platform/i18n/messages';

export const contentMessageLoaders: MessageLoaders = {
    en: () => import('./messages/en.json'),
    de: () => import('./messages/de.json'),
};

```

---

## [42] REPLACE — apps/storefront/src/site/i18n/messages.ts

OLD:
```
import {collectionsMessageLoaders} from '@/features/collections/messages';
```

NEW:
```
import {collectionsMessageLoaders} from '@/features/collections/messages';
import {contentMessageLoaders} from '@/features/content/messages';
```

---

## [43] REPLACE — apps/storefront/src/site/i18n/messages.ts

OLD:
```
    collectionsMessageLoaders,
    ordersMessageLoaders,
```

NEW:
```
    collectionsMessageLoaders,
    contentMessageLoaders,
    ordersMessageLoaders,
```

---

## [44] CREATE — scripts/tmp-ns-fix.cjs

```
// One-off: revert site/home message additions, switch home-sections namespace.
// Deleted after use.
const fs = require('fs');
for (const f of [
    'apps/storefront/src/site/home/messages/en.json',
    'apps/storefront/src/site/home/messages/de.json',
]) {
    const json = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
    delete json.Home.trustStrip;
    delete json.Home.categories;
    fs.writeFileSync(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
}
const hs = 'apps/storefront/src/features/content/components/home-sections.tsx';
let s = fs.readFileSync(hs, 'utf8');
const before = (s.match(/namespace: 'Home'/g) || []).length;
s = s.split("namespace: 'Home'").join("namespace: 'HomeSections'");
fs.writeFileSync(hs, s, 'utf8');
console.log('reverted site/home messages; switched', before, 'namespace usages to HomeSections');

```

---

## [45] REPLACE — docs/implementation/PHASE_3_STOREFRONT_EXPERIENCE.md

OLD:
```
| F2 | Hero commerce zone, trust strip, featured category discovery, section rhythm | Pending |
```

NEW:
```
| F2 | Hero commerce zone, trust strip, featured category discovery, section rhythm | **Implemented 2026-09-05** — HeroSection redesigned per spec §10 (choreographed campaign label → headline → CTAs → `ImageReveal` imagery → featured-story card, all config-driven from the CMS PageSection); new backend-composable `trustStrip` section type per spec §11 (default LIPEK service strip auto-injected after the hero unless staff compose their own; Dashboard config editor registered); CategoryCardsSection rebuilt as the spec §12 asymmetric bento grid with hover zoom/arrow-reveal and `Stagger` entrance. Content namespace `HomeSections` added to `features/content` per the i18n ownership boundary. Evidence: typecheck, full test suite (45 pass), `next build` passes all routes |
```

---


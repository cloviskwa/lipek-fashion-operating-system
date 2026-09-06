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

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

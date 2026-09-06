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

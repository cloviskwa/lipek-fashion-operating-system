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

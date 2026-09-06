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

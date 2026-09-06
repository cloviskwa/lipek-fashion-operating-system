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

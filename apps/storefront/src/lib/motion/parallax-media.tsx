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

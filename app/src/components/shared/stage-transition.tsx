"use client";

import type { ReactNode } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Keyed enter when claim or ceremony content swaps. */
export function StageTransition({
  stageKey,
  children,
  className,
  variant = "stage",
}: {
  stageKey: string;
  children: ReactNode;
  className?: string;
  /** `fade` avoids transform under sticky/blur (gate); `stage` for claim body. */
  variant?: "stage" | "fade";
}) {
  const prefersReducedMotion = useReducedMotion();
  const offset = variant === "fade" ? 6 : 12;

  if (prefersReducedMotion) {
    const motionClass =
      variant === "fade" ? galleryAnimate.stageFade : galleryAnimate.stage;
    return (
      <div key={stageKey} className={cn(motionClass, className)}>
        {children}
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={stageKey}
          className={className}
          initial={{ opacity: 0, y: offset, scale: 0.995, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, scale: 0.995, filter: "blur(4px)" }}
          transition={{
            duration: variant === "fade" ? 0.26 : 0.34,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}

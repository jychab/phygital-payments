"use client";

import type { ReactNode } from "react";

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
  const motion =
    variant === "fade" ? galleryAnimate.stageFade : galleryAnimate.stage;
  return (
    <div key={stageKey} className={cn(motion, className)}>
      {children}
    </div>
  );
}

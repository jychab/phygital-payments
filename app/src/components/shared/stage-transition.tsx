"use client";

import type { ReactNode } from "react";

import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Crossfade/rise when claim or ceremony stage content swaps. */
export function StageTransition({
  stageKey,
  children,
  className,
}: {
  stageKey: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div key={stageKey} className={cn(galleryAnimate.stage, className)}>
      {children}
    </div>
  );
}

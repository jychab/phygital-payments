"use client";

import type { CSSProperties, ReactNode } from "react";

import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Sticky bottom action dock — primary CTAs across token, claim, collect, pay.
 * Safe-area padding lives here so the shell can stay tight at the bottom.
 */
export function StickyActions({
  children,
  className,
  animate = true,
  enterDelayMs,
  blur = true,
}: {
  children: ReactNode;
  className?: string;
  /** Skip slide-up when the dock remounts inside a stage swap. */
  animate?: boolean;
  enterDelayMs?: number;
  /** Token/claim use blur; collect/pay stay solid to avoid scroll paint cost. */
  blur?: boolean;
}) {
  const style: CSSProperties | undefined =
    animate && enterDelayMs != null && enterDelayMs > 0
      ? { animationDelay: `${enterDelayMs}ms` }
      : undefined;

  return (
    <div
      className={cn(
        "sticky bottom-0 mt-auto flex w-full flex-col gap-2.5",
        "border-t border-border/40 pt-3",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        blur ? "bg-background/95 backdrop-blur-sm" : "bg-background",
        animate && galleryAnimate.slideUp,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

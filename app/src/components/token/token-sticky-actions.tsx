"use client";

import type { ReactNode } from "react";

import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Sticky bottom action stack for token landings (Verify / claim / Pay). */
export function TokenStickyActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 mt-auto flex w-full flex-col gap-2.5",
        "border-t border-border/40 bg-background/95 py-3 backdrop-blur-sm",
        galleryAnimate.slideUp,
        className,
      )}
    >
      {children}
    </div>
  );
}

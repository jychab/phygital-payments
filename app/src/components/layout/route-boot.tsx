"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { brand } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Compact route loading splash (Suspense / dynamic import). */
export function RouteBoot({ children }: { children?: ReactNode }) {
  return (
    <AppShell layout="compact">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-14">
        <div
          className={cn(
            "h-2 w-24 rounded-full bg-linear-to-r from-muted/30 via-muted/60 to-muted/30 bg-size-[200%_100%]",
            galleryAnimate.shimmer,
          )}
          aria-hidden
        />
        <p className="font-(family-name:--font-display) text-sm tracking-tight text-muted-foreground">
          {brand.company}
        </p>
      </div>
      {children}
    </AppShell>
  );
}

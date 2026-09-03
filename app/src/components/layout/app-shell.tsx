"use client";

import type { ReactNode } from "react";

import { brand } from "@/lib/copy/phygital";
import {
  shellLayoutClass,
  shellPaddingClass,
  type ShellLayout,
} from "@/lib/layout";
import { galleryAnimate } from "@/lib/motion";
import { isMainnet } from "@/lib/solana/cluster";
import { cn } from "@/lib/utils";
import Link from "next/link";

/** Chrome for every route: company wordmark; identity chip supplied by page. */
export function AppShell({
  children,
  layout = "compact",
  headerExtra,
  showWordmark = true,
}: {
  children: ReactNode;
  layout?: ShellLayout;
  headerExtra?: ReactNode;
  showWordmark?: boolean;
}) {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-x-clip bg-background">
      <main
        className={cn(
          "relative z-10 mx-auto flex w-full min-w-0 flex-1 flex-col",
          shellPaddingClass,
          shellLayoutClass[layout],
        )}
      >
        <div
          className={cn(
            "mb-5 flex items-center justify-between gap-2 sm:gap-3 md:mb-6",
            galleryAnimate.rise,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            {showWordmark ? (
              <Link
                href="/"
                className="truncate font-(family-name:--font-display) text-sm font-medium tracking-tight text-foreground"
              >
                {brand.company}
              </Link>
            ) : (
              <span className="w-4" aria-hidden />
            )}
            {!isMainnet() ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:px-2.5">
                <span
                  className="size-1 rounded-full bg-muted-foreground/70"
                  aria-hidden
                />
                Devnet
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerExtra}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}

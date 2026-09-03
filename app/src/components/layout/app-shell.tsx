"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { brand } from "@/lib/copy/phygital";
import {
  shellLayoutClass,
  shellPaddingClass,
  type ShellLayout,
} from "@/lib/layout";
import { galleryAnimate } from "@/lib/motion";
import { isMainnet } from "@/lib/solana/cluster";
import { cn } from "@/lib/utils";

/** Chrome for every route: optional centered company wordmark; trailing slot for page chrome. */
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
            "relative mb-4 flex min-h-11 items-center md:mb-5",
            galleryAnimate.rise,
          )}
        >
          <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
            {!isMainnet() ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:px-2.5">
                <span
                  className="size-1 rounded-full bg-muted-foreground/70"
                  aria-hidden
                />
                Devnet
              </span>
            ) : (
              <span className="w-4" aria-hidden />
            )}
          </div>

          {showWordmark ? (
            <Link
              href="/"
              className="absolute left-1/2 max-w-[50%] -translate-x-1/2 truncate font-(family-name:--font-display) text-sm font-semibold tracking-tight text-foreground hover:opacity-80"
            >
              {brand.company}
            </Link>
          ) : null}

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            {headerExtra}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}

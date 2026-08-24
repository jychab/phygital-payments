"use client";

import type { ReactNode } from "react";

import { isMainnet } from "@/lib/solana/cluster";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  modeLabel,
}: {
  children: ReactNode;
  modeLabel?: string;
}) {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col">
      <AmbientBackground />
      <main
        className={cn(
          "relative z-10 mx-auto flex w-full flex-1 flex-col",
          // Phone column on small screens; slightly roomier frame on desktop.
          "max-w-md md:max-w-lg lg:max-w-xl",
          "px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5 md:px-6 md:pt-8 md:pb-8",
        )}
      >
        <div className="mb-4 flex items-center gap-3 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both] md:mb-5">
          <div className="flex min-w-0 items-center gap-2">
            {modeLabel ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {modeLabel}
              </span>
            ) : null}
            {!isMainnet() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span
                  className="size-1 rounded-full bg-muted-foreground/70"
                  aria-hidden
                />
                Devnet
              </span>
            ) : null}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export function AppCard({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-2 flex min-h-0 flex-1 flex-col overflow-hidden",
        "rounded-[1.4rem] border border-border/50 bg-card/80 shadow-[0_24px_80px_-48px_oklch(0_0_0/0.9)] backdrop-blur-xl",
        "p-4 sm:p-5 md:mt-3 md:rounded-[1.6rem] md:p-6",
        // Fill viewport under chrome; flex-1 handles the rest of the height chain.
        "min-h-[calc(100dvh-7.5rem)] md:min-h-[calc(100dvh-9rem)]",
        "motion-safe:animate-[wallet-rise_0.6s_cubic-bezier(0.22,1,0.36,1)_0.04s_both]",
      )}
    >
      {children}
    </div>
  );
}

export function AppBoot({ modeLabel }: { modeLabel?: string }) {
  return (
    <AppShell modeLabel={modeLabel}>
      <AppCard>
        <div className="flex flex-1 flex-col items-center justify-center py-14" />
      </AppCard>
    </AppShell>
  );
}

function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-28 -top-16 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_9%,transparent),transparent_70%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_16s_ease-in-out_infinite] md:h-[32rem] md:w-[32rem]" />
      <div className="absolute -bottom-16 -right-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_6%,transparent),transparent_72%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_20s_ease-in-out_infinite_reverse] md:h-[34rem] md:w-[34rem]" />
    </div>
  );
}

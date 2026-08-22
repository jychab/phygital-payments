"use client";

import type { ReactNode } from "react";

import { isMainnet } from "@/lib/solana/cluster";

/** Chrome for `/accessory`: mode label and cluster badge. */
export function AppShell({
  children,
  modeLabel,
}: {
  children: ReactNode;
  modeLabel?: string;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <AmbientBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-5 md:px-6">
        <div className="mb-5 flex items-center gap-3 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex min-w-0 items-center gap-2">
            {modeLabel ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {modeLabel}
              </span>
            ) : null}
            {!isMainnet() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span className="size-1 rounded-full bg-muted-foreground/70" aria-hidden />
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
    <div className="mt-4 flex flex-1 flex-col rounded-[1.6rem] border border-border/50 bg-card/80 p-5 shadow-[0_24px_80px_-48px_oklch(0_0_0/0.9)] backdrop-blur-xl motion-safe:animate-[wallet-rise_0.6s_cubic-bezier(0.22,1,0.36,1)_0.04s_both] md:p-6">
      {children}
    </div>
  );
}

/** Empty chrome while `/accessory` hydrates. */
export function AppBoot() {
  return (
    <AppShell modeLabel="Accessory">
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
      <div className="absolute -left-28 -top-16 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_9%,transparent),transparent_70%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_16s_ease-in-out_infinite]" />
      <div className="absolute -bottom-16 -right-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_6%,transparent),transparent_72%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_20s_ease-in-out_infinite_reverse]" />
    </div>
  );
}

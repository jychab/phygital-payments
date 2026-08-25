"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

import { CopyableAddress } from "@/components/shared/copyable-address";
import {
  appCardPaddingClass,
  shellLayoutClass,
  shellPaddingClass,
  type ShellLayout,
} from "@/lib/layout";
import { galleryAnimate } from "@/lib/motion";
import { isMainnet } from "@/lib/solana/cluster";
import { cn } from "@/lib/utils";

const WalletChip = dynamic(
  () => import("@/components/shared/wallet-chip").then((m) => m.WalletChip),
  { ssr: false },
);

export type WalletActionsMode = "full" | "display-only" | "hidden";

export type AppMode = "Home" | "Collect" | "Accessory" | "Card";

/** Chrome for every route: wordmark or mode label, optional wallet chip. */
export function AppShell({
  recipient,
  children,
  walletActions = "full",
  modeLabel,
  layout = "compact",
  wordmark = false,
  headerExtra,
}: {
  /** Required for `walletActions="display-only"` (sealed Collect chip). */
  recipient?: string | null;
  children: ReactNode;
  walletActions?: WalletActionsMode;
  modeLabel?: AppMode;
  wordmark?: boolean;
  layout?: ShellLayout;
  headerExtra?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <main
        className={cn(
          "relative z-10 mx-auto flex w-full flex-1 flex-col",
          shellPaddingClass,
          shellLayoutClass[layout],
        )}
      >
        <div
          className={cn(
            "mb-5 flex items-center justify-between gap-3",
            galleryAnimate.rise,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            {wordmark ? (
              <span className="font-(family-name:--font-display) text-sm font-medium tracking-tight text-foreground">
                Phygital
              </span>
            ) : modeLabel ? (
              <span className="text-eyebrow text-muted-foreground">
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
            ) : wordmark || modeLabel ? null : (
              <span aria-hidden />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerExtra}
            {walletActions === "full" ? (
              <WalletChip />
            ) : walletActions === "display-only" && recipient ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs">
                <span
                  className="size-1.5 rounded-full bg-muted-foreground/50"
                  aria-hidden
                />
                <CopyableAddress address={recipient} label="wallet address" />
              </span>
            ) : (
              <span aria-hidden />
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export function AppCard({
  children,
  bare = false,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  if (bare) {
    return <div className="flex flex-1 flex-col">{children}</div>;
  }

  return (
    <div
      className={cn(
        "mt-4 flex flex-1 flex-col rounded-2xl border border-border/60 bg-card/60",
        appCardPaddingClass,
        galleryAnimate.rise,
      )}
    >
      {children}
    </div>
  );
}

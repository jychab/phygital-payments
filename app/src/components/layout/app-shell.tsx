"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

import { PrivyGate } from "@/app/privy-wallet-root";
import { CopyableAddress } from "@/components/shared/copyable-address";
import { brand } from "@/lib/copy/phygital";
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

/** Product / object chrome labels — not company name. */
export type AppMode = "Collection" | "Collect" | "Accessory" | "Card" | "Pay";

/** Chrome for every route: company wordmark OR product/object label. */
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
  /** Company wordmark (use on `/` hub only). */
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
                {brand.company}
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
              <PrivyGate
                fallback={
                  <span className="inline-flex h-8 items-center rounded-full border border-border/60 px-2.5 text-xs text-muted-foreground">
                    …
                  </span>
                }
              >
                <WalletChip />
              </PrivyGate>
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

/**
 * Same root element whether bare or framed so toggling chrome (e.g. Pay)
 * does not remount authenticity / NFC children.
 */
export function AppCard({
  children,
  bare = false,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        !bare &&
          cn(
            "mt-4 rounded-2xl border border-border/60 bg-card/60",
            appCardPaddingClass,
            galleryAnimate.rise,
          ),
      )}
    >
      {children}
    </div>
  );
}

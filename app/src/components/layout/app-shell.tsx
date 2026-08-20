"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

import { CopyableAddress } from "@/components/shared/copyable-address";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { collectHref } from "@/lib/collect/payment-request";
import { isMainnet } from "@/lib/solana/cluster";
import { cn } from "@/lib/utils";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";

const WalletChip = dynamic(
  () => import("@/components/shared/wallet-chip").then((m) => m.WalletChip),
  { ssr: false },
);

export type WalletActionsMode = "full" | "display-only" | "hidden";

export type AppMode = "Home" | "Collect" | "Setup" | "Device";

export type ModeNavItem = {
  mode: "Home" | "Collect";
  href: string;
  /** Visible but not selectable (e.g. Collect before Connect). */
  disabled?: boolean;
};

/** Shared Home ↔ Collect header dropdown items. */
export function homeCollectModeNav(recipient: string | null): ModeNavItem[] {
  return [
    { mode: "Home", href: "/" },
    {
      mode: "Collect",
      href: recipient ? collectHref({ recipient }) : "/collect",
      disabled: !recipient,
    },
  ];
}

/** Chrome for every route: mode label, Home/Collect switch, optional wallet chip. */
export function AppShell({
  recipient,
  children,
  walletActions = "full",
  modeLabel,
  modeNav,
  linkedOwner,
}: {
  /** Required for `walletActions="display-only"` (sealed Collect chip). */
  recipient?: string | null;
  children: ReactNode;
  /** Session wallet via WalletChip (`full`), sealed link display (`display-only`), or hidden. */
  walletActions?: WalletActionsMode;
  /** Current mode label in the header. */
  modeLabel?: AppMode;
  /** When set, mode label becomes a dropdown (Home / Collect; Device stays the current label). */
  modeNav?: ModeNavItem[] | null;
  /** Asset-linked wallet — must match Privy when both are connected. */
  linkedOwner?: string | null;
}) {
  const navItems = modeNav && modeNav.length > 0 ? modeNav : null;
  const body =
    walletActions === "full" && linkedOwner ? (
      <WalletSyncGate linkedOwner={linkedOwner}>{children}</WalletSyncGate>
    ) : (
      children
    );

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <AmbientBackground />
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-5 md:px-6">
        <div className="mb-5 flex items-center justify-between gap-3 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex min-w-0 items-center gap-2">
            {modeLabel && navItems ? (
              <ModeSwitcher current={modeLabel} items={navItems} />
            ) : modeLabel ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {modeLabel}
              </span>
            ) : null}
            {!isMainnet() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span className="size-1 rounded-full bg-muted-foreground/70" aria-hidden />
                Devnet
              </span>
            ) : modeLabel ? null : (
              <span aria-hidden />
            )}
          </div>
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
        {body}
      </main>
    </div>
  );
}

function ModeSwitcher({
  current,
  items,
}: {
  current: AppMode;
  items: ModeNavItem[];
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1 px-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground outline-none transition-colors",
            "hover:text-foreground",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
            "data-[state=open]:border-border data-[state=open]:bg-muted/40 data-[state=open]:text-foreground",
          )}
          aria-label="Switch mode"
        >
          {current}
          <ChevronDown className="size-3.5 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {items.map((item) => {
          const selected = item.mode === current;
          return (
            <DropdownMenuItem
              key={item.mode}
              disabled={item.disabled}
              onSelect={() => {
                if (selected || item.disabled) return;
                router.push(item.href);
              }}
              className={cn(
                "justify-between text-[0.8125rem]",
                selected && "bg-muted/50 text-foreground",
              )}
            >
              <span>{item.mode}</span>
              {selected ? (
                <Check className="size-3.5 text-primary" aria-hidden />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppCard({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-1 flex-col rounded-[1.6rem] border border-border/50 bg-card/80 p-5 shadow-[0_24px_80px_-48px_oklch(0_0_0/0.9)] backdrop-blur-xl motion-safe:animate-[wallet-rise_0.6s_cubic-bezier(0.22,1,0.36,1)_0.04s_both] md:p-6">
      {children}
    </div>
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

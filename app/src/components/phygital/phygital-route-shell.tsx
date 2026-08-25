"use client";

import type { ReactNode } from "react";

import { PrivyGate } from "@/app/privy-wallet-root";
import { FinishClaimPanel } from "@/components/claim/finish-claim-panel";
import {
  AppCard,
  AppShell,
  type AppMode,
} from "@/components/layout/app-shell";
import type { ShellLayout } from "@/lib/layout";

/**
 * Shared chrome for `/card` and `/accessory`.
 * Authenticity children stay mounted when wallet chrome toggles — Privy wraps
 * only the WalletChip (AppShell) and Pay/claim content, never the NFC tree.
 * `?token=` claim finish mounts Privy for the whole finish panel.
 */
export function PhygitalRouteShell({
  token,
  children,
  modeLabel,
  headerExtra,
  walletActions: walletActionsProp,
  layout = "compact",
}: {
  token?: string;
  children?: ReactNode;
  modeLabel: AppMode;
  headerExtra?: ReactNode;
  walletActions?: "full" | "hidden";
  layout?: ShellLayout;
}) {
  if (token) {
    return (
      <PrivyGate>
        <RouteChrome
          walletActions="full"
          modeLabel={modeLabel}
          layout={layout}
        >
          <FinishClaimPanel />
        </RouteChrome>
      </PrivyGate>
    );
  }

  return (
    <RouteChrome
      walletActions={walletActionsProp ?? "hidden"}
      modeLabel={modeLabel}
      headerExtra={headerExtra}
      layout={layout}
    >
      {children}
    </RouteChrome>
  );
}

function RouteChrome({
  children,
  walletActions,
  modeLabel,
  headerExtra,
  layout,
}: {
  children: ReactNode;
  walletActions: "full" | "hidden";
  modeLabel: AppMode;
  headerExtra?: ReactNode;
  layout: ShellLayout;
}) {
  return (
    <AppShell
      walletActions={walletActions}
      modeLabel={modeLabel}
      headerExtra={headerExtra}
      layout={layout}
    >
      <AppCard bare={walletActions === "hidden"}>{children}</AppCard>
    </AppShell>
  );
}

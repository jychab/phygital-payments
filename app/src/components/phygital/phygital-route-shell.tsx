"use client";

import type { ReactNode } from "react";

import { PrivyGate } from "@/app/privy-wallet-root";
import { FinishClaimPanel } from "@/components/claim/finish-claim-panel";
import {
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
        <AppShell walletActions="full" modeLabel={modeLabel} layout={layout}>
          <FinishClaimPanel />
        </AppShell>
      </PrivyGate>
    );
  }

  return (
    <AppShell
      walletActions={walletActionsProp ?? "hidden"}
      modeLabel={modeLabel}
      headerExtra={headerExtra}
      layout={layout}
    >
      {children}
    </AppShell>
  );
}

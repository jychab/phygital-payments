"use client";

import { type ReactNode } from "react";

import { PrivyGate } from "@/app/privy-wallet-root";
import { FinishClaimPanel } from "@/components/accessory/finish-claim-panel";
import {
  AppCard,
  AppShell,
  homeCollectModeNav,
} from "@/components/layout/app-shell";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/**
 * Chrome for `/accessory`. Authenticity (NFC children) skips Privy.
 * `?token=` (claim handoff) still loads the wallet.
 */
export function AccessoryWalletShell({
  token,
  children,
}: {
  token?: string;
  children?: ReactNode;
}) {
  if (token) {
    return (
      <PrivyGate>
        <AccessoryChrome walletActions="full">
          <FinishClaimPanel />
        </AccessoryChrome>
      </PrivyGate>
    );
  }

  return <AccessoryChrome walletActions="hidden">{children}</AccessoryChrome>;
}

function AccessoryChrome({
  children,
  walletActions,
}: {
  children: ReactNode;
  walletActions: "full" | "hidden";
}) {
  if (walletActions === "full") {
    return <AccessoryChromeWithWallet>{children}</AccessoryChromeWithWallet>;
  }

  return (
    <AppShell walletActions="hidden" modeLabel="Accessory">
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}

function AccessoryChromeWithWallet({ children }: { children: ReactNode }) {
  const { address, isConnected } = useSolanaAddress();

  return (
    <AppShell
      walletActions="full"
      modeLabel="Accessory"
      modeNav={isConnected && address ? homeCollectModeNav(address) : null}
    >
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}

"use client";

import { type ReactNode } from "react";

import { PrivyWalletProvider } from "@/app/privy-wallet-provider";
import { DeviceHome } from "@/components/device/device-home";
import { FinishClaimPanel } from "@/components/device/finish-claim-panel";
import {
  AppCard,
  AppShell,
  homeCollectModeNav,
} from "@/components/layout/app-shell";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/**
 * Privy + AppShell for every `/device` visit.
 * NFC content is `children`; `?token=` finishes a claim; `?owner=&asset=` is owned-device home.
 */
export function DeviceWalletShell({
  token,
  owner,
  asset,
  children,
}: {
  token?: string;
  owner?: string;
  asset?: string;
  children?: ReactNode;
}) {
  return (
    <PrivyWalletProvider>
      <DeviceChrome>
        {token ? (
          <FinishClaimPanel />
        ) : owner && asset ? (
          <DeviceHome owner={owner} asset={asset} />
        ) : (
          children
        )}
      </DeviceChrome>
    </PrivyWalletProvider>
  );
}

function DeviceChrome({ children }: { children: ReactNode }) {
  const { address, isConnected } = useSolanaAddress();

  return (
    <AppShell
      walletActions="full"
      modeLabel="Device"
      modeNav={isConnected && address ? homeCollectModeNav(address) : null}
    >
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}

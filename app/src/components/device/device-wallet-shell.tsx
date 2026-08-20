"use client";

import { type ReactNode } from "react";

import { PrivyGate } from "@/app/privy-wallet-root";
import { DeviceHomeByAddress } from "@/components/device/device-home";
import { FinishClaimPanel } from "@/components/device/finish-claim-panel";
import {
  AppCard,
  AppShell,
  homeCollectModeNav,
} from "@/components/layout/app-shell";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/**
 * AppShell for every `/device` visit. Uses the root `PrivyProvider` via `PrivyGate`.
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
    <PrivyGate>
      <DeviceChrome>
        {token ? (
          <FinishClaimPanel />
        ) : owner && asset ? (
          <DeviceHomeByAddress owner={owner} asset={asset} />
        ) : (
          children
        )}
      </DeviceChrome>
    </PrivyGate>
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

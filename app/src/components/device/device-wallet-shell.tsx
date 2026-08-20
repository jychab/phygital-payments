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
 * Chrome for `/device`. Authenticity (NFC children) skips Privy.
 * `?token=` (claim handoff) and `?owner=&phygital=` still load the wallet.
 */
export function DeviceWalletShell({
  token,
  owner,
  tokenAddress,
  children,
}: {
  token?: string;
  owner?: string;
  tokenAddress?: string;
  children?: ReactNode;
}) {
  if (token) {
    return (
      <PrivyGate>
        <DeviceChrome walletActions="full">
          <FinishClaimPanel />
        </DeviceChrome>
      </PrivyGate>
    );
  }

  if (owner && tokenAddress) {
    return (
      <PrivyGate>
        <DeviceChrome walletActions="full">
          <DeviceHomeByAddress owner={owner} tokenAddress={tokenAddress} />
        </DeviceChrome>
      </PrivyGate>
    );
  }

  return (
    <DeviceChrome walletActions="hidden">{children}</DeviceChrome>
  );
}

function DeviceChrome({
  children,
  walletActions,
}: {
  children: ReactNode;
  walletActions: "full" | "hidden";
}) {
  if (walletActions === "full") {
    return <DeviceChromeWithWallet>{children}</DeviceChromeWithWallet>;
  }

  return (
    <AppShell walletActions="hidden" modeLabel="Device">
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}

function DeviceChromeWithWallet({ children }: { children: ReactNode }) {
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

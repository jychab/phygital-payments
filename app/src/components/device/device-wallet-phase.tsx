"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { PrivyWalletProvider } from "@/app/privy-wallet-provider";
import { FinishClaimPanel } from "@/components/device/finish-claim-panel";
import { PayTab } from "@/components/pay/pay-tab";
import {
  AppCard,
  AppShell,
  homeCollectModeNav,
} from "@/components/layout/app-shell";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/**
 * Privy + header for every `/device` visit. NFC content is `children`;
 * `?token=` / `?owner=&asset=` replace it with wallet finish.
 */
export function DeviceWalletPhase({
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
  const router = useRouter();

  return (
    <PrivyWalletProvider>
      <DeviceShell linkedOwner={owner && asset ? owner : null}>
        {token ? (
          <FinishClaimPanel />
        ) : owner && asset ? (
          <PayTab
            owner={owner}
            pinnedAsset={asset}
            onExit={() => router.push("/")}
          />
        ) : (
          children
        )}
      </DeviceShell>
    </PrivyWalletProvider>
  );
}

function DeviceShell({
  children,
  linkedOwner,
}: {
  children: ReactNode;
  linkedOwner?: string | null;
}) {
  const { address, isConnected } = useSolanaAddress();

  return (
    <AppShell
      walletActions="full"
      modeLabel="Device"
      modeNav={isConnected && address ? homeCollectModeNav(address) : null}
      linkedOwner={linkedOwner}
    >
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}

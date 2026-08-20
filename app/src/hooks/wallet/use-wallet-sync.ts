"use client";

import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";

/**
 * Compare a route's linked wallet (asset owner, URL recipient, etc.)
 * with the connected Privy session. Block when both are set and differ.
 */
export function useWalletSync(linkedOwner: string | null) {
  const wallet = useExpectedWallet(linkedOwner ?? "");
  const blocked = Boolean(
    linkedOwner && wallet.ready && wallet.isConnected && wallet.wrongWallet,
  );

  return { ...wallet, linkedOwner, blocked };
}

"use client";

import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/** Whether the connected wallet matches an expected owner address. */
export function useExpectedWallet(expectedOwner: string) {
  const { address, isConnected, ready, connect } = useSolanaAddress();
  const wrongWallet =
    isConnected && address != null && address !== expectedOwner;
  const matched = isConnected && address === expectedOwner;
  const ownerShort = shortAddress(expectedOwner, 4);

  return {
    address,
    isConnected,
    ready,
    connect,
    wrongWallet,
    matched,
    ownerShort,
  };
}

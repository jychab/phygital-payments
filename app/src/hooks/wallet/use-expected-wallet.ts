"use client";

import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/** Whether the connected wallet matches `owner`. */
export function useExpectedWallet(owner: string) {
  const { address, isConnected, ready, connect } = useSolanaAddress();
  const wrongWallet = isConnected && address != null && address !== owner;
  const matched = isConnected && address === owner;
  const ownerShort = shortAddress(owner, 4);

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

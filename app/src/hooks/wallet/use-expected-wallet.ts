"use client";

import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/** Whether the connected wallet matches `owner`. */
export function useExpectedWallet(owner: string) {
  const { address, connect } = useSolanaAddress();
  const wrongWallet = address != null && address !== owner;
  const matched = address === owner;
  const ownerShort = shortAddress(owner, 4);

  return {
    address,
    isConnected: Boolean(address),
    connect,
    wrongWallet,
    matched,
    ownerShort,
  };
}

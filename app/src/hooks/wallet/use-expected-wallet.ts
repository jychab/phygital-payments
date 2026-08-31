"use client";

import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/**
 * Whether the connected wallet matches an expected owner/recipient.
 * Only compares when both `owner` and a connected address are present.
 */
export function useExpectedWallet(owner: string) {
  const { address, connect, connectReady } = useSolanaAddress();
  const hasExpected = Boolean(owner);
  const wrongWallet =
    hasExpected && address != null && address !== owner;
  const matched = hasExpected && address === owner;
  const ownerShort = shortAddress(owner, 4);

  return {
    address,
    isConnected: Boolean(address),
    connectReady,
    connect,
    wrongWallet,
    matched,
    ownerShort,
  };
}

"use client";

import { useWallet } from "./wallet-context";

export { solanaAddressFromLinkedAccounts } from "./privy-config";

/**
 * Connected Solana address + connection state, sourced from the active wallet
 * backend (iframe parent bridge or Privy). See {@link useWallet}.
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  ready: boolean;
} {
  const { address, isConnected, ready } = useWallet();
  return { address, isConnected, ready };
}

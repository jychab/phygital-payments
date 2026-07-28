"use client";

import { useParentWallet } from "@/lib/wallet/parent-bridge";

/**
 * The connected Solana address is owned by the parent vault wallet and arrives
 * over the postMessage bridge. Same return shape as before so downstream
 * components (payments-app, fund-panel, history-panel) are unchanged.
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  ready: boolean;
  isEmbedded: boolean;
} {
  const { address, isConnected, ready, isEmbedded } = useParentWallet();
  return { address, isConnected, ready, isEmbedded };
}

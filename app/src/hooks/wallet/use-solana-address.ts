"use client";

import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";

/**
 * Connected vault address from the app passkey smart wallet.
 * `address` is the LazorKit vault PDA (`token.owner`).
 */
export function useSolanaAddress(): {
  address: string | null;
  isConnected: boolean;
  ready: boolean;
  walletIcon: string | null;
  walletName: string | null;
  isEmbeddedWallet: boolean;
  canExportWallet: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
} {
  const wallet = useSmartWallet();
  return {
    address: wallet.address,
    isConnected: wallet.isConnected,
    ready: wallet.ready,
    walletIcon: null,
    walletName: wallet.isConnected ? "Passkey" : null,
    isEmbeddedWallet: false,
    canExportWallet: false,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
  };
}

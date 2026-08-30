"use client";

import { useCallback } from "react";
import { useSignMessage } from "@privy-io/react-auth/solana";

import { useActiveSolanaWallet } from "@/hooks/wallet/use-active-solana-wallet";

/**
 * Sign an arbitrary message with the connected Solana wallet.
 * Used for Pay API-key provision and Confirm Payments.
 */
export function useWalletSignMessage() {
  const { ready, wallet } = useActiveSolanaWallet();
  const { signMessage: privySignMessage } = useSignMessage();

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!ready || !wallet) {
        throw new Error("Connect a wallet that can sign messages");
      }
      const { signature } = await privySignMessage({
        message,
        wallet,
        options: {
          uiOptions: { showWalletUIs: true },
        },
      });
      return signature;
    },
    [ready, wallet, privySignMessage],
  );

  return { signMessage };
}

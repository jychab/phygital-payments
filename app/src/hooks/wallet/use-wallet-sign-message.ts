"use client";

import { useCallback } from "react";
import { useSignMessage, useWallets } from "@privy-io/react-auth/solana";

/**
 * Sign an arbitrary message with the connected Solana wallet.
 * Used for Pay API-key provision and Confirm Payments.
 */
export function useWalletSignMessage() {
  const { wallets, ready } = useWallets();
  const { signMessage: privySignMessage } = useSignMessage();
  const wallet = wallets[0] ?? null;

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

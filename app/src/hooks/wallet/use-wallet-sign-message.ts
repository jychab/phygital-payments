"use client";

import { useCallback } from "react";
import { useTransactionSigner } from "@solana/connector/react";

/**
 * Sign an arbitrary message with the connected wallet (Wallet Standard
 * `solana:signMessage`). Used for Pay API-key provision and Confirm Payments.
 */
export function useWalletSignMessage() {
  const { signer, ready, capabilities } = useTransactionSigner();

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!ready || !signer?.signMessage || !capabilities.canSignMessage) {
        throw new Error("Connect a wallet that can sign messages");
      }
      return signer.signMessage(message);
    },
    [ready, signer, capabilities.canSignMessage],
  );

  return { signMessage };
}

"use client";

import { useKitTransactionSigner } from "@solana/connector/react";
import type { TransactionModifyingSigner } from "@solana/kit";

/** ConnectorKit `@solana/kit` TransactionModifyingSigner for the connected wallet. */
export function useWalletKitSigner(): TransactionModifyingSigner | null {
  const { signer } = useKitTransactionSigner();
  return signer;
}

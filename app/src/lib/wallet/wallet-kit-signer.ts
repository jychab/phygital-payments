"use client";

import { useMemo } from "react";
import {
  address,
  getTransactionDecoder,
  getTransactionEncoder,
  SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
  SolanaError,
  type SignatureBytes,
  type TransactionPartialSigner,
} from "@solana/kit";
import {
  useSignTransaction,
  useWallets,
  type ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";

import { getChainId } from "@/lib/solana/cluster";

function isNonZero(sig: SignatureBytes): boolean {
  return sig.some((b) => b !== 0);
}

type SignTx = ReturnType<typeof useSignTransaction>["signTransaction"];

/**
 * A @solana/kit TransactionPartialSigner backed by Privy's Solana
 * signTransaction.
 */
export function makePrivyKitSigner(
  wallet: ConnectedStandardSolanaWallet,
  signTransaction: SignTx,
): TransactionPartialSigner {
  const signerAddress = address(wallet.address);
  const chain = getChainId();
  return {
    address: signerAddress,
    async signTransactions(transactions) {
      const results = [];
      for (const tx of transactions) {
        const encoded = new Uint8Array(getTransactionEncoder().encode(tx));
        const { signedTransaction } = await signTransaction({
          transaction: encoded,
          wallet,
          chain,
        });
        const decoded = getTransactionDecoder().decode(signedTransaction);
        const signature = decoded.signatures[signerAddress];
        if (!signature || !isNonZero(signature)) {
          throw new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
            addresses: [signerAddress],
          });
        }
        results.push(Object.freeze({ [signerAddress]: signature }));
      }
      return results;
    },
  };
}

export function useWalletKitSigner(): TransactionPartialSigner | null {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const wallet = wallets[0] ?? null;

  return useMemo(
    () => (wallet ? makePrivyKitSigner(wallet, signTransaction) : null),
    [wallet, signTransaction],
  );
}

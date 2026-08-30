"use client";

import { useMemo } from "react";
import {
  useSignTransaction,
  useWallets,
  type ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";
import {
  address,
  getTransactionDecoder,
  getTransactionEncoder,
  type Transaction,
  type TransactionModifyingSigner,
  type TransactionWithLifetime,
  type TransactionWithinSizeLimit,
} from "@solana/kit";

import { getChainId } from "@/lib/solana/cluster";

type SignTransactionFn = ReturnType<
  typeof useSignTransaction
>["signTransaction"];

type SignedTx = Transaction & TransactionWithinSizeLimit & TransactionWithLifetime;

function createPrivyKitSigner(
  wallet: ConnectedStandardSolanaWallet,
  signTransaction: SignTransactionFn,
): TransactionModifyingSigner {
  const chain = getChainId();
  return {
    address: address(wallet.address),
    async modifyAndSignTransactions(transactions, config) {
      const signed: SignedTx[] = [];

      for (const tx of transactions) {
        config?.abortSignal?.throwIfAborted();
        const encoded = getTransactionEncoder().encode(tx);
        const { signedTransaction } = await signTransaction({
          transaction: new Uint8Array(encoded),
          wallet,
          chain,
        });
        const decoded = getTransactionDecoder().decode(signedTransaction);
        const lifetime =
          "lifetimeConstraint" in tx
            ? (tx as Transaction & TransactionWithLifetime).lifetimeConstraint
            : undefined;
        signed.push({
          ...decoded,
          ...(lifetime ? { lifetimeConstraint: lifetime } : {}),
        } as SignedTx);
      }

      return signed;
    },
  };
}

/** Privy-backed `@solana/kit` TransactionModifyingSigner for the active wallet. */
export function useWalletKitSigner(): TransactionModifyingSigner | null {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const wallet = wallets[0] ?? null;

  return useMemo(() => {
    if (!wallet) return null;
    return createPrivyKitSigner(wallet, signTransaction);
  }, [wallet, signTransaction]);
}

"use client";

import { useMemo } from "react";
import {
  address,
  getTransactionDecoder,
  getTransactionEncoder,
  signatureBytes,
  SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
  SolanaError,
  type SignatureBytes,
  type Transaction,
  type TransactionModifyingSigner,
  type TransactionWithinSizeLimit,
  type TransactionWithLifetime,
} from "@solana/kit";
import {
  useSignTransaction,
  useWallets,
  type ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";

import { getChainId } from "@/lib/solana/cluster";

function isNonZero(sig: SignatureBytes | null | undefined): sig is SignatureBytes {
  return Boolean(sig?.some((b) => b !== 0));
}

type SignedTx = Transaction & TransactionWithinSizeLimit & TransactionWithLifetime;

/** Keep kit confirm metadata; never rewrite signed message bytes or signatures. */
function asSignedTx(
  original: Transaction | (Transaction & TransactionWithLifetime),
  signed: Transaction,
): SignedTx {
  const lifetimeConstraint =
    "lifetimeConstraint" in original ? original.lifetimeConstraint : undefined;
  return Object.freeze({
    ...signed,
    ...(lifetimeConstraint ? { lifetimeConstraint } : {}),
  }) as SignedTx;
}

type SignTx = ReturnType<typeof useSignTransaction>["signTransaction"];

/**
 * A @solana/kit TransactionModifyingSigner backed by Privy's Solana
 * signTransaction. Returns the wallet-signed transaction as-is so a wallet
 * that mutates the message (compute budget, etc.) is not re-bound to the
 * original compiled bytes.
 */
export function makePrivyKitSigner(
  wallet: ConnectedStandardSolanaWallet,
  signTransaction: SignTx,
): TransactionModifyingSigner {
  const signerAddress = address(wallet.address);
  const chain = getChainId();
  return {
    address: signerAddress,
    async modifyAndSignTransactions(transactions) {
      const results: SignedTx[] = [];
      for (const tx of transactions) {
        const encoded = new Uint8Array(getTransactionEncoder().encode(tx));
        const { signedTransaction } = await signTransaction({
          transaction: encoded,
          wallet,
          chain,
        });
        const decoded = getTransactionDecoder().decode(signedTransaction);
        if (!isNonZero(decoded.signatures[signerAddress])) {
          throw new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
            addresses: [signerAddress],
          });
        }
        results.push(asSignedTx(tx, decoded));
      }
      return results;
    },
  };
}

export function useWalletKitSigner(): TransactionModifyingSigner | null {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const wallet = wallets[0] ?? null;

  return useMemo(
    () => (wallet ? makePrivyKitSigner(wallet, signTransaction) : null),
    [wallet, signTransaction],
  );
}

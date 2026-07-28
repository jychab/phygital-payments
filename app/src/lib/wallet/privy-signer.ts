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

type SignTransactionFn = (input: {
  transaction: Uint8Array;
  wallet: ConnectedStandardSolanaWallet;
}) => Promise<{ signedTransaction: Uint8Array }>;

async function signWires(
  signTransaction: SignTransactionFn,
  wallet: ConnectedStandardSolanaWallet,
  wires: Uint8Array[],
): Promise<Uint8Array[]> {
  const signed: Uint8Array[] = [];
  for (const wire of wires) {
    const { signedTransaction } = await signTransaction({
      transaction: wire,
      wallet,
    });
    signed.push(signedTransaction);
  }
  return signed;
}

function isNonZero(sig: SignatureBytes): boolean {
  return sig.some((b) => b !== 0);
}

export function makeKitSigner(
  signTransaction: SignTransactionFn,
  wallet: ConnectedStandardSolanaWallet,
): TransactionPartialSigner {
  const signerAddress = address(wallet.address);
  return {
    address: signerAddress,
    async signTransactions(transactions) {
      const wires = transactions.map(
        (tx) => new Uint8Array(getTransactionEncoder().encode(tx)),
      );
      const signed = await signWires(signTransaction, wallet, wires);
      return signed.map((wire) => {
        const decoded = getTransactionDecoder().decode(wire);
        const signature = decoded.signatures[signerAddress];
        if (!signature || !isNonZero(signature)) {
          throw new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
            addresses: [signerAddress],
          });
        }
        return Object.freeze({ [signerAddress]: signature });
      });
    },
  };
}

export function useWalletKitSigner(): TransactionPartialSigner | null {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const wallet = wallets[0] ?? null;

  return useMemo(
    () => (wallet ? makeKitSigner(signTransaction, wallet) : null),
    [wallet, signTransaction],
  );
}

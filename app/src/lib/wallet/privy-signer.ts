"use client";

import { type TransactionPartialSigner } from "@solana/kit";
import { type ConnectedStandardSolanaWallet } from "@privy-io/react-auth/solana";

import { makeKitSignerFromWires } from "./kit-signer";

type SignTransactionFn = (input: {
  transaction: Uint8Array;
  wallet: ConnectedStandardSolanaWallet;
}) => Promise<{ signedTransaction: Uint8Array }>;

/** Build a kit signer backed by Privy's `useSignTransaction`. */
export function makeKitSigner(
  signTransaction: SignTransactionFn,
  wallet: ConnectedStandardSolanaWallet,
): TransactionPartialSigner {
  return makeKitSignerFromWires(wallet.address, async (wires) => {
    const signed: Uint8Array[] = [];
    for (const wire of wires) {
      const { signedTransaction } = await signTransaction({
        transaction: wire,
        wallet,
      });
      signed.push(signedTransaction);
    }
    return signed;
  });
}

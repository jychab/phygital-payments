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

import { useParentWallet } from "@/lib/wallet/parent-bridge";

/** Signs a single unsigned wire tx via the parent, returning the signed wire. */
type SignWireFn = (wire: Uint8Array) => Promise<Uint8Array>;

async function signWires(
  signWire: SignWireFn,
  wires: Uint8Array[],
): Promise<Uint8Array[]> {
  const signed: Uint8Array[] = [];
  for (const wire of wires) {
    signed.push(await signWire(wire));
  }
  return signed;
}

function isNonZero(sig: SignatureBytes): boolean {
  return sig.some((b) => b !== 0);
}

/**
 * A @solana/kit TransactionPartialSigner whose signing is proxied to the parent
 * vault wallet over postMessage. It encodes kit transactions to wire bytes,
 * asks the parent to sign, then decodes and extracts this signer's signature.
 */
export function makeBridgeSigner(
  signWire: SignWireFn,
  walletAddress: string,
): TransactionPartialSigner {
  const signerAddress = address(walletAddress);
  return {
    address: signerAddress,
    async signTransactions(transactions) {
      const wires = transactions.map(
        (tx) => new Uint8Array(getTransactionEncoder().encode(tx)),
      );
      const signed = await signWires(signWire, wires);
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
  const { address: walletAddress, signTransaction } = useParentWallet();

  return useMemo(
    () =>
      walletAddress ? makeBridgeSigner(signTransaction, walletAddress) : null,
    [walletAddress, signTransaction],
  );
}

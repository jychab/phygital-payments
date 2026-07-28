import {
  address,
  getTransactionDecoder,
  getTransactionEncoder,
  SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
  SolanaError,
  type SignatureBytes,
  type Transaction,
  type TransactionPartialSigner,
} from "@solana/kit";

/** Sign a batch of wire-encoded transactions, returning the signed wires. */
export type SignWires = (wires: Uint8Array[]) => Promise<Uint8Array[]>;

function isNonZero(sig: SignatureBytes): boolean {
  return sig.some((b) => b !== 0);
}

/**
 * Build a `@solana/kit` partial signer from a lower-level "sign these wire
 * transactions" function. Both the Privy wallet and the iframe parent bridge
 * ultimately return fully-signed wire transactions, so they share this adapter:
 * each transaction is wire-encoded, handed to `signWires`, then the signature
 * for `signerAddress` is extracted from the returned wire.
 */
export function makeKitSignerFromWires(
  signerAddressString: string,
  signWires: SignWires,
): TransactionPartialSigner {
  const signerAddress = address(signerAddressString);
  return {
    address: signerAddress,
    async signTransactions(transactions: readonly Transaction[]) {
      const wires = transactions.map(
        (tx) => new Uint8Array(getTransactionEncoder().encode(tx)),
      );
      const signed = await signWires(wires);
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

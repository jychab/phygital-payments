import type { Address, TransactionPartialSigner } from "@solana/kit";

/**
 * Instruction-meta signer with no local key. Signatures come from the
 * sponsor server or an on-chain CPI.
 */
export function createAddressSigner(
  address: Address,
  reason = "This signer does not hold a key",
): TransactionPartialSigner {
  return {
    address,
    async signTransactions() {
      throw new Error(reason);
    },
  };
}

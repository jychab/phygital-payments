import { getSetLockStateInstruction } from "phygital-token-sdk";
import type { Address } from "@solana/kit";

import { createAddressSigner } from "@/lib/solana/address-signer";

/** Vault PDA signs set_lock_state via LazorKit Execute CPI. */
export function lockAccessoryForVault(args: {
  token: Address;
  vaultPda: Address;
}) {
  return getSetLockStateInstruction({
    owner: createAddressSigner(
      args.vaultPda,
      "Vault signs via LazorKit Execute CPI",
    ),
    token: args.token,
    isLocked: true,
  });
}

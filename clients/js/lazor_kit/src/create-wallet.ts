import { createNoopSigner, type Address, type Instruction } from "@solana/kit";

import { AUTH_TYPE_SECP256R1 } from "./constants";
import { getCreateWalletInstruction } from "./generated/instructions/createWallet";
import { LAZORKIT_PROGRAM_PROGRAM_ADDRESS } from "./generated/programs/lazorkitProgram";
import type { LazorKitPdas } from "./pdas";

/** Convenience builder: Address payer (sponsored) instead of a TransactionSigner. */
export function buildCreateWalletInstruction(args: {
  payer: Address;
  pdas: LazorKitPdas;
  userSeed: Uint8Array;
  credentialIdHash: Uint8Array;
  compressedPubkey: Uint8Array;
  programAddress?: Address;
}): Instruction {
  if (args.userSeed.length !== 32) throw new Error("userSeed must be 32 bytes");
  if (args.credentialIdHash.length !== 32) {
    throw new Error("credentialIdHash must be 32 bytes");
  }
  if (args.compressedPubkey.length !== 33) {
    throw new Error("compressedPubkey must be 33 bytes");
  }
  return getCreateWalletInstruction(
    {
      payer: createNoopSigner(args.payer),
      wallet: args.pdas.walletPda,
      vault: args.pdas.vaultPda,
      authority: args.pdas.authorityPda,
      userSeed: args.userSeed,
      authType: AUTH_TYPE_SECP256R1,
      authPubkey: args.compressedPubkey,
      credentialHash: args.credentialIdHash,
    },
    {
      programAddress: args.programAddress ?? LAZORKIT_PROGRAM_PROGRAM_ADDRESS,
    },
  );
}

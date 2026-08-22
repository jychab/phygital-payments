import {
  AccountRole,
  type Address,
  type Instruction,
} from "@solana/kit";

import {
  AUTH_TYPE_SECP256R1,
  DISC_CREATE_WALLET,
  SYSTEM_PROGRAM_ADDRESS,
  SYSVAR_RENT_ADDRESS,
  lazorkitProgramAddress,
} from "./constants";
import { concatBytes } from "./bytes";
import type { LazorKitPdas } from "./pdas";

export function encodeCreateWalletData(args: {
  userSeed: Uint8Array;
  credentialIdHash: Uint8Array;
  compressedPubkey: Uint8Array;
  rpId: string;
  authBump?: number;
}): Uint8Array {
  if (args.userSeed.length !== 32) throw new Error("userSeed must be 32 bytes");
  if (args.credentialIdHash.length !== 32) {
    throw new Error("credentialIdHash must be 32 bytes");
  }
  if (args.compressedPubkey.length !== 33) {
    throw new Error("compressedPubkey must be 33 bytes");
  }
  const rpId = new TextEncoder().encode(args.rpId);
  if (rpId.length === 0 || rpId.length > 253) {
    throw new Error("Invalid rpId");
  }
  const header = new Uint8Array(40);
  header.set(args.userSeed, 0);
  header[32] = AUTH_TYPE_SECP256R1;
  header[33] = args.authBump ?? 0;
  return concatBytes([
    Uint8Array.of(DISC_CREATE_WALLET),
    header,
    args.credentialIdHash,
    args.compressedPubkey,
    Uint8Array.of(rpId.length),
    rpId,
  ]);
}

export function getCreateWalletInstruction(args: {
  payer: Address;
  pdas: LazorKitPdas;
  userSeed: Uint8Array;
  credentialIdHash: Uint8Array;
  compressedPubkey: Uint8Array;
  rpId: string;
  programAddress?: Address;
}): Instruction {
  return {
    programAddress: args.programAddress ?? lazorkitProgramAddress(),
    accounts: [
      { address: args.payer, role: AccountRole.WRITABLE_SIGNER },
      { address: args.pdas.walletPda, role: AccountRole.WRITABLE },
      { address: args.pdas.vaultPda, role: AccountRole.WRITABLE },
      { address: args.pdas.authorityPda, role: AccountRole.WRITABLE },
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
      { address: SYSVAR_RENT_ADDRESS, role: AccountRole.READONLY },
    ],
    data: encodeCreateWalletData(args),
  };
}

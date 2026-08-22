import { type Address, type Instruction } from "@solana/kit";

import {
  DISC_EXECUTE,
  EXECUTE_SYSVAR_IX_INDEX,
  lazorkitProgramAddress,
} from "./constants";
import { concatBytes, derEcdsaToRawLowS } from "./bytes";
import { hashPackedAccounts, packExecute, type PackedExecute } from "./compact";
import {
  buildLazorKitSecp256r1Instruction,
  clientDataHash,
  encodeAuthPayload,
  encodeAuthPrefix,
  executeChallengeHash,
} from "./secp256r1";

export type PreparedExecute = PackedExecute & {
  accountsHash: Uint8Array;
  programAddress: Address;
};

export async function prepareExecute(args: {
  payer: Address;
  walletPda: Address;
  authorityPda: Address;
  vaultPda: Address;
  inner: readonly Instruction[];
  programAddress?: Address;
}): Promise<PreparedExecute> {
  const packed = packExecute(args);
  const accountsHash = await hashPackedAccounts(packed);
  return {
    ...packed,
    accountsHash,
    programAddress: args.programAddress ?? lazorkitProgramAddress(),
  };
}

export async function buildExecuteChallenge(args: {
  prepared: PreparedExecute;
  payer: Address;
  slot: bigint;
  nextCounter: number;
}): Promise<{ challenge: Uint8Array; authPrefix: Uint8Array }> {
  const authPrefix = encodeAuthPrefix({
    slot: args.slot,
    counter: args.nextCounter,
    sysvarIxIndex: EXECUTE_SYSVAR_IX_INDEX,
  });
  const challenge = await executeChallengeHash({
    discriminator: DISC_EXECUTE,
    authPrefix,
    compactBytes: args.prepared.compactBytes,
    accountsHash: args.prepared.accountsHash,
    payer: args.payer,
    counter: args.nextCounter,
    programAddress: args.prepared.programAddress,
  });
  return { challenge, authPrefix };
}

export async function assembleExecuteInstructions(args: {
  prepared: PreparedExecute;
  authPrefix: Uint8Array;
  compressedPubkey: Uint8Array;
  signatureDer: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
}): Promise<{ secpIx: Instruction; executeIx: Instruction }> {
  const clientHash = await clientDataHash(args.clientDataJSON);
  const signature = derEcdsaToRawLowS(args.signatureDer);
  const secpIx = buildLazorKitSecp256r1Instruction({
    compressedPubkey: args.compressedPubkey,
    signature,
    authenticatorData: args.authenticatorData,
    clientDataHash: clientHash,
  });
  const authPayload = encodeAuthPayload({
    prefix: args.authPrefix,
    authenticatorData: args.authenticatorData,
    clientDataJSON: args.clientDataJSON,
  });
  const executeIx: Instruction = {
    programAddress: args.prepared.programAddress,
    accounts: args.prepared.accounts,
    data: concatBytes([
      Uint8Array.of(DISC_EXECUTE),
      args.prepared.compactBytes,
      authPayload,
    ]),
  };
  return { secpIx, executeIx };
}

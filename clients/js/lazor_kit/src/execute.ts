import { createNoopSigner, type Address, type Instruction } from "@solana/kit";

import { concatBytes, derEcdsaToRawLowS } from "./bytes";
import { hashPackedAccounts, packExecute, type PackedExecute } from "./compact";
import {
  EXECUTE_FIXED_ACCOUNT_COUNT,
  EXECUTE_SYSVAR_IX_INDEX,
  SYSVAR_INSTRUCTIONS_ADDRESS,
} from "./constants";
import {
  EXECUTE_DISCRIMINATOR,
  getExecuteInstruction,
} from "./generated/instructions/execute";
import { LAZORKIT_PROGRAM_PROGRAM_ADDRESS } from "./generated/programs/lazorkitProgram";
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
    programAddress: args.programAddress ?? LAZORKIT_PROGRAM_PROGRAM_ADDRESS,
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
    discriminator: Uint8Array.from(EXECUTE_DISCRIMINATOR),
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
  const payer = args.prepared.accounts[0]?.address;
  const wallet = args.prepared.accounts[1]?.address;
  const authority = args.prepared.accounts[2]?.address;
  const vault = args.prepared.accounts[3]?.address;
  if (!payer || !wallet || !authority || !vault) {
    throw new Error("Execute account list is incomplete");
  }
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
  const base = getExecuteInstruction(
    {
      payer: createNoopSigner(payer),
      wallet,
      authority,
      vault,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_ADDRESS,
      instructions: concatBytes([args.prepared.compactBytes, authPayload]),
    },
    { programAddress: args.prepared.programAddress },
  );
  const remaining = args.prepared.accounts.slice(EXECUTE_FIXED_ACCOUNT_COUNT);
  const executeIx: Instruction = {
    programAddress: base.programAddress,
    accounts: [...base.accounts, ...remaining],
    data: base.data,
  };
  return { secpIx, executeIx };
}

import { type Address, type Instruction } from "@solana/kit";

import {
  bytesToBase64Url,
  concatBytes,
  encodeU16Le,
  sha256,
} from "./bytes";
import { SECP256R1_PROGRAM_ADDRESS } from "./constants";
import { addressBytes } from "./pdas";

/** LazorKit-custom secp256r1 precompile offsets (not the generic layout). */
export const SECP_HEADER = 2;
export const SECP_OFFSETS = 14;
export const SECP_DATA_START = 16;
export const SECP_SIG_OFFSET = 16;
export const SECP_PUBKEY_OFFSET = 80;
export const SECP_MESSAGE_OFFSET = 114;
const CURRENT_IX = 0xffff;

export function buildLazorKitSecp256r1Instruction(args: {
  compressedPubkey: Uint8Array;
  signature: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataHash: Uint8Array;
}): Instruction {
  if (args.compressedPubkey.length !== 33) {
    throw new Error("compressedPubkey must be 33 bytes");
  }
  if (args.signature.length !== 64) {
    throw new Error("signature must be 64 bytes");
  }
  const message = concatBytes([args.authenticatorData, args.clientDataHash]);
  const data = new Uint8Array(SECP_MESSAGE_OFFSET + message.length);
  data[0] = 1;
  data[1] = 0;
  const view = new DataView(data.buffer);
  view.setUint16(2, SECP_SIG_OFFSET, true);
  view.setUint16(4, CURRENT_IX, true);
  view.setUint16(6, SECP_PUBKEY_OFFSET, true);
  view.setUint16(8, CURRENT_IX, true);
  view.setUint16(10, SECP_MESSAGE_OFFSET, true);
  view.setUint16(12, message.length, true);
  view.setUint16(14, CURRENT_IX, true);
  data.set(args.signature, SECP_SIG_OFFSET);
  data.set(args.compressedPubkey, SECP_PUBKEY_OFFSET);
  data.set(message, SECP_MESSAGE_OFFSET);
  return {
    programAddress: SECP256R1_PROGRAM_ADDRESS,
    accounts: [],
    data,
  };
}

export function encodeAuthPrefix(args: {
  slot: bigint;
  counter: number;
  sysvarIxIndex: number;
}): Uint8Array {
  const prefix = new Uint8Array(14);
  const view = new DataView(prefix.buffer);
  view.setBigUint64(0, args.slot, true);
  view.setUint32(8, args.counter, true);
  prefix[12] = args.sysvarIxIndex;
  prefix[13] = 0;
  return prefix;
}

export function encodeAuthPayload(args: {
  prefix: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
}): Uint8Array {
  if (args.prefix.length !== 14) {
    throw new Error("auth prefix must be 14 bytes");
  }
  return concatBytes([
    args.prefix,
    encodeU16Le(args.authenticatorData.length),
    args.authenticatorData,
    encodeU16Le(args.clientDataJSON.length),
    args.clientDataJSON,
  ]);
}

/**
 * SHA256(disc || auth[:14] || signed_payload || payer || counter || program_id)
 * where disc is the 8-byte execute discriminator and signed_payload is
 * compact || accounts_hash.
 */
export async function executeChallengeHash(args: {
  discriminator: Uint8Array;
  authPrefix: Uint8Array;
  compactBytes: Uint8Array;
  accountsHash: Uint8Array;
  payer: Address;
  counter: number;
  programAddress: Address;
}): Promise<Uint8Array> {
  const counterBytes = new Uint8Array(4);
  new DataView(counterBytes.buffer).setUint32(0, args.counter, true);
  const preimage = concatBytes([
    args.discriminator,
    args.authPrefix,
    args.compactBytes,
    args.accountsHash,
    addressBytes(args.payer),
    counterBytes,
    addressBytes(args.programAddress),
  ]);
  return sha256(preimage);
}

export function challengeToBase64Url(challenge: Uint8Array): string {
  return bytesToBase64Url(challenge);
}

export async function clientDataHash(
  clientDataJSON: Uint8Array,
): Promise<Uint8Array> {
  return sha256(clientDataJSON);
}

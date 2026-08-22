import { getAddressDecoder, type Address } from "@solana/kit";

import {
  AUTHORITY_DISCRIMINATOR,
  AUTHORITY_HEADER_SIZE,
  AUTHORITY_SECP_SIZE,
  WALLET_DISCRIMINATOR,
} from "./constants";
import { readU32Le } from "./bytes";

export type AuthorityAccount = {
  discriminator: number;
  authorityType: number;
  role: number;
  bump: number;
  version: number;
  counter: number;
  wallet: Address;
  credentialIdHash: Uint8Array;
  compressedPubkey: Uint8Array;
  rpIdHash: Uint8Array;
};

export function decodeWalletAccount(data: Uint8Array): { discriminator: number } {
  if (data.length < 1 || data[0] !== WALLET_DISCRIMINATOR) {
    throw new Error("Not a LazorKit wallet account");
  }
  return { discriminator: data[0]! };
}

export function decodeAuthorityAccount(data: Uint8Array): AuthorityAccount {
  if (data.length < AUTHORITY_SECP_SIZE) {
    throw new Error("Not a LazorKit secp256r1 authority account");
  }
  if (data[0] !== AUTHORITY_DISCRIMINATOR) {
    throw new Error("Not a LazorKit authority account");
  }
  if (data[1] !== 1) {
    throw new Error("Authority is not secp256r1");
  }
  const wallet = getAddressDecoder().decode(data.subarray(16, 48));
  return {
    discriminator: data[0]!,
    authorityType: data[1]!,
    role: data[2]!,
    bump: data[3]!,
    version: data[4]!,
    counter: readU32Le(data, 8),
    wallet,
    credentialIdHash: data.slice(AUTHORITY_HEADER_SIZE, AUTHORITY_HEADER_SIZE + 32),
    compressedPubkey: data.slice(
      AUTHORITY_HEADER_SIZE + 32,
      AUTHORITY_HEADER_SIZE + 65,
    ),
    rpIdHash: data.slice(AUTHORITY_HEADER_SIZE + 65, AUTHORITY_HEADER_SIZE + 97),
  };
}

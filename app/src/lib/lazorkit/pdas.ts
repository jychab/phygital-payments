import {
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
} from "@solana/kit";

import { lazorkitProgramAddress, USER_SEED_DOMAIN } from "./constants";
import { sha256 } from "./bytes";

export function addressBytes(value: Address): Uint8Array {
  return new Uint8Array(getAddressEncoder().encode(value));
}

export async function userSeedFromPubkey(
  compressedPubkey: Uint8Array,
): Promise<Uint8Array> {
  const domain = new TextEncoder().encode(USER_SEED_DOMAIN);
  const preimage = new Uint8Array(domain.length + compressedPubkey.length);
  preimage.set(domain);
  preimage.set(compressedPubkey, domain.length);
  return sha256(preimage);
}

export async function credentialIdHash(
  credentialId: Uint8Array,
): Promise<Uint8Array> {
  return sha256(credentialId);
}

export type LazorKitPdas = {
  walletPda: Address;
  vaultPda: Address;
  authorityPda: Address;
  walletBump: number;
  vaultBump: number;
  authorityBump: number;
};

export async function findVaultAndAuthorityPdas(args: {
  walletPda: Address;
  credentialIdHash: Uint8Array;
  programAddress?: Address;
}): Promise<{ vaultPda: Address; authorityPda: Address }> {
  const programAddress = args.programAddress ?? lazorkitProgramAddress();
  const [vaultPda] = await getProgramDerivedAddress({
    programAddress,
    seeds: [new TextEncoder().encode("vault"), addressBytes(args.walletPda)],
  });
  const [authorityPda] = await getProgramDerivedAddress({
    programAddress,
    seeds: [
      new TextEncoder().encode("authority"),
      addressBytes(args.walletPda),
      args.credentialIdHash,
    ],
  });
  return { vaultPda, authorityPda };
}

export async function findLazorKitPdas(args: {
  userSeed: Uint8Array;
  credentialIdHash: Uint8Array;
  programAddress?: Address;
}): Promise<LazorKitPdas> {
  const programAddress = args.programAddress ?? lazorkitProgramAddress();
  const [walletPda, walletBump] = await getProgramDerivedAddress({
    programAddress,
    seeds: [new TextEncoder().encode("wallet"), args.userSeed],
  });
  const [vaultPda, vaultBump] = await getProgramDerivedAddress({
    programAddress,
    seeds: [new TextEncoder().encode("vault"), addressBytes(walletPda)],
  });
  const [authorityPda, authorityBump] = await getProgramDerivedAddress({
    programAddress,
    seeds: [
      new TextEncoder().encode("authority"),
      addressBytes(walletPda),
      args.credentialIdHash,
    ],
  });
  return {
    walletPda,
    vaultPda,
    authorityPda,
    walletBump,
    vaultBump,
    authorityBump,
  };
}

import {
  credentialIdHash,
  findLazorKitPdas,
  userSeedFromPubkey,
} from "lazor-kit";

import { lazorkitProgramAddress, USER_SEED_DOMAIN } from "./constants";

export async function resolveSmartWalletPdas(args: {
  compressedPubkey: Uint8Array;
  credentialId: Uint8Array;
}) {
  const programAddress = lazorkitProgramAddress();
  const [userSeed, credentialIdHashValue] = await Promise.all([
    userSeedFromPubkey(args.compressedPubkey, USER_SEED_DOMAIN),
    credentialIdHash(args.credentialId),
  ]);
  const pdas = await findLazorKitPdas({
    userSeed,
    credentialIdHash: credentialIdHashValue,
    programAddress,
  });
  return {
    ...pdas,
    userSeed,
    credentialIdHash: credentialIdHashValue,
    programAddress,
  };
}

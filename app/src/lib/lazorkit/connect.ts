import { getBase64Encoder } from "@solana/kit";
import {
  buildCreateWalletInstruction,
  credentialIdHash,
  decodeWalletAccount,
  findLazorKitPdas,
  userSeedFromPubkey,
} from "lazor-kit";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { lazorkitProgramAddress, USER_SEED_DOMAIN } from "./constants";
import {
  saveSmartWalletSession,
  type SmartWalletSession,
} from "./credential-store";
import {
  createPlatformPasskey,
  relyingPartyId,
  type CreatedPasskey,
} from "./passkey";
import { sponsoredFeePayerSigner, sponsorInstructions } from "./sponsor";

export async function ensureSmartWallet(
  passkey: CreatedPasskey,
): Promise<SmartWalletSession> {
  const programAddress = lazorkitProgramAddress();
  const [userSeed, credHash] = await Promise.all([
    userSeedFromPubkey(passkey.compressedPubkey, USER_SEED_DOMAIN),
    credentialIdHash(passkey.credentialId),
  ]);
  const pdas = await findLazorKitPdas({
    userSeed,
    credentialIdHash: credHash,
    programAddress,
  });

  const { value } = await getSolanaRpc()
    .getAccountInfo(pdas.walletPda, { encoding: "base64" })
    .send();
  if (!value) {
    await sponsorInstructions([
      buildCreateWalletInstruction({
        payer: sponsoredFeePayerSigner(),
        pdas,
        userSeed,
        credentialIdHash: credHash,
        compressedPubkey: passkey.compressedPubkey,
        programAddress,
      }),
    ]);
  } else {
    if (value.owner !== programAddress) {
      throw new Error("Wallet address is already in use");
    }
    const raw = Array.isArray(value.data) ? value.data[0] : value.data;
    decodeWalletAccount(new Uint8Array(getBase64Encoder().encode(raw)));
  }

  const session: SmartWalletSession = {
    vaultPda: pdas.vaultPda,
    walletPda: pdas.walletPda,
    authorityPda: pdas.authorityPda,
    credentialId: passkey.credentialId,
    compressedPubkey: passkey.compressedPubkey,
    userSeed,
    rpId: passkey.rpId || relyingPartyId(),
  };
  await saveSmartWalletSession(session);
  return session;
}

export async function createAndConnectSmartWallet(): Promise<SmartWalletSession> {
  return ensureSmartWallet(await createPlatformPasskey());
}

import { getBase64Encoder } from "@solana/kit";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { decodeWalletAccount } from "./accounts";
import { lazorkitProgramAddress } from "./constants";
import { getCreateWalletInstruction } from "./create-wallet";
import {
  saveSmartWalletSession,
  type SmartWalletSession,
} from "./credential-store";
import {
  createPlatformPasskey,
  relyingPartyId,
  type CreatedPasskey,
} from "./passkey";
import { credentialIdHash, findLazorKitPdas, userSeedFromPubkey } from "./pdas";
import { feePayerAddress, sponsorInstructions } from "./sponsor";

export async function ensureSmartWallet(
  passkey: CreatedPasskey,
): Promise<SmartWalletSession> {
  const userSeed = await userSeedFromPubkey(passkey.compressedPubkey);
  const credHash = await credentialIdHash(passkey.credentialId);
  const pdas = await findLazorKitPdas({
    userSeed,
    credentialIdHash: credHash,
  });

  const { value } = await getSolanaRpc()
    .getAccountInfo(pdas.walletPda, { encoding: "base64" })
    .send();
  if (!value) {
    await sponsorInstructions([
      getCreateWalletInstruction({
        payer: feePayerAddress(),
        pdas,
        userSeed,
        credentialIdHash: credHash,
        compressedPubkey: passkey.compressedPubkey,
        rpId: passkey.rpId,
      }),
    ]);
  } else {
    if (value.owner !== lazorkitProgramAddress()) {
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

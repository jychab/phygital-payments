import {
  buildCreateWalletInstruction,
  decodeWalletAccount,
} from "lazor-kit";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { rpcAccountDataBytes } from "@/lib/solana/rpc-account-data";
import {
  saveSmartWalletSession,
  loadSmartWalletSession,
  type SmartWalletSession,
} from "./credential-store";
import { queryFetch } from "@/lib/queries/http";
import { bytesToBase64Url } from "../crypto/base64";
import {
  createPlatformPasskey,
  relyingPartyId,
  type CreatedPasskey,
} from "./passkey";
import { resolveSmartWalletPdas } from "./resolve-pdas";
import { sponsoredFeePayerSigner, sponsorInstructions } from "./sponsor";
import { establishWalletSessionCookie } from "@/lib/wallet/wallet-session-client";

export async function ensureSmartWallet(
  passkey: CreatedPasskey,
): Promise<SmartWalletSession> {
  const pdas = await resolveSmartWalletPdas({
    compressedPubkey: passkey.compressedPubkey,
    credentialId: passkey.credentialId,
  });

  const { value } = await getSolanaRpc()
    .getAccountInfo(pdas.walletPda, { encoding: "base64" })
    .send();
  if (!value) {
    await sponsorInstructions([
      buildCreateWalletInstruction({
        payer: sponsoredFeePayerSigner(),
        pdas,
        userSeed: pdas.userSeed,
        credentialIdHash: pdas.credentialIdHash,
        compressedPubkey: passkey.compressedPubkey,
        programAddress: pdas.programAddress,
      }),
    ]);
  } else {
    if (value.owner !== String(pdas.programAddress)) {
      throw new Error("Wallet address is already in use");
    }
    const bytes = rpcAccountDataBytes(value.data);
    if (!bytes) throw new Error("Wallet address is already in use");
    decodeWalletAccount(bytes);
  }

  const session: SmartWalletSession = {
    vaultPda: pdas.vaultPda,
    walletPda: pdas.walletPda,
    authorityPda: pdas.authorityPda,
    credentialId: passkey.credentialId,
    compressedPubkey: passkey.compressedPubkey,
    userSeed: pdas.userSeed,
    rpId: passkey.rpId || relyingPartyId(),
  };
  await saveSmartWalletSession(session);
  return session;
}

async function registerPasskeyMapping(passkey: CreatedPasskey): Promise<void> {
  await queryFetch("/api/wallet/passkey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      credentialId: bytesToBase64Url(passkey.credentialId),
      compressedPubkey: bytesToBase64Url(passkey.compressedPubkey),
    }),
  });
}

async function signInWithPasskey(
  passkey: CreatedPasskey,
): Promise<SmartWalletSession> {
  const session = await ensureSmartWallet(passkey);
  await establishWalletSessionCookie(session);
  await registerPasskeyMapping(passkey);
  return session;
}

async function tryRestoreWithLocalHint(
  local: SmartWalletSession,
): Promise<SmartWalletSession | null> {
  try {
    const session = await ensureSmartWallet({
      credentialId: local.credentialId,
      compressedPubkey: local.compressedPubkey,
      rpId: local.rpId,
    });
    await establishWalletSessionCookie(session);
    return session;
  } catch {
    return null;
  }
}

export async function createAndConnectSmartWallet(): Promise<SmartWalletSession> {
  const local = await loadSmartWalletSession();
  if (local) {
    const restored = await tryRestoreWithLocalHint(local);
    if (restored) return restored;
  }
  return signInWithPasskey(await createPlatformPasskey());
}

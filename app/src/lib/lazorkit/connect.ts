import {
  buildCreateWalletInstruction,
  decodeWalletAccount,
} from "lazor-kit";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { rpcAccountDataBytes } from "@/lib/solana/rpc-account-data";
import { base64UrlToBytes } from "@/lib/crypto/base64";
import {
  saveSmartWalletSession,
  loadSmartWalletSession,
  type SmartWalletSession,
} from "./credential-store";
import {
  createPlatformPasskey,
  relyingPartyId,
  type PasskeyIdentity,
} from "./passkey";
import { resolveSmartWalletPdas } from "./resolve-pdas";
import { sponsoredFeePayerSigner } from "@/lib/wallet/fee-payer-client";
import { sponsorInstructions } from "./sponsor";
import {
  establishWalletSessionCookie,
  establishWalletSessionFromDiscoverablePasskey,
  establishWalletSessionFromRegistration,
} from "@/lib/wallet/wallet-session-client";
import { fetchWalletAuthChallenge } from "@/lib/wallet/wallet-auth-client";

export async function ensureSmartWallet(
  passkey: PasskeyIdentity,
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
        payer: await sponsoredFeePayerSigner(),
        pdas,
        userSeed: pdas.userSeed,
        credentialIdHash: pdas.credentialIdHash,
        compressedPubkey: passkey.compressedPubkey,
        programAddress: pdas.programAddress,
        rpId: passkey.rpId || relyingPartyId(),
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

/** True when WebAuthn has no matching credential (or the user dismissed the prompt). */
function isPasskeyUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const name = "name" in error ? String((error as { name?: string }).name) : "";
  return name === "NotAllowedError" || name === "AbortError";
}

async function registerAndConnectPasskey(): Promise<SmartWalletSession> {
  const { requestId, challenge } = await fetchWalletAuthChallenge();
  const passkey = await createPlatformPasskey({
    challenge: base64UrlToBytes(challenge),
  });
  const session = await ensureSmartWallet(passkey);
  await establishWalletSessionFromRegistration({ requestId, passkey });
  return session;
}

/**
 * Prefer signing in with an existing discoverable passkey.
 * Returns null when none is available.
 */
async function trySignInWithDiscoverablePasskey(): Promise<SmartWalletSession | null> {
  try {
    const signedIn = await establishWalletSessionFromDiscoverablePasskey();
    return ensureSmartWallet({
      credentialId: signedIn.credentialId,
      compressedPubkey: base64UrlToBytes(signedIn.compressedPubkey),
      rpId: relyingPartyId(),
    });
  } catch (error) {
    if (isPasskeyUnavailable(error)) return null;
    const message = error instanceof Error ? error.message : "";
    // No server mapping yet (or stale challenge).
    if (
      message.includes("Unknown passkey") ||
      message.includes("expired") ||
      message.includes("Confirm with Face ID")
    ) {
      return null;
    }
    throw error;
  }
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

/** Sign in with an existing Face ID passkey. Does not create a new wallet. */
export async function signInSmartWallet(): Promise<SmartWalletSession> {
  const local = await loadSmartWalletSession();
  if (local) {
    const restored = await tryRestoreWithLocalHint(local);
    if (restored) return restored;
  }

  const signedIn = await trySignInWithDiscoverablePasskey();
  if (signedIn) return signedIn;

  throw new Error("No wallet found for this Face ID. Sign up to create one.");
}

/** Sign up: create a new Face ID passkey and smart wallet. */
export async function signUpSmartWallet(): Promise<SmartWalletSession> {
  return registerAndConnectPasskey();
}

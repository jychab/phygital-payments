import { queryFetch, readJson } from "@/lib/queries/http";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";
import type { CreatedPasskey } from "@/lib/lazorkit/passkey";
import {
  fetchDiscoverableWalletAuthProof,
  fetchWalletAuthProof,
  walletRegistrationProofFromPasskey,
  type WalletAuthProof,
  type WalletRegistrationProof,
} from "@/lib/wallet/wallet-auth-client";

export type WalletSessionResponse = {
  vaultPda: string;
  walletPda: string;
  authorityPda: string;
  compressedPubkey: string;
};

export type DiscoverableWalletSessionResponse = WalletSessionResponse & {
  credentialId: Uint8Array;
};

async function postWalletSession(
  body:
    | { walletAuth: WalletAuthProof }
    | { walletRegistration: WalletRegistrationProof },
): Promise<WalletSessionResponse> {
  return queryFetch("/api/wallet/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((res) => readJson(res, "Couldn’t sign in"));
}

/** Returning user — Face ID assertion → HttpOnly wallet session cookie. */
export async function establishWalletSessionCookie(
  session: SmartWalletSession,
): Promise<WalletSessionResponse> {
  return postWalletSession({ walletAuth: await fetchWalletAuthProof(session) });
}

/**
 * Discoverable Face ID sign-in when IndexedDB has no local hint.
 * Server passkey map resolves credentialId → wallet.
 */
export async function establishWalletSessionFromDiscoverablePasskey(): Promise<DiscoverableWalletSessionResponse> {
  const { proof, credentialId } = await fetchDiscoverableWalletAuthProof();
  const session = await postWalletSession({ walletAuth: proof });
  return { ...session, credentialId };
}

/** New passkey — session from registration attestation (no second Face ID). */
export async function establishWalletSessionFromRegistration(args: {
  requestId: string;
  passkey: CreatedPasskey;
}): Promise<WalletSessionResponse> {
  return postWalletSession({
    walletRegistration: walletRegistrationProofFromPasskey(
      args.requestId,
      args.passkey,
    ),
  });
}

export async function clearWalletSessionCookie(): Promise<void> {
  await queryFetch("/api/wallet/session", { method: "DELETE" }).catch(() => {
    /* cookie may already be gone */
  });
}

import { queryFetch, readJson } from "@/lib/queries/http";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";
import {
  fetchWalletAuthProof,
  type WalletAuthProof,
} from "@/lib/wallet/wallet-auth-client";

export async function postWalletSessionCookie(
  walletAuth: WalletAuthProof,
): Promise<void> {
  await queryFetch("/api/wallet/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAuth }),
  }).then((res) => readJson(res, "Couldn’t sign in"));
}

/** Face ID once at sign-in → HttpOnly wallet session cookie. */
export async function establishWalletSessionCookie(
  session: SmartWalletSession,
): Promise<void> {
  await postWalletSessionCookie(await fetchWalletAuthProof(session));
}

export async function clearWalletSessionCookie(): Promise<void> {
  await queryFetch("/api/wallet/session", { method: "DELETE" }).catch(() => {
    /* cookie may already be gone */
  });
}

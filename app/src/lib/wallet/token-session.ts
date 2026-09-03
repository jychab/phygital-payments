import { startAuthentication } from "phygital-token-sdk";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { queryFetch, QueryHttpError, readJson } from "@/lib/queries/http";

type UnlockHooks = {
  onStart?: () => void;
  onEnd?: () => void;
};

let unlockHooks: UnlockHooks = {};

/** Register UI hooks for Hold-to-unlock (used by HoldToUnlockGate). */
export function setTokenSessionUnlockHooks(hooks: UnlockHooks): void {
  unlockHooks = hooks;
}

/** Hold accessory → mint HttpOnly session cookie for policy writes. */
async function mintTokenSessionViaHold(): Promise<{
  phygitalToken: string;
  expiresAt: number;
}> {
  const message = crypto.randomUUID();
  const response = await startAuthentication(message, getSolanaRpc());
  const res = await queryFetch("/auth/token-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, response }),
  });
  return readJson(res, "Couldn’t unlock session");
}

/** Run a cookie-authed API call; on 401, Hold unlock then retry once. */
export async function withTokenSessionRetry<T>(
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof QueryHttpError && e.status === 401) {
      unlockHooks.onStart?.();
      try {
        await mintTokenSessionViaHold();
        return await fn();
      } finally {
        unlockHooks.onEnd?.();
      }
    }
    throw e;
  }
}

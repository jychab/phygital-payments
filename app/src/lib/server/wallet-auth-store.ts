import "server-only";

import { createKvChallengeStore } from "./kv-challenge-store";

export type WalletAuthChallenge = {
  requestId: string;
  /** Raw challenge bytes, base64url — must match WebAuthn clientDataJSON. */
  challenge: string;
  createdAtMs: number;
  expiresAtMs: number;
  consumed: boolean;
};

const store = createKvChallengeStore<WalletAuthChallenge>("wallet:auth");

export async function putWalletAuthChallenge(
  challenge: WalletAuthChallenge,
  ttlSeconds: number,
): Promise<void> {
  await store.put(challenge, ttlSeconds);
}

export async function takeWalletAuthChallenge(
  requestId: string,
): Promise<WalletAuthChallenge | null> {
  return store.take(requestId);
}

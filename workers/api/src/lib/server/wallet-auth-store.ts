import { createD1ChallengeStore } from "./d1-challenge-store";

export type WalletAuthChallenge = {
  requestId: string;
  /** Raw challenge bytes, base64url — must match WebAuthn clientDataJSON. */
  challenge: string;
  createdAtMs: number;
  expiresAtMs: number;
  consumed: boolean;
};

const store = createD1ChallengeStore<WalletAuthChallenge>("wallet:auth");

export async function putWalletAuthChallenge(
  challenge: WalletAuthChallenge,
): Promise<void> {
  await store.put(challenge);
}

export async function takeWalletAuthChallenge(
  requestId: string,
): Promise<WalletAuthChallenge | null> {
  return store.take(requestId);
}

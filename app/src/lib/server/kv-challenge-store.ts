import "server-only";

import { getAppKv } from "./app-kv";

export type ConsumableChallenge = {
  requestId: string;
  expiresAtMs: number;
  consumed: boolean;
};

export function createKvChallengeStore<T extends ConsumableChallenge>(
  keyPrefix: string,
) {
  function key(requestId: string): string {
    return `${keyPrefix}:${requestId}`;
  }

  return {
    put(challenge: T, ttlSeconds: number): Promise<void> {
      return getAppKv().put(key(challenge.requestId), JSON.stringify(challenge), {
        expirationTtl: ttlSeconds,
      });
    },

    async get(requestId: string): Promise<T | null> {
      const raw = await getAppKv().get(key(requestId));
      return raw ? (JSON.parse(raw) as T) : null;
    },

    async take(requestId: string): Promise<T | null> {
      const challenge = await this.get(requestId);
      if (!challenge || challenge.consumed) return null;
      if (Date.now() >= challenge.expiresAtMs) return null;
      await getAppKv().put(
        key(requestId),
        JSON.stringify({ ...challenge, consumed: true }),
        { expirationTtl: 60 },
      );
      return challenge;
    },
  };
}

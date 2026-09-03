/**
 * React Query keys, fetchers, and staleTime presets.
 *
 * Browser HTTP always goes through `queryFetch` (`cache: "no-store"`).
 * React Query is the only client cache.
 */

import { fetchDasCollectibleClient } from "@/lib/tokens/das-collectible-client";
import type { Collectible } from "@/lib/tokens/collectible";

export { shouldRetryQuery } from "./http";

export const queryKeys = {
  dasCollectible: {
    all: () => ["dasCollectible"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.dasCollectible.all(), mint] as const,
  },

  mintedCollectibleView: {
    all: () => ["mintedCollectibleView"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.mintedCollectibleView.all(), mint] as const,
  },

  tapVerify: {
    all: () => ["tapVerify"] as const,
    byParams: (params: string) =>
      [...queryKeys.tapVerify.all(), params] as const,
  },

  walletPortfolio: {
    all: () => ["walletPortfolio"] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.walletPortfolio.all(), owner] as const,
  },

  phygitalToken: {
    all: () => ["phygitalTokens"] as const,
    byIdentifier: (identifier: string | null) =>
      [...queryKeys.phygitalToken.all(), "identifier", identifier] as const,
    byAddress: (token: string | null) =>
      [...queryKeys.phygitalToken.all(), "address", token] as const,
  },
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const queryOptions = {
  /**
   * Ownership / token accounts that change in another browser (wallet IAB)
   * or via an NFC tap that cannot invalidate this tab's cache. Persist may
   * paint instantly; always refetch on mount/focus/reconnect.
   */
  volatile: {
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  /** Changes after user actions; mutations already invalidate. */
  default: { refetchOnWindowFocus: false, staleTime: 5 * MINUTE },
  /** Catalog / rarely changing metadata. */
  stable: { refetchOnWindowFocus: false, staleTime: 15 * MINUTE },
  /** One-shot proofs / immutable chain metadata — never refetch. */
  immutable: {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  },
} as const;

export function fetchDasCollectible(mint: string): Promise<Collectible | null> {
  return fetchDasCollectibleClient(mint);
}

/**
 * React Query keys, fetchers, and staleTime presets.
 *
 * Browser HTTP always goes through `queryFetch` (`cache: "no-store"`).
 * React Query is the only client cache; API GET routes send
 * `Cache-Control: private, no-store`.
 *
 * Domain code lives next to the matching UI folder:
 *   lib/accessory + hooks/accessory  NFC tap, Hold to Check, claim
 *   lib/server                       API routes only (`import "server-only"`)
 *   hooks/wallet                     passkey smart wallet
 *   hooks/layout                     page-show / persist refresh
 */

import type { QueryClient } from "@tanstack/react-query";

import { fetchDasCollectibleClient } from "@/lib/tokens/das-collectible-client";
import type { Collectible } from "@/lib/tokens/collectible";

export { queryFetch, readJson } from "./http";

export const queryKeys = {
  dasCollectible: {
    all: () => ["dasCollectible"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.dasCollectible.all(), mint] as const,
  },

  tapVerify: {
    all: () => ["tapVerify"] as const,
    byParams: (params: string) =>
      [...queryKeys.tapVerify.all(), params] as const,
  },

  phygitalToken: {
    all: () => ["phygitalTokens"] as const,
    byIdentifier: (identifier: string | null) =>
      [...queryKeys.phygitalToken.all(), "identifier", identifier] as const,
    byPasskey: (secp256r1PublicKey: string | null) =>
      [...queryKeys.phygitalToken.all(), "passkey", secp256r1PublicKey] as const,
  },
};

/** Token account reads keyed by identifier / passkey. */
export function invalidatePhygitalTokenQueries(
  queryClient: QueryClient,
  token: {
    identifier: string;
    secp256r1PublicKey: string;
  },
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.byIdentifier(token.identifier),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.byPasskey(token.secp256r1PublicKey),
    }),
  ]).then(() => undefined);
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const queryOptions = {
  /** Changes after user actions; mutations already invalidate. */
  default: { refetchOnWindowFocus: false, staleTime: 5 * MINUTE },
  /**
   * Ownership / token accounts that change via an NFC tap that cannot
   * invalidate this tab's cache. Persist may paint instantly; always
   * refetch on mount/focus/reconnect.
   */
  volatile: {
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  /** Catalog / rarely changing metadata. */
  stable: { refetchOnWindowFocus: false, staleTime: 15 * MINUTE },
  /** One-shot proofs / immutable chain metadata — never refetch. */
  immutable: { refetchOnWindowFocus: false, staleTime: Infinity },
} as const;

export function fetchDasCollectible(mint: string): Promise<Collectible | null> {
  return fetchDasCollectibleClient(mint);
}

export type { Collectible };

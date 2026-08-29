"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchDasCollectible,
  fetchDasCollectibles,
  queryKeys,
  queryOptions,
  type Collectible,
} from "@/lib/queries";
import { fallbackCollectible } from "@/lib/tokens/collectible";

export function useDasCollectible(mint: string | null) {
  return useQuery<Collectible | null, Error>({
    queryKey: queryKeys.dasCollectible.byMint(mint),
    queryFn: () => {
      if (!mint) return null;
      return fetchDasCollectible(mint);
    },
    enabled: Boolean(mint),
    ...queryOptions.stable,
  });
}

/** DAS metadata with fallback placeholder once the query has settled. */
export function useResolvedDasCollectible(mint: string | null) {
  const das = useDasCollectible(mint);
  const collectible =
    das.data ?? (das.isFetched && mint ? fallbackCollectible(mint) : null);
  const loading = das.isLoading && !das.isFetched;
  return { collectible, loading };
}

/**
 * Prefetch binder DAS metadata in one round-trip and seed per-mint caches
 * so `useDasCollectible` on each tile hits warm data.
 */
export function usePrefetchDasCollectibles(mints: string[]) {
  const queryClient = useQueryClient();
  const sorted = [...new Set(mints.filter(Boolean))].sort();

  return useQuery({
    queryKey: queryKeys.dasCollectible.batch(sorted),
    queryFn: async () => {
      const map = await fetchDasCollectibles(sorted);
      for (const mint of sorted) {
        queryClient.setQueryData(
          queryKeys.dasCollectible.byMint(mint),
          map[mint] ?? null,
        );
      }
      return map;
    },
    enabled: sorted.length > 0,
    ...queryOptions.stable,
  });
}

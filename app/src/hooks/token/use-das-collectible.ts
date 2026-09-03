"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDasCollectible, queryKeys, queryOptions } from "@/lib/queries";
import {
  fallbackCollectible,
  type Collectible,
} from "@/lib/tokens/collectible";

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

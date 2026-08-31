"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchCollectibleRarity,
  queryKeys,
  queryOptions,
} from "@/lib/queries";
import type { CollectibleRarity } from "@/lib/tokens/collectible";

export function useCollectibleRarity(mint: string | null) {
  return useQuery<CollectibleRarity | null, Error>({
    queryKey: queryKeys.collectibleRarity.byMint(mint),
    queryFn: async () => {
      if (!mint) return null;
      return fetchCollectibleRarity(mint);
    },
    enabled: Boolean(mint),
    ...queryOptions.stable,
  });
}

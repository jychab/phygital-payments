"use client";

import { useQuery } from "@tanstack/react-query";

import {
  queryKeys,
  queryOptions,
} from "@/lib/queries";
import { fetchCollectibleRarityClient } from "@/lib/tokens/rarity-client";
import type { CollectibleRarity } from "@/lib/tokens/collectible";

export function useCollectibleRarity(mint: string | null) {
  return useQuery<CollectibleRarity | null, Error>({
    queryKey: queryKeys.collectibleRarity.byMint(mint),
    queryFn: () => {
      if (!mint) return null;
      return fetchCollectibleRarityClient(mint);
    },
    enabled: Boolean(mint),
    ...queryOptions.stable,
  });
}

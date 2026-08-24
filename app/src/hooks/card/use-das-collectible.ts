"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys, queryOptions, type Collectible } from "@/lib/queries";
import { fetchDasCollectibleClient } from "@/lib/tokens/das-collectible-client";

export function useDasCollectible(mint: string | null) {
  return useQuery<Collectible | null, Error>({
    queryKey: queryKeys.dasCollectible.byMint(mint),
    queryFn: () => {
      if (!mint) throw new Error("Missing mint");
      return fetchDasCollectibleClient(mint);
    },
    enabled: Boolean(mint),
    retry: false,
    ...queryOptions.stable,
  });
}

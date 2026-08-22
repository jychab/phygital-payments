"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchDasCollectible,
  queryKeys,
  queryOptions,
  type Collectible,
} from "@/lib/queries";

export function useDasCollectible(mint: string | null) {
  return useQuery<Collectible | null, Error>({
    queryKey: queryKeys.dasCollectible.byMint(mint),
    queryFn: () => {
      if (!mint) throw new Error("Missing mint");
      return fetchDasCollectible(mint);
    },
    enabled: Boolean(mint),
    retry: false,
    ...queryOptions.stable,
  });
}

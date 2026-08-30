"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchCollectibleShortcuts,
  queryKeys,
  queryOptions,
  type CollectibleShortcut,
} from "@/lib/queries";

/** Phantom shortcuts for a collectible — empty on missing URL or fetch failure. */
export function useCollectibleShortcuts(
  externalUrl: string | null | undefined,
  collectionMint: string | null | undefined,
) {
  const url = externalUrl?.trim() || null;
  const collection = collectionMint?.trim() || null;

  return useQuery<CollectibleShortcut[], Error>({
    queryKey: queryKeys.collectibleShortcuts.byExternalUrl(url, collection),
    queryFn: async () => {
      if (!url) return [];
      return fetchCollectibleShortcuts(url, collection);
    },
    enabled: Boolean(url),
    ...queryOptions.stable,
    retry: false,
  });
}

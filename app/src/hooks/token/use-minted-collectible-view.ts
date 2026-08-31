"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, queryOptions } from "@/lib/queries";
import { fetchMintedCollectibleViewClient } from "@/lib/tokens/minted-collectible-view-client";
import { fallbackCollectible } from "@/lib/tokens/collectible";
import type { CollectibleRarity } from "@/lib/tokens/collectible";
import type { CollectibleShortcut } from "@/lib/tokens/shortcuts";

/**
 * Single round-trip for minted landing: DAS collectible + rarity + shortcuts.
 * Seeds per-key caches so binder / claim hooks stay warm if the user navigates.
 */
export function useMintedCollectibleView(mint: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.mintedCollectibleView.byMint(mint),
    queryFn: async () => {
      if (!mint) {
        return { collectible: null, rarity: null, shortcuts: [] as CollectibleShortcut[] };
      }
      const view = await fetchMintedCollectibleViewClient(mint);
      queryClient.setQueryData(
        queryKeys.dasCollectible.byMint(mint),
        view.collectible,
      );
      queryClient.setQueryData(
        queryKeys.collectibleRarity.byMint(mint),
        view.rarity,
      );
      if (view.collectible?.externalUrl) {
        queryClient.setQueryData(
          queryKeys.collectibleShortcuts.byExternalUrl(
            view.collectible.externalUrl,
            view.collectible.collectionMint,
          ),
          view.shortcuts,
        );
      }
      return view;
    },
    enabled: Boolean(mint),
    ...queryOptions.stable,
  });

  const collectible =
    query.data?.collectible ??
    (query.isFetched && mint ? fallbackCollectible(mint) : null);
  const rarity: CollectibleRarity | null = query.data?.rarity ?? null;
  const shortcuts: CollectibleShortcut[] = query.data?.shortcuts ?? [];
  const loading = query.isLoading && !query.isFetched;

  return {
    collectible,
    rarity,
    shortcuts,
    loading,
    rarityLoading: loading && !rarity,
  };
}

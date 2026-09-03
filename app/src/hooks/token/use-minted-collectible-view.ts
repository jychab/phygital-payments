"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, queryOptions } from "@/lib/queries";
import {
  fetchCollectibleRarityClient,
  fetchMintedCollectibleViewClient,
} from "@/lib/tokens/minted-collectible-view-client";
import { fallbackCollectible } from "@/lib/tokens/collectible";
import type { CollectibleRarity } from "@/lib/tokens/collectible";
import type { CollectibleShortcut } from "@/lib/tokens/shortcuts";

/** Single round-trip for minted landing: DAS collectible + rarity + shortcuts. */
export function useMintedCollectibleView(mint: string | null) {
  const queryClient = useQueryClient();

  const viewQuery = useQuery({
    queryKey: queryKeys.mintedCollectibleView.byMint(mint),
    queryFn: async () => {
      if (!mint) {
        return {
          collectible: null,
          rarity: null,
          shortcuts: [] as CollectibleShortcut[],
        };
      }
      const view = await fetchMintedCollectibleViewClient(mint);
      queryClient.setQueryData(
        queryKeys.dasCollectible.byMint(mint),
        view.collectible,
      );
      return view;
    },
    enabled: Boolean(mint),
    ...queryOptions.stable,
  });

  const collectionMint = viewQuery.data?.collectible?.collectionMint ?? null;
  const needsRarityPoll =
    Boolean(mint) &&
    Boolean(collectionMint) &&
    viewQuery.isSuccess &&
    viewQuery.data?.rarity == null;

  const rarityQuery = useQuery({
    queryKey: [
      ...queryKeys.mintedCollectibleView.byMint(mint),
      "rarity",
      collectionMint,
    ] as const,
    queryFn: async () => {
      const collectible = viewQuery.data?.collectible;
      if (!mint || !collectible?.collectionMint) return null;
      const rarity = await fetchCollectibleRarityClient({
        mint,
        collectionMint: collectible.collectionMint,
        attributes: collectible.attributes,
      });
      if (rarity) {
        queryClient.setQueryData(
          queryKeys.mintedCollectibleView.byMint(mint),
          (prev: Awaited<
            ReturnType<typeof fetchMintedCollectibleViewClient>
          > | undefined) =>
            prev ? { ...prev, rarity } : prev,
        );
      }
      return rarity;
    },
    enabled: needsRarityPoll,
    ...queryOptions.stable,
    refetchInterval: (q) => {
      if (q.state.data != null) return false;
      return q.state.dataUpdateCount > 24 ? false : 5_000;
    },
  });

  const collectible =
    viewQuery.data?.collectible ??
    (viewQuery.isFetched && mint ? fallbackCollectible(mint) : null);
  const rarity: CollectibleRarity | null =
    rarityQuery.data ?? viewQuery.data?.rarity ?? null;
  const shortcuts: CollectibleShortcut[] = viewQuery.data?.shortcuts ?? [];
  const loading = viewQuery.isLoading && !viewQuery.isFetched;

  return {
    collectible,
    rarity,
    shortcuts,
    loading,
    rarityLoading: (loading || rarityQuery.isFetching) && !rarity,
  };
}

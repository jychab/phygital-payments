import "server-only";

import { getCollectibleRarityForMint } from "@/lib/server/collection-rarity";
import { fetchDasCollectible } from "@/lib/server/das-collectible";
import type { Collectible, CollectibleRarity } from "@/lib/tokens/collectible";
import {
  fetchCollectibleShortcuts,
  type CollectibleShortcut,
} from "@/lib/tokens/shortcuts";

export type MintedCollectibleView = {
  collectible: Collectible | null;
  rarity: CollectibleRarity | null;
  shortcuts: CollectibleShortcut[];
};

/**
 * One DAS getAsset, then rarity (D1) + shortcuts.json in parallel.
 * Used by the minted token landing to avoid 3 client round-trips.
 */
export async function loadMintedCollectibleView(
  mint: string,
): Promise<MintedCollectibleView> {
  const collectible = await fetchDasCollectible(mint);
  if (!collectible) {
    return { collectible: null, rarity: null, shortcuts: [] };
  }

  const [rarity, shortcuts] = await Promise.all([
    getCollectibleRarityForMint({
      mint,
      collectionMint: collectible.collectionMint,
      attributes: collectible.attributes,
    }),
    collectible.externalUrl
      ? fetchCollectibleShortcuts(
          collectible.externalUrl,
          collectible.collectionMint,
        )
      : Promise.resolve([] as CollectibleShortcut[]),
  ]);

  return { collectible, rarity, shortcuts };
}

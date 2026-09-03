import { queryFetch, readJson } from "@/lib/queries/http";
import { fetchDasCollectibleClient } from "@/lib/tokens/das-collectible-client";
import type {
  Collectible,
  CollectibleAttribute,
  CollectibleRarity,
} from "@/lib/tokens/collectible";
import {
  fetchCollectibleShortcuts,
  type CollectibleShortcut,
} from "@/lib/tokens/shortcuts";

export type MintedCollectibleView = {
  collectible: Collectible | null;
  rarity: CollectibleRarity | null;
  shortcuts: CollectibleShortcut[];
};

export async function fetchCollectibleRarityClient(args: {
  mint: string;
  collectionMint: string;
  attributes: CollectibleAttribute[];
}): Promise<CollectibleRarity | null> {
  try {
    const res = await queryFetch("/tokens/rarity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mint: args.mint,
        collectionMint: args.collectionMint,
        attributes: args.attributes,
      }),
    });
    if (!res.ok) return null;
    const body = await readJson<{ rarity?: CollectibleRarity | null }>(
      res,
      "Couldn’t load rarity",
    );
    return body.rarity ?? null;
  } catch {
    return null;
  }
}

/**
 * Minted landing: DAS + shortcuts on the client RPC / browser;
 * rarity from API D1 (no server DAS).
 */
export async function fetchMintedCollectibleViewClient(
  mint: string,
): Promise<MintedCollectibleView> {
  const collectible = await fetchDasCollectibleClient(mint);
  if (!collectible) {
    return { collectible: null, rarity: null, shortcuts: [] };
  }

  const [rarity, shortcuts] = await Promise.all([
    collectible.collectionMint
      ? fetchCollectibleRarityClient({
          mint,
          collectionMint: collectible.collectionMint,
          attributes: collectible.attributes,
        })
      : Promise.resolve(null),
    collectible.externalUrl
      ? fetchCollectibleShortcuts(
          collectible.externalUrl,
          collectible.collectionMint,
        )
      : Promise.resolve([] as CollectibleShortcut[]),
  ]);

  return { collectible, rarity, shortcuts };
}

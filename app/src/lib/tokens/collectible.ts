import { shortAddress } from "@/lib/utils";
import type { RarityTier } from "@/lib/tokens/rarity/rarity-tier";

export type { RarityTier };

export type CollectibleAttribute = {
  traitType: string;
  value: string;
};

export type CollectibleAttributeWithRarity = CollectibleAttribute & {
  rarityPercent?: number;
  tier?: RarityTier;
};

export type CollectibleRarity = {
  algorithm: "howrare";
  rank: number;
  total: number;
  rankSharedWith: number;
  score: number;
  tier: RarityTier;
  attributes: CollectibleAttributeWithRarity[];
};

/** Lean collectible for minted `/token` UI — not a payment (fungible) token. */
export type Collectible = {
  mint: string;
  name: string;
  image: string | null;
  collectionName: string | null;
  /** Collection logo (https only). */
  collectionImage: string | null;
  collectionDescription: string | null;
  collectionMint: string | null;
  description: string | null;
  attributes: CollectibleAttribute[];
  externalUrl: string | null;
  /** SPL NFT holder. */
  mintOwner: string | null;
};

/** Mint address fallback when metadata has no name or image. */
export function fallbackCollectible(mint: string): Collectible {
  return {
    mint,
    name: shortAddress(mint),
    image: null,
    collectionName: null,
    collectionImage: null,
    collectionDescription: null,
    collectionMint: null,
    description: null,
    attributes: [],
    externalUrl: null,
    mintOwner: null,
  };
}

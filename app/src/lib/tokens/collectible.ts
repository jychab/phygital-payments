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
  algorithm: "trait_normalized";
  rank: number;
  total: number;
  rankSharedWith: number;
  score: number;
  tier: RarityTier;
  attributes: CollectibleAttributeWithRarity[];
};

/** Lean DAS collectible for minted `/token` UI — not a payment (fungible) token. */
export type Collectible = {
  mint: string;
  name: string;
  image: string | null;
  collectionName: string | null;
  /** Collection logo from DAS `collection_metadata.image` (https only). */
  collectionImage: string | null;
  collectionDescription: string | null;
  collectionMint: string | null;
  description: string | null;
  attributes: CollectibleAttribute[];
  externalUrl: string | null;
};

export type DasCollectibleAsset = {
  id?: string;
  content?: {
    metadata?: {
      name?: string;
      description?: string;
      attributes?: Array<{
        trait_type?: string;
        traitType?: string;
        value?: string | number | boolean;
      }>;
    };
    links?: { image?: string; external_url?: string };
    files?: Array<{ uri?: string; cdn_uri?: string }>;
  };
  grouping?: Array<{
    group_key?: string;
    group_value?: string;
    collection_metadata?: {
      name?: string;
      image?: string;
      description?: string;
      external_url?: string;
    };
  }>;
};

function firstHttpsUrl(...candidates: Array<string | undefined>): string | null {
  for (const raw of candidates) {
    const url = raw?.trim();
    if (url?.startsWith("https://")) return url;
  }
  return null;
}

export function mapAttributesFromDasContent(
  raw: DasCollectibleAsset["content"],
): CollectibleAttribute[] {
  const list = raw?.metadata?.attributes;
  if (!Array.isArray(list) || list.length === 0) return [];

  const out: CollectibleAttribute[] = [];
  for (const item of list) {
    const traitType = (item.trait_type ?? item.traitType)?.trim();
    if (!traitType) continue;
    if (item.value === undefined || item.value === null) continue;
    const value = String(item.value).trim();
    if (!value) continue;
    out.push({ traitType, value });
  }
  return out;
}

/**
 * Map a DAS `getAsset` result to a collectible, or `null` when there is
 * neither a metadata name nor an image (caller falls back to the NFC hero).
 */
export function collectibleFromDas(
  asset: DasCollectibleAsset | null | undefined,
): Collectible | null {
  if (!asset) return null;
  const mint = asset.id?.trim();
  if (!mint) return null;

  const name = asset.content?.metadata?.name?.trim() || "";
  const files = asset.content?.files ?? [];
  let image: string | null = null;
  for (const file of files) {
    image = firstHttpsUrl(file.cdn_uri, file.uri);
    if (image) break;
  }
  image ??= firstHttpsUrl(asset.content?.links?.image);
  if (!name && !image) return null;

  const collection = asset.grouping?.find((g) => g.group_key === "collection");
  const description =
    asset.content?.metadata?.description?.trim() || null;
  const externalUrl = firstHttpsUrl(
    asset.content?.links?.external_url,
  );

  return {
    mint,
    name: name || shortAddress(mint),
    image,
    collectionName: collection?.collection_metadata?.name?.trim() || null,
    collectionImage: firstHttpsUrl(collection?.collection_metadata?.image),
    collectionDescription:
      collection?.collection_metadata?.description?.trim() || null,
    collectionMint: collection?.group_value?.trim() || null,
    description,
    attributes: mapAttributesFromDasContent(asset.content),
    externalUrl,
  };
}

/** Mint address fallback when DAS has no name or image. */
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
  };
}

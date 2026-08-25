import { shortAddress } from "@/lib/utils";

/** Lean DAS collectible for `/card` — not a payment (fungible) token. */
export type Collectible = {
  mint: string;
  name: string;
  image: string | null;
  collectionName: string | null;
};

export type DasCollectibleAsset = {
  id?: string;
  content?: {
    metadata?: { name?: string };
    links?: { image?: string };
    files?: Array<{ uri?: string; cdn_uri?: string }>;
  };
  grouping?: Array<{
    group_key?: string;
    group_value?: string;
    collection_metadata?: { name?: string };
  }>;
};

function firstHttpsUrl(...candidates: Array<string | undefined>): string | null {
  for (const raw of candidates) {
    const url = raw?.trim();
    if (url?.startsWith("https://")) return url;
  }
  return null;
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
  return {
    mint,
    name: name || shortAddress(mint),
    image,
    collectionName: collection?.collection_metadata?.name?.trim() || null,
  };
}

/** Mint address fallback when DAS has no name or image. */
export function fallbackCollectible(mint: string): Collectible {
  return {
    mint,
    name: shortAddress(mint),
    image: null,
    collectionName: null,
  };
}

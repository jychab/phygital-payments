import type { DasContent } from "@/tokens/das-schema";
import type { RarityTier } from "@/tokens/rarity/rarity-tier";

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

/** Keep in sync with `app/src/lib/tokens/collectible.ts`. */
export function mapAttributesFromDasContent(
  raw: DasContent | undefined,
): CollectibleAttribute[] {
  const list = raw?.metadata?.attributes;
  if (!Array.isArray(list) || list.length === 0) return [];

  const out: CollectibleAttribute[] = [];
  for (const item of list) {
    const extra = item as typeof item & { traitType?: string };
    const traitType = (item.trait_type ?? extra.traitType)?.trim();
    if (!traitType) continue;
    if (item.value === undefined || item.value === null) continue;
    const value = String(item.value).trim();
    if (!value) continue;
    out.push({ traitType, value });
  }
  return out;
}

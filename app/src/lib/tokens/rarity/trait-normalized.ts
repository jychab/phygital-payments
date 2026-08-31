import type { CollectibleAttribute } from "@/lib/tokens/collectible";

import { tierFromPercentile, type RarityTier } from "./rarity-tier";

/** HowRare / Tensor Tn pseudo-trait for attribute count. */
export const ATTR_COUNT_TRAIT_TYPE = "Attribute Count";

export type CollectibleAttributeWithRarity = CollectibleAttribute & {
  rarityPercent?: number;
  tier?: RarityTier;
};

export function traitKey(traitType: string, value: string): string {
  return `${traitType}|${value}`;
}

export function traitRarityPercent(count: number, total: number): number {
  if (total <= 0 || count <= 0) return 100;
  return (count / total) * 100;
}

export function scoreMintFromCounts(args: {
  attributes: CollectibleAttribute[];
  attrCount: number;
  getTraitCount: (traitType: string, value: string) => number;
  maxCountByTraitType: ReadonlyMap<string, number>;
  attrCountFrequency: number;
  maxAttrCountFrequency: number;
}): number {
  let score = 0;

  for (const attr of args.attributes) {
    const count = args.getTraitCount(attr.traitType, attr.value);
    if (count <= 0) continue;
    const maxForType = args.maxCountByTraitType.get(attr.traitType) ?? count;
    score += maxForType / count;
  }

  if (args.attrCountFrequency > 0 && args.maxAttrCountFrequency > 0) {
    score += args.maxAttrCountFrequency / args.attrCountFrequency;
  }

  return score;
}

export function enrichAttributes(args: {
  attributes: CollectibleAttribute[];
  totalSupply: number;
  getTraitCount: (traitType: string, value: string) => number;
}): CollectibleAttributeWithRarity[] {
  const { attributes, totalSupply, getTraitCount } = args;
  return attributes.map((attr) => {
    const count = getTraitCount(attr.traitType, attr.value);
    const rarityPercent = traitRarityPercent(count, totalSupply);
    return {
      ...attr,
      rarityPercent,
      tier: tierFromPercentile(rarityPercent),
    };
  });
}

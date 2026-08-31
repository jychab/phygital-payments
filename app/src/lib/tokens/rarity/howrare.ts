import type { CollectibleAttribute } from "@/lib/tokens/collectible";

import { tierFromPercentile, type RarityTier } from "./rarity-tier";

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

/**
 * HowRare / Tensor methodology score: sum of `1 / rarity%` over present traits.
 *
 * rarity% = (count / totalSupply) × 100, so each term is `totalSupply / (count × 100)`.
 * Attribute-count is intentionally omitted — Tensor’s HowRare ranks match this
 * (including it shifts Mad Lads #7343 from #112 → #120).
 */
export function scoreMintHowRare(args: {
  attributes: CollectibleAttribute[];
  totalSupply: number;
  getTraitCount: (traitType: string, value: string) => number;
}): number {
  const { totalSupply } = args;
  if (totalSupply <= 0) return 0;

  let score = 0;
  for (const attr of args.attributes) {
    const count = args.getTraitCount(attr.traitType, attr.value);
    if (count <= 0) continue;
    score += totalSupply / (count * 100);
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

export type RarityTier =
  | "mythic"
  | "legendary"
  | "epic"
  | "rare"
  | "uncommon"
  | "common";

const TIER_LABELS: Record<RarityTier, string> = {
  mythic: "Mythic",
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  uncommon: "Uncommon",
  common: "Common",
};

/** Tensor-style top-percentile buckets (lower percentile = rarer). */
export function tierFromPercentile(percentile: number): RarityTier {
  if (percentile <= 1) return "mythic";
  if (percentile <= 5) return "legendary";
  if (percentile <= 15) return "epic";
  if (percentile <= 35) return "rare";
  if (percentile <= 60) return "uncommon";
  return "common";
}

export function tierLabel(tier: RarityTier): string {
  return TIER_LABELS[tier];
}

export function tierFromRank(rank: number, total: number): RarityTier {
  if (total <= 0 || rank <= 0) return "common";
  return tierFromPercentile((rank / total) * 100);
}

import { tierLabel } from "@/lib/tokens/rarity/rarity-tier";

/** Format trait frequency for display. */
export function formatRarityPercent(pct: number): string {
  if (pct <= 0) return "0%";
  if (pct < 0.01) return "<0.01%";
  if (pct < 1) return `${pct.toFixed(2)}%`;
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

/** Overall collection rank line, e.g. `#756 of 5,000`. */
export function formatRarityRank(rank: number, total: number): string {
  return `#${rank.toLocaleString()} of ${total.toLocaleString()}`;
}

export function formatRarityRankWithTie(
  rank: number,
  total: number,
  rankSharedWith: number,
): string {
  const base = formatRarityRank(rank, total);
  if (rankSharedWith > 0) return `${base} (tie)`;
  return base;
}

/** Trait cell footer: `Mythic · 0.02%`. */
export function formatTraitRarityLine(
  tier: Parameters<typeof tierLabel>[0],
  rarityPercent: number,
): string {
  return `${tierLabel(tier)} · ${formatRarityPercent(rarityPercent)}`;
}

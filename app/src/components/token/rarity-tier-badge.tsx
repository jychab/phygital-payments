import { tierLabel, type RarityTier } from "@/lib/tokens/rarity/rarity-tier";
import { cn } from "@/lib/utils";

const TIER_CLASS: Record<
  RarityTier,
  { pill: string; cell: string; text: string }
> = {
  mythic: {
    pill: "border-rarity-mythic-border bg-rarity-mythic-bg text-rarity-mythic",
    cell: "border-rarity-mythic-border/40",
    text: "text-rarity-mythic",
  },
  legendary: {
    pill: "border-rarity-legendary-border bg-rarity-legendary-bg text-rarity-legendary",
    cell: "border-rarity-legendary-border/40",
    text: "text-rarity-legendary",
  },
  epic: {
    pill: "border-rarity-epic-border bg-rarity-epic-bg text-rarity-epic",
    cell: "border-rarity-epic-border/40",
    text: "text-rarity-epic",
  },
  rare: {
    pill: "border-rarity-rare-border bg-rarity-rare-bg text-rarity-rare",
    cell: "border-rarity-rare-border/40",
    text: "text-rarity-rare",
  },
  uncommon: {
    pill: "border-rarity-uncommon-border bg-rarity-uncommon-bg text-rarity-uncommon",
    cell: "border-rarity-uncommon-border/35",
    text: "text-rarity-uncommon",
  },
  common: {
    pill: "border-rarity-common-border bg-rarity-common-bg text-rarity-common",
    cell: "border-rarity-common-border/30",
    text: "text-rarity-common",
  },
};

export function rarityTierClasses(tier: RarityTier) {
  return TIER_CLASS[tier];
}

export function RarityTierBadge({
  tier,
  detail,
  className,
}: {
  tier: RarityTier;
  detail?: string;
  className?: string;
}) {
  const styles = TIER_CLASS[tier];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        styles.pill,
        className,
      )}
    >
      <span>{tierLabel(tier)}</span>
      {detail ? (
        <span className="truncate font-normal opacity-85">· {detail}</span>
      ) : null}
    </span>
  );
}

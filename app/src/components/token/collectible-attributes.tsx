"use client";

import {
  rarityTierClasses,
} from "@/components/token/rarity-tier-badge";
import { formatTraitRarityLine } from "@/lib/tokens/rarity/format";
import { copy } from "@/lib/copy/phygital";
import type { CollectibleAttributeWithRarity } from "@/lib/tokens/collectible";
import { cn } from "@/lib/utils";

/** Two-column trait grid — Phantom/Backpack style. */
export function CollectibleAttributes({
  attributes,
  className,
}: {
  attributes: CollectibleAttributeWithRarity[];
  className?: string;
}) {
  if (attributes.length === 0) return null;

  return (
    <section className={cn("w-full text-left", className)}>
      <h2 className="text-eyebrow text-muted-foreground">{copy.token.attributes}</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
        {attributes.map((attr) => {
          const tierStyles =
            attr.tier != null ? rarityTierClasses(attr.tier) : null;
          return (
            <li
              key={`${attr.traitType}:${attr.value}`}
              className={cn(
                "rounded-xl border bg-muted/25 px-3 py-2.5",
                tierStyles?.cell ?? "border-border/50",
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {attr.traitType}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {attr.value}
              </p>
              {attr.tier != null && attr.rarityPercent != null ? (
                <p
                  className={cn(
                    "mt-1.5 text-[11px] font-medium",
                    tierStyles?.text ?? "text-muted-foreground",
                  )}
                >
                  {formatTraitRarityLine(attr.tier, attr.rarityPercent)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

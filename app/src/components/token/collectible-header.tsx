"use client";

import { useState } from "react";

import { RarityTierBadge } from "@/components/token/rarity-tier-badge";
import { formatRarityRankWithTie } from "@/lib/copy/phygital";
import type { CollectibleRarity } from "@/lib/tokens/collectible";
import { cn } from "@/lib/utils";

/** Collectible identity — title, collection, rarity (Tensor/ME style). */
export function CollectibleHeader({
  name,
  collectionName,
  collectionImage,
  rarity,
  rarityLoading = false,
  className,
}: {
  name: string;
  collectionName?: string | null;
  collectionImage?: string | null;
  rarity?: Pick<
    CollectibleRarity,
    "rank" | "total" | "tier" | "rankSharedWith"
  > | null;
  rarityLoading?: boolean;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showCollectionImage = Boolean(collectionImage) && !imageFailed;

  return (
    <div className={cn("flex w-full flex-col gap-2 text-left", className)}>
      <h1 className="text-display-xl tracking-tight text-foreground">{name}</h1>
      {collectionName || showCollectionImage ? (
        <div className="inline-flex min-w-0 items-center gap-1.5">
          {showCollectionImage ? (
            // DAS collection logos are remote https URLs.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={collectionImage!}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0 rounded-sm object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : null}
          {collectionName ? (
            <p className="truncate text-sm text-muted-foreground">
              {collectionName}
            </p>
          ) : null}
        </div>
      ) : null}
      {rarityLoading ? (
        <div
          className="h-5 w-40 animate-pulse rounded-full bg-muted/40"
          aria-hidden
        />
      ) : rarity ? (
        <RarityTierBadge
          tier={rarity.tier}
          detail={formatRarityRankWithTie(
            rarity.rank,
            rarity.total,
            rarity.rankSharedWith,
          )}
        />
      ) : null}
    </div>
  );
}

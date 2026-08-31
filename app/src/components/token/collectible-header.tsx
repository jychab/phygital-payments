"use client";

import { useState, type ReactNode } from "react";

import { VerificationMetadataRow } from "@/components/token/authenticity-badge";
import {
  CollectibleMetadataGroup,
  CollectibleMetadataRow,
} from "@/components/token/collectible-metadata-group";
import { RarityMetadataRow } from "@/components/token/rarity-tier-badge";
import { CopyableAddress } from "@/components/shared/copyable-address";
import { copy, formatRarityRankWithTie } from "@/lib/copy/phygital";
import type { CollectibleRarity } from "@/lib/tokens/collectible";
import { cn } from "@/lib/utils";

/** Collectible identity — title, collection, grouped metadata card. */
export function CollectibleHeader({
  name,
  collectionName,
  collectionImage,
  liveConfirmed = false,
  onConfirmPresence,
  rarity,
  rarityLoading = false,
  owner,
  unclaimed = false,
  ownerRefresh,
  collectionFootnote,
  className,
}: {
  name: string;
  collectionName?: string | null;
  collectionImage?: string | null;
  liveConfirmed?: boolean;
  /** Fresh WebAuthn re-check — required when liveConfirmed. */
  onConfirmPresence?: () => void;
  rarity?: Pick<
    CollectibleRarity,
    "rank" | "total" | "tier" | "rankSharedWith"
  > | null;
  rarityLoading?: boolean;
  owner?: string;
  unclaimed?: boolean;
  ownerRefresh?: ReactNode;
  /** e.g. signedInAsOwner when opened from Collection. */
  collectionFootnote?: string | null;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showCollectionImage = Boolean(collectionImage) && !imageFailed;
  const showOwner = owner !== undefined;
  const showRarity = rarityLoading || Boolean(rarity);

  return (
    <div className={cn("flex w-full flex-col gap-3 text-left", className)}>
      <div className="flex flex-col gap-2">
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
      </div>

      {collectionFootnote ? (
        <p className="text-xs text-muted-foreground">{collectionFootnote}</p>
      ) : null}

      <CollectibleMetadataGroup>
        <VerificationMetadataRow
          liveConfirmed={liveConfirmed}
          onVerifyAgain={onConfirmPresence}
        />

        {showRarity ? (
          rarityLoading ? (
            <div
              className="h-11 animate-pulse bg-muted/30 px-4"
              aria-hidden
            />
          ) : rarity ? (
            <RarityMetadataRow
              tier={rarity.tier}
              detail={formatRarityRankWithTie(
                rarity.rank,
                rarity.total,
                rarity.rankSharedWith,
              )}
            />
          ) : null
        ) : null}

        {showOwner ? (
          <CollectibleMetadataRow
            label={copy.owner}
            trailing={ownerRefresh}
          >
            {unclaimed ? (
              <span className="font-medium text-muted-foreground">
                {copy.notLinked}
              </span>
            ) : (
              <CopyableAddress
                address={owner!}
                length={4}
                label="owner wallet"
              />
            )}
          </CollectibleMetadataRow>
        ) : null}
      </CollectibleMetadataGroup>
    </div>
  );
}

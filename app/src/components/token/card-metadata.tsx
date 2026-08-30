"use client";

import { CollectibleHeader } from "@/components/token/collectible-header";

/** @deprecated Prefer CollectibleHeader — kept for binder/legacy call sites. */
export function CardMetadata({
  name,
  collectionName,
  liveConfirmed = false,
  className,
}: {
  name: string;
  collectionName?: string | null;
  liveConfirmed?: boolean;
  className?: string;
}) {
  return (
    <CollectibleHeader
      name={name}
      collectionName={collectionName}
      liveConfirmed={liveConfirmed}
      className={className}
    />
  );
}

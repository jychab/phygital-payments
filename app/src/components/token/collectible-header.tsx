"use client";

import { useState } from "react";

import { AuthenticityBadge } from "@/components/token/authenticity-badge";
import { cn } from "@/lib/utils";

/** Collectible identity — left-aligned like Phantom/Backpack detail. */
export function CollectibleHeader({
  name,
  collectionName,
  collectionImage,
  liveConfirmed = false,
  className,
}: {
  name: string;
  collectionName?: string | null;
  collectionImage?: string | null;
  liveConfirmed?: boolean;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showCollectionImage = Boolean(collectionImage) && !imageFailed;

  return (
    <div className={cn("flex w-full flex-col gap-2 text-left", className)}>
      <h1 className="text-display-xl tracking-tight text-foreground">{name}</h1>
      <div className="flex flex-wrap items-center gap-2">
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
        <AuthenticityBadge confirmed={liveConfirmed} />
      </div>
    </div>
  );
}

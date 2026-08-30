"use client";

import { AuthenticityBadge } from "@/components/token/authenticity-badge";
import { cn } from "@/lib/utils";

/** Collectible identity — left-aligned like Phantom/Backpack detail. */
export function CollectibleHeader({
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
    <div className={cn("flex w-full flex-col gap-2 text-left", className)}>
      <h1 className="text-display-xl tracking-tight text-foreground">{name}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {collectionName ? (
          <p className="text-sm text-muted-foreground">{collectionName}</p>
        ) : null}
        <AuthenticityBadge confirmed={liveConfirmed} />
      </div>
    </div>
  );
}

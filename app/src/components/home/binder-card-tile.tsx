"use client";

import Link from "next/link";
import { Lock, LockOpen } from "lucide-react";

import { CollectionTokenMenu } from "@/components/home/collection-token-menu";
import { useDasCollectible } from "@/hooks/accessory/use-das-collectible";
import { fallbackCollectible } from "@/lib/tokens/collectible";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import { collectionDetailHref } from "@/lib/journey";
import { CardSlab } from "@/components/card/card-slab";
import { staggerStyle } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Single binder tile — DAS art, lock status, and ⋮ manage menu. */
export function BinderCardTile({
  owner,
  token,
  index,
}: {
  owner: string;
  token: PhygitalToken;
  index: number;
}) {
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const das = useDasCollectible(mint);
  const collectible =
    das.data ?? (das.isFetched && mint ? fallbackCollectible(mint) : null);
  const loading = das.isLoading && !das.isFetched;
  const name = collectible?.name ?? "Card";
  const image = collectible?.image ?? null;
  const href = collectionDetailHref("card", token.address);

  return (
    <div
      className="relative motion-safe:animate-[gallery-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]"
      style={staggerStyle(index)}
    >
      <div className="absolute right-1 top-1 z-10">
        <CollectionTokenMenu
          owner={owner}
          token={token}
          noun="card"
          className="bg-background/80 backdrop-blur-sm"
        />
      </div>
      <Link
        href={href}
        className={cn(
          "group block",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <CardSlab
          src={image}
          alt={name}
          loading={loading}
          size="sm"
          className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:scale-[1.02] motion-safe:group-active:scale-[0.99]"
        />
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <p className="truncate text-center text-xs text-muted-foreground transition-colors group-hover:text-foreground">
            {loading ? "…" : name}
          </p>
          <p className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80">
            {token.isLocked ? (
              <>
                <Lock className="size-2.5" aria-hidden />
                Locked
              </>
            ) : (
              <>
                <LockOpen className="size-2.5" aria-hidden />
                Unlocked
              </>
            )}
          </p>
        </div>
      </Link>
    </div>
  );
}

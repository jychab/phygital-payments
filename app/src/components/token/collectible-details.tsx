"use client";

import { CopyableAddress } from "@/components/shared/copyable-address";
import { copy } from "@/lib/copy/phygital";
import { cn } from "@/lib/utils";

/** Mint / collection address rows. */
export function CollectibleDetails({
  mint,
  collectionMint,
  className,
}: {
  mint: string;
  collectionMint?: string | null;
  className?: string;
}) {
  return (
    <section className={cn("w-full text-left", className)}>
      <h2 className="text-eyebrow text-muted-foreground">{copy.details}</h2>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/25 px-4 py-3 text-xs">
          <span className="text-muted-foreground">{copy.mintAddress}</span>
          <CopyableAddress address={mint} label="mint address" />
        </div>
        {collectionMint ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/25 px-4 py-3 text-xs">
            <span className="text-muted-foreground">
              {copy.collectionAddress}
            </span>
            <CopyableAddress
              address={collectionMint}
              label="collection address"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

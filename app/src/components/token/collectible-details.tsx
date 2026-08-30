"use client";

import { useState } from "react";

import { CopyableAddress } from "@/components/shared/copyable-address";
import { copy } from "@/lib/copy/phygital";
import { cn } from "@/lib/utils";

/** Mint address + collection dossier (image, name, description). */
export function CollectibleDetails({
  mint,
  collectionName,
  collectionImage,
  collectionDescription,
  className,
}: {
  mint: string;
  collectionName?: string | null;
  collectionImage?: string | null;
  collectionDescription?: string | null;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(collectionImage) && !imageFailed;
  const hasCollection = Boolean(
    collectionName || showImage || collectionDescription,
  );

  return (
    <section className={cn("w-full text-left", className)}>
      <h2 className="text-eyebrow text-muted-foreground">{copy.details}</h2>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/25 px-4 py-3 text-xs">
          <span className="text-muted-foreground">{copy.mintAddress}</span>
          <CopyableAddress address={mint} label="mint address" />
        </div>

        {hasCollection ? (
          <div className="rounded-xl border border-border/50 bg-muted/25 px-4 py-3">
            <div className="flex items-start gap-3">
              {showImage ? (
                // DAS collection logos are remote https URLs.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={collectionImage!}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-lg object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : null}
              <div className="min-w-0 flex-1 space-y-1">
                {collectionName ? (
                  <p className="text-sm font-medium text-foreground">
                    {collectionName}
                  </p>
                ) : null}
                {collectionDescription ? (
                  <p className="text-xs leading-5 text-muted-foreground whitespace-pre-wrap">
                    {collectionDescription}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

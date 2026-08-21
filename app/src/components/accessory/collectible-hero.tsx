"use client";

import { useState } from "react";

import type { Collectible } from "@/lib/tokens/collectible";

export function CollectibleHero({ collectible }: { collectible: Collectible }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = collectible.image;
  const failed = !src || failedSrc === src;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="aspect-square w-full max-w-72 overflow-hidden rounded-2xl bg-muted">
        {!failed && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={collectible.name}
            referrerPolicy="no-referrer"
            onError={() => setFailedSrc(src)}
            className="size-full object-contain"
          />
        ) : (
          <span className="block size-full bg-muted" aria-hidden />
        )}
      </div>
      <div className="space-y-1 text-center">
        <p className="font-(family-name:--font-display) text-xl tracking-tight">
          {collectible.name}
        </p>
        {collectible.collectionName ? (
          <p className="text-xs text-muted-foreground">
            {collectible.collectionName}
          </p>
        ) : null}
      </div>
    </div>
  );
}

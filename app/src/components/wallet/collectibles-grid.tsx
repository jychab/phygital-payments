"use client";

import type { WalletCollectible } from "@/lib/wallet/portfolio-types";
import { cn } from "@/lib/utils";

/** Phantom-style collectibles grid — square tiles, 2-col / 3-col sm+. */
export function CollectiblesGrid({
  collectibles,
  onSelect,
  className,
}: {
  collectibles: WalletCollectible[];
  onSelect: (c: WalletCollectible) => void;
  className?: string;
}) {
  if (collectibles.length === 0) return null;

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3",
        className,
      )}
    >
      {collectibles.map((c) => (
        <li key={c.mint}>
          <button
            type="button"
            onClick={() => onSelect(c)}
            className="group flex w-full flex-col overflow-hidden rounded-2xl text-left transition-opacity hover:opacity-90 active:opacity-80"
          >
            <span className="relative aspect-square w-full overflow-hidden bg-muted">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 bg-muted" />
              )}
            </span>
            <span className="mt-2 truncate px-0.5 text-sm font-medium">
              {c.name}
            </span>
            {c.collectionName ? (
              <span className="truncate px-0.5 text-xs text-muted-foreground">
                {c.collectionName}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

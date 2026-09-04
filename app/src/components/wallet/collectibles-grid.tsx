"use client";

import type { WalletCollectible } from "@/lib/wallet/portfolio-types";
import { Button } from "@/components/ui/button";
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => onSelect(c)}
            className="group h-auto min-h-0 w-full flex-col items-stretch gap-0 overflow-hidden rounded-2xl p-0 text-left font-normal hover:bg-transparent hover:opacity-90 active:opacity-80"
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
                <span
                  className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted via-muted/80 to-background"
                  aria-hidden
                >
                  <span className="text-3xl font-medium tracking-tight text-muted-foreground/45">
                    {(c.name.trim().charAt(0) || "?").toUpperCase()}
                  </span>
                </span>
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
          </Button>
        </li>
      ))}
    </ul>
  );
}

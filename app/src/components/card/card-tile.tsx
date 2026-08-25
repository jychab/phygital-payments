"use client";

import Link from "next/link";

import { CardSlab } from "@/components/card/card-slab";
import { staggerStyle } from "@/lib/motion";
import type { Collectible } from "@/lib/tokens/collectible";
import { cn } from "@/lib/utils";

/** Binder grid cell — links to `/card?address=` for owned cards. */
export function CardTile({
  href,
  collectible,
  loading = false,
  index = 0,
  className,
}: {
  href: string;
  collectible: Collectible | null;
  loading?: boolean;
  index?: number;
  className?: string;
}) {
  const name = collectible?.name ?? "Card";
  const image = collectible?.image ?? null;

  return (
    <Link
      href={href}
      className={cn(
        "group block motion-safe:animate-[gallery-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      style={staggerStyle(index)}
    >
      <CardSlab
        src={image}
        alt={name}
        loading={loading}
        size="sm"
        className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:group-hover:scale-[1.02] motion-safe:group-active:scale-[0.99]"
      />
      <p className="mt-2 truncate text-center text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        {loading ? "…" : name}
      </p>
    </Link>
  );
}

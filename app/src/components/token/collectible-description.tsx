"use client";

import { useState } from "react";

import { copy } from "@/lib/copy/phygital";
import { cn } from "@/lib/utils";

/** Clamped collectible description with expand. */
export function CollectibleDescription({
  description,
  className,
}: {
  description: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const long = description.length > 180 || description.split("\n").length > 4;

  return (
    <section className={cn("w-full text-left", className)}>
      <h2 className="text-eyebrow text-muted-foreground">{copy.about}</h2>
      <p
        className={cn(
          "mt-2 text-sm leading-6 text-foreground/90 whitespace-pre-wrap",
          !expanded && long && "line-clamp-4",
        )}
      >
        {description}
      </p>
      {long ? (
        <button
          type="button"
          className="mt-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? copy.showLess : copy.showMore}
        </button>
      ) : null}
    </section>
  );
}

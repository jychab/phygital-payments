"use client";

import { ExternalLink } from "lucide-react";

import { copy } from "@/lib/copy/phygital";
import { shortcutOpensExternally } from "@/lib/tokens/shortcuts";
import type { CollectibleShortcut } from "@/lib/tokens/shortcuts";
import { cn } from "@/lib/utils";

/** Horizontal shortcut chips from Phantom shortcuts.json. */
export function CollectibleShortcuts({
  shortcuts,
  onOpenShortcut,
  className,
}: {
  shortcuts: CollectibleShortcut[];
  onOpenShortcut: (shortcut: CollectibleShortcut) => void;
  className?: string;
}) {
  if (shortcuts.length === 0) return null;

  return (
    <section className={cn("w-full text-left", className)}>
      <h2 className="text-eyebrow text-muted-foreground">{copy.shortcut.heading}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {shortcuts.map((shortcut) => {
          const external = shortcutOpensExternally(shortcut);
          return (
            <li key={`${shortcut.label}:${shortcut.uri}`}>
              <button
                type="button"
                onClick={() => onOpenShortcut(shortcut)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border/60",
                  "bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground",
                  "transition-colors hover:bg-muted/50",
                )}
              >
                {shortcut.label}
                {external ? (
                  <ExternalLink
                    className="size-3 text-muted-foreground"
                    aria-hidden
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

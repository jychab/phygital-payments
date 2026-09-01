"use client";

import type { ReactNode } from "react";

import { CollectibleOrb } from "@/components/token/collectible-orb";
import { copyBlockClass, ctaBlockClass } from "@/lib/layout";
import { galleryAnimate, staggerStyle } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Shared NFC hold / processing status used by claim, pay, receive, and accessory check. */
export function NfcHoldStatus({
  title,
  body,
  pulsing = true,
  busy = false,
  size = "md",
  tone = "default",
  action,
  header,
  imageSrc,
  imageAlt = "",
}: {
  title: string;
  body?: string;
  pulsing?: boolean;
  busy?: boolean;
  size?: "md" | "lg";
  /** Success morphs the ring into the green check (same stage as Hold). */
  tone?: "default" | "success";
  action?: ReactNode;
  header?: ReactNode;
  /** DAS mint art for the circular hold target; NFC glyph if missing. */
  imageSrc?: string | null;
  imageAlt?: string;
}) {
  const base = header ? 1 : 0;
  const titleClassName =
    "text-display-md tracking-tight md:text-2xl text-foreground";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center sm:py-14">
      {header ? (
        <div
          className={cn("w-full max-w-sm", galleryAnimate.rise)}
          style={staggerStyle(0)}
        >
          {header}
        </div>
      ) : null}
      <CollectibleOrb
        src={imageSrc}
        alt={imageAlt}
        size={size}
        pulsing={pulsing}
        busy={busy}
        tone={tone}
        style={staggerStyle(base)}
      />
      <div
        className={cn(copyBlockClass, "space-y-1", galleryAnimate.rise)}
        style={staggerStyle(base + 1)}
      >
        <p className={titleClassName}>{title}</p>
        {body ? (
          <p className="text-sm text-muted-foreground">{body}</p>
        ) : null}
      </div>
      {action ? (
        <div
          className={cn(ctaBlockClass, galleryAnimate.rise)}
          style={staggerStyle(base + 2)}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

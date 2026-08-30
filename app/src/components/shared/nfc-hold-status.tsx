"use client";

import type { ReactNode } from "react";

import { CollectibleOrb } from "@/components/token/collectible-orb";
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
  onRingClick,
  ringAriaLabel,
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
  /** When set, the ring is the control (browser needs a gesture for WebAuthn). */
  onRingClick?: () => void;
  ringAriaLabel?: string;
  action?: ReactNode;
  /** Optional chrome above the ring (e.g. collectible context). */
  header?: ReactNode;
  /** DAS mint art for the circular hold target; NFC glyph if missing. */
  imageSrc?: string | null;
  imageAlt?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-14 text-center">
      {header ? (
        <div
          className={cn("w-full max-w-sm", galleryAnimate.rise)}
          style={staggerStyle(0)}
        >
          {header}
        </div>
      ) : null}
      <div style={staggerStyle(header ? 1 : 0)}>
        <CollectibleOrb
          src={imageSrc}
          alt={imageAlt}
          size={size}
          pulsing={pulsing}
          busy={busy}
          tone={tone}
          onClick={onRingClick}
          ariaLabel={ringAriaLabel ?? title}
        />
      </div>
      <div
        className={cn(
          "w-full max-w-72 space-y-1",
          galleryAnimate.rise,
        )}
        style={staggerStyle(header ? 2 : 1)}
      >
        <p className="text-display-md tracking-tight md:text-2xl">
          {title}
        </p>
        {body ? (
          <p className="text-sm text-muted-foreground">{body}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

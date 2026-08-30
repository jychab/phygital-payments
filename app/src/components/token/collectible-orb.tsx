"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Nfc } from "lucide-react";

import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Circular hold target — DAS mint art when available, NFC glyph fallback.
 * Soft outer pulse for ceremony affordance.
 */
export function CollectibleOrb({
  src,
  alt = "",
  size = "lg",
  pulsing = true,
  busy = false,
  tone = "default",
  onClick,
  ariaLabel,
  className,
}: {
  src?: string | null;
  alt?: string;
  size?: "md" | "lg";
  pulsing?: boolean;
  busy?: boolean;
  tone?: "default" | "success";
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shell = size === "lg" ? "size-28" : "size-24";
  const art = size === "lg" ? "size-20" : "size-16";
  const icon = size === "lg" ? "size-7" : "size-6";
  const success = tone === "success";
  const showPulse = pulsing && !busy && !success;
  const showArt = Boolean(src) && failedSrc !== src;

  const orb = (
    <div
      className={cn(
        "relative flex items-center justify-center",
        shell,
        galleryAnimate.scaleIn,
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full border",
          success ? "border-success/25" : "border-primary/25",
          showPulse &&
            "motion-safe:animate-[gallery-pulse_1.6s_ease-out_infinite]",
        )}
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-full",
          art,
          showArt
            ? "bg-muted/40"
            : success
              ? "flex items-center justify-center bg-success/15 text-success"
              : "flex items-center justify-center bg-primary/15 text-primary",
          busy && showArt && "opacity-70",
        )}
      >
        {busy ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40">
            <LoaderCircle
              className={cn(icon, "animate-spin text-foreground")}
            />
          </div>
        ) : null}
        {success && !showArt ? (
          <CheckCircle2 className={icon} />
        ) : showArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={alt}
            className="size-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setFailedSrc(src!)}
          />
        ) : (
          <Nfc className={icon} />
        )}
      </div>
    </div>
  );

  if (onClick && !busy) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-busy={busy}
        className={cn(
          "rounded-full outline-none transition-transform",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          "motion-safe:active:scale-[0.98]",
        )}
      >
        {orb}
      </button>
    );
  }

  return <div aria-busy={busy}>{orb}</div>;
}

"use client";

import { useState, type CSSProperties } from "react";
import { CheckCircle2, Nfc } from "lucide-react";

import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

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
  className,
  style,
}: {
  src?: string | null;
  alt?: string;
  size?: "md" | "lg";
  pulsing?: boolean;
  busy?: boolean;
  tone?: "default" | "success";
  className?: string;
  style?: CSSProperties;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shell = size === "lg" ? "size-24" : "size-18";
  const art = size === "lg" ? "size-20" : "size-14";
  const icon = size === "lg" ? "size-7" : "size-6";
  const success = tone === "success";
  const showPulse = pulsing && !busy && !success;
  // Success always shows the check — mint art stays for pending / default holds.
  const showArt = !success && Boolean(src) && failedSrc !== src;

  return (
    <div aria-busy={busy}>
      <div
        className={cn(
          "relative flex items-center justify-center",
          shell,
          galleryAnimate.scaleIn,
          className,
        )}
        style={style}
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
              <Spinner
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
    </div>
  );
}

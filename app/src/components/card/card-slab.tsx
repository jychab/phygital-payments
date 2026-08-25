"use client";

import { useState } from "react";

import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Framed card art — neutral matte slab with optional hero reveal. */
export function CardSlab({
  src,
  alt,
  fallbackLabel,
  loading = false,
  reveal = false,
  size = "lg",
  className,
}: {
  src: string | null;
  alt: string;
  fallbackLabel?: string;
  loading?: boolean;
  reveal?: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;
  const showImage = !loading && !failed && src;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[color:var(--card-frame)] bg-muted/40",
        "shadow-[0_12px_40px_-16px_var(--card-shadow)]",
        size === "lg"
          ? "aspect-square w-full max-w-72 sm:max-w-80 md:max-w-96"
          : "aspect-[3/4] w-full",
        reveal && galleryAnimate.scaleIn,
        className,
      )}
    >
      {loading ? (
        <div
          className={cn(
            "size-full bg-linear-to-r from-muted/30 via-muted/60 to-muted/30 bg-size-[200%_100%]",
            galleryAnimate.shimmer,
          )}
          aria-hidden
        />
      ) : showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          className="size-full object-contain motion-safe:animate-[gallery-fade_0.22s_ease-out_both]"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-muted/50 px-4">
          <span className="text-center text-sm font-medium text-muted-foreground">
            {fallbackLabel ?? alt}
          </span>
        </div>
      )}
    </div>
  );
}

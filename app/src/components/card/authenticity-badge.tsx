"use client";

import { CheckCircle2 } from "lucide-react";

import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Authenticity pill — Registered (on-chain) vs Confirmed (live tap). */
export function AuthenticityBadge({
  confirmed = false,
  className,
}: {
  confirmed?: boolean;
  className?: string;
}) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        confirmed
          ? "border-success/25 bg-success/10 text-success"
          : "border-border/60 bg-muted/40 text-muted-foreground",
        confirmed && galleryAnimate.check,
        className,
      )}
    >
      <CheckCircle2 className="size-3.5" aria-hidden />
      {confirmed ? copy.confirmed : copy.registered}
    </span>
  );
}

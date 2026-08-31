"use client";

import { CheckCircle2 } from "lucide-react";

import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Authenticity pill — Registered (on-chain) vs Confirmed (live / tap proof).
 * When confirmed + `onConfirmPresence`, the pill is the doorway to a fresh hold.
 */
export function AuthenticityBadge({
  confirmed = false,
  onConfirmPresence,
  className,
}: {
  confirmed?: boolean;
  /** Fresh WebAuthn re-check — only used while already Confirmed. */
  onConfirmPresence?: () => void;
  className?: string;
}) {
  const canRecheck = confirmed && Boolean(onConfirmPresence);
  const label = confirmed ? copy.confirmed : copy.registered;

  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
    confirmed
      ? "border-success/25 bg-success/10 text-success"
      : "border-border/60 bg-muted/40 text-muted-foreground",
    confirmed && galleryAnimate.check,
    canRecheck &&
      "cursor-pointer transition-colors hover:bg-success/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );

  if (canRecheck) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onConfirmPresence}
        aria-label={copy.confirmedRecheckAria}
      >
        <CheckCircle2 className="size-3.5" aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <span role="status" className={classes}>
      <CheckCircle2 className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

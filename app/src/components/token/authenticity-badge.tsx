"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";

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

  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
    confirmed
      ? "border-success/25 bg-success/10 text-success"
      : "border-border/60 bg-muted/40 text-muted-foreground",
    confirmed && galleryAnimate.check,
    canRecheck &&
      "cursor-pointer border-dashed transition-colors hover:bg-success/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );

  const content = (
    <>
      {canRecheck ? (
        <RefreshCw className="size-3.5 shrink-0 opacity-90" aria-hidden />
      ) : (
        <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
      )}
      <span className="flex flex-col items-start leading-tight">
        <span>{confirmed ? copy.confirmed : copy.registered}</span>
        {canRecheck ? (
          <span className="text-[10px] font-normal opacity-80">
            {copy.confirmPresenceHint}
          </span>
        ) : null}
      </span>
    </>
  );

  if (canRecheck) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onConfirmPresence}
        aria-label={copy.confirmedRecheckAria}
      >
        {content}
      </button>
    );
  }

  return (
    <span role="status" className={classes}>
      {content}
    </span>
  );
}

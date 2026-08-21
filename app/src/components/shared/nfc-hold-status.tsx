"use client";

import type { ReactNode } from "react";
import { CheckCircle2, LoaderCircle, Nfc } from "lucide-react";

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
}) {
  const shell = size === "lg" ? "size-28" : "size-24";
  const inner = size === "lg" ? "size-16" : "size-14";
  const icon = size === "lg" ? "size-7" : "size-6";
  const success = tone === "success";
  const showPulse = pulsing && !busy && !success;

  const ring = (
    <div className={cn("relative flex items-center justify-center", shell)}>
      <div
        className={cn(
          "absolute inset-0 rounded-full border",
          success ? "border-success/25" : "border-primary/25",
          showPulse &&
            "motion-safe:animate-[wallet-pulse_1.6s_ease-out_infinite]",
        )}
      />
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          inner,
          success
            ? "bg-success/15 text-success"
            : "bg-primary/15 text-primary",
        )}
      >
        {busy ? (
          <LoaderCircle className={cn(icon, "animate-spin")} />
        ) : success ? (
          <CheckCircle2 className={icon} />
        ) : (
          <Nfc className={icon} />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
      {onRingClick && !busy ? (
        <button
          type="button"
          onClick={onRingClick}
          aria-label={ringAriaLabel ?? title}
          className={cn(
            "rounded-full outline-none transition-transform",
            "focus-visible:ring-3 focus-visible:ring-ring/50",
            "motion-safe:active:scale-[0.98]",
          )}
        >
          {ring}
        </button>
      ) : (
        ring
      )}
      <div className="space-y-1">
        <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
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

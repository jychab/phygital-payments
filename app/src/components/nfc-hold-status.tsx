"use client";

import type { ReactNode } from "react";
import { LoaderCircle, Nfc } from "lucide-react";

import { cn } from "@/lib/utils";

/** Shared NFC hold / processing status used by claim, pay, and receive. */
export function NfcHoldStatus({
  title,
  body,
  pulsing = true,
  busy = false,
  size = "md",
  action,
}: {
  title: string;
  body?: string;
  pulsing?: boolean;
  busy?: boolean;
  size?: "md" | "lg";
  action?: ReactNode;
}) {
  const shell = size === "lg" ? "size-28" : "size-24";
  const inner = size === "lg" ? "size-16" : "size-14";
  const icon = size === "lg" ? "size-7" : "size-6";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
      <div className={cn("relative flex items-center justify-center", shell)}>
        <div
          className={cn(
            "absolute inset-0 rounded-full border border-primary/25",
            pulsing &&
              "motion-safe:animate-[wallet-pulse_1.6s_ease-out_infinite]",
          )}
        />
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full bg-primary/15 text-primary",
            inner,
          )}
        >
          {busy ? (
            <LoaderCircle className={cn(icon, "animate-spin")} />
          ) : (
            <Nfc className={icon} />
          )}
        </div>
      </div>
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

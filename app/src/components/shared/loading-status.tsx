"use client";

import { LoaderCircle } from "lucide-react";

import { CenteredStatus } from "@/components/layout/gate-message";

/** Spinner with visible label and screen-reader text. */
export function LoadingStatus({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <CenteredStatus>
        <LoaderCircle
          className="size-5 animate-spin text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {label}
        </p>
      </CenteredStatus>
    </div>
  );
}

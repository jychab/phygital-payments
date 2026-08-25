"use client";

import { LoaderCircle } from "lucide-react";

import { centeredBlockClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

/** Spinner with visible label — fills parent and centers (e.g. verifying chip). */
export function LoadingStatus({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn(centeredBlockClass, className)}>
      <LoaderCircle
        className="size-5 animate-spin text-muted-foreground"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {label}
      </p>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

/** Simple step indicator for multi-phase flows (e.g. claim). */
export function StepProgress({
  step,
  total,
  labels,
  className,
}: {
  step: number;
  total: number;
  labels?: [string, string];
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      aria-label={`Step ${step} of ${total}`}
    >
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors",
              i < step ? "bg-primary" : "bg-muted",
            )}
            aria-hidden
          />
        ))}
      </div>
      {labels ? (
        <p className="text-xs text-muted-foreground">
          {step}/{total} — {labels[step - 1] ?? labels[0]}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Step {step} of {total}
        </p>
      )}
    </div>
  );
}

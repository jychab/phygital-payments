"use client";

import { cn } from "@/lib/utils";

/** Destructive inline message — shared across panels. */
export function InlineError({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive",
        className,
      )}
      role="alert"
    >
      {children}
    </p>
  );
}

"use client";

import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

/** Hierarchical back — top-left chevron, never a footer action. */
export function BackLink({
  onClick,
  disabled,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Back"
      className={cn(
        "-mt-1 inline-flex items-center gap-1 self-start py-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <ChevronLeft className="size-3.5" aria-hidden />
      Back
    </button>
  );
}

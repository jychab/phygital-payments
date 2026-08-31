"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Grouped inset rows — iOS Settings-style metadata card. */
export function CollectibleMetadataGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border/50 overflow-hidden rounded-xl border border-border/50 bg-muted/25",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CollectibleMetadataRow({
  label,
  children,
  trailing,
  subtitle,
  onPress,
  className,
}: {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
  subtitle?: ReactNode;
  onPress?: () => void;
  className?: string;
}) {
  const content = (
    <>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right">
        <div className="flex min-w-0 items-center justify-end gap-2">
          <div className="min-w-0">{children}</div>
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
        {subtitle ? (
          <div className="text-[11px] leading-snug text-muted-foreground">
            {subtitle}
          </div>
        ) : null}
      </div>
    </>
  );

  const rowClasses = cn("flex items-start justify-between gap-3 px-4 py-3 text-xs", className);

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className={cn(
          rowClasses,
          "w-full text-left transition-colors",
          "hover:bg-muted/40 active:bg-muted/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={rowClasses}>{content}</div>;
}

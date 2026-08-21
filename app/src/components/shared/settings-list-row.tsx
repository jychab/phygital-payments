"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Token-agnostic settings row — Pay Settings, pickers, Confirm Payments. */
export function SettingsListRow({
  leading,
  title,
  subtitle,
  trailing,
  selected,
  disabled,
  truncate = true,
  onSelect,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  truncate?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        selected ? "bg-primary/10" : "hover:bg-muted/50",
        "disabled:opacity-60",
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium text-foreground",
            truncate && "truncate",
          )}
        >
          {title}
        </p>
        {subtitle != null ? (
          <p
            className={cn(
              "text-[11px] text-muted-foreground",
              truncate && "truncate",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {trailing}
    </button>
  );
}

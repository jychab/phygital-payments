"use client";

import { cn } from "@/lib/utils";

/** Amount chip row shared by Enable Pay limit + ready-to-pay panels. */
export function AmountPresets({
  value,
  onChange,
  presets,
  disabled = false,
}: {
  value: string;
  onChange: (next: string) => void;
  presets: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset}
          type="button"
          disabled={disabled}
          onClick={() => onChange(preset)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === preset
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:text-foreground",
          )}
        >
          {preset}
        </button>
      ))}
    </div>
  );
}

"use client";

import { TokenSymbol } from "@/components/shared/token-chip";
import { Input } from "@/components/ui/input";
import type { PaymentToken } from "@/lib/tokens/payment-token";
import { cn } from "@/lib/utils";

type AmountFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  token: PaymentToken;
  /** Max fractional digits (defaults to token.decimals, capped at 18). */
  decimals?: number;
  autoFocus?: boolean;
  className?: string;
  /** Visible caption above the field (e.g. Spending limit). */
  caption?: string;
};

/** Large, wallet-style currency amount entry. */
export function AmountField({
  id,
  value,
  onChange,
  disabled,
  token,
  decimals,
  autoFocus,
  className,
  caption,
}: AmountFieldProps) {
  const label = token.symbol;
  const fracCap = Math.max(0, Math.min(decimals ?? token.decimals, 18));

  // Keep enough width for the value while avoiding excessive expansion.
  const chars = Math.min(Math.max(value.length || 1, 1), 12);

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {caption ? (
        <label
          htmlFor={id}
          className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70"
        >
          {caption}
        </label>
      ) : (
        <label htmlFor={id} className="sr-only">
          Amount in {label}
        </label>
      )}

      <div
        role="presentation"
        onMouseDown={(e) => {
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();

          const el = document.getElementById(id);
          if (el instanceof HTMLInputElement && !el.disabled) {
            el.focus();
          }
        }}
        className={cn(
          "group flex w-full items-center justify-center",
          "rounded-2xl px-3 py-4",
          "transition-colors",
          !disabled && "cursor-text hover:bg-muted/30",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center justify-center gap-2",
            "transition-transform duration-150",
            "group-focus-within:scale-[1.01]",
          )}
        >
          <Input
            id={id}
            variant="hero"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder="0"
            value={value}
            aria-label={
              caption ? `${caption} in ${label}` : `Amount in ${label}`
            }
            className={cn(
              "h-auto min-w-[1ch] max-w-[12ch]",
              "border-0 bg-transparent p-0",
              "text-right text-5xl font-semibold",
              "tracking-[-0.045em] tabular-nums",
              "shadow-none outline-none",
              "placeholder:text-muted-foreground/25",
              "focus-visible:ring-0",
            )}
            style={{ width: `${chars}ch` }}
            onChange={(e) => {
              const next = e.target.value.replace(/[^0-9.]/g, "");
              const parts = next.split(".");

              const cleaned =
                parts.length <= 1
                  ? next
                  : `${parts[0]}.${parts.slice(1).join("").slice(0, fracCap)}`;

              onChange(cleaned);
            }}
          />

          <TokenSymbol
            token={token}
            size="sm"
            className={cn(
              "rounded-full px-2 py-1",
              "bg-muted/60 ring-1 ring-border/40",
              "transition-colors",
              "group-focus-within:bg-muted",
              disabled && "opacity-50",
            )}
            symbolClassName="text-sm font-semibold text-foreground/70"
          />
        </div>
      </div>
    </div>
  );
}

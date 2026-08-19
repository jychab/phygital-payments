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

/** Large, Wallet-style currency amount entry. */
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
  const chars = Math.max((value || "0").length, 1);

  return (
    <div className={cn("relative flex flex-col items-center gap-1.5 py-2", className)}>
      {caption ? (
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          {caption}
        </label>
      ) : (
        <label htmlFor={id} className="sr-only">
          Amount in {label}
        </label>
      )}
      <div
        className="flex max-w-full cursor-text items-center justify-center gap-2.5"
        onMouseDown={(e) => {
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          const el = document.getElementById(id);
          if (el instanceof HTMLInputElement) el.focus();
        }}
      >
        <Input
          id={id}
          variant="hero"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder="0"
          value={value}
          aria-label={caption ? `${caption} in ${label}` : undefined}
          className="max-w-[min(100%,16ch)] min-w-[1ch] text-left"
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
        <span aria-hidden>
          <TokenSymbol
            token={token}
            size="xs"
            className={cn(
              "pointer-events-none shrink-0 select-none rounded-full bg-muted/55 py-1 pl-1 pr-2.5",
              disabled && "opacity-50",
            )}
            symbolClassName="text-[13px] font-medium tracking-tight text-muted-foreground"
          />
        </span>
      </div>
    </div>
  );
}

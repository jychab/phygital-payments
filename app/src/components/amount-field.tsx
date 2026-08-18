"use client";

import { TokenIcon } from "@/components/token-chip";
import { Input } from "@/components/ui/input";
import type { PaymentToken } from "@/lib/payments/payment-token";
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
  return (
    <div className={cn("relative flex flex-col items-center gap-1 py-2", className)}>
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
      <div className="flex w-full items-baseline justify-center gap-2">
        <Input
          id={id}
          variant="hero"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder="0"
          value={value}
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
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <TokenIcon token={token} size="xs" />
        {label}
      </span>
    </div>
  );
}

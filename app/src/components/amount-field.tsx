"use client";

import { TokenIcon } from "@/components/token-chip";
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
}: AmountFieldProps) {
  const label = token.symbol;
  const fracCap = Math.max(0, Math.min(decimals ?? token.decimals, 18));
  return (
    <div className={cn("relative flex flex-col items-center gap-1 py-2", className)}>
      <label htmlFor={id} className="sr-only">
        Amount in {label}
      </label>
      <div className="flex w-full items-baseline justify-center gap-2">
        <input
          id={id}
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
          className={cn(
            "w-full min-w-0 bg-transparent text-center font-[family-name:var(--font-display)]",
            "text-[2.75rem] leading-none tracking-tight tabular-nums md:text-5xl",
            "outline-none placeholder:text-muted-foreground/40",
            "disabled:opacity-50",
          )}
        />
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <TokenIcon token={token} size="xs" />
        {label}
      </span>
    </div>
  );
}

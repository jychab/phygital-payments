"use client";

import { useId } from "react";

import { tryParseAddress } from "@/lib/payments/payment-request";
import { cn, shortAddress } from "@/lib/utils";

/** Pasteable wallet address with validation and short-form confirm. */
export function SolanaAddressField({
  value,
  onChange,
  connectedAddress = null,
  onUseConnected,
  disabled = false,
  label = "Wallet address",
  hint,
  id: idProp,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  connectedAddress?: string | null;
  onUseConnected?: () => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  id?: string;
  /** Quieter inline style for secondary placement (e.g. under Collect amount). */
  compact?: boolean;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const parsed = tryParseAddress(value);
  const trimmed = value.trim();
  const showInvalid = trimmed.length > 0 && !parsed;
  const connected =
    connectedAddress && onUseConnected && connectedAddress !== parsed
      ? connectedAddress
      : null;

  return (
    <div className={cn("flex flex-col gap-2", compact && "gap-1.5")}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
        >
          {label}
        </label>
        {connected ? (
          <button
            type="button"
            className="text-xs text-primary underline-offset-4 hover:underline disabled:opacity-50"
            disabled={disabled}
            onClick={onUseConnected}
          >
            Use mine
          </button>
        ) : null}
      </div>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Paste wallet address"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.trim())}
        className={cn(
          "h-11 w-full rounded-xl border bg-background/60 px-3 font-mono text-sm tracking-tight outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground/60",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
          showInvalid
            ? "border-destructive/50 focus-visible:border-destructive/50 focus-visible:ring-destructive/20"
            : "border-border/60",
          compact && "h-10 text-xs",
        )}
        aria-invalid={showInvalid || undefined}
      />
      {showInvalid ? (
        <p className="text-xs text-destructive">Not a valid wallet address</p>
      ) : parsed ? (
        <p className="text-xs text-muted-foreground">
          {shortAddress(parsed, 4)}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

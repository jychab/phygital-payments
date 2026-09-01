"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { SettingsListRow } from "@/components/shared/settings-list-row";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import {
  isDefaultMint,
  USDC_ICON_URL,
  type PaymentToken,
} from "@/lib/tokens/payment-token";
import { cn, shortAddress } from "@/lib/utils";

export function TokenIcon({
  token,
  size = "md",
  className,
}: {
  token: PaymentToken;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const dim =
    size === "xs" ? "size-4" : size === "sm" ? "size-6" : "size-8";
  const letter =
    size === "xs" ? "text-[8px]" : "text-[10px]";
  // Prefer vendored USDC mark — remote Jupiter/GitHub URLs often fail to paint.
  const src = isDefaultMint(token.mint)
    ? USDC_ICON_URL
    : token.icon?.trim() || null;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={cn(dim, "shrink-0 rounded-full bg-muted object-cover", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        dim,
        letter,
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold uppercase text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      {token.symbol.slice(0, 2)}
    </span>
  );
}

/** Icon + symbol — use anywhere a mint symbol is shown. */
export function TokenSymbol({
  token,
  size = "sm",
  className,
  symbolClassName,
}: {
  token: PaymentToken;
  size?: "xs" | "sm" | "md";
  className?: string;
  symbolClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 align-middle",
        "whitespace-nowrap",
        className,
      )}
    >
      <TokenIcon token={token} size={size} />
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground/75",
          symbolClassName,
        )}
      >
        {token.symbol}
      </span>
    </span>
  );
}

/** Compact mint control — Collect only. Opens picker when clicked. */
export function TokenChip({
  token,
  onClick,
  disabled,
  className,
}: {
  token: PaymentToken;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || !onClick}
      onClick={onClick}
      className={cn(
        "h-9 gap-2 rounded-full border-border/60 bg-card/80 px-2.5 font-medium",
        className,
      )}
    >
      <TokenIcon token={token} size="sm" />
      <span className="text-sm tracking-tight">{token.symbol}</span>
      {onClick ? (
        <ChevronDown className="size-3.5 opacity-60" strokeWidth={2.25} />
      ) : null}
    </Button>
  );
}

export function TokenListRow({
  token,
  selected,
  subtitle,
  onSelect,
  trailing,
}: {
  token: PaymentToken;
  selected?: boolean;
  subtitle?: string;
  onSelect: () => void;
  trailing?: ReactNode;
}) {
  return (
    <SettingsListRow
      leading={<TokenIcon token={token} />}
      title={token.symbol}
      subtitle={subtitle ?? token.name}
      selected={selected}
      onSelect={onSelect}
      trailing={
        trailing != null ? (
          trailing
        ) : selected ? (
          <span className="text-[11px] font-medium text-primary">{copy.common.selected}</span>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground/70">
            {shortAddress(token.mint, 4)}
          </span>
        )
      }
    />
  );
}

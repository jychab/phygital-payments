"use client";

import { m } from "framer-motion";

import { TokenIcon } from "@/components/shared/token-chip";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";
import { formatUsd } from "@/lib/currency/usd";
import { holdingToSendAsset, type SendAssetRef } from "@/lib/wallet/send-asset-ref";
import { cn } from "@/lib/utils";

/** Shared token row for home preview and See All. */
export function TokenHoldingRow({
  holding,
  onSelect,
  className,
}: {
  holding: PaymentTokenHolding;
  onSelect: (asset: SendAssetRef) => void;
  className?: string;
}) {
  return (
    <m.button
      type="button"
      className={cn(
        "flex w-full min-h-11 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted/70",
        className,
      )}
      onClick={() => onSelect(holdingToSendAsset(holding))}
      whileHover={{ x: 1.5 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <TokenIcon
        token={{
          mint: holding.mint,
          symbol: holding.symbol,
          icon: holding.icon,
        }}
        className="size-8"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{holding.symbol}</p>
        <p className="truncate text-xs text-muted-foreground">{holding.name}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm tabular-nums">{holding.balanceUi}</p>
        {holding.valueUsd != null ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatUsd(holding.valueUsd)}
          </p>
        ) : null}
      </div>
    </m.button>
  );
}

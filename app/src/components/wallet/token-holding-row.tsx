"use client";

import { m, useReducedMotion } from "framer-motion";

import { GroupedRow } from "@/components/shared/grouped-list";
import { TokenIcon } from "@/components/shared/token-chip";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";
import { formatUsd } from "@/lib/currency/usd";
import { holdingToSendAsset, type SendAssetRef } from "@/lib/wallet/send-asset-ref";

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
  const prefersReducedMotion = useReducedMotion();
  return (
    <GroupedRow asChild className={className}>
      <m.button
        type="button"
        onClick={() => onSelect(holdingToSendAsset(holding))}
        whileHover={prefersReducedMotion ? undefined : { x: 1.5 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
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
    </GroupedRow>
  );
}

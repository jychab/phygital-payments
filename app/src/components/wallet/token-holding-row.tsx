"use client";

import { TokenIcon } from "@/components/shared/token-chip";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";
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
    <button
      type="button"
      className={cn(
        "flex w-full min-h-11 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted/70",
        className,
      )}
      onClick={() => onSelect(holdingToSendAsset(holding))}
    >
      <TokenIcon
        token={{
          mint: holding.mint,
          symbol: holding.symbol,
          name: holding.name,
          icon: holding.icon,
          decimals: holding.decimals,
          tokenProgram: holding.tokenProgram,
        }}
        className="size-8"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{holding.symbol}</p>
        <p className="truncate text-xs text-muted-foreground">{holding.name}</p>
      </div>
      <p className="shrink-0 text-sm tabular-nums">{holding.balanceUi}</p>
    </button>
  );
}

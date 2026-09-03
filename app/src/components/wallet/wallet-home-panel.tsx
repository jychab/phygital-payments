"use client";

import { useMemo, type ReactNode } from "react";
import { ArrowDown, ArrowUp, LoaderCircle } from "lucide-react";

import { CollectiblesGrid } from "@/components/wallet/collectibles-grid";
import { TokenHoldingRow } from "@/components/wallet/token-holding-row";
import { GroupedList } from "@/components/shared/grouped-list";
import { copy } from "@/lib/copy/phygital";
import type { WalletCollectible, WalletPortfolio } from "@/lib/wallet/portfolio-types";
import type { SendAssetRef } from "@/lib/wallet/send-asset-ref";
import {
  HOME_COLLECTIBLE_PREVIEW,
  HOME_TOKEN_PREVIEW,
  previewCollectibles,
  previewHoldings,
} from "@/lib/wallet/portfolio-preview";
import { cn } from "@/lib/utils";

/** Shared Wallet panel — calm home: capped tokens + collectibles, See All. */
export function WalletHomePanel({
  portfolio,
  loading,
  linkedMint,
  onSend,
  onSendAsset,
  onReceive,
  onSelectCollectible,
  onSeeAllTokens,
  onSeeAllCollectibles,
  feeBalanceLow,
  onTopUpFees,
  className,
}: {
  portfolio: WalletPortfolio | undefined;
  loading?: boolean;
  linkedMint?: string | null;
  onSend: () => void;
  onSendAsset: (asset: SendAssetRef) => void;
  onReceive: () => void;
  onSelectCollectible: (c: WalletCollectible) => void;
  onSeeAllTokens: () => void;
  onSeeAllCollectibles: () => void;
  feeBalanceLow?: boolean;
  onTopUpFees?: () => void;
  className?: string;
}) {
  const holdings = portfolio?.holdings ?? [];
  const collectibles = portfolio?.collectibles ?? [];
  const hasFungible = holdings.some((h) => Number(h.balanceUi) > 0);
  const empty = !loading && holdings.length === 0 && collectibles.length === 0;

  const tokenPreview = useMemo(() => previewHoldings(holdings), [holdings]);
  const collectiblePreview = useMemo(
    () => previewCollectibles(collectibles, linkedMint),
    [collectibles, linkedMint],
  );
  const moreTokens = holdings.length > HOME_TOKEN_PREVIEW;
  const moreCollectibles = collectibles.length > HOME_COLLECTIBLE_PREVIEW;

  return (
    <div className={cn("flex flex-1 flex-col gap-8", className)}>
      <div className="flex flex-col items-center gap-2 pt-4 text-center sm:pt-6">
        {loading && !portfolio ? (
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        ) : empty ? (
          <p className="text-sm text-muted-foreground">{copy.wallet.addMoney}</p>
        ) : null}
      </div>

      <div className="flex items-start justify-center gap-10">
        {hasFungible ? (
          <CircleAction
            label={copy.wallet.send}
            onClick={onSend}
            icon={<ArrowUp className="size-5" />}
          />
        ) : null}
        <CircleAction
          label={copy.wallet.receive}
          onClick={onReceive}
          icon={<ArrowDown className="size-5" />}
        />
      </div>

      {feeBalanceLow && onTopUpFees ? (
        <button
          type="button"
          onClick={onTopUpFees}
          className="mx-3 rounded-2xl bg-muted/40 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/60"
        >
          <p className="font-medium">{copy.wallet.feeBalanceLow}</p>
          <p className="mt-1 text-xs text-primary">{copy.wallet.topUpFees}</p>
        </button>
      ) : null}

      {!empty && tokenPreview.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between px-4">
            <h2 className="text-section-label">{copy.wallet.tokens}</h2>
            {moreTokens ? (
              <button
                type="button"
                onClick={onSeeAllTokens}
                className="text-xs font-medium text-primary"
              >
                {copy.wallet.seeAll}
              </button>
            ) : null}
          </div>
          <GroupedList>
            {tokenPreview.map((h) => (
              <li
                key={h.mint}
                className="border-b border-border/50 last:border-b-0"
              >
                <TokenHoldingRow holding={h} onSelect={onSendAsset} />
              </li>
            ))}
          </GroupedList>
        </section>
      ) : null}

      {!empty && collectiblePreview.length > 0 ? (
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-baseline justify-between px-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {copy.wallet.collectibles}
            </p>
            {moreCollectibles ? (
              <button
                type="button"
                onClick={onSeeAllCollectibles}
                className="text-xs font-medium text-primary"
              >
                {copy.wallet.seeAll}
              </button>
            ) : null}
          </div>
          <CollectiblesGrid
            collectibles={collectiblePreview}
            onSelect={onSelectCollectible}
            className="px-1"
          />
        </div>
      ) : null}
    </div>
  );
}

function CircleAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80">
        {icon}
      </span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

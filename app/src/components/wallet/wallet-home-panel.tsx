"use client";

import { useMemo, type ReactNode } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { ArrowDown, ArrowUp, Nfc, RefreshCcw, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivityList } from "@/components/wallet/activity-list";
import { CollectiblesGrid } from "@/components/wallet/collectibles-grid";
import { TokenHoldingRow } from "@/components/wallet/token-holding-row";
import { GroupedList } from "@/components/shared/grouped-list";
import { copy } from "@/lib/copy/phygital";
import type {
  WalletActivityItem,
  WalletCollectible,
  WalletPortfolio,
} from "@/lib/wallet/portfolio-types";
import type { SendAssetRef } from "@/lib/wallet/send-asset-ref";
import {
  HOME_COLLECTIBLE_PREVIEW,
  HOME_TOKEN_PREVIEW,
  previewCollectibles,
  previewHoldings,
} from "@/lib/wallet/portfolio-preview";
import { formatUsd, sumUsd } from "@/lib/currency/usd";
import { formatCompactTokenAmount } from "@/lib/tokens/amount";
import { cn, shortAddress } from "@/lib/utils";

/** Shared Wallet panel — calm home: capped tokens + collectibles, See All. */
const EMPTY_HOLDINGS: WalletPortfolio["holdings"] = [];
const EMPTY_COLLECTIBLES: WalletPortfolio["collectibles"] = [];
const SKELETON_ROWS = ["wallet-home-1", "wallet-home-2", "wallet-home-3"] as const;
const sectionTransition = {
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1] as const,
};
const sectionVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function WalletHomePanel({
  portfolio,
  loading,
  tokenAddress,
  linkedMint,
  onManageDevice,
  onSend,
  onSendAsset,
  onReceive,
  onSelectCollectible,
  onSeeAllTokens,
  onSeeAllCollectibles,
  onSeeAllActivity,
  feeBalanceLow,
  onTopUpFees,
  customRpcEndpoint,
  onChangeRpc,
  onRefresh,
  refreshing,
  lastUpdatedLabel,
  activityItems,
  activityAssetMetaByMint,
  className,
}: {
  portfolio: WalletPortfolio | undefined;
  loading?: boolean;
  tokenAddress: string;
  linkedMint?: string | null;
  onSend: () => void;
  onSendAsset: (asset: SendAssetRef) => void;
  onReceive: () => void;
  onSelectCollectible: (c: WalletCollectible) => void;
  onSeeAllTokens: () => void;
  onSeeAllCollectibles: () => void;
  onSeeAllActivity?: () => void;
  feeBalanceLow?: boolean;
  onTopUpFees?: () => void;
  /** Masked host when a custom RPC is active (Backpack-style reminder). */
  customRpcEndpoint?: string | null;
  onChangeRpc?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  lastUpdatedLabel?: string | null;
  activityItems?: WalletActivityItem[];
  activityAssetMetaByMint?: Record<string, { symbol: string; name: string }>;
  onManageDevice: () => void;
  className?: string;
}) {
  const holdings = portfolio?.holdings ?? EMPTY_HOLDINGS;
  const collectibles = portfolio?.collectibles ?? EMPTY_COLLECTIBLES;
  const hasFungible = holdings.some((h) => Number(h.balanceUi) > 0);
  const empty = !loading && holdings.length === 0 && collectibles.length === 0;

  const tokenPreview = useMemo(() => previewHoldings(holdings), [holdings]);
  const collectiblePreview = useMemo(
    () => previewCollectibles(collectibles, linkedMint),
    [collectibles, linkedMint],
  );
  const moreTokens = holdings.length > HOME_TOKEN_PREVIEW;
  const moreCollectibles = collectibles.length > HOME_COLLECTIBLE_PREVIEW;

  const primaryHolding = tokenPreview[0];

  const hasUsd = holdings.some(
    (h) => typeof h.valueUsd === "number" && Number.isFinite(h.valueUsd),
  );
  const totalUsd = hasUsd ? sumUsd(holdings.map((h) => h.valueUsd)) : 0;

  // Prices cover mainnet top volume only; fall back to the largest holding.
  const showUsdHero = hasUsd && totalUsd > 0;
  const primaryCryptoLine = primaryHolding
    ? `${formatCompactTokenAmount(primaryHolding.balanceUi)} ${primaryHolding.symbol}`
    : null;
  const heroValue = showUsdHero
    ? formatUsd(totalUsd)
    : (primaryCryptoLine ?? "—");
  const heroSecondary = showUsdHero
    ? primaryCryptoLine
    : primaryCryptoLine
      ? null
      : copy.wallet.addMoney;

  if (loading && !portfolio) {
    return (
      <div className={cn("flex flex-1 flex-col gap-6", className)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-4 animate-pulse rounded-full bg-muted/30" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted/30" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded bg-muted/30" />
        </div>

        <div className="flex flex-col items-center gap-2 py-1 text-center">
          <div className="h-10 w-44 animate-pulse rounded-2xl bg-muted/30" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted/30" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 animate-pulse rounded-2xl bg-muted/30" />
              <div className="h-3 w-10 animate-pulse rounded bg-muted/30" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 animate-pulse rounded-2xl bg-muted/30" />
              <div className="h-3 w-10 animate-pulse rounded bg-muted/30" />
            </div>
          </div>
          <div className="size-9 animate-pulse rounded-2xl bg-muted/30" />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="mx-4 h-3 w-16 animate-pulse rounded bg-muted/30" />
          <div className="overflow-hidden rounded-2xl bg-grouped">
            {SKELETON_ROWS.map((key) => (
              <div key={key} className="h-14 animate-pulse bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={cn("flex flex-1 flex-col gap-6", className)}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.045,
              delayChildren: 0.03,
            },
          },
        }}
      >
      <m.div
        className="flex items-center justify-between gap-3"
        variants={sectionVariants}
        transition={sectionTransition}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Nfc className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
              {shortAddress(tokenAddress, 6)}
            </p>
          </div>
          {onRefresh ? (
            <button
              type="button"
              aria-label={copy.wallet.refresh}
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={onRefresh}
            >
              <RefreshCcw
                className={cn("size-3.5", refreshing ? "animate-spin" : "")}
                aria-hidden
              />
              <span className="sr-only">{copy.wallet.refresh}</span>
            </button>
          ) : null}
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          <p className="text-xs font-medium text-success">
            {copy.wallet.accessoryConnected}
          </p>
        </div>
      </m.div>

      <m.div
        className="flex flex-col items-center gap-1.5 py-1 text-center"
        variants={sectionVariants}
        transition={sectionTransition}
      >
        <m.h1
          className="text-balance-hero tabular-nums"
          initial={{ opacity: 0, scale: 0.985, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
        >
          {heroValue}
        </m.h1>
        {heroSecondary ? (
          <p className="text-sm text-muted-foreground tabular-nums">
            {heroSecondary}
          </p>
        ) : null}
        {lastUpdatedLabel ? (
          <p className="text-xs text-muted-foreground">{lastUpdatedLabel}</p>
        ) : null}
      </m.div>

      <m.div
        className="flex items-center justify-between"
        variants={sectionVariants}
        transition={sectionTransition}
      >
        <div className="flex items-center gap-10">
          {hasFungible ? (
            <QuickActionButton
              label={copy.wallet.send}
              icon={<ArrowUp className="size-5" />}
              primary
              onClick={onSend}
            />
          ) : null}
          <QuickActionButton
            label={copy.wallet.receive}
            icon={<ArrowDown className="size-5" />}
            onClick={onReceive}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copy.wallet.manageDevice}
          onClick={onManageDevice}
          className="rounded-2xl border border-border/60 bg-muted/30"
        >
          <Settings className="size-4" aria-hidden />
        </Button>
      </m.div>

      {customRpcEndpoint && onChangeRpc ? (
        <QuietNotice
          label={copy.wallet.rpcBannerBody(customRpcEndpoint)}
          action={copy.wallet.rpcBannerChange}
          onClick={onChangeRpc}
        />
      ) : null}

      {feeBalanceLow && onTopUpFees ? (
        <QuietNotice
          label={copy.wallet.feeBalanceLow}
          action={copy.wallet.topUpFees}
          onClick={onTopUpFees}
        />
      ) : null}

      {!empty && tokenPreview.length > 0 ? (
        <m.section
          className="flex flex-col gap-1.5"
          variants={sectionVariants}
          transition={sectionTransition}
        >
          <div className="flex items-baseline justify-between px-4 pt-1">
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
              <li key={h.mint}>
                <TokenHoldingRow holding={h} onSelect={onSendAsset} />
              </li>
            ))}
          </GroupedList>
        </m.section>
      ) : null}

      {!empty && collectiblePreview.length > 0 ? (
        <m.section
          className="flex flex-col gap-2.5"
          variants={sectionVariants}
          transition={sectionTransition}
        >
          <div className="flex items-baseline justify-between px-4">
            <h2 className="text-section-label">{copy.wallet.collectibles}</h2>
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
          />
        </m.section>
      ) : null}
      {activityItems?.length ? (
        <m.section
          className="flex flex-col gap-1.5"
          variants={sectionVariants}
          transition={sectionTransition}
        >
          <div className="flex items-baseline justify-between px-4">
            <h2 className="text-section-label">{copy.wallet.activity}</h2>
            {onSeeAllActivity ? (
              <button
                type="button"
                onClick={onSeeAllActivity}
                className="text-xs font-medium text-primary"
              >
                {copy.wallet.seeAll}
              </button>
            ) : null}
          </div>
          <ActivityList
            items={activityItems.slice(0, 4)}
            emptyLabel={copy.wallet.noActivity}
            assetMetaByMint={activityAssetMetaByMint}
          />
        </m.section>
      ) : null}
      </m.div>
    </LazyMotion>
  );
}

function QuickActionButton({
  label,
  icon,
  onClick,
  primary,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2"
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <m.span
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl border transition-opacity active:opacity-80",
          primary
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-border/60 bg-muted/30 text-foreground",
        )}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {icon}
      </m.span>
      <span className="text-[11px] font-medium text-foreground/80">
        {label}
      </span>
    </m.button>
  );
}

function QuietNotice({
  label,
  action,
  onClick,
}: {
  label: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      className="mx-4 flex items-center justify-between gap-3 rounded-2xl bg-muted/20 px-4 py-2.5 text-left transition-colors hover:bg-muted/30"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{label}</p>
      <span className="shrink-0 text-xs font-medium text-primary">{action}</span>
    </m.button>
  );
}

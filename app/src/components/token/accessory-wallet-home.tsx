"use client";

import { LoaderCircle } from "lucide-react";

import { TokenIcon } from "@/components/shared/token-chip";
import { SettingsListRow } from "@/components/shared/settings-list-row";
import { copy } from "@/lib/copy/phygital";
import {
  accessoryEnabledMintCount,
  accessoryMintPayEnabled,
  accessoryMintPaySubtitle,
  deriveAccessoryWalletHomeHeader,
  sortAccessoryHoldings,
  type AccessoryStatusLine,
} from "@/lib/pay/accessory-pay-state";
import type { OwnerPayDelegates } from "@/lib/tokens/mint-delegate";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";
import { cn } from "@/lib/utils";

/** Linked-wallet tokens — enable spending limits per mint for this accessory. */
export function AccessoryWalletHome({
  tokenAddress,
  holdings,
  delegates,
  loading,
  statusLine,
  onEditLimit,
}: {
  tokenAddress: string;
  holdings: readonly PaymentTokenHolding[] | undefined;
  delegates: OwnerPayDelegates | undefined;
  loading: boolean;
  statusLine: AccessoryStatusLine | null;
  onEditLimit: (holding: PaymentTokenHolding) => void;
}) {
  const list = holdings ?? [];
  const enabledCount = accessoryEnabledMintCount(list, delegates, tokenAddress);
  const hasLimit = enabledCount > 0;
  const header = deriveAccessoryWalletHomeHeader({
    hasLimit,
    holdingsEmpty: !loading && list.length === 0,
    enabledCount,
    totalCount: list.length,
  });
  const sorted = sortAccessoryHoldings(list, delegates, tokenAddress);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{header.subtitle}</p>
      {header.enabledSummary ? (
        <p className="text-xs text-muted-foreground">{header.enabledSummary}</p>
      ) : null}

      {statusLine ? (
        <p
          className={cn(
            "px-1 text-sm",
            statusLine.tone === "primary"
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          {statusLine.text}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <p className="rounded-xl border border-border/50 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          {copy.pay.noTokensSubtitle}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {sorted.map((holding) => (
            <AccessoryPayTokenRow
              key={holding.mint}
              holding={holding}
              enabled={accessoryMintPayEnabled(
                delegates,
                tokenAddress,
                holding.mint,
              )}
              subtitle={accessoryMintPaySubtitle(
                delegates,
                tokenAddress,
                holding.mint,
              )}
              onSelect={() => onEditLimit(holding)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AccessoryPayTokenRow({
  holding,
  enabled,
  subtitle,
  onSelect,
}: {
  holding: PaymentTokenHolding;
  enabled: boolean;
  subtitle: string | null;
  onSelect: () => void;
}) {
  return (
    <li
      className={cn(
        "overflow-hidden rounded-xl border border-border/50 bg-muted/20",
        enabled && "border-success/25 bg-success/5",
      )}
    >
      <SettingsListRow
        leading={<TokenIcon token={holding} size="md" />}
        title={holding.symbol}
        subtitle={enabled ? (subtitle ?? undefined) : holding.balanceUi}
        truncate={false}
        onSelect={onSelect}
        trailing={
          enabled ? (
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                {copy.pay.payEnabled}
              </span>
              <span className="text-sm tabular-nums text-foreground">
                {holding.balanceUi}
              </span>
              <span className="text-[11px] font-medium text-primary">
                {copy.pay.editLimit}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium text-primary">
              {copy.pay.enableToken}
            </span>
          )
        }
      />
    </li>
  );
}

"use client";

import { ArrowDown, ArrowUp, LoaderCircle, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { TokenIcon } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import type { WalletPortfolio } from "@/lib/wallet/portfolio-types";
import { cn } from "@/lib/utils";

function formatUsd(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Shared Wallet panel — `$` hero, circular Send/Receive, inset holdings. */
export function WalletHomePanel({
  portfolio,
  loading,
  onSend,
  onReceive,
  onSettings,
  className,
}: {
  portfolio: WalletPortfolio | undefined;
  loading?: boolean;
  onSend: () => void;
  onReceive: () => void;
  onSettings?: () => void;
  className?: string;
}) {
  const total = portfolio?.totalUsd ?? 0;
  const hasFunds =
    total > 0 ||
    (portfolio?.holdings.some((h) => Number(h.balanceUi) > 0) ?? false) ||
    (portfolio?.collectibles.length ?? 0) > 0;
  const empty = !loading && !hasFunds;
  const holdings = portfolio?.holdings ?? [];
  const collectibles = portfolio?.collectibles ?? [];

  return (
    <div className={cn("flex flex-1 flex-col gap-8", className)}>
      <div className="flex flex-col items-center gap-2 pt-6 text-center">
        {loading && !portfolio ? (
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <p className="font-(family-name:--font-display) text-[2.75rem] font-light leading-none tracking-tight tabular-nums md:text-5xl">
              ${formatUsd(total)}
            </p>
            <p className="text-sm text-muted-foreground">
              {empty ? copy.wallet.addMoney : copy.wallet.availableBalance}
            </p>
          </>
        )}
      </div>

      <div className="flex items-start justify-center gap-10">
        {!empty ? (
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

      {!empty && holdings.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {copy.wallet.tokens}
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-muted/25">
            {holdings.map((h) => (
              <li
                key={h.mint}
                className="flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-b-0"
              >
                <TokenIcon
                  token={{
                    mint: h.mint,
                    symbol: h.symbol,
                    name: h.name,
                    icon: h.icon,
                    decimals: h.decimals,
                    tokenProgram: h.tokenProgram,
                  }}
                  className="size-8"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h.symbol}</p>
                  <p className="truncate text-xs text-muted-foreground">{h.name}</p>
                </div>
                <p className="shrink-0 text-sm tabular-nums">
                  {h.symbol === "USDC" ? `$${h.balanceUi}` : h.balanceUi}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!empty && collectibles.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {copy.wallet.collectibles}
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-muted/25">
            {collectibles.map((c) => (
              <li
                key={c.mint}
                className="flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-b-0"
              >
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt=""
                    className="size-8 rounded-lg object-cover"
                  />
                ) : (
                  <span className="size-8 rounded-lg bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  {c.collectionName ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {c.collectionName}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {onSettings ? (
        <div className="mt-auto flex justify-center pb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={onSettings}
          >
            <MoreHorizontal className="size-4" />
            {copy.wallet.settings}
          </Button>
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
      <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-80">
        {icon}
      </span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

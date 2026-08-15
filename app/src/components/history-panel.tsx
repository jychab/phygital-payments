"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { formatTokenAmount } from "@/lib/payments/usdc-allowance";
import { getUsdcMint, USDC_DECIMALS } from "@/lib/payments/usdc";
import type { PaymentRecord } from "@/lib/payments/history-client";
import { usePaymentHistory } from "@/hooks/use-payment-history";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn, shortAddress } from "@/lib/utils";

function relativeTime(unixSeconds: number | null): string {
  if (!unixSeconds) return "";
  const diff = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString();
}

type Row = PaymentRecord & {
  direction: "received" | "sent";
  counterparty: string | null;
};

function toRows(payments: PaymentRecord[], wallet: string): Row[] {
  return payments.map((p) => {
    const received = p.recipientOwner === wallet;
    return {
      ...p,
      direction: received ? "received" : "sent",
      counterparty: received ? p.senderOwner : p.recipientOwner,
    };
  });
}

export function HistoryPanel({
  recipient,
  allowConnect = false,
}: {
  /** Wallet address whose payment history to show. */
  recipient?: string | null;
  /** Show an inline connect CTA when no address is available. */
  allowConnect?: boolean;
} = {}) {
  const { address: connectedAddress, connect, ready } = useSolanaAddress();
  const address = recipient ?? connectedAddress ?? null;
  const query = usePaymentHistory(address);
  const usdcMint = getUsdcMint();

  const loading = query.isLoading;
  const error = query.error as Error | null;
  const rows =
    query.data && address ? toRows(query.data, address) : [];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Activity</p>
        {address ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn("size-3.5", query.isFetching && "animate-spin")}
            />
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Couldn’t load activity
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => query.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
            <History className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {address
              ? "Payments you collect will show up here."
              : "Connect a wallet to see activity."}
          </p>
          {!address && allowConnect ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!ready}
              onClick={connect}
            >
              Connect wallet
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const received = row.direction === "received";
            const amount =
              row.mint === usdcMint
                ? `${formatTokenAmount(BigInt(row.amount), USDC_DECIMALS)} USDC`
                : "Unknown token";
            return (
              <li key={`${row.signature}:${row.transferIndex}`}>
                <a
                  href={explorerTxUrl(row.signature)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      received
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {received ? (
                      <ArrowDownLeft className="size-4" strokeWidth={2.5} />
                    ) : (
                      <ArrowUpRight className="size-4" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        received ? "text-primary" : "text-foreground",
                      )}
                    >
                      {received ? "+" : "−"}
                      {amount}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {received ? "Received" : "Sent"}
                      {relativeTime(row.blockTime)
                        ? ` · ${relativeTime(row.blockTime)}`
                        : ""}
                    </p>
                    {row.counterparty ? (
                      <p className="truncate font-mono text-[11px] text-muted-foreground/70">
                        {received ? "from" : "to"}{" "}
                        {shortAddress(row.counterparty, 6)}
                      </p>
                    ) : null}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

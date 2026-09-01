"use client";

import { useIsRestoring } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  LoaderCircle,
} from "lucide-react";

import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { useVerifiedTokens } from "@/hooks/tokens/use-payment-tokens";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { formatTokenAmount } from "@/lib/tokens/mint-delegate";
import {
  resolvePaymentToken,
  type PaymentToken,
} from "@/lib/tokens/payment-token";
import type { PaymentRecord } from "@/lib/home/history-client";
import { usePaymentHistory } from "@/hooks/home/use-payment-history";
import { copy } from "@/lib/copy/phygital";
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

function formatPaymentAmountUi(
  mint: string,
  amount: string,
  catalog: PaymentToken[] | undefined,
): { token: PaymentToken; amountUi: string } {
  const token = resolvePaymentToken(mint, catalog);
  if (!/^\d+$/.test(amount)) {
    return { token, amountUi: "—" };
  }
  return {
    token,
    amountUi: formatTokenAmount(BigInt(amount), token.decimals),
  };
}

/** Collect / wallet Activity — indexed payments for an address. */
export function HistoryPanel({ owner }: { owner: string }) {
  const isRestoring = useIsRestoring();
  const query = usePaymentHistory(owner);
  const verified = useVerifiedTokens();

  const loading = isRestoring || query.isLoading;
  const error = query.error as Error | null;
  const rows = query.data ? toRows(query.data, owner) : [];
  const emptyCopy = copy.collection.activityEmpty;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="text-sm font-medium text-foreground">{copy.common.activity}</p>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {copy.collection.activityLoadFailed}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => query.refetch()}
          >
            {copy.common.tryAgain}
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
            <History className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyCopy}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const received = row.direction === "received";
            const { token, amountUi } = formatPaymentAmountUi(
              row.mint,
              row.amount,
              verified.data,
            );
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
                        "flex flex-wrap items-center gap-1.5 text-sm font-semibold tabular-nums",
                        received ? "text-primary" : "text-foreground",
                      )}
                    >
                      <span>
                        {received ? "+" : "−"}
                        {amountUi}
                      </span>
                      <TokenSymbol
                        token={token}
                        size="xs"
                        symbolClassName="font-semibold"
                      />
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {received ? copy.collect.received : copy.collection.sent}
                      {relativeTime(row.blockTime)
                        ? ` · ${relativeTime(row.blockTime)}`
                        : ""}
                    </p>
                    {row.counterparty ? (
                      <p className="truncate font-mono text-[11px] text-muted-foreground/70">
                        {received ? copy.collection.from : copy.collection.to}{" "}
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

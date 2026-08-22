"use client";

import { BackLink } from "@/components/shared/back-link";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import {
  formatTokenAmount,
  formatUsd,
  type WalletHolding,
} from "@/lib/wallet/portfolio";

function HoldingRow({ holding }: { holding: WalletHolding }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
      {holding.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={holding.image}
          alt=""
          className="size-9 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-medium uppercase text-muted-foreground">
          {holding.symbol.slice(0, 3)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{holding.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatTokenAmount(holding.uiAmount)} {holding.symbol}
        </p>
      </div>
      {holding.kind !== "collectible" ? (
        <p className="shrink-0 text-sm text-foreground">
          {holding.usdValue != null ? formatUsd(holding.usdValue) : "—"}
        </p>
      ) : null}
    </div>
  );
}

export function HoldingsSheet({ onBack }: { onBack: () => void }) {
  const { session } = useSmartWallet();
  const portfolioQuery = useWalletPortfolio(session?.vaultPda ?? null);
  const portfolio = portfolioQuery.data ?? null;
  const tokens = portfolio?.tokens ?? [];
  const collectibles = portfolio?.collectibles ?? [];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="space-y-0.5">
        <p className="text-base font-medium text-foreground">Holdings</p>
        <p className="text-sm text-muted-foreground">
          {portfolio?.totalUsd != null
            ? `${formatUsd(portfolio.totalUsd)} total`
            : "Your assets"}
        </p>
      </div>

      <section className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Tokens
        </p>
        {tokens.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tokens yet.</p>
        ) : (
          tokens.map((holding) => <HoldingRow key={holding.id} holding={holding} />)
        )}
      </section>

      {collectibles.length > 0 ? (
        <section className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Collectibles
          </p>
          {collectibles.map((holding) => (
            <HoldingRow key={holding.id} holding={holding} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

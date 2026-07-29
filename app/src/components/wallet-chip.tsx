"use client";

import { LoaderCircle, Wallet } from "lucide-react";

import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

function shortAddress(value: string, length = 4): string {
  return `${value.slice(0, length)}…${value.slice(-length)}`;
}

/**
 * Read-only indicator of the wallet the parent vault reports over the bridge.
 * There is no connect/disconnect here — the vault owns the session.
 *
 * When a `recipient` is supplied (from `?recipient=`), it stands in for the
 * connected wallet so the navbar shows who the payment settles to even without
 * a vault session.
 */
export function WalletChip({
  className,
  recipient,
}: {
  className?: string;
  recipient?: string | null;
}) {
  const { ready, address, isConnected } = useSolanaAddress();

  // The connected vault wallet wins; otherwise fall back to the URL recipient,
  // which is known immediately and doesn't need the bridge to be ready.
  const display = isConnected && address ? address : recipient ?? null;

  if (!ready && !recipient) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground",
          className,
        )}
      >
        <LoaderCircle className="size-3.5 animate-spin" />
        …
      </span>
    );
  }

  if (display) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 font-mono text-xs",
          className,
        )}
        title={display}
      >
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        {shortAddress(display)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Wallet className="size-3.5" />
      No wallet
    </span>
  );
}

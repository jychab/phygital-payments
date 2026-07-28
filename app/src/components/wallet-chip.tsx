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
 */
export function WalletChip({ className }: { className?: string }) {
  const { ready, address, isConnected } = useSolanaAddress();

  if (!ready) {
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

  if (isConnected && address) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 font-mono text-xs",
          className,
        )}
        title={address}
      >
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        {shortAddress(address)}
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

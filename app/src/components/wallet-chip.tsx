"use client";

import { LoaderCircle, Wallet } from "lucide-react";

import { CopyableAddress } from "@/components/copyable-address";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

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

  // An explicit recipient (URL or typed) wins and is known immediately without
  // waiting on the bridge; otherwise fall back to the connected vault wallet.
  const display = recipient ?? (isConnected && address ? address : null);

  if (!ready && !recipient) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground",
          className,
        )}
      >
        <LoaderCircle className="size-3.5 animate-spin" />
        <span className="tracking-tight">Connecting…</span>
      </span>
    );
  }

  if (display) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs",
          className,
        )}
      >
        <span
          className="size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]"
          aria-hidden
        />
        <CopyableAddress address={display} label="wallet address" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Wallet className="size-3.5" />
      No wallet
    </span>
  );
}

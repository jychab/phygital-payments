"use client";

import { LoaderCircle, LogOut } from "lucide-react";

import { CopyableAddress } from "@/components/copyable-address";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

/** Connected wallet status / disconnect only — connect lives in contextual CTAs. */
export function WalletChip({
  className,
  recipient,
  actions = "full",
}: {
  className?: string;
  recipient?: string | null;
  actions?: "full" | "none";
}) {
  const { ready, address, isConnected, authenticated, disconnect } =
    useSolanaAddress();

  const display =
    (actions === "none" ? recipient : null) ??
    (actions === "full" && isConnected && address ? address : null) ??
    (actions === "full" && !isConnected && recipient ? recipient : null);

  const canDisconnect = actions === "full" && (isConnected || authenticated);

  if (!ready && !display) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground",
          className,
        )}
      >
        <LoaderCircle className="size-3.5 animate-spin" />
      </span>
    );
  }

  if (!display) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isConnected
            ? "bg-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]"
            : "bg-muted-foreground/50",
        )}
        aria-hidden
      />
      <CopyableAddress address={display} label="wallet address" />
      {canDisconnect ? (
        <button
          type="button"
          onClick={() => void disconnect()}
          className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Disconnect"
        >
          <LogOut className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

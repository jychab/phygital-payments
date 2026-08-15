"use client";

import { LoaderCircle, LogOut, Wallet } from "lucide-react";

import { CopyableAddress } from "@/components/copyable-address";
import { Button } from "@/components/ui/button";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

/**
 * Shows the connected Privy Solana wallet, or a Sign in control.
 * In embeds (`actions="none"`), `recipient` is shown as a read-only address.
 * Top-level always uses the connected wallet — URL `?recipient=` never
 * pretends the session is signed in.
 */
export function WalletChip({
  className,
  recipient,
  actions = "full",
}: {
  className?: string;
  recipient?: string | null;
  /** `none` = address only (iframe embeds). */
  actions?: "full" | "none";
}) {
  const { ready, address, isConnected, authenticated, connect, disconnect } =
    useSolanaAddress();

  const embedDisplay = actions === "none" ? recipient : null;
  const connectedDisplay =
    actions === "full" && isConnected && address ? address : null;
  const display = embedDisplay ?? connectedDisplay;
  const canDisconnect = actions === "full" && (isConnected || authenticated);
  const canConnect = actions === "full";

  if (!ready && !embedDisplay) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground",
          className,
        )}
      >
        <LoaderCircle className="size-3.5 animate-spin" />
        <span className="tracking-tight">Signing in…</span>
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

  if (!canConnect) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn("h-8 gap-1.5 rounded-full px-2.5 text-xs", className)}
      onClick={connect}
      disabled={!ready}
    >
      <Wallet className="size-3.5" />
      Sign in
    </Button>
  );
}

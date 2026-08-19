"use client";

import { LoaderCircle, LogOut } from "lucide-react";

import { CopyableAddress } from "@/components/shared/copyable-address";
import { Button } from "@/components/ui/button";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { cn } from "@/lib/utils";

/**
 * Session wallet control for Privy routes (Home / setup / device/finish).
 * Do not mount on `/collect` or `/device` (no PrivyProvider there).
 */
export function WalletChip({ className }: { className?: string }) {
  const {
    ready,
    address,
    isConnected,
    walletIcon,
    walletName,
    connect,
    disconnect,
  } = useSolanaAddress();

  const display = isConnected && address ? address : null;
  const canConnect = ready && !display;

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

  if (canConnect) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn("h-8 rounded-full px-3 text-xs", className)}
        onClick={connect}
      >
        Connect
      </Button>
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
      {walletIcon ? (
        // Wallet-standard icons are data: URLs from the connected wallet.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={walletIcon}
          alt={walletName ?? "Connected wallet"}
          width={16}
          height={16}
          className="size-4 shrink-0 rounded-sm"
        />
      ) : (
        <span
          className="size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]"
          aria-hidden
        />
      )}
      <CopyableAddress address={display} label="wallet address" />
      <button
        type="button"
        onClick={() => void disconnect()}
        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Disconnect"
      >
        <LogOut className="size-3" />
      </button>
    </span>
  );
}

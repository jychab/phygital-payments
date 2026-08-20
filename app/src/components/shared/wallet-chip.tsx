"use client";

import { Banknote, ChevronDown, Copy, KeyRound, LoaderCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useExportWallet } from "@privy-io/react-auth/solana";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBuyUsdc } from "@/hooks/wallet/use-buy-usdc";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { toUserErrorMessage } from "@/lib/user-errors";
import { cn, shortAddress } from "@/lib/utils";

/** Official four-color Google G; Lucide has no Google mark. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * Session wallet control for Privy routes (Home, `/collect`, `/device`).
 * Embeds use a sealed display chip instead.
 */
export function WalletChip({ className }: { className?: string }) {
  const {
    ready,
    address,
    isConnected,
    walletIcon,
    walletName,
    isEmbeddedWallet,
    canExportWallet,
    connect,
    disconnect,
  } = useSolanaAddress();
  const { exportWallet } = useExportWallet();
  const { buyUsdc, pending: onrampPending } = useBuyUsdc(address);

  const display = isConnected && address ? address : null;
  const canConnect = ready && !display;

  async function onCopy() {
    if (!display) return;
    try {
      await navigator.clipboard.writeText(display);
      toast.success("Address copied");
    } catch {
      toast.error("Couldn’t copy address");
    }
  }

  async function onExport() {
    if (!display) return;
    try {
      await exportWallet({ address: display });
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t export this wallet"));
    }
  }

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-full border border-border/60 bg-card/40 px-2.5 text-xs outline-none",
            "transition-colors hover:bg-muted/40",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
            "data-[state=open]:bg-muted/40",
            className,
          )}
          aria-label={walletName ? `${walletName} menu` : "Wallet menu"}
        >
          {isEmbeddedWallet ? (
            <GoogleMark className="size-4 shrink-0" />
          ) : walletIcon ? (
            // Wallet-standard icons are data: URLs from the connected wallet.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={walletIcon}
              alt=""
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
          <span className="font-mono tabular-nums">
            {shortAddress(display)}
          </span>
          <ChevronDown className="size-3.5 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onSelect={() => {
            void onCopy();
          }}
        >
          <Copy className="size-3.5 opacity-70" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={onrampPending}
          onSelect={() => {
            void buyUsdc();
          }}
        >
          {onrampPending ? (
            <LoaderCircle className="size-3.5 animate-spin opacity-70" />
          ) : (
            <Banknote className="size-3.5 opacity-70" />
          )}
          Buy USDC
        </DropdownMenuItem>
        {canExportWallet ? (
          <DropdownMenuItem
            onSelect={() => {
              void onExport();
            }}
          >
            <KeyRound className="size-3.5 opacity-70" />
            Export private key
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void disconnect();
          }}
        >
          <LogOut className="size-3.5 opacity-70" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

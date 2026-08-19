"use client";

import { ChevronDown, Copy, KeyRound, LoaderCircle, LogOut } from "lucide-react";
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
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { toUserErrorMessage } from "@/lib/user-errors";
import { cn, shortAddress } from "@/lib/utils";

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
    canExportWallet,
    connect,
    disconnect,
  } = useSolanaAddress();
  const { exportWallet } = useExportWallet();

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
          {walletIcon ? (
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

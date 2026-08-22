"use client";

import { ChevronDown, Copy, Fingerprint, LoaderCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { cn, shortAddress } from "@/lib/utils";

/**
 * Session wallet control (Home, `/collect`, `/accessory`).
 * Embeds use a sealed display chip instead.
 */
export function WalletChip({ className }: { className?: string }) {
  const {
    ready,
    address,
    isConnected,
    connect,
    disconnect,
  } = useSolanaAddress();

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
        Passkey
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
          aria-label="Passkey menu"
        >
          <Fingerprint className="size-3.5 shrink-0 opacity-80" aria-hidden />
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

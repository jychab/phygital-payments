"use client";

import { Diamond } from "lucide-react";
import { toast } from "sonner";

import { copy } from "@/lib/copy/phygital";
import { cn, shortAddress } from "@/lib/utils";

/**
 * Top-right identity chip — truncated wallet PDA + mark.
 * Card: opens Wallet. Wallet/Accessory: copies address.
 */
export function IdentityChip({
  walletAddress,
  mode,
  onOpenWallet,
  className,
}: {
  walletAddress: string | null | undefined;
  mode: "open-wallet" | "copy";
  onOpenWallet?: () => void;
  className?: string;
}) {
  if (!walletAddress) {
    return <span aria-hidden className="h-11 w-11" />;
  }

  const label = shortAddress(walletAddress, 4);

  async function onClick() {
    if (mode === "open-wallet") {
      onOpenWallet?.();
      return;
    }
    try {
      await navigator.clipboard.writeText(walletAddress!);
      toast.success(copy.wallet.addressCopied);
    } catch {
      toast.error(copy.wallet.addressCopyFailed);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className={cn(
        "inline-flex min-h-11 h-11 max-w-[10.5rem] items-center gap-1.5 rounded-full",
        "border border-border/60 bg-card/40 px-2.5 text-xs text-foreground",
        "transition-colors hover:bg-card/70",
        className,
      )}
      aria-label={
        mode === "open-wallet"
          ? copy.wallet.openWalletAria(label)
          : copy.wallet.copyAddressAria(label)
      }
    >
      <Diamond className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="truncate font-medium tabular-nums tracking-tight">
        {label}
      </span>
    </button>
  );
}

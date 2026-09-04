"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import { cn } from "@/lib/utils";

const chipClass =
  "h-9 min-h-9 gap-1.5 rounded-full border px-3 text-sm font-medium shadow-sm transition-colors active:scale-[0.98]";

/** Toggle between mint card and wallet. */
export function IdentityChip({
  viewingWallet,
  onToggle,
  className,
}: {
  viewingWallet?: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={viewingWallet ? "outline" : "secondary"}
      onClick={onToggle}
      className={cn(
        chipClass,
        viewingWallet
          ? "border-border/70 bg-muted/40 text-foreground hover:bg-muted/70"
          : "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      aria-label={
        viewingWallet
          ? copy.wallet.showCardAria
          : copy.wallet.openWalletAriaLabel
      }
    >
      {viewingWallet ? (
        <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
      ) : null}
      {viewingWallet
        ? copy.wallet.backToCardChip
        : copy.wallet.toWalletChip}
      {!viewingWallet ? (
        <ArrowRight className="size-3.5 shrink-0 opacity-90" aria-hidden />
      ) : null}
    </Button>
  );
}

"use client";

import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { brand, copy } from "@/lib/copy/phygital";
import { cn } from "@/lib/utils";

/** Receive hub — QR + Receive nearby. */
export function ReceiveHub({
  walletAddress,
  onClose,
  onReceiveNearby,
}: {
  walletAddress: string;
  onClose: () => void;
  onReceiveNearby: () => void;
}) {
  const payUrl = `solana:${walletAddress.trim()}?label=${encodeURIComponent(brand.company)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(payUrl)}`;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success(copy.wallet.addressCopied);
    } catch {
      toast.error(copy.wallet.addressCopyFailed);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {copy.common.cancel}
        </Button>
        <p className="text-sm font-medium">{copy.wallet.receive}</p>
        <span className="w-16" aria-hidden />
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        <button
          type="button"
          onClick={() => void copyAddress()}
          onContextMenu={(e) => {
            e.preventDefault();
            void copyAddress();
          }}
          className={cn(
            "rounded-2xl bg-white p-4 shadow-sm",
            "transition-opacity hover:opacity-90",
          )}
          aria-label={copy.wallet.copyAddress}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="" width={180} height={180} className="size-[180px]" />
        </button>
        <p className="text-sm text-muted-foreground">{copy.wallet.shareAddress}</p>
      </div>

      <button
        type="button"
        onClick={onReceiveNearby}
        className="mt-auto flex items-center gap-3 rounded-2xl bg-muted/25 px-4 py-4 text-left transition-colors hover:bg-muted/40"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{copy.wallet.receiveNearby}</p>
          <p className="text-xs text-muted-foreground">
            {copy.wallet.receiveNearbyHint}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { shortAddress } from "@/lib/utils";

export function ReceiveSheet({ onBack }: { onBack: () => void }) {
  const { session } = useSmartWallet();
  const [copied, setCopied] = useState(false);
  const vault = session ? String(session.vaultPda) : "";

  async function onCopy() {
    if (!vault) return;
    await navigator.clipboard.writeText(vault);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function onShare() {
    if (!vault || !navigator.share) {
      await onCopy();
      return;
    }
    try {
      await navigator.share({
        title: "My wallet address",
        text: vault,
      });
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <BackLink onClick={onBack} />
      <div className="space-y-1.5 text-center">
        <p className="text-base font-medium text-foreground">Receive</p>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          Send SOL and tokens to this address.
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Your address
        </p>
        <p className="mt-2 break-all font-mono text-xs text-foreground">{vault}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {vault ? shortAddress(vault, 8) : "—"}
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <Button type="button" size="lg" className="w-full" onClick={() => void onCopy()}>
          <Copy className="size-4" />
          {copied ? "Copied" : "Copy address"}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={() => void onShare()}>
          <Share2 className="size-4" />
          Share
        </Button>
      </div>
    </div>
  );
}

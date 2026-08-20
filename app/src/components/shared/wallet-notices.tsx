"use client";

import { LoaderCircle, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";

export function WrongWalletNotice({
  ownerShort,
  className,
}: {
  ownerShort: string;
  className?: string;
}) {
  return (
    <p
      className={
        className ??
        "rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive"
      }
    >
      Wrong wallet. Disconnect above, then connect {ownerShort}.
    </p>
  );
}

export function ConnectWalletNotice({
  ownerShort,
  hint,
  className,
}: {
  ownerShort: string;
  hint?: string;
  className?: string;
}) {
  return (
    <p
      className={
        className ??
        "rounded-xl border border-border/60 bg-muted/25 px-3 py-2 text-center text-xs text-muted-foreground"
      }
    >
      {hint ?? `Connect ${ownerShort} above to continue.`}
    </p>
  );
}

/** Connect CTA when the expected wallet is not linked yet. */
export function ExpectedWalletConnect({
  owner,
  hint,
  label = "Connect wallet",
  disabled,
}: {
  owner: string;
  hint?: string;
  label?: string;
  disabled?: boolean;
}) {
  const { ready, wrongWallet, matched, ownerShort, connect } =
    useExpectedWallet(owner);

  if (!ready) {
    return (
      <div className="flex justify-center py-2">
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (wrongWallet) {
    return (
      <WrongWalletNotice
        ownerShort={ownerShort}
        className="px-2 text-center text-sm text-destructive"
      />
    );
  }

  if (matched) return null;

  return (
    <div className="space-y-2.5">
      {hint ? (
        <p className="px-2 text-center text-sm text-muted-foreground">{hint}</p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={connect}
        disabled={disabled}
      >
        <Wallet className="size-4" />
        {label}
      </Button>
    </div>
  );
}

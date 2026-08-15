"use client";

import { LoaderCircle, Wallet } from "lucide-react";

import { CenteredStatus, GateMessage } from "@/components/enable/gate-message";
import { Button } from "@/components/ui/button";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

export function ConnectPrompt({
  title = "Sign in to continue",
  body = "Use Google or a wallet to collect payments with an NFC device.",
  buttonLabel = "Sign in",
}: {
  title?: string;
  body?: string;
  buttonLabel?: string;
}) {
  const { ready, connect } = useSolanaAddress();

  if (!ready) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Signing in…</p>
      </CenteredStatus>
    );
  }

  return (
    <GateMessage
      icon={<Wallet className="size-5 text-muted-foreground" />}
      title={title}
      body={body}
      action={
        <Button type="button" size="sm" onClick={connect}>
          {buttonLabel}
        </Button>
      }
    />
  );
}

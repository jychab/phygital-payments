"use client";

import { useState } from "react";
import { History } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CollectPanel } from "@/components/collect/collect-panel";
import { HistoryPanel } from "@/components/home/history-panel";
import { BackLink } from "@/components/shared/back-link";
import { ConnectGate } from "@/components/shared/connect-gate";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { Button } from "@/components/ui/button";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { copy } from "@/lib/copy/phygital";
import type { PaymentRequest } from "@/lib/collect/payment-request";
import { tryParseAddress } from "@/lib/solana/address";

/**
 * Route `/collect` — merchant receive.
 * Recipient from `?recipient=` when present; otherwise the connected wallet.
 * Embeds still require `?recipient=` (sealed chip, no connect).
 * When URL recipient and a connected wallet both exist, they must match.
 */
export function CollectApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const embedded = useIsEmbedded();
  const { address, connect, connectReady } = useSolanaAddress();
  const [view, setView] = useState<"collect" | "activity">("collect");

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (paymentRequest.hasRecipientParam && !paymentRequest.recipient) {
    return (
      <EmbedError
        title={copy.collect.linkInvalidTitle}
        body={copy.collect.linkInvalidBody}
      />
    );
  }

  if (embedded && !paymentRequest.recipient) {
    return (
      <EmbedError
        title={copy.collect.linkInvalidTitle}
        body={copy.collect.linkMissingRecipientBody}
      />
    );
  }

  const recipient =
    paymentRequest.recipient ??
    (address ? tryParseAddress(address) : null);

  if (!recipient) {
    return (
      <AppShell layout="compact">
        <div className="flex flex-1 flex-col items-center justify-center">
          <ConnectGate
            title={copy.common.connectWalletTitle}
            body={copy.collect.connectBody}
            onConnect={connect}
            connectReady={connectReady}
          />
        </div>
      </AppShell>
    );
  }

  const recipientStr = recipient.toString();
  const sealedFromUrl = Boolean(paymentRequest.recipient);

  return (
    <AppShell
      recipient={sealedFromUrl ? recipientStr : undefined}
      walletActions={embedded ? "display-only" : "full"}
      layout="compact"
      headerExtra={
        view === "collect" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copy.common.activity}
            onClick={() => setView("activity")}
          >
            <History className="size-4 text-muted-foreground" />
          </Button>
        ) : null
      }
    >
      <WalletSyncGate linkedOwner={sealedFromUrl ? recipientStr : null}>
        {view === "activity" ? (
          <div className="flex flex-1 flex-col">
            <BackLink onClick={() => setView("collect")} />
            <HistoryPanel owner={recipientStr} />
          </div>
        ) : (
          <CollectPanel
            paymentRequest={{ ...paymentRequest, recipient }}
            allowWalletSetup={!embedded}
          />
        )}
      </WalletSyncGate>
    </AppShell>
  );
}

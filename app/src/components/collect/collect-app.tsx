"use client";

import { useState } from "react";
import { History } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CollectPanel } from "@/components/collect/collect-panel";
import { HistoryPanel } from "@/components/home/history-panel";
import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import type { PaymentRequest } from "@/lib/collect/payment-request";

/**
 * Route `/collect` — merchant receive. Recipient always comes from
 * `?recipient=` (URL). Activity is public-by-address (no Privy).
 * Privy loads only inside ATA setup when the receive account is missing.
 */
export function CollectApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const embedded = useIsEmbedded();
  const [view, setView] = useState<"collect" | "activity">("collect");

  if (embedded === null) {
    return <EmbedBoot />;
  }

  const recipient = paymentRequest.recipient;

  if (!recipient) {
    return (
      <EmbedError
        title="This payment link isn’t set up"
        body={
          paymentRequest.hasRecipientParam
            ? "The link looks incomplete. Ask for a new one."
            : "Open a payment link with a recipient address, or ask the seller for one."
        }
      />
    );
  }

  const recipientStr = recipient.toString();

  return (
    <AppShell
      recipient={recipientStr}
      walletActions="display-only"
      modeLabel="Collect"
      layout="compact"
      headerExtra={
        view === "collect" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Activity"
            onClick={() => setView("activity")}
          >
            <History className="size-4 text-muted-foreground" />
          </Button>
        ) : null
      }
    >
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
    </AppShell>
  );
}

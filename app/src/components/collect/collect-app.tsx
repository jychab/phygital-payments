"use client";

import { AppCard, AppShell, homeCollectModeNav } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CollectPanel } from "@/components/collect/collect-panel";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import type { PaymentRequest } from "@/lib/collect/payment-request";

/**
 * Route `/collect` — merchant receive. Settle-to wallet always comes from `?recipient=`.
 * No Privy connect; missing ATA hands off to `/setup`.
 */
export function CollectApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const embedded = useIsEmbedded();
  const recipient = paymentRequest.recipient;

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (!recipient) {
    return (
      <EmbedError
        title="This payment link isn’t set up"
        body={
          paymentRequest.hasRecipientParam
            ? "The link looks incomplete. Ask for a new one."
            : embedded
              ? "Ask the seller to send a working payment link."
              : "Open a Collect link that includes ?recipient=…"
        }
      />
    );
  }

  const recipientStr = recipient.toString();

  return (
    <AppShell
      recipient={embedded ? recipientStr : undefined}
      walletActions={embedded ? "display-only" : "hidden"}
      modeLabel="Collect"
      modeNav={embedded ? null : homeCollectModeNav(recipientStr)}
    >
      <AppCard>
        <CollectPanel paymentRequest={{ ...paymentRequest, recipient }} />
      </AppCard>
    </AppShell>
  );
}

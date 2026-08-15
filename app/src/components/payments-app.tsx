"use client";

import { AppCard, AppShell, homeCollectModeNav } from "@/components/app-shell";
import { EmbedBoot, EmbedError } from "@/components/embed-error";
import { ReceivePanel } from "@/components/receive-panel";
import { useIsEmbedded } from "@/hooks/use-is-embedded";
import type { PaymentRequest } from "@/lib/payments/payment-request";

/**
 * Collect — settle-to wallet always comes from `?recipient=`.
 * No Privy connect; missing ATA hands off to `/setup`.
 */
export function PaymentsApp({
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
        <ReceivePanel paymentRequest={paymentRequest} recipient={recipient} />
      </AppCard>
    </AppShell>
  );
}

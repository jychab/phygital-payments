"use client";

import { AppCard, AppShell } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CollectPanel } from "@/components/collect/collect-panel";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import type { PaymentRequest } from "@/lib/collect/payment-request";

/**
 * Route `/collect` — merchant receive. Recipient always comes from
 * `?recipient=` (URL). Privy loads only inside ATA setup when the receive
 * account is missing (standalone only — embeds stay sealed).
 */
export function CollectApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const embedded = useIsEmbedded();

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
    >
      <AppCard>
        <CollectPanel
          paymentRequest={{ ...paymentRequest, recipient }}
          allowWalletSetup={!embedded}
        />
      </AppCard>
    </AppShell>
  );
}

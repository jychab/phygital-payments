"use client";

import dynamic from "next/dynamic";

import { AppCard, AppShell } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CollectPanel } from "@/components/collect/collect-panel";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import type { PaymentRequest } from "@/lib/collect/payment-request";

const CollectWalletShell = dynamic(
  () =>
    import("@/components/collect/collect-wallet-shell").then(
      (m) => m.CollectWalletShell,
    ),
  { ssr: false, loading: () => <EmbedBoot /> },
);

/**
 * Route `/collect` — merchant receive. Non-embed uses the connected wallet
 * or `?recipient=` (synced when both exist). Embeds stay sealed to the URL.
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

  if (!embedded) {
    return <CollectWalletShell paymentRequest={paymentRequest} />;
  }

  const recipient = paymentRequest.recipient;

  if (!recipient) {
    return (
      <EmbedError
        title="This payment link isn’t set up"
        body={
          paymentRequest.hasRecipientParam
            ? "The link looks incomplete. Ask for a new one."
            : "Ask the seller to send a working payment link."
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
    >
      <AppCard>
        <CollectPanel
          paymentRequest={{ ...paymentRequest, recipient }}
          allowWalletSetup={false}
        />
      </AppCard>
    </AppShell>
  );
}

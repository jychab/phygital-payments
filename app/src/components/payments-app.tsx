"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Nfc } from "lucide-react";
import type { Address } from "@solana/kit";

import { AppCard, AppShell } from "@/components/app-shell";
import { EmbedBoot, EmbedError } from "@/components/embed-error";
import { HistoryPanel } from "@/components/history-panel";
import {
  ReceivePanel,
  type CollectRecipientMode,
} from "@/components/receive-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsEmbedded } from "@/hooks/use-is-embedded";
import { usePrefillAddress } from "@/hooks/use-prefill-address";
import type { PaymentRequest } from "@/lib/payments/payment-request";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

export function PaymentsApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const router = useRouter();
  const embedded = useIsEmbedded();
  const { address: walletAddress } = useSolanaAddress();

  const urlRecipient = paymentRequest.recipient?.toString() ?? null;
  const linkMode = Boolean(urlRecipient);

  const [mode, setMode] = useState<"receive" | "history">("receive");
  const [recipientDraft, setRecipientDraft] = useState(walletAddress ?? "");
  usePrefillAddress(walletAddress, recipientDraft, setRecipientDraft);

  useEffect(() => {
    if (embedded || embedded === null || linkMode) return;
    if (!paymentRequest.fromUrl) return;
    if (!recipientDraft.trim() && !walletAddress) return;
    router.replace("/", { scroll: false });
  }, [
    embedded,
    linkMode,
    paymentRequest.fromUrl,
    recipientDraft,
    walletAddress,
    router,
  ]);

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    if (!paymentRequest.hasRecipientParam || !urlRecipient) {
      return (
        <EmbedError
          title="This payment link isn’t set up"
          body="Ask the seller to send a working payment link."
        />
      );
    }
    return (
      <AppShell
        recipient={urlRecipient}
        walletActions="display-only"
        modeLabel="Collect"
      >
        <AppCard>
          <ReceivePanel
            paymentRequest={paymentRequest}
            recipientMode={fixedMode(paymentRequest.recipient!)}
          />
        </AppCard>
      </AppShell>
    );
  }

  if (linkMode) {
    return (
      <AppShell
        recipient={urlRecipient}
        walletActions="hidden"
        modeLabel="Collect"
      >
        <AppCard>
          <ReceivePanel
            paymentRequest={paymentRequest}
            recipientMode={fixedMode(paymentRequest.recipient!)}
          />
        </AppCard>
      </AppShell>
    );
  }

  if (paymentRequest.hasRecipientParam && !urlRecipient) {
    return (
      <EmbedError
        title="This payment link isn’t set up"
        body="The link looks incomplete. Ask for a new one."
      />
    );
  }

  const editableMode: CollectRecipientMode = {
    kind: "editable",
    draft: recipientDraft,
    onDraftChange: setRecipientDraft,
  };

  return (
    <AppShell recipient={recipientDraft || walletAddress} modeLabel="Collect">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          if (value === "receive" || value === "history") setMode(value);
        }}
        className="flex flex-1 flex-col gap-0 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger
            value="receive"
            className="h-full gap-1.5 rounded-xl text-[0.8125rem] data-active:shadow-[0_1px_2px_oklch(0_0_0/0.25)]"
          >
            <Nfc className="size-3.5 opacity-70" />
            Collect
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="h-full gap-1.5 rounded-xl text-[0.8125rem] data-active:shadow-[0_1px_2px_oklch(0_0_0/0.25)]"
          >
            <History className="size-3.5 opacity-70" />
            Activity
          </TabsTrigger>
        </TabsList>

        <AppCard>
          <TabsContent
            value="receive"
            className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
          >
            <ReceivePanel
              paymentRequest={paymentRequest}
              recipientMode={editableMode}
            />
          </TabsContent>
          <TabsContent
            value="history"
            className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
          >
            <HistoryPanel
              recipient={recipientDraft || walletAddress}
              allowConnect
            />
          </TabsContent>
        </AppCard>
      </Tabs>
    </AppShell>
  );
}

function fixedMode(address: Address): CollectRecipientMode {
  return { kind: "fixed", address };
}

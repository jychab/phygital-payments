"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Nfc } from "lucide-react";

import { AppCard, AppShell } from "@/components/app-shell";
import { ConnectPrompt } from "@/components/connect-prompt";
import { EmbedBoot, EmbedError } from "@/components/embed-error";
import { HistoryPanel } from "@/components/history-panel";
import { ReceivePanel } from "@/components/receive-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsEmbedded } from "@/hooks/use-is-embedded";
import type { PaymentRequest } from "@/lib/payments/payment-request";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

export function PaymentsApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const router = useRouter();
  const embedded = useIsEmbedded();
  const { address: walletAddress, isConnected } = useSolanaAddress();

  const urlRecipient = paymentRequest.recipient?.toString() ?? null;
  const linkMode = Boolean(urlRecipient);

  const [mode, setMode] = useState<"receive" | "history">("receive");

  useEffect(() => {
    if (!isConnected && mode === "history") {
      setMode("receive");
    }
  }, [isConnected, mode]);

  // Owner session: drop leftover amount/etc. params after sign-in (never in link mode).
  useEffect(() => {
    if (embedded || embedded === null) return;
    if (linkMode) return;
    if (!isConnected || !paymentRequest.fromUrl) return;
    router.replace("/", { scroll: false });
  }, [embedded, isConnected, linkMode, paymentRequest.fromUrl, router]);

  // Wait until we know whether this is an iframe (avoids a connect flash).
  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    if (!paymentRequest.hasRecipientParam) {
      return (
        <EmbedError
          title="This payment link isn’t set up"
          body="Ask the seller to send a working payment link."
        />
      );
    }
    if (!urlRecipient) {
      return (
        <EmbedError
          title="This payment link isn’t set up"
          body="The link looks incomplete. Ask for a new one."
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
            fixedRecipient={urlRecipient}
            intoOwnWallet={false}
            walletConnectEnabled={false}
          />
        </AppCard>
      </AppShell>
    );
  }

  // Payment link: settle to URL recipient — no Sign in / wallet chrome.
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
            fixedRecipient={urlRecipient}
            intoOwnWallet={false}
            walletConnectEnabled={false}
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

  if (!isConnected || !walletAddress) {
    return (
      <AppShell recipient={null} modeLabel="Collect">
        <AppCard>
          <ConnectPrompt
            title="Sign in to collect"
            body="Enter an amount, then hold their NFC device to your phone. Paying instead? Hold your NFC device to open Pay."
            buttonLabel="Sign in"
          />
        </AppCard>
      </AppShell>
    );
  }

  return (
    <AppShell recipient={walletAddress} modeLabel="Collect">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          if (value === "receive" || value === "history") {
            setMode(value);
          }
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
              fixedRecipient={walletAddress}
              intoOwnWallet
            />
          </TabsContent>
          <TabsContent
            value="history"
            className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
          >
            <HistoryPanel recipient={walletAddress} />
          </TabsContent>
        </AppCard>
      </Tabs>
    </AppShell>
  );
}

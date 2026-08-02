"use client";

import { useState } from "react";
import { History, LoaderCircle, Nfc, Wallet } from "lucide-react";

import { FundPanel } from "@/components/fund-panel";
import { HistoryPanel } from "@/components/history-panel";
import { ReceivePanel } from "@/components/receive-panel";
import { WalletChip } from "@/components/wallet-chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isMainnet } from "@/lib/solana/cluster";
import {
  tryParseAddress,
  type PaymentRequest,
} from "@/lib/payments/payment-request";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

export function PaymentsApp({
  paymentRequest,
  requestedReceive = false,
}: {
  paymentRequest: PaymentRequest;
  /** `?mode=receive`, honored only when embedded. */
  requestedReceive?: boolean;
}) {
  const { address: walletAddress, isConnected, ready, isEmbedded } =
    useSolanaAddress();

  const urlRecipient = paymentRequest.recipient?.toString() ?? null;
  const [manualRecipient, setManualRecipient] = useState("");

  // Embedded mode always transacts with the connected vault wallet and uses
  // `?mode=` to choose between the allowance manager and the receive flow. The
  // `?recipient=` param and manual entry only apply standalone.
  const allowanceOnly = isEmbedded && !requestedReceive;
  const needsWalletGate = isEmbedded && !isConnected;
  const editableRecipient = !isEmbedded && !urlRecipient;

  // The address the Receive flow settles into and Activity displays: the
  // connected wallet when embedded, otherwise the URL or typed recipient.
  const effectiveRecipient = isEmbedded
    ? walletAddress
    : urlRecipient ?? tryParseAddress(manualRecipient)?.toString() ?? null;

  const [mode, setMode] = useState<"receive" | "history">("receive");

  // The allowance state needs the vault to report a wallet over the bridge.
  // Show a quiet connecting state, then a one-line prompt.
  const connectPrompt = (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center">
      {!ready ? (
        <>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Connecting…</p>
        </>
      ) : (
        <>
          <div className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
            <Wallet className="size-5 text-muted-foreground" />
          </div>
          <p className="max-w-60 text-sm text-muted-foreground">
            {isEmbedded
              ? "Connect a wallet in your vault to continue."
              : "Open this from your Revibase vault."}
          </p>
        </>
      )}
    </div>
  );

  const cardClass =
    "mt-4 flex flex-1 flex-col rounded-[1.6rem] border border-border/50 bg-card/80 p-5 shadow-[0_24px_80px_-48px_oklch(0_0_0/0.9)] backdrop-blur-xl motion-safe:animate-[wallet-rise_0.6s_cubic-bezier(0.22,1,0.36,1)_0.04s_both] md:p-6";

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-28 -top-16 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_9%,transparent),transparent_70%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_16s_ease-in-out_infinite]" />
        <div className="absolute -bottom-16 -right-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_6%,transparent),transparent_72%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_20s_ease-in-out_infinite_reverse]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-5 md:px-6">
        {/* Quiet top row: the vault's sheet header already provides identity. */}
        <div className="mb-5 flex items-center justify-between gap-3 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          {!isMainnet() ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="size-1 rounded-full bg-muted-foreground/70" aria-hidden />
              Devnet
            </span>
          ) : (
            <span aria-hidden />
          )}
          <WalletChip recipient={effectiveRecipient} />
        </div>

        {needsWalletGate ? (
          // Both embedded states (allowance and receive) transact with the
          // vault wallet — wait for it before showing either.
          <div className={cardClass}>{connectPrompt}</div>
        ) : allowanceOnly ? (
          <div className={cardClass}>
            <FundPanel />
          </div>
        ) : (
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
                Receive
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="h-full gap-1.5 rounded-xl text-[0.8125rem] data-active:shadow-[0_1px_2px_oklch(0_0_0/0.25)]"
              >
                <History className="size-3.5 opacity-70" />
                Activity
              </TabsTrigger>
            </TabsList>

            <div className={cardClass}>
              <TabsContent
                value="receive"
                className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
              >
                {/* Receive settles to an explicit recipient (URL or typed) and
                    submits with sponsored fees — no connected wallet required. */}
                <ReceivePanel
                  paymentRequest={paymentRequest}
                  editableRecipient={editableRecipient}
                  manualRecipient={manualRecipient}
                  onManualRecipientChange={setManualRecipient}
                  fixedRecipient={isEmbedded ? walletAddress : urlRecipient}
                  intoOwnWallet={isEmbedded}
                />
              </TabsContent>
              <TabsContent
                value="history"
                className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
              >
                <HistoryPanel recipient={effectiveRecipient} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </main>
    </div>
  );
}

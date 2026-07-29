"use client";

import { useState } from "react";
import { History, LoaderCircle, Nfc, ShieldCheck, Wallet } from "lucide-react";

import { FundPanel } from "@/components/fund-panel";
import { HistoryPanel } from "@/components/history-panel";
import { ReceivePanel } from "@/components/receive-panel";
import { WalletChip } from "@/components/wallet-chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isMainnet } from "@/lib/solana/cluster";
import type { PaymentRequest } from "@/lib/payments/payment-request";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

export function PaymentsApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const [mode, setMode] = useState<"allow" | "receive" | "history">(
    paymentRequest.fromUrl ? "receive" : "allow",
  );
  const { isConnected, ready, isEmbedded } = useSolanaAddress();
  const recipient = paymentRequest.recipient?.toString() ?? null;
  const canViewActivity = isConnected || Boolean(recipient);

  // Wallet-gated tabs (Allowance / Activity) need the vault to report a wallet
  // over the bridge. Show a quiet connecting state, then a one-line prompt.
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
          <p className="max-w-[15rem] text-sm text-muted-foreground">
            {isEmbedded
              ? "Connect a wallet in your vault to continue."
              : "Open this from your Revibase vault."}
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-28 -top-16 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_16%,transparent),transparent_68%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-16 -right-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent-glow)_10%,transparent),transparent_70%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_12s_ease-in-out_infinite_reverse]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-5 md:px-6">
        {/* Quiet top row: the vault's sheet header already provides identity. */}
        <div className="mb-5 flex items-center justify-between gap-3">
          {!isMainnet() ? (
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Devnet
            </span>
          ) : (
            <span aria-hidden />
          )}
          <WalletChip recipient={recipient} />
        </div>

        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (value === "allow" || value === "receive" || value === "history") {
              setMode(value);
            }
          }}
          className="flex flex-1 flex-col gap-0"
        >
          <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl p-1">
            <TabsTrigger
              value="allow"
              className="h-full gap-1.5 rounded-lg text-[0.8125rem]"
            >
              <ShieldCheck className="size-3.5 opacity-70" />
              Allowance
            </TabsTrigger>
            <TabsTrigger
              value="receive"
              className="h-full gap-1.5 rounded-lg text-[0.8125rem]"
            >
              <Nfc className="size-3.5 opacity-70" />
              Receive
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="h-full gap-1.5 rounded-lg text-[0.8125rem]"
            >
              <History className="size-3.5 opacity-70" />
              Activity
            </TabsTrigger>
          </TabsList>

          <div
            className={cn(
              "mt-4 flex flex-1 flex-col rounded-[1.35rem] border border-border/50",
              "bg-card/80 p-5 shadow-[0_24px_80px_-48px_oklch(0_0_0/0.9)] backdrop-blur-xl md:p-6",
            )}
          >
            <TabsContent
              value="allow"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              {isConnected ? <FundPanel /> : connectPrompt}
            </TabsContent>
            <TabsContent
              value="receive"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              {/* Receive settles to an explicit recipient address and submits
                  with sponsored fees — no connected wallet required. */}
              <ReceivePanel paymentRequest={paymentRequest} />
            </TabsContent>
            <TabsContent
              value="history"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              {canViewActivity ? (
                <HistoryPanel recipient={recipient} />
              ) : (
                connectPrompt
              )}
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

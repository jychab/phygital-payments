"use client";

import { useState } from "react";
import { ContactRound, History, ShieldCheck } from "lucide-react";

import { ConnectWallet } from "@/components/connect-wallet";
import { FundPanel } from "@/components/fund-panel";
import { HistoryPanel } from "@/components/history-panel";
import { ReceivePanel } from "@/components/receive-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isMainnet } from "@/lib/solana/cluster";
import type { PaymentRequest } from "@/lib/payments/payment-request";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

const MODE_COPY = {
  allow: {
    title: "Set what your pass can spend.",
    subtitle:
      "Your USDC stays in your wallet. You choose an allowance — then revoke it anytime.",
  },
  receive: {
    title: "Get paid with a tap.",
    subtitle:
      "Enter an amount, tap a locked passkey, and USDC settles into this wallet.",
  },
  receiveRequest: {
    title: "Complete this payment.",
    subtitle:
      "Confirm the amount, tap a locked passkey, and USDC settles to the recipient.",
  },
  history: {
    title: "Your payment activity.",
    subtitle:
      "Payments settled to or from this wallet, indexed as they confirm on-chain.",
  },
} as const;

export function PaymentsApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const [mode, setMode] = useState<"allow" | "receive" | "history">(
    paymentRequest.fromUrl ? "receive" : "allow",
  );
  const { isConnected } = useSolanaAddress();
  const copy =
    mode === "receive" && paymentRequest.fromUrl
      ? MODE_COPY.receiveRequest
      : MODE_COPY[mode];

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-28 -top-10 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,oklch(0.82_0.18_130/0.16),transparent_68%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-16 -right-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,oklch(0.72_0.1_200/0.12),transparent_70%)] blur-3xl transform-gpu motion-safe:animate-[wallet-breathe_12s_ease-in-out_infinite_reverse]" />
      </div>

      <header className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight md:text-2xl">
            Phygital Pay
          </span>
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {isMainnet() ? "Mainnet" : "Devnet"}
          </span>
        </div>
        <ConnectWallet />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-12 pt-2 md:px-8 md:pt-6">
        <div
          key={mode}
          className="motion-safe:animate-[wallet-rise_420ms_cubic-bezier(0.22,1,0.36,1)]"
        >
          <h1 className="font-[family-name:var(--font-display)] text-[1.85rem] leading-[1.12] tracking-tight md:text-[2.15rem]">
            {copy.title}
          </h1>
          <p className="mt-2.5 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        <div className="mt-8 flex flex-1 flex-col">
          <Tabs
            value={mode}
            onValueChange={(value) => {
              if (
                value === "allow" ||
                value === "receive" ||
                value === "history"
              ) {
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
                Allow
              </TabsTrigger>
              <TabsTrigger
                value="receive"
                className="h-full gap-1.5 rounded-lg text-[0.8125rem]"
              >
                <ContactRound className="size-3.5 opacity-70" />
                Get paid
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
              {!isConnected ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                      Connect to continue
                    </p>
                    <p className="mx-auto max-w-[16rem] text-sm text-muted-foreground">
                      {paymentRequest.fromUrl
                        ? "Connect a wallet to confirm and complete this payment."
                        : "Use the wallet you want to allow spending from — or the one that should receive payment."}
                    </p>
                  </div>
                  <ConnectWallet />
                </div>
              ) : (
                <>
                  <TabsContent
                    value="allow"
                    className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
                  >
                    <FundPanel />
                  </TabsContent>
                  <TabsContent
                    value="receive"
                    className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
                  >
                    <ReceivePanel paymentRequest={paymentRequest} />
                  </TabsContent>
                  <TabsContent
                    value="history"
                    className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
                  >
                    <HistoryPanel />
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

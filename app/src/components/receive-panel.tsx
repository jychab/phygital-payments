"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  ExternalLink,
  LoaderCircle,
  Nfc,
  ShieldCheck,
} from "lucide-react";
import type { Address } from "@solana/kit";

import { AmountField } from "@/components/amount-field";
import { CopyableAddress } from "@/components/copyable-address";
import { InAppBrowserGate } from "@/components/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/use-is-in-app-browser";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { uiAmountToRaw } from "@/lib/payments/usdc-allowance";
import {
  receiveSetupHref,
  type PaymentRequest,
} from "@/lib/payments/payment-request";
import {
  isSponsoredSubmitAvailable,
  type ReceiveTransferContext,
} from "@/lib/payments/receive";
import { getUsdcMint } from "@/lib/payments/usdc";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useRecipientAtaStatus } from "@/hooks/use-recipient-ata-status";
import { useReceiveMutation } from "@/hooks/use-receive-mutation";
import { cn, shortAddress } from "@/lib/utils";

type Phase = "idle" | "awaiting-tap" | "confirming" | "success";

const SUCCESS_HOLD_MS = 3200;

/**
 * Collect receive UI. Settle-to wallet is always the sealed URL `recipient`.
 * No Privy / wallet connect — missing ATA hands off to `/setup`.
 */
export function ReceivePanel({
  paymentRequest,
  recipient,
}: {
  paymentRequest: PaymentRequest;
  recipient: Address;
}) {
  const inApp = useIsInAppBrowser();
  const [amount, setAmount] = useState(paymentRequest.amount ?? "");
  const [phase, setPhase] = useState<Phase>("idle");
  const [settledAmount, setSettledAmount] = useState("");
  const [failMessage, setFailMessage] = useState<string | null>(null);

  const sponsoredAvailable = isSponsoredSubmitAvailable();
  const mint = paymentRequest.mint;
  const amountLocked = Boolean(paymentRequest.amount);
  const mintLabel = mint === getUsdcMint() ? "USDC" : shortAddress(mint, 6);

  const mintQuery = useMintProgram(mint);
  const ataQuery = useRecipientAtaStatus(
    recipient,
    mint,
    mintQuery.data?.program,
  );
  const ataStatus = ataQuery.data ?? null;
  const ataLoading = ataQuery.isLoading;
  const readyToReceive = ataStatus?.exists === true;
  const missingAta = ataStatus != null && !ataStatus.exists;

  const receive = useReceiveMutation({
    onSuccess: (signature) => {
      toast.success("Payment received", {
        description: (
          <a
            className="underline"
            href={explorerTxUrl(signature)}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        ),
      });
    },
  });

  const busy = phase !== "idle";
  const setupUrl = receiveSetupHref({
    recipient,
    mint: mint === getUsdcMint() ? undefined : mint,
    amount: paymentRequest.amount,
  });

  async function onReceive() {
    if (inApp) {
      setFailMessage("Open this page in Safari or Chrome to collect.");
      return;
    }
    if (!sponsoredAvailable) {
      setFailMessage("Payments aren’t available right now.");
      return;
    }
    if (!readyToReceive || !ataStatus || !mintQuery.data) {
      setFailMessage("Finish one-time setup before collecting.");
      return;
    }
    const paidAmount = amount;
    setFailMessage(null);
    setPhase("awaiting-tap");
    try {
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      const context: ReceiveTransferContext = {
        tokenProgram: ataStatus.program,
        recipientAta: ataStatus.ata,
      };
      await receive.mutateAsync({
        recipient,
        rawAmount,
        mint,
        context,
        onPasskeyComplete: () => {
          setPhase("confirming");
          try {
            navigator.vibrate?.(30);
          } catch {
            /* ignore */
          }
        },
      });
      setSettledAmount(paidAmount);
      setPhase("success");
      try {
        navigator.vibrate?.([20, 40, 20]);
      } catch {
        /* ignore */
      }
      if (!amountLocked) setAmount("");
      window.setTimeout(() => setPhase("idle"), SUCCESS_HOLD_MS);
    } catch (error) {
      setFailMessage(
        toUserErrorMessage(error, "Payment didn’t go through. Try again."),
      );
      setPhase("idle");
    }
  }

  if (phase === "idle" && inApp) {
    return (
      <InAppBrowserGate body="Collecting needs Safari or Chrome so the NFC device can be read." />
    );
  }

  if (phase === "success") {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center"
        aria-live="assertive"
      >
        <div className="relative flex size-24 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-success/15 motion-safe:animate-[wallet-pulse_1.4s_ease-out]"
          />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-success text-success-foreground motion-safe:animate-[wallet-rise_0.4s_cubic-bezier(0.22,1,0.36,1)]">
            <Check className="size-8" strokeWidth={2.75} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-semibold tracking-tight">Received</p>
          <p className="font-(family-name:--font-display) text-[2.5rem] leading-none tracking-tight tabular-nums">
            {settledAmount || amount || "0"}
            <span className="ml-1.5 text-lg font-medium text-muted-foreground">
              {mintLabel}
            </span>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setPhase("idle")}
        >
          Done
        </Button>
      </div>
    );
  }

  if (phase === "awaiting-tap" || phase === "confirming") {
    return (
      <div className="flex flex-1 flex-col py-6 text-center">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Receiving
          </p>
          <p className="font-(family-name:--font-display) text-[2.75rem] leading-none tracking-tight tabular-nums">
            {amount || "0"}
            <span className="ml-1.5 text-xl font-medium text-muted-foreground">
              {mintLabel}
            </span>
          </p>
        </div>
        <NfcHoldStatus
          size="lg"
          title={
            phase === "confirming" ? "Confirming…" : "Hold their NFC device close"
          }
          pulsing={phase === "awaiting-tap"}
          busy={phase === "confirming"}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">Collect</p>
        <p className="text-xs text-muted-foreground">
          Enter an amount, then hold their NFC device to your phone.
        </p>
      </div>

      <div className="flex flex-1 items-start justify-center py-2">
        <AmountField
          id="receive-amount"
          value={amount}
          onChange={(next) => {
            setFailMessage(null);
            setAmount(next);
          }}
          currency={mintLabel}
          disabled={amountLocked || busy}
          autoFocus={!amountLocked}
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/35 px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">To</span>
        <CopyableAddress address={recipient} length={6} label="recipient" />
      </div>

      {ataLoading || missingAta ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3",
            missingAta && !ataLoading
              ? "border-destructive/30 bg-destructive/10"
              : "border-border/60 bg-muted/25",
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
              missingAta && !ataLoading
                ? "bg-destructive/15 text-destructive"
                : "bg-muted text-muted-foreground",
            )}
          >
            {ataLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <AlertCircle className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {ataLoading ? "Checking…" : "Receive account needed"}
            </p>
            {missingAta && !ataLoading ? (
              <>
                <p className="text-xs text-muted-foreground">
                  This wallet needs a one-time receive account before you can
                  collect. Set it up, then open Collect again.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  asChild
                >
                  <a href={setupUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    Set up receive account
                  </a>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {failMessage ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-center">
          <p className="text-xs text-destructive">{failMessage}</p>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-[0.9375rem]"
          onClick={onReceive}
          disabled={busy || !amount || !readyToReceive || !sponsoredAvailable}
        >
          <Nfc className="size-4" />
          Hold NFC to receive
        </Button>
        {sponsoredAvailable ? (
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary/80" />
            No fee
          </p>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Payments aren’t available right now.
          </p>
        )}
      </div>
    </div>
  );
}

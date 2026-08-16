"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  ExternalLink,
  LoaderCircle,
  Nfc,
  ShieldCheck,
} from "lucide-react";
import { address, type Address } from "@solana/kit";

import { AmountField } from "@/components/amount-field";
import { CopyableAddress } from "@/components/copyable-address";
import { InAppBrowserGate } from "@/components/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { TokenChip, TokenSymbol } from "@/components/token-chip";
import { TokenPickerSheet } from "@/components/token-picker-sheet";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/use-is-in-app-browser";
import { useVerifiedTokens } from "@/hooks/use-verified-tokens";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { uiAmountToRaw } from "@/lib/payments/mint-delegate";
import {
  collectHref,
  receiveSetupHref,
  type PaymentRequest,
} from "@/lib/payments/payment-request";
import {
  getDefaultMint,
  resolvePaymentToken,
  type PaymentToken,
} from "@/lib/payments/payment-token";
import {
  isSponsoredSubmitAvailable,
  type ReceiveTransferContext,
} from "@/lib/payments/collect-settle";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useRecipientAtaStatus } from "@/hooks/use-recipient-ata-status";
import { useCollectMutation } from "@/hooks/use-collect-mutation";
import { cn } from "@/lib/utils";

type Phase = "idle" | "awaiting-tap" | "confirming" | "success";

const SUCCESS_HOLD_MS = 3200;

function syncCollectUrl(args: {
  recipient: string;
  mint: string;
  amount: string | null;
}) {
  if (typeof window === "undefined") return;
  const href = collectHref({
    recipient: args.recipient,
    mint: args.mint,
    amount: args.amount,
  });
  window.history.replaceState(null, "", href);
}

/**
 * Collect receive UI. Settle-to wallet is always the sealed URL `recipient`.
 * Merchant chooses mint; no Privy / wallet connect — missing ATA hands off to `/setup`.
 */
export function CollectPanel({
  paymentRequest,
  recipient,
}: {
  paymentRequest: PaymentRequest;
  recipient: Address;
}) {
  const inApp = useIsInAppBrowser();
  const [amount, setAmount] = useState(paymentRequest.amount ?? "");
  const [mint, setMint] = useState(String(paymentRequest.mint));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [settledAmount, setSettledAmount] = useState("");
  const [failMessage, setFailMessage] = useState<string | null>(null);

  const sponsoredAvailable = isSponsoredSubmitAvailable();
  const amountLocked = Boolean(paymentRequest.amount);

  const verified = useVerifiedTokens();
  const token = useMemo(
    () => resolvePaymentToken(mint, verified.data),
    [mint, verified.data],
  );

  const mintSupported =
    Boolean(verified.data?.some((t: PaymentToken) => t.mint === mint)) ||
    verified.isLoading;

  const mintAddress = useMemo(() => address(mint), [mint]);
  const mintQuery = useMintProgram(mintAddress);
  const ataQuery = useRecipientAtaStatus(
    recipient,
    mintAddress,
    mintQuery.data?.program,
  );
  const ataStatus = ataQuery.data ?? null;
  const ataLoading = ataQuery.isLoading;
  const readyToReceive = ataStatus?.exists === true;
  const missingAta = ataStatus != null && !ataStatus.exists;
  const mintProgramError = mintQuery.isError;

  const receive = useCollectMutation({
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
    mint,
    amount: paymentRequest.amount,
  });

  useEffect(() => {
    syncCollectUrl({
      recipient: String(recipient),
      mint,
      amount: amountLocked ? paymentRequest.amount : amount || null,
    });
  }, [mint, recipient, amount, amountLocked, paymentRequest.amount]);

  async function onReceive() {
    if (inApp) {
      setFailMessage("Open this page in Safari or Chrome to collect.");
      return;
    }
    if (!sponsoredAvailable) {
      setFailMessage("Payments aren’t available right now.");
      return;
    }
    if (!mintSupported || mintProgramError) {
      setFailMessage("This token isn’t supported. Switch to USDC.");
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
        mint: mintAddress,
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
            <span className="ml-2 inline-flex align-middle text-lg font-medium text-muted-foreground">
              <TokenSymbol
                token={token}
                size="sm"
                symbolClassName="tracking-normal normal-case"
              />
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
            <span className="ml-2 inline-flex align-middle text-xl font-medium text-muted-foreground">
              <TokenSymbol
                token={token}
                size="sm"
                symbolClassName="tracking-normal normal-case"
              />
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

  if (!verified.isLoading && !mintSupported) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <div className="max-w-64 space-y-1.5">
          <p className="text-base font-medium text-foreground">
            Token not supported
          </p>
          <p className="text-sm text-muted-foreground">
            Only Jupiter verified classic SPL tokens can be collected. Switch to
            USDC to continue.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="h-11 w-full max-w-xs"
          onClick={() => {
            const usdc = String(getDefaultMint());
            setMint(usdc);
            setFailMessage(null);
          }}
        >
          Switch to USDC
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">Collect</p>
        <p className="text-xs text-muted-foreground">
          Choose a token and amount, then hold their NFC device to your phone.
        </p>
      </div>

      <div className="flex justify-center">
        <TokenChip
          token={token}
          disabled={busy}
          onClick={busy ? undefined : () => setPickerOpen(true)}
        />
      </div>

      <div className="flex flex-1 items-start justify-center py-2">
        <AmountField
          id="receive-amount"
          value={amount}
          onChange={(next) => {
            setFailMessage(null);
            setAmount(next);
          }}
          token={token}
          decimals={mintQuery.data?.decimals ?? token.decimals}
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
                  This wallet needs a one-time{" "}
                  <TokenSymbol
                    token={token}
                    size="xs"
                    className="mx-0.5"
                    symbolClassName="font-medium text-foreground"
                  />{" "}
                  receive account before you can collect. Set it up, then open
                  Collect again.
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
          disabled={
            busy ||
            !amount ||
            !readyToReceive ||
            !sponsoredAvailable ||
            !mintSupported
          }
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

      <TokenPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedMint={mint}
        onSelect={(next) => {
          setMint(next.mint);
          setFailMessage(null);
        }}
      />
    </div>
  );
}

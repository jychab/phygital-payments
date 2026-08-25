"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Check,
  LoaderCircle,
  Nfc,
  ShieldCheck,
  X,
} from "lucide-react";
import { address, type Address } from "@solana/kit";

import { AmountField } from "@/components/shared/amount-field";
import { CopyableAddress } from "@/components/shared/copyable-address";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { TokenChip, TokenSymbol } from "@/components/shared/token-chip";
import { TokenPickerSheet } from "@/components/shared/token-picker-sheet";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { useVerifiedTokens } from "@/hooks/tokens/use-payment-tokens";
import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { uiAmountToRaw } from "@/lib/tokens/mint-delegate";
import {
  collectHref,
  type PaymentRequest,
} from "@/lib/collect/payment-request";
import {
  getDefaultMint,
  resolvePaymentToken,
  type PaymentToken,
} from "@/lib/tokens/payment-token";
import {
  isSponsoredSubmitAvailable,
  type ReceiveTransferContext,
} from "@/lib/collect/collect-settle";
import {
  getRawPaymentError,
  logPaymentError,
  toUserFacingError,
} from "@/lib/user-errors";
import { cn } from "@/lib/utils";
import { useMintProgram } from "@/hooks/tokens/use-mint-program";
import { useRecipientAtaStatus } from "@/hooks/collect/use-recipient-ata-status";
import { useCollectMutation } from "@/hooks/collect/use-collect-mutation";

function AtaSetupLoading() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertCircle className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <p className="text-sm font-medium text-foreground">
          Finish Setup
        </p>
        <div className="flex justify-center py-1">
          <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

const CollectAtaSetup = dynamic(
  () =>
    import("@/components/collect/collect-ata-setup").then(
      (m) => m.CollectAtaSetup,
    ),
  { ssr: false, loading: AtaSetupLoading },
);

type Phase = "idle" | "awaiting-tap" | "confirming" | "success" | "failed";

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
 * Collect receive UI. Settle-to wallet is always `?recipient=` from the URL.
 * Merchant chooses mint. Missing ATA loads Privy in place (standalone only).
 */
export function CollectPanel({
  paymentRequest,
  allowWalletSetup = false,
}: {
  paymentRequest: PaymentRequest & { recipient: Address };
  /** Standalone Collect: Privy connect + create ATA when the receive account is missing. */
  allowWalletSetup?: boolean;
}) {
  const recipient = paymentRequest.recipient;
  const inApp = useIsInAppBrowser();
  const [amount, setAmount] = useState(paymentRequest.amount ?? "");
  const [mint, setMint] = useState(String(paymentRequest.mint));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [settledAmount, setSettledAmount] = useState("");
  const [failTitle, setFailTitle] = useState<string | null>(null);
  const [failMessage, setFailMessage] = useState<string | null>(null);
  const [failDebug, setFailDebug] = useState<string | null>(null);

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

  const receive = useCollectMutation();

  const busy = phase !== "idle";

  useEffect(() => {
    syncCollectUrl({
      recipient: String(recipient),
      mint,
      amount: amountLocked ? paymentRequest.amount : amount || null,
    });
  }, [mint, recipient, amount, amountLocked, paymentRequest.amount]);

  function clearFail() {
    setFailTitle(null);
    setFailMessage(null);
    setFailDebug(null);
  }

  async function onReceive() {
    if (inApp) {
      setFailTitle("Open in Safari or Chrome");
      setFailMessage("To collect a payment, open this page in Safari or Chrome.");
      return;
    }
    if (!sponsoredAvailable) {
      setFailTitle("Payments Unavailable");
      setFailMessage("Payments aren’t available right now. Try again later.");
      return;
    }
    if (!mintSupported || mintProgramError) {
      setFailTitle("Token Not Supported");
      setFailMessage("This token isn’t supported. Switch to USDC.");
      return;
    }
    if (!readyToReceive || !ataStatus || !mintQuery.data) {
      setFailTitle("Finish Setup");
      setFailMessage("This wallet isn’t ready to receive yet. Finish setup, then try again.");
      return;
    }
    const paidAmount = amount;
    clearFail();
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
    } catch (error) {
      logPaymentError("collect", error);
      const facing = toUserFacingError(error, {
        title: "Payment Not Completed",
        body: "Try again.",
      });
      const raw = getRawPaymentError(error);
      setFailTitle(facing.title);
      setFailMessage(facing.body);
      setFailDebug(
        raw && raw !== facing.body && process.env.NODE_ENV === "development"
          ? raw
          : null,
      );
      try {
        navigator.vibrate?.(40);
      } catch {
        /* ignore */
      }
      setPhase("failed");
    }
  }

  if (phase === "idle" && inApp) {
    return (
      <InAppBrowserGate body="To collect a payment, open this page in Safari or Chrome." />
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
            className={cn(
              "absolute inset-0 rounded-full bg-success/15",
              galleryAnimate.pulse,
            )}
          />
          <div
            className={cn(
              "relative flex size-16 items-center justify-center rounded-full bg-success text-success-foreground",
              galleryAnimate.successRing,
            )}
          >
            <Check className="size-8" strokeWidth={2.75} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-semibold tracking-tight">Received</p>
          <p className="font-(family-name:--font-display) text-[2.5rem] leading-none tracking-tight tabular-nums md:text-5xl">
            {settledAmount || amount || "0"}
            <span className="ml-2 inline-flex align-middle text-lg font-medium text-muted-foreground md:text-xl">
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
          size="lg"
          className="w-full max-w-xs"
          onClick={() => setPhase("idle")}
        >
          Done
        </Button>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center"
        aria-live="assertive"
      >
        <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
          <X className="size-6" strokeWidth={2} />
        </div>
        <div className="max-w-64 space-y-1.5">
          <p className="text-base font-medium text-foreground">
            {failTitle ?? "Payment Not Completed"}
          </p>
          <p className="text-sm text-muted-foreground">
            {failMessage ?? "Try again."}
          </p>
        </div>
        {failDebug ? (
          <pre className="max-h-32 max-w-xs overflow-auto whitespace-pre-wrap wrap-break-word text-left text-[10px] leading-snug text-muted-foreground">
            {failDebug}
          </pre>
        ) : null}
        <Button
          type="button"
          size="lg"
          className="w-full max-w-xs"
          onClick={() => {
            clearFail();
            setPhase("idle");
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (phase === "awaiting-tap" || phase === "confirming") {
    return (
      <div className="flex flex-1 flex-col py-6 text-center">
        <div className="space-y-1">
          <p className="font-(family-name:--font-display) text-[2.75rem] leading-none tracking-tight tabular-nums md:text-5xl">
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
          title={phase === "confirming" ? "Processing" : "Hold Their Accessory Here"}
          body={
            phase === "confirming"
              ? "Just a moment."
              : "Keep holding until it reads."
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
            Token Not Supported
          </p>
          <p className="text-sm text-muted-foreground">
            Only supported tokens can be collected. Switch to USDC to continue.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full max-w-xs"
          onClick={() => {
            const usdc = String(getDefaultMint());
            setMint(usdc);
            clearFail();
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
          Enter an amount, then hold their accessory to this phone.
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
            clearFail();
            setAmount(next);
          }}
          token={token}
          decimals={mintQuery.data?.decimals ?? token.decimals}
          disabled={amountLocked || busy}
          autoFocus={!amountLocked}
        />
      </div>

      {amountLocked ? (
        <p className="text-center text-xs text-muted-foreground">
          {copy.amountLocked}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/35 px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">To</span>
        <CopyableAddress address={recipient} length={6} label="recipient" />
      </div>

      {ataLoading ? (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/25 px-4 py-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
          </div>
          <p className="text-sm font-medium text-foreground">Checking…</p>
        </div>
      ) : missingAta && allowWalletSetup ? (
        <CollectAtaSetup
          recipient={recipient}
          mint={mintAddress}
          token={token}
        />
      ) : missingAta ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="size-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">
              Finish Setup
            </p>
            <p className="text-xs text-muted-foreground">
              Open this page in Safari or Chrome to finish{" "}
              <TokenSymbol
                token={token}
                size="xs"
                className="mx-0.5"
                symbolClassName="font-medium text-foreground"
              />{" "}
              setup, then come back.
            </p>
          </div>
        </div>
      ) : null}

      {failMessage && phase === "idle" ? (
        <div className="rounded-xl border border-border/60 bg-muted/25 px-4 py-3 text-center">
          {failTitle ? (
            <p className="text-sm font-medium text-foreground">{failTitle}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">{failMessage}</p>
          {failDebug ? (
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap wrap-break-word text-left text-[10px] leading-snug text-muted-foreground">
              {failDebug}
            </pre>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full"
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
          {copy.holdToCollect}
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
          clearFail();
        }}
      />
    </div>
  );
}

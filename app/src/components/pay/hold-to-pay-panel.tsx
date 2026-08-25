"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, LoaderCircle, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { TokenSymbol } from "@/components/shared/token-chip";
import { formatCountdown } from "@/components/shared/expiry-countdown";
import { Button } from "@/components/ui/button";
import { payCopy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import {
  cancelPreauthForWallet,
  requestPreauthForWallet,
  waitPreauthStatusForWallet,
  type PreauthStatusResult,
} from "@/lib/pay/preauth-client";
import { invalidateOwnerQueries } from "@/lib/queries";
import { formatTokenAmount } from "@/lib/tokens/mint-delegate";
import { resolvePaymentToken, type PaymentTokenHolding } from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { shortAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Phase =
  | "idle"
  | "window"
  | "expired"
  | "cancelled"
  | "replaced"
  | "success";

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

/**
 * Pay home: ready to tap, or Press Pay when Confirm Payments is on.
 * Mint and amount are chosen by Collect and capped on-chain by the token's
 * spending limit.
 */
export function HoldToPayPanel({
  owner,
  confirmationRequired,
  keyReady,
  holdings,
  onSetupPhone,
  onManage,
  onBack,
}: {
  owner: string;
  confirmationRequired: boolean;
  keyReady: boolean;
  holdings?: PaymentTokenHolding[];
  onSetupPhone?: () => void;
  onManage?: () => void;
  onBack?: () => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [grantId, setGrantId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [paid, setPaid] = useState<Extract<
    PreauthStatusResult,
    { status: "success" }
  > | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const windowOpen = phase === "window";
  const secondsLeft =
    expiresAt != null && expiresAt * 1000 > nowMs
      ? Math.max(0, Math.ceil((expiresAt * 1000 - nowMs) / 1000))
      : 0;

  useEffect(() => {
    if (!windowOpen || expiresAt == null) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [windowOpen, expiresAt]);

  useEffect(() => {
    if (!windowOpen || grantId == null) return;
    const ac = new AbortController();
    void waitPreauthStatusForWallet({
      wallet: owner,
      grantId,
      signal: ac.signal,
    })
      .then((result) => {
        if (result.status === "success") {
          setPaid(result);
          setPhase("success");
          invalidateOwnerQueries(queryClient, owner);
          return;
        }
        setPaid(null);
        setPhase(result.status);
      })
      .catch((error) => {
        if (isAbortError(error) || ac.signal.aborted) return;
        toast.error(toUserErrorMessage(error, "Couldn’t check this payment."));
        setPhase("expired");
      })
      .finally(() => {
        if (!ac.signal.aborted) setExpiresAt(null);
      });
    return () => ac.abort();
  }, [windowOpen, grantId, owner, queryClient]);

  async function onPay() {
    try {
      setBusy(true);
      const grant = await requestPreauthForWallet({ wallet: owner });
      setPaid(null);
      setNowMs(Date.now());
      setGrantId(grant.grantId);
      setExpiresAt(grant.expiresAt);
      setPhase("window");
    } catch (error) {
        toast.error(toUserErrorMessage(error, "Couldn’t start this payment."));
    } finally {
      setBusy(false);
    }
  }

  async function onCancelWindow() {
    try {
      await cancelPreauthForWallet({ wallet: owner });
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t cancel."));
    }
  }

  function resetToIdle() {
    setPhase("idle");
    setGrantId(null);
    setExpiresAt(null);
    setPaid(null);
  }

  if (phase === "success" && paid) {
    const token = resolvePaymentToken(paid.mint, holdings);
    const amountUi = /^\d+$/.test(paid.amount)
      ? formatTokenAmount(BigInt(paid.amount), token.decimals)
      : "—";
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
          <p className="text-xl font-semibold tracking-tight">Paid</p>
          <p className="font-(family-name:--font-display) text-[2.5rem] leading-none tracking-tight tabular-nums md:text-5xl">
            {amountUi}
            <span className="ml-2 inline-flex align-middle text-lg font-medium text-muted-foreground md:text-xl">
              <TokenSymbol
                token={token}
                size="sm"
                symbolClassName="tracking-normal normal-case"
              />
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            To {shortAddress(paid.recipient)}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full max-w-xs"
          onClick={resetToIdle}
        >
          Done
        </Button>
      </div>
    );
  }

  if (phase === "expired" || phase === "cancelled" || phase === "replaced") {
    const heading =
      phase === "cancelled"
        ? "Cancelled"
        : phase === "replaced"
          ? "New Payment Started"
          : "Time Expired";
    const detail =
      phase === "cancelled"
        ? "Nothing was charged."
        : phase === "replaced"
          ? "Continue with the new payment."
          : "Press Pay again to continue.";
    return (
      <div className="flex flex-1 flex-col gap-5">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
            <X className="size-6" strokeWidth={2} />
          </div>
          <div className="max-w-60 space-y-1.5">
            <p className="text-base font-medium text-foreground">{heading}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>
          <Button
            type="button"
            size="lg"
            className="w-full max-w-xs"
            onClick={resetToIdle}
          >
            Pay Again
          </Button>
        </div>
      </div>
    );
  }

  if (windowOpen) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Hold to Pay"
        body={
          secondsLeft > 0
            ? `${formatCountdown(secondsLeft)} remaining`
            : "Confirming payment…"
        }
        pulsing
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void onCancelWindow()}
          >
            Cancel
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-2">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <QueryRefreshButton owner={owner} className="ml-auto" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="max-w-64 text-sm text-muted-foreground">
          {!confirmationRequired
            ? payCopy.holdConfirmOff
            : !keyReady
              ? payCopy.holdNeedsKey
              : payCopy.holdReady}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        {confirmationRequired && keyReady ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void onPay()}
            disabled={busy}
          >
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : payCopy.pay}
          </Button>
        ) : null}
        {confirmationRequired && !keyReady && onSetupPhone ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onSetupPhone}
          >
            {payCopy.setUp}
          </Button>
        ) : null}
        {onManage ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground"
            onClick={onManage}
          >
            {payCopy.settings}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

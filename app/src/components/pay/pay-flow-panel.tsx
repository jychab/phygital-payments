"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { useVerifiedTokens } from "@/hooks/tokens/use-verified-tokens";
import {
  cancelPreauthForWallet,
  requestPreauthForWallet,
  waitPreauthStatusForWallet,
  type PreauthStatusResult,
} from "@/lib/pay/preauth-client";
import { invalidateOwnerQueries } from "@/lib/queries";
import { formatTokenAmount } from "@/lib/tokens/mint-delegate";
import { resolvePaymentToken } from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { shortAddress } from "@/lib/utils";

type Phase = "idle" | "window" | "expired" | "cancelled" | "success";

function formatCountdown(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

/**
 * Pay → Hold to Pay. Opens a spending window, then waits on `/api/preauth/status`
 * for cancelled, expired, or webhook success. Mint and amount are chosen by
 * Collect and capped on-chain by the token's spending limit.
 */
export function PayFlowPanel({
  owner,
  tokenEnabled,
  isLoading = false,
  variant = "home",
  onSetLimit,
  onManage,
  onManageApiKey,
  onBack,
}: {
  owner: string;
  tokenEnabled: boolean;
  isLoading?: boolean;
  variant?: "home" | "device";
  onSetLimit?: () => void;
  onManage?: () => void;
  onManageApiKey?: () => void;
  onBack?: () => void;
}) {
  const queryClient = useQueryClient();
  const verified = useVerifiedTokens();
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
        setPhase(result.status === "cancelled" ? "cancelled" : "expired");
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
    if (!tokenEnabled) {
      toast.error("Turn on a token for Pay first.");
      return;
    }
    try {
      setBusy(true);
      const grant = await requestPreauthForWallet({ wallet: owner });
      setPaid(null);
      setNowMs(Date.now());
      setGrantId(grant.grantId);
      setExpiresAt(grant.expiresAt);
      setPhase("window");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t enable this payment."));
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
    const token = resolvePaymentToken(paid.mint, verified.data);
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
            className="absolute inset-0 rounded-full bg-success/15 motion-safe:animate-[wallet-pulse_1.4s_ease-out]"
          />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-success text-success-foreground motion-safe:animate-[wallet-rise_0.4s_cubic-bezier(0.22,1,0.36,1)]">
            <Check className="size-8" strokeWidth={2.75} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-semibold tracking-tight">Paid</p>
          <p className="font-(family-name:--font-display) text-[2.5rem] leading-none tracking-tight tabular-nums">
            {amountUi}
            <span className="ml-2 inline-flex align-middle text-lg font-medium text-muted-foreground">
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

  if (phase === "expired" || phase === "cancelled") {
    const cancelled = phase === "cancelled";
    return (
      <div className="flex flex-1 flex-col gap-5">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
            <X className="size-6" strokeWidth={2} />
          </div>
          <div className="max-w-60 space-y-1.5">
            <p className="text-base font-medium text-foreground">
              {cancelled ? "Cancelled" : "Time Expired"}
            </p>
            <p className="text-sm text-muted-foreground">
              {cancelled
                ? "Nothing was charged."
                : "Tap Pay again to continue."}
            </p>
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

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading Pay…</p>
        </div>
      </div>
    );
  }

  if (!tokenEnabled) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          {onBack ? <BackLink onClick={onBack} /> : null}
          <QueryRefreshButton owner={owner} className="ml-auto" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
          <div className="max-w-64 space-y-1.5">
            <p className="text-base font-medium text-foreground">
              Turn On Pay
            </p>
            <p className="text-sm text-muted-foreground">
              Set a spending limit to start paying.
            </p>
          </div>
          {onSetLimit ? (
            <Button
              type="button"
              size="lg"
              className="w-full max-w-xs"
              onClick={onSetLimit}
            >
              Set Spending Limit
            </Button>
          ) : (
            <Button type="button" size="lg" className="w-full max-w-xs" asChild>
              <Link href="/">Set Up on Home</Link>
            </Button>
          )}
        </div>
      </div>
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
          Tap Pay, then hold your device at the receiver phone.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onPay()}
          disabled={busy}
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Pay"}
        </Button>
        {onManage ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground"
            onClick={onManage}
          >
            Manage Pay
          </Button>
        ) : null}
        {onManageApiKey ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onManageApiKey}
          >
            Manage API key
          </Button>
        ) : null}
        {!onBack && variant === "device" ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            asChild
          >
            <Link href="/">Done</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

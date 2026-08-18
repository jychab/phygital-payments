"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, X } from "lucide-react";
import { address } from "@solana/kit";
import Link from "next/link";

import { AmountField } from "@/components/amount-field";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { useMaxTapAmountUi } from "@/hooks/use-max-tap-amount";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useVerifiedTokens } from "@/hooks/use-verified-tokens";
import { hasLocalPayKey } from "@/lib/payments/device-setup-state";
import { isDelegateEnabled, uiAmountToRaw } from "@/lib/payments/mint-delegate";
import {
  defaultTapAmountUi,
  getDefaultMint,
  resolvePaymentToken,
} from "@/lib/payments/payment-token";
import {
  cancelPreauthForWallet,
  requestPreauthForWallet,
} from "@/lib/payments/preauth-client";
import { toUserErrorMessage } from "@/lib/payments/user-errors";

type Phase = "idle" | "window" | "expired";

export type PayFlowPanelProps = {
  owner: string;
  /** Device route shows Done; home omits footer actions. */
  variant?: "home" | "device";
  /** Parent already verified a local key (skips missing-key gate). */
  assumeKeyReady?: boolean;
  /** Open spending-limit setup for the Pay token. */
  onSetLimit?: () => void;
};

function defaultPayAmount(
  limitUi?: string | null,
  balanceUi?: string | null,
  maxTapUi?: string | null,
): string {
  const fromLimit = defaultTapAmountUi(limitUi, maxTapUi);
  const bal = balanceUi != null && balanceUi !== "" ? Number(balanceUi) : NaN;
  if (!Number.isFinite(bal) || bal <= 0) return fromLimit;
  const cap = Number(fromLimit);
  if (!Number.isFinite(cap) || cap <= 0) return fromLimit;
  const n = Math.min(cap, bal);
  return Number.isInteger(n) ? String(n) : String(n);
}

function tryUiAmountToRaw(amount: string, decimals: number): bigint | null {
  try {
    return uiAmountToRaw(amount, decimals);
  } catch {
    return null;
  }
}

function formatCountdown(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Shared Pay $X → Hold to Pay flow (stored localStorage key + preauth window).
 * Works without Privy when `owner` is known (e.g. `/device`).
 */
export function PayFlowPanel({
  owner,
  variant = "home",
  assumeKeyReady = false,
  onSetLimit,
}: PayFlowPanelProps) {
  const mint = String(getDefaultMint());
  const mintAddress = useMemo(() => address(mint), [mint]);
  const [amountDraft, setAmountDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const hasKey = assumeKeyReady || hasLocalPayKey(owner);
  const capQuery = useDelegateStatus(owner, mintAddress);
  const mintQuery = useMintProgram(mintAddress);
  const verified = useVerifiedTokens();
  const token = resolvePaymentToken(mint, verified.data);
  const tokenEnabled = isDelegateEnabled(capQuery.data);
  const limitUi = tokenEnabled ? capQuery.data?.delegatedAmountUi : null;
  const maxTapUi = useMaxTapAmountUi(owner);
  const tapCapUi = defaultTapAmountUi(limitUi, maxTapUi);
  const amount = amountDraft ?? defaultPayAmount(
    limitUi,
    capQuery.data?.balanceUi,
    maxTapUi,
  );
  const decimals = mintQuery.data?.decimals ?? token.decimals;
  const rawAmount = tryUiAmountToRaw(amount, decimals);
  const tapCapRaw = tryUiAmountToRaw(tapCapUi, decimals);

  const insufficientBalance =
    rawAmount != null &&
    capQuery.data != null &&
    capQuery.data.balanceRaw < rawAmount;
  const overLimit =
    rawAmount != null &&
    capQuery.data?.delegatedAmountRaw != null &&
    tokenEnabled &&
    rawAmount > capQuery.data.delegatedAmountRaw;
  const overMaxTap =
    !overLimit &&
    rawAmount != null &&
    tapCapRaw != null &&
    rawAmount > tapCapRaw;

  const windowOpen = phase === "window";
  const secondsLeft =
    expiresAt != null && expiresAt * 1000 > nowMs
      ? Math.max(0, Math.ceil((expiresAt * 1000 - nowMs) / 1000))
      : 0;

  useEffect(() => {
    if (!windowOpen || expiresAt == null) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNowMs(t);
      if (expiresAt * 1000 <= t) {
        setPhase("expired");
        setExpiresAt(null);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [windowOpen, expiresAt]);

  function formatPayLabel(): string {
    if (insufficientBalance) return `Not Enough ${token.symbol}`;
    if (overLimit) return "Over Limit";
    if (overMaxTap) return "Over max tap";
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) return "Pay";
    const formatted =
      amount.includes(".") && !amount.endsWith(".")
        ? `$${amount}`
        : `$${Math.round(n)}`;
    return `Pay ${formatted}`;
  }

  async function onPay() {
    if (!hasKey) {
      toast.error("Turn on Pay on this phone first.");
      return;
    }
    if (!tokenEnabled) {
      toast.error(`Turn on ${token.symbol} for Pay first.`);
      return;
    }
    if (!mintQuery.data) {
      toast.error("Still loading. Try again in a moment.");
      return;
    }
    if (!amount || rawAmount == null) {
      toast.error("Enter an amount.");
      return;
    }
    if (insufficientBalance) {
      toast.error(`Not enough ${token.symbol}.`);
      return;
    }
    if (overLimit) {
      toast.error(`Over your $${limitUi ?? "—"} limit.`);
      return;
    }
    if (overMaxTap) {
      toast.error(`Over your $${tapCapUi} max tap.`);
      return;
    }
    try {
      setBusy(true);
      const grant = await requestPreauthForWallet({
        wallet: owner,
        amount: rawAmount.toString(),
        mint,
      });
      setNowMs(Date.now());
      setExpiresAt(grant.expiresAt);
      setPhase("window");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t enable this payment."));
    } finally {
      setBusy(false);
    }
  }

  async function onCancelWindow() {
    setPhase("expired");
    setExpiresAt(null);
    try {
      await cancelPreauthForWallet({ wallet: owner });
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t cancel."));
    }
  }

  if (phase === "expired") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
          <X className="size-6" strokeWidth={2} />
        </div>
        <div className="max-w-60 space-y-1.5">
          <p className="text-base font-medium text-foreground">Time Expired</p>
          <p className="text-sm text-muted-foreground">
            Enable Pay again to continue.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full max-w-xs"
          onClick={() => setPhase("idle")}
        >
          Pay Again
        </Button>
      </div>
    );
  }

  if (windowOpen) {
    const n = parseFloat(amount);
    const amountLabel =
      Number.isFinite(n) && amount.includes(".") && !amount.endsWith(".")
        ? `$${amount}`
        : Number.isFinite(n)
          ? `$${Math.round(n)}`
          : `$${amount}`;
    return (
      <NfcHoldStatus
        size="lg"
        title="Hold to Pay"
        body={`${amountLabel} · ${formatCountdown(secondsLeft)} remaining`}
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

  if (!hasKey) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <div className="max-w-64 space-y-1.5">
          <p className="text-base font-medium text-foreground">Pay Isn’t Set Up</p>
          <p className="text-sm text-muted-foreground">
            Turn on Pay on this phone, then come back to pay.
          </p>
        </div>
        {variant === "device" ? (
          <Button type="button" size="lg" className="w-full max-w-xs" asChild>
            <Link href="/">Set Up Pay</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  if (capQuery.isLoading || mintQuery.isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading Pay…</p>
      </div>
    );
  }

  if (!tokenEnabled) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        <div className="max-w-64 space-y-1.5">
          <p className="text-base font-medium text-foreground">
            Turn On {token.symbol}
          </p>
          <p className="text-sm text-muted-foreground">
            Set a spending limit to pay with {token.symbol}.
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
    );
  }

  const payBlocked =
    busy ||
    !amount ||
    rawAmount == null ||
    insufficientBalance ||
    overLimit ||
    overMaxTap;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <AmountField
        id={`pay-amount-${variant}`}
        value={amount}
        onChange={setAmountDraft}
        token={token}
        decimals={decimals}
        disabled={busy}
      />

      <p className="text-center text-[11px] tabular-nums text-muted-foreground">
        {insufficientBalance ? (
          <span className="text-destructive">
            Not enough {token.symbol}
            {capQuery.data?.balanceUi
              ? ` · ${capQuery.data.balanceUi} available`
              : ""}
          </span>
        ) : overLimit ? (
          <span className="text-destructive">
            Over your ${limitUi} limit
          </span>
        ) : overMaxTap ? (
          <span className="text-destructive">
            Over your ${tapCapUi} max tap
          </span>
        ) : (
          <>
            {limitUi ? `Limit $${limitUi}` : null}
            {tapCapUi ? (
              <>
                {limitUi ? " · " : null}
                Max tap ${tapCapUi}
              </>
            ) : null}
            {capQuery.data?.balanceUi ? (
              <>
                {limitUi || tapCapUi ? " · " : null}
                {capQuery.data.balanceUi} {token.symbol}
              </>
            ) : null}
          </>
        )}
      </p>

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onPay()}
          disabled={payBlocked || !mintQuery.data}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            formatPayLabel()
          )}
        </Button>
        {variant === "device" ? (
          <Button type="button" variant="ghost" size="lg" className="w-full" asChild>
            <Link href="/">Done</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

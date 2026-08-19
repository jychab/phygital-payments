"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, X } from "lucide-react";
import { address } from "@solana/kit";
import Link from "next/link";

import { BackLink } from "@/components/shared/back-link";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/pay/use-delegate-status";
import { useMaxTapAmountUi } from "@/hooks/pay/use-max-tap-amount";
import { useMintProgram } from "@/hooks/tokens/use-mint-program";
import { useVerifiedTokens } from "@/hooks/tokens/use-verified-tokens";
import { isDelegateEnabled, uiAmountToRaw } from "@/lib/tokens/mint-delegate";
import {
  defaultTapAmountUi,
  getDefaultMint,
  resolvePaymentToken,
} from "@/lib/tokens/payment-token";
import {
  cancelPreauthForWallet,
  requestPreauthForWallet,
} from "@/lib/pay/preauth-client";
import { toUserErrorMessage } from "@/lib/user-errors";

type Phase = "idle" | "window" | "expired";

function silentGrantAmountUi(
  limitUi?: string | null,
  balanceUi?: string | null,
  maxTapUi?: string | null,
  mint?: string | null,
): string {
  const fromLimit = defaultTapAmountUi(limitUi, maxTapUi, mint);
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
 * Pay → Hold to Pay. Opens a silent grant up to min(max tap, spending limit).
 * Works without Privy when `owner` is known (e.g. `/device`).
 */
export function PayFlowPanel({
  owner,
  variant = "home",
  onSetLimit,
  onManage,
  onManageApiKey,
  onBack,
}: {
  owner: string;
  variant?: "home" | "device";
  onSetLimit?: () => void;
  onManage?: () => void;
  onManageApiKey?: () => void;
  onBack?: () => void;
}) {
  const mint = String(getDefaultMint());
  const mintAddress = useMemo(() => address(mint), [mint]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const capQuery = useDelegateStatus(owner, mintAddress);
  const mintQuery = useMintProgram(mintAddress);
  const verified = useVerifiedTokens();
  const token = resolvePaymentToken(mint, verified.data);
  const tokenEnabled = isDelegateEnabled(capQuery.data);
  const limitUi = tokenEnabled ? capQuery.data?.delegatedAmountUi : null;
  const maxTapUi = useMaxTapAmountUi(owner, mint);
  const grantUi = silentGrantAmountUi(
    limitUi,
    capQuery.data?.balanceUi,
    maxTapUi,
    mint,
  );
  const decimals = mintQuery.data?.decimals ?? token.decimals;
  const rawAmount = tryUiAmountToRaw(grantUi, decimals);

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

  async function onPay() {
    if (!tokenEnabled) {
      toast.error(`Turn on ${token.symbol} for Pay first.`);
      return;
    }
    if (!mintQuery.data) {
      toast.error("Still loading. Try again in a moment.");
      return;
    }
    if (rawAmount == null) {
      toast.error("Couldn’t start Pay. Check your spending limit.");
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
      <div className="flex flex-1 flex-col gap-5">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
            <X className="size-6" strokeWidth={2} />
          </div>
          <div className="max-w-60 space-y-1.5">
            <p className="text-base font-medium text-foreground">
              Time Expired
            </p>
            <p className="text-sm text-muted-foreground">
              Tap Pay again to continue.
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
      </div>
    );
  }

  if (windowOpen) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Hold to Pay"
        body={`${formatCountdown(secondsLeft)} remaining`}
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

  if (capQuery.isLoading || mintQuery.isLoading) {
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
      </div>
    );
  }

  const payBlocked = busy || rawAmount == null;

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
          disabled={payBlocked || !mintQuery.data}
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

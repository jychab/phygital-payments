"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, X } from "lucide-react";
import { address } from "@solana/kit";
import Link from "next/link";

import { AmountField } from "@/components/amount-field";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { TokenSymbol } from "@/components/token-chip";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
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
};

/**
 * Shared Pay $X → Hold to Pay flow (stored localStorage key + preauth window).
 * Works without Privy when `owner` is known (e.g. `/device`).
 */
export function PayFlowPanel({
  owner,
  variant = "home",
  assumeKeyReady = false,
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
  const limitUi = isDelegateEnabled(capQuery.data)
    ? capQuery.data?.delegatedAmountUi
    : null;
  const amount = amountDraft ?? defaultTapAmountUi(limitUi);

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
      toast.error("Pay isn't set up on this phone yet.");
      return;
    }
    if (!mintQuery.data) {
      toast.error("Still loading — try again in a moment");
      return;
    }
    if (!amount) {
      toast.error("Choose an amount");
      return;
    }
    try {
      setBusy(true);
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      if (
        capQuery.data?.delegatedAmountRaw != null &&
        rawAmount > capQuery.data.delegatedAmountRaw
      ) {
        toast.error(`Amount exceeds your $${limitUi ?? "—"} limit`);
        return;
      }
      const grant = await requestPreauthForWallet({
        wallet: owner,
        amount: rawAmount.toString(),
        mint,
      });
      setNowMs(Date.now());
      setExpiresAt(grant.expiresAt);
      setPhase("window");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't pay"));
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
      toast.error(toUserErrorMessage(error, "Couldn't cancel"));
    }
  }

  if (phase === "expired") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
          <X className="size-6" strokeWidth={2} />
        </div>
        <div className="max-w-60 space-y-1.5">
          <p className="text-base font-medium text-foreground">Window Ended</p>
          <p className="text-sm text-muted-foreground">Tap Pay to try again.</p>
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

  if (windowOpen) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Hold to Pay"
        body={`Up to $${amount} · ${secondsLeft}s left`}
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
      <div className="space-y-1 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Pay
        </p>
        <p className="text-sm font-medium text-foreground">Choose amount</p>
        {variant === "device" ? (
          <p className="text-xs text-muted-foreground">
            Hold this device near their phone after you pay.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Then hold your NFC device to their phone.
          </p>
        )}
      </div>

      {!hasKey ? (
        <p className="rounded-xl border border-border/60 bg-muted/25 px-3 py-2 text-center text-xs text-muted-foreground">
          Pay isn&apos;t set up on this phone yet.{" "}
          <Link href="/" className="text-primary underline-offset-2 hover:underline">
            Set Up Pay on Home
          </Link>
          .
        </p>
      ) : (
        <>
          <AmountField
            id={`pay-amount-${variant}`}
            value={amount}
            onChange={setAmountDraft}
            token={token}
            decimals={mintQuery.data?.decimals ?? token.decimals}
            disabled={busy}
          />

          {limitUi ? (
            <p className="text-center text-[11px] text-muted-foreground">
              Spending limit ${limitUi} ${token.symbol}
            </p>
          ) : null}
        </>
      )}

      <div className="mt-auto flex flex-col gap-2.5">
        {hasKey ? (
          <>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => void onPay()}
              disabled={busy || !amount || !mintQuery.data}
            >
              {busy ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Pay…
                </>
              ) : (
                formatPayLabel()
              )}
            </Button>
            {variant === "device" ? (
              <Button type="button" variant="ghost" size="lg" className="w-full" asChild>
                <Link href="/">Done</Link>
              </Button>
            ) : null}
          </>
        ) : variant === "device" ? (
          <Button type="button" variant="ghost" size="lg" className="w-full" asChild>
            <Link href="/">Done</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

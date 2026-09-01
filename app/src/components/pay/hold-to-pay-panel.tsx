"use client";

import { Check, X } from "lucide-react";

import { BackLink } from "@/components/shared/back-link";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import {
  type HoldToPayPhase,
  type HoldToPaySuccess,
} from "@/hooks/pay/use-hold-to-pay";
import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { formatTokenAmount } from "@/lib/tokens/mint-delegate";
import {
  resolvePaymentToken,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { shortAddress, cn } from "@/lib/utils";

/** Active Pay window, success, and expiry states during hold-to-pay. */
export function HoldToPayPhaseView({
  phase,
  paid,
  secondsLeft,
  holdings,
  onCancelWindow,
  onReset,
  onBack,
}: {
  phase: HoldToPayPhase;
  paid: HoldToPaySuccess | null;
  secondsLeft: number;
  holdings?: PaymentTokenHolding[];
  onCancelWindow: () => void;
  onReset: () => void;
  onBack?: () => void;
}) {
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
          <p className="text-xl font-semibold tracking-tight">{copy.pay.paid}</p>
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
          onClick={onReset}
        >
          {copy.common.done}
        </Button>
      </div>
    );
  }

  if (phase === "expired" || phase === "cancelled" || phase === "replaced") {
    const heading =
      phase === "cancelled"
        ? copy.pay.cancelled
        : phase === "replaced"
          ? copy.pay.replacedTitle
          : copy.pay.expiredTitle;
    const detail =
      phase === "cancelled"
        ? copy.pay.cancelledBody
        : phase === "replaced"
          ? copy.pay.replacedBody
          : copy.pay.expiredBody;
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
            onClick={onReset}
          >
            {copy.pay.payAgain}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "window") {
    return (
      <NfcHoldStatus
        size="lg"
        title={copy.pay.holdToPay}
        body={
          secondsLeft > 0
            ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} remaining`
            : copy.pay.confirmingPayment
        }
        pulsing
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelWindow}
          >
            {copy.common.cancel}
          </Button>
        }
      />
    );
  }

  return null;
}

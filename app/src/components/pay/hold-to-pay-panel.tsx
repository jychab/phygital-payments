"use client";

import { Check, X } from "lucide-react";

import {
  HoldToPayHint,
  HoldToPayIdleActions,
} from "@/components/pay/hold-to-pay-actions";
import { BackLink } from "@/components/shared/back-link";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { StickyActions } from "@/components/shared/sticky-actions";
import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import {
  useHoldToPay,
  type HoldToPayPhase,
  type HoldToPaySuccess,
} from "@/hooks/pay/use-hold-to-pay";
import { galleryAnimate } from "@/lib/motion";
import { formatTokenAmount } from "@/lib/tokens/mint-delegate";
import {
  resolvePaymentToken,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { shortAddress, cn } from "@/lib/utils";

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
  const hold = useHoldToPay(owner);

  if (hold.showPhase) {
    return (
      <HoldToPayPhaseView
        phase={hold.phase}
        paid={hold.paid}
        secondsLeft={hold.secondsLeft}
        holdings={holdings}
        onCancelWindow={() => void hold.onCancelWindow()}
        onReset={hold.resetToIdle}
        onBack={onBack}
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
          <HoldToPayHint
            confirmationRequired={confirmationRequired}
            keyReady={keyReady}
          />
        </p>
      </div>

      <StickyActions>
        <HoldToPayIdleActions
          confirmationRequired={confirmationRequired}
          keyReady={keyReady}
          busy={hold.busy}
          onPay={() => void hold.onPay()}
          onSetupPhone={onSetupPhone}
          onManage={onManage}
        />
      </StickyActions>
    </div>
  );
}

/** Window / success / expired — authenticity yields the screen to this. */
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
          onClick={onReset}
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
            onClick={onReset}
          >
            Pay Again
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "window") {
    return (
      <NfcHoldStatus
        size="lg"
        title="Hold to Pay"
        body={
          secondsLeft > 0
            ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} remaining`
            : "Confirming payment…"
        }
        pulsing
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelWindow}
          >
            Cancel
          </Button>
        }
      />
    );
  }

  return null;
}

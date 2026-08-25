"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { payCopy } from "@/lib/copy/phygital";
import { cn } from "@/lib/utils";

/** Helper line above Pay / Set up CTAs. */
export function HoldToPayHint({
  confirmationRequired,
  keyReady,
}: {
  confirmationRequired: boolean;
  keyReady: boolean;
}) {
  if (!confirmationRequired) return payCopy.holdConfirmOff;
  if (!keyReady) return payCopy.holdNeedsKey;
  return payCopy.holdReady;
}

/**
 * Idle footer: arm Pay, Set up, or Manage — usable as authenticity `payAction`.
 * Kept separate from phase UI so authenticity can stay out of the heavy chunk.
 */
export function HoldToPayIdleActions({
  confirmationRequired,
  keyReady,
  busy,
  onPay,
  onSetupPhone,
  onManage,
  manageVariant = "ghost",
}: {
  confirmationRequired: boolean;
  keyReady: boolean;
  busy?: boolean;
  onPay?: () => void;
  onSetupPhone?: () => void;
  onManage?: () => void;
  /** Confirm-off accessory uses primary Manage; Hold panel keeps ghost. */
  manageVariant?: "ghost" | "primary";
}) {
  const showPay = confirmationRequired && keyReady && onPay;
  const showSetup = confirmationRequired && !keyReady && onSetupPhone;
  const manageIsPrimary = manageVariant === "primary" && !showPay && !showSetup;

  return (
    <div className="flex w-full flex-col gap-2.5">
      {showPay ? (
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onPay}
          disabled={busy}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            payCopy.pay
          )}
        </Button>
      ) : null}
      {showSetup ? (
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
          variant={manageIsPrimary ? "default" : "ghost"}
          size="lg"
          className={cn(
            "w-full",
            !manageIsPrimary && "text-muted-foreground",
          )}
          onClick={onManage}
        >
          {manageIsPrimary ? payCopy.manage : payCopy.settings}
        </Button>
      ) : null}
    </div>
  );
}

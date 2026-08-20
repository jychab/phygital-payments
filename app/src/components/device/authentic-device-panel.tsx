"use client";

import Link from "next/link";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { collectHref } from "@/lib/collect/payment-request";
import {
  assetAllowsPay,
  isUnclaimedAsset,
  type PhygitalAsset,
} from "@/lib/phygital/asset";
import { shortAddress } from "@/lib/utils";

/**
 * Authentic success stage — Hold ring morphs into a check.
 * Claim / Collect / Pay are secondary and never replace the hero.
 */
export function AuthenticDevicePanel({
  asset,
  liveConfirmed,
  holdError,
  onHoldToCheck,
  onClaim,
  onPay,
}: {
  asset: PhygitalAsset;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onClaim?: () => void;
  onPay?: () => void;
}) {
  const unclaimed = isUnclaimedAsset(asset);
  const canClaim = (unclaimed || !asset.isLocked) && Boolean(onClaim);
  const canPay = asset.isLocked && assetAllowsPay(asset) && Boolean(onPay);
  const collectUrl = collectHref({ recipient: String(asset.currentOwner) });

  return (
    <div className="flex flex-1 flex-col">
      <NfcHoldStatus
        size="lg"
        tone="success"
        pulsing={false}
        title="Verified"
        body={
          liveConfirmed ? "Confirmed just now." : "This device is genuine."
        }
        action={
          <div className="flex w-full max-w-64 flex-col items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {unclaimed
                ? "Not linked to a wallet."
                : `Linked to ${shortAddress(String(asset.currentOwner))}.`}
            </p>
            {!liveConfirmed && onHoldToCheck ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={onHoldToCheck}
              >
                Hold to Check
              </Button>
            ) : null}
            {holdError ? (
              <p className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                {holdError}
              </p>
            ) : null}
          </div>
        }
      />

      {canClaim || canPay ? (
        <div className="mt-auto flex flex-col gap-2.5 pt-2 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          {canClaim ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onClaim}
            >
              Add to Wallet
            </Button>
          ) : null}

          {canPay ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                asChild
              >
                <Link href={collectUrl}>Collect</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={onPay}
              >
                Pay
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

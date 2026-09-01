"use client";

import Link from "next/link";

import { AccessoryIdentityHeader } from "@/components/token/accessory-identity-header";
import { AccessoryWalletHome } from "@/components/token/accessory-wallet-home";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { StickyActions } from "@/components/shared/sticky-actions";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import { STICKY_ENTER_DELAY_MS } from "@/lib/motion";
import {
  deriveAccessoryPrimaryAction,
  deriveAccessoryStatusLine,
  accessoryHasSpendingLimit,
  type AccessoryPrimaryKind,
} from "@/lib/pay/accessory-pay-state";
import type { OwnerPayDelegates } from "@/lib/tokens/mint-delegate";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";

/** Unminted accessory — wallet identity home or claim / verify surfaces. */
export function TokenUnmintedPanel({
  token,
  liveConfirmed,
  holdError,
  onHoldToCheck,
  onClaim,
  onEditLimit,
  onOpenSettings,
  receiveHref,
  onPrimaryAction,
  owner,
  tokenAddress,
  holdings,
  delegates,
  payLoading = false,
  preConfirmationOn = false,
  keyReady = false,
  payBusy = false,
}: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onClaim?: () => void;
  onEditLimit: (holding: PaymentTokenHolding) => void;
  onOpenSettings?: () => void;
  receiveHref?: string;
  onPrimaryAction: (kind: AccessoryPrimaryKind) => void;
  owner: string;
  tokenAddress: string;
  holdings?: readonly PaymentTokenHolding[];
  delegates?: OwnerPayDelegates;
  payLoading?: boolean;
  preConfirmationOn?: boolean;
  keyReady?: boolean;
  payBusy?: boolean;
}) {
  const unclaimed = isUnclaimedToken(token);
  const canClaim = (unclaimed || !token.isLocked) && Boolean(onClaim);
  const canPay = token.isLocked && tokenAllowsPay(token);
  const hasLimit = accessoryHasSpendingLimit(delegates, tokenAddress);

  const primary = deriveAccessoryPrimaryAction({
    token,
    liveConfirmed,
    canClaim,
    preConfirmationOn,
    keyReady,
    hasLimit,
    canPay,
  });

  const statusLine =
    !unclaimed && liveConfirmed
      ? deriveAccessoryStatusLine({
          preConfirmationOn,
          keyReady,
          hasLimit,
          canPay,
        })
      : null;

  const showWalletHome = !unclaimed && !canClaim;
  const verifyAgain = liveConfirmed && onHoldToCheck ? onHoldToCheck : undefined;
  const receiveAsPrimary =
    Boolean(receiveHref) && primary.kind === "none";

  if (!liveConfirmed && onHoldToCheck) {
    return (
      <div className="flex flex-1 flex-col">
        <NfcHoldStatus
          size="lg"
          title={copy.verify.holdToCheck}
          body={copy.verify.notVerifiedHint}
        />
        <StickyActions enterDelayMs={STICKY_ENTER_DELAY_MS}>
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onHoldToCheck}
          >
            {copy.verify.holdToCheck}
          </Button>
        </StickyActions>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-2">
      <div className="relative">
        <AccessoryIdentityHeader
          token={token}
          owner={owner}
          unclaimed={unclaimed}
          liveConfirmed={liveConfirmed}
          holdError={holdError}
          onVerifyAgain={verifyAgain}
          onOpenSettings={onOpenSettings}
        />
      </div>

      {showWalletHome ? (
        <AccessoryWalletHome
          tokenAddress={tokenAddress}
          holdings={holdings}
          delegates={delegates}
          loading={payLoading}
          statusLine={statusLine}
          onEditLimit={onEditLimit}
        />
      ) : null}

      {primary.kind !== "none" || receiveHref ? (
        <StickyActions enterDelayMs={STICKY_ENTER_DELAY_MS}>
          {primary.kind !== "none" ? (
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={payBusy && primary.kind === "pay"}
              onClick={() => onPrimaryAction(primary.kind)}
            >
              {payBusy && primary.kind === "pay" ? "…" : primary.label}
            </Button>
          ) : null}
          {receiveHref ? (
            <Button
              type="button"
              variant={receiveAsPrimary ? "default" : "ghost"}
              size="lg"
              className={
                receiveAsPrimary
                  ? "w-full"
                  : "w-full text-muted-foreground"
              }
              asChild
            >
              <Link href={receiveHref}>{copy.pay.receive}</Link>
            </Button>
          ) : null}
        </StickyActions>
      ) : null}
    </div>
  );
}

"use client";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { PhygitalTokenRefreshButton } from "@/components/shared/query-refresh-button";
import { InlineError } from "@/components/shared/inline-error";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { shortAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Task-mode accessory panel — NFC ring + one primary CTA (claim / Pay / Hold to Check). */
export function AuthenticAccessoryPanel({
  token,
  liveConfirmed,
  holdError,
  onHoldToCheck,
  onClaim,
  onPay,
  payLabel = "Pay",
}: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onClaim?: () => void;
  onPay?: () => void;
  payLabel?: string;
}) {
  const unclaimed = isUnclaimedToken(token);
  const canClaim = (unclaimed || !token.isLocked) && Boolean(onClaim);
  const canPay = token.isLocked && tokenAllowsPay(token) && Boolean(onPay);
  const statusLine = liveConfirmed
    ? copy.confirmedJustNow
    : copy.registeredOnChain;

  const primaryAction = canClaim
    ? { label: copy.addToWallet, onClick: onClaim }
    : canPay
      ? { label: payLabel, onClick: onPay }
      : !liveConfirmed && onHoldToCheck
        ? { label: copy.holdToCheck, onClick: onHoldToCheck }
        : null;

  return (
    <div className="flex flex-1 flex-col">
      <NfcHoldStatus
        size="lg"
        tone="success"
        pulsing={false}
        title={liveConfirmed ? copy.confirmed : copy.registered}
        body={statusLine}
        action={
          <AccessoryStatus
            token={token}
            unclaimed={unclaimed}
            owner={String(token.currentOwner)}
            liveConfirmed={liveConfirmed}
            holdError={holdError}
            onHoldToCheck={onHoldToCheck}
          />
        }
      />

      {primaryAction ? (
        <div
          className={cn(
            "mt-auto flex flex-col gap-2.5 pt-2",
            galleryAnimate.rise,
          )}
        >
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function AccessoryStatus({
  token,
  unclaimed,
  owner,
  liveConfirmed,
  holdError,
  onHoldToCheck,
}: {
  token: PhygitalToken;
  unclaimed: boolean;
  owner: string;
  liveConfirmed: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
}) {
  return (
    <div className="flex w-full max-w-72 flex-col items-center gap-2">
      <div className="flex items-center gap-0.5">
        <p className="text-xs text-muted-foreground">
          {unclaimed
            ? "Not linked to a wallet."
            : `Linked to ${shortAddress(owner)}.`}
        </p>
        <PhygitalTokenRefreshButton token={token} />
      </div>
      {!liveConfirmed && onHoldToCheck ? (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={onHoldToCheck}
        >
          {copy.holdToCheck}
        </Button>
      ) : null}
      {holdError ? <InlineError>{holdError}</InlineError> : null}
    </div>
  );
}

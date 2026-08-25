"use client";

import type { ReactNode } from "react";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { CopyableAddress } from "@/components/shared/copyable-address";
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
import { cn } from "@/lib/utils";

/** Task-mode accessory panel — NFC ring + claim / Hold / integrated Pay CTAs. */
export function AuthenticAccessoryPanel({
  token,
  liveConfirmed,
  fromCollection = false,
  holdError,
  onHoldToCheck,
  onClaim,
  payAction,
  collectAction,
}: {
  token: PhygitalToken;
  liveConfirmed: boolean;
  /** Collection open — Confirmed body is verified-owned, not live NFC. */
  fromCollection?: boolean;
  holdError?: string | null;
  onHoldToCheck?: () => void;
  onClaim?: () => void;
  /** Integrated Hold-to-Pay actions (arm Pay / Set up / Manage). */
  payAction?: ReactNode;
  /** Merchant launcher (owned detail from Collection only). */
  collectAction?: ReactNode;
}) {
  const unclaimed = isUnclaimedToken(token);
  const canClaim = (unclaimed || !token.isLocked) && Boolean(onClaim);
  const showPay =
    token.isLocked && tokenAllowsPay(token) && payAction != null;
  const statusLine = liveConfirmed
    ? fromCollection
      ? copy.verifiedFromCollection
      : copy.confirmedJustNow
    : copy.registeredOnChain;

  // Ghost Hold when another primary exists; otherwise Hold is the primary.
  const ghostHold =
    !liveConfirmed && Boolean(onHoldToCheck) && (canClaim || showPay);

  const primaryAction = canClaim
    ? { label: copy.addToWallet, onClick: onClaim! }
    : !showPay && !liveConfirmed && onHoldToCheck
      ? { label: copy.holdToCheck, onClick: onHoldToCheck }
      : null;

  const footer = showPay ? (
    payAction
  ) : primaryAction ? (
    <Button
      type="button"
      size="lg"
      className="w-full"
      onClick={primaryAction.onClick}
    >
      {primaryAction.label}
    </Button>
  ) : null;

  const hasFooter = footer != null || collectAction != null;

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
            holdError={holdError}
            ghostHold={ghostHold}
            onHoldToCheck={onHoldToCheck}
          />
        }
      />

      {hasFooter ? (
        <div
          className={cn(
            "mt-auto flex w-full flex-col items-center gap-2.5 pt-2",
            galleryAnimate.rise,
          )}
        >
          <div className="flex w-full max-w-xs flex-col gap-2.5">
            {footer}
            {collectAction}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AccessoryStatus({
  token,
  unclaimed,
  owner,
  holdError,
  ghostHold,
  onHoldToCheck,
}: {
  token: PhygitalToken;
  unclaimed: boolean;
  owner: string;
  holdError?: string | null;
  ghostHold: boolean;
  onHoldToCheck?: () => void;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2">
      {/* Balance the refresh control so “Linked to …” stays optically centered. */}
      <div className="flex w-full items-center justify-center gap-0.5">
        <span className="size-9 shrink-0" aria-hidden />
        {unclaimed ? (
          <p className="text-xs text-muted-foreground">Not linked to a wallet.</p>
        ) : (
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span>Linked to</span>
            <CopyableAddress
              address={owner}
              length={4}
              label="linked wallet"
              className="text-xs text-muted-foreground"
            />
          </p>
        )}
        <PhygitalTokenRefreshButton token={token} className="shrink-0" />
      </div>
      {ghostHold && onHoldToCheck ? (
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

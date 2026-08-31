"use client";

import type { ReactNode } from "react";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { CopyableAddress } from "@/components/shared/copyable-address";
import { PhygitalTokenRefreshButton } from "@/components/shared/query-refresh-button";
import { InlineError } from "@/components/shared/inline-error";
import { StickyActions } from "@/components/shared/sticky-actions";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import { STICKY_ENTER_DELAY_MS } from "@/lib/motion";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";

/** Unminted-token panel — NFC ring + sticky claim / Verify / Pay CTAs. */
export function TokenUnmintedPanel({
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
  const showVerify = !liveConfirmed && Boolean(onHoldToCheck);
  const statusLine = liveConfirmed
    ? fromCollection
      ? copy.verifiedFromCollection
      : copy.confirmedJustNow
    : copy.registeredOnChain;

  const hasSticky =
    showVerify || canClaim || showPay || collectAction != null;
  const confirmPresence =
    liveConfirmed && onHoldToCheck ? onHoldToCheck : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <NfcHoldStatus
        size="lg"
        tone="success"
        pulsing={false}
        title={liveConfirmed ? copy.confirmed : copy.registered}
        body={statusLine}
        onTitleClick={confirmPresence}
        titleAriaLabel={
          confirmPresence ? copy.confirmedRecheckAria : undefined
        }
        action={
          <TokenUnmintedStatus
            token={token}
            unclaimed={unclaimed}
            owner={String(token.currentOwner)}
            holdError={holdError}
          />
        }
      />

      {hasSticky ? (
        <StickyActions enterDelayMs={STICKY_ENTER_DELAY_MS}>
          {showVerify ? (
            <Button
              type="button"
              variant={canClaim || showPay ? "outline" : "default"}
              size="lg"
              className="w-full"
              onClick={onHoldToCheck}
            >
              {copy.holdToCheck}
            </Button>
          ) : null}
          {canClaim ? (
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={onClaim}
            >
              {copy.addToWallet}
            </Button>
          ) : null}
          {showPay ? payAction : null}
          {collectAction}
        </StickyActions>
      ) : null}
    </div>
  );
}

function TokenUnmintedStatus({
  token,
  unclaimed,
  owner,
  holdError,
}: {
  token: PhygitalToken;
  unclaimed: boolean;
  owner: string;
  holdError?: string | null;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2">
      <div className="flex w-full items-center justify-center gap-0.5">
        <span className="size-9 shrink-0" aria-hidden />
        {unclaimed ? (
          <p className="text-xs text-muted-foreground">{copy.notLinked}</p>
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
      {holdError ? <InlineError>{holdError}</InlineError> : null}
    </div>
  );
}

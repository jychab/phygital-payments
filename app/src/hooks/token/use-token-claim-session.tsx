"use client";

import { useState, type ReactNode } from "react";
import { address as toAddress } from "@solana/kit";

import { ClaimPanel } from "@/components/claim/claim-panel";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { StageTransition } from "@/components/shared/stage-transition";
import { Button } from "@/components/ui/button";
import { useHoldToCheck } from "@/hooks/token/use-hold-to-check";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { copy } from "@/lib/copy/phygital";
import {
  isUnclaimedToken,
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { cn } from "@/lib/utils";

/**
 * Shared claim + Hold-to-Check session for minted and unminted token homes.
 */
export function useTokenClaimSession(
  tokenProp: PhygitalToken,
  liveConfirmedProp = false,
  options?: { autoOpenClaim?: boolean },
) {
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);
  const token: PhygitalToken = claimedOwner
    ? { ...tokenProp, currentOwner: toAddress(claimedOwner) }
    : tokenProp;
  const hold = useHoldToCheck(token, liveConfirmedProp);
  const autoOpened = options?.autoOpenClaim ?? false;
  const [showClaim, setShowClaim] = useState(() => autoOpened);
  const [claimOpenedManually, setClaimOpenedManually] = useState(false);
  const canExitClaim = !autoOpened || claimOpenedManually;

  return {
    token,
    liveConfirmed: hold.liveConfirmed,
    overlay: hold.overlay,
    failedRecheck: hold.failedRecheck,
    pending: hold.pending,
    recheckSuccess: hold.recheckSuccess,
    holdError: hold.holdError,
    showInAppGate: hold.showInAppGate,
    holdToCheck: hold.holdToCheck,
    showClaim,
    canExitClaim,
    openClaim: () => {
      setClaimOpenedManually(true);
      setShowClaim(true);
    },
    closeClaim: () => setShowClaim(false),
    onClaimed: (owner: string) => {
      setClaimedOwner(owner);
      setShowClaim(false);
    },
  };
}

export type TokenClaimSession = ReturnType<typeof useTokenClaimSession>;

function VerifyFailedCeremony({
  token,
  recheck,
  errorMessage,
  onRetry,
}: {
  token: PhygitalToken;
  recheck: boolean;
  errorMessage: string;
  onRetry: () => void;
}) {
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);

  return (
    <NfcHoldStatus
      size="lg"
      pulsing={false}
      title={recheck ? copy.verify.failed : copy.verify.failed}
      body={errorMessage}
      imageSrc={collectible?.image}
      imageAlt={collectible?.name ?? ""}
      action={
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onRetry}
        >
          {copy.common.tryAgain}
        </Button>
      }
    />
  );
}

function RecheckSuccessCeremony() {
  return (
    <NfcHoldStatus
      size="lg"
      tone="success"
      pulsing={false}
      title={copy.verify.verified}
      body={copy.verify.verifiedAgainBody}
    />
  );
}

function PendingVerifyCeremony({
  token,
  recheck,
}: {
  token: PhygitalToken;
  /** Already Confirmed — fresh presence check, not first Verify. */
  recheck?: boolean;
}) {
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);

  return (
    <NfcHoldStatus
      size="lg"
      busy
      title={recheck ? copy.verify.verifying : copy.verify.holdStill}
      body={recheck ? copy.verify.introBody : copy.verify.holdStillBody}
      imageSrc={collectible?.image}
      imageAlt={collectible?.name ?? ""}
    />
  );
}

type GateMode = "landing" | "pending" | "recheckSuccess" | "failed" | "claim";

/**
 * Keeps the landing tree mounted across verify/claim so dossier state and
 * enter animations are not replayed on return.
 */
export function TokenClaimSessionGate({
  session,
  noun,
  inAppBody,
  children,
}: {
  session: TokenClaimSession;
  noun: "card" | "accessory";
  inAppBody: string;
  children: ReactNode;
}) {
  if (session.showInAppGate) {
    return <InAppBrowserGate body={inAppBody} />;
  }

  const mode: GateMode = session.showClaim
    ? "claim"
    : session.overlay === "recheck-success"
      ? "recheckSuccess"
      : session.overlay === "failed"
        ? "failed"
        : session.overlay === "pending"
          ? "pending"
          : "landing";
  const onLanding = mode === "landing";

  return (
    <div className="flex flex-1 flex-col">
      <div
        className={cn("flex flex-1 flex-col", !onLanding && "hidden")}
        aria-hidden={!onLanding}
        inert={!onLanding || undefined}
      >
        {children}
      </div>
      {!onLanding ? (
        <StageTransition
          stageKey={mode}
          variant="fade"
          className="flex flex-1 flex-col"
        >
          {mode === "claim" ? (
            <ClaimPanel
              token={session.token}
              noun={noun}
              unclaimed={isUnclaimedToken(session.token)}
              onBack={
                session.canExitClaim ? session.closeClaim : undefined
              }
              onClaimed={session.onClaimed}
            />
          ) : mode === "recheckSuccess" ? (
            <RecheckSuccessCeremony />
          ) : mode === "failed" ? (
            <VerifyFailedCeremony
              token={session.token}
              recheck={session.failedRecheck}
              errorMessage={
                session.holdError ?? copy.verify.failedBody
              }
              onRetry={() => void session.holdToCheck()}
            />
          ) : (
            <PendingVerifyCeremony
              token={session.token}
              recheck={session.liveConfirmed}
            />
          )}
        </StageTransition>
      ) : null}
    </div>
  );
}

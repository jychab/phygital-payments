"use client";

import { useState, type ReactNode } from "react";
import { address as toAddress } from "@solana/kit";

import { ClaimPanel } from "@/components/claim/claim-panel";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { StageTransition } from "@/components/shared/stage-transition";
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
) {
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);
  const token: PhygitalToken = claimedOwner
    ? { ...tokenProp, currentOwner: toAddress(claimedOwner) }
    : tokenProp;
  const hold = useHoldToCheck(token, liveConfirmedProp);
  const [showClaim, setShowClaim] = useState(false);

  return {
    token,
    liveConfirmed: hold.liveConfirmed,
    pending: hold.pending,
    holdError: hold.holdError,
    showInAppGate: hold.showInAppGate,
    holdToCheck: hold.holdToCheck,
    showClaim,
    openClaim: () => setShowClaim(true),
    closeClaim: () => setShowClaim(false),
    onClaimed: (owner: string) => {
      setClaimedOwner(owner);
      setShowClaim(false);
    },
  };
}

export type TokenClaimSession = ReturnType<typeof useTokenClaimSession>;

function PendingVerifyCeremony({ token }: { token: PhygitalToken }) {
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);

  return (
    <NfcHoldStatus
      size="lg"
      busy
      title={copy.holdStill}
      body={copy.holdStillBody}
      imageSrc={collectible?.image}
      imageAlt={collectible?.name ?? ""}
    />
  );
}

type GateMode = "landing" | "pending" | "claim";

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
    : session.pending
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
              onBack={session.closeClaim}
              onClaimed={session.onClaimed}
            />
          ) : (
            <PendingVerifyCeremony token={session.token} />
          )}
        </StageTransition>
      ) : null}
    </div>
  );
}

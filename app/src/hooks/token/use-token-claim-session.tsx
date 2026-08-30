"use client";

import { useState, type ReactNode } from "react";
import { address as toAddress } from "@solana/kit";

import { ClaimPanel } from "@/components/claim/claim-panel";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { useHoldToCheck } from "@/hooks/token/use-hold-to-check";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { copy } from "@/lib/copy/phygital";
import {
  isUnclaimedToken,
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";

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

/**
 * Renders in-app gate, claim panel, or hold-pending chrome before the home body.
 */
export function TokenClaimSessionGate({
  session,
  noun,
  inAppBody,
  claimWrapperClassName,
  children,
}: {
  session: TokenClaimSession;
  noun: "card" | "accessory";
  inAppBody: string;
  claimWrapperClassName?: string;
  children: ReactNode;
}) {
  if (session.showInAppGate) {
    return <InAppBrowserGate body={inAppBody} />;
  }

  if (session.showClaim) {
    const panel = (
      <ClaimPanel
        token={session.token}
        noun={noun}
        unclaimed={isUnclaimedToken(session.token)}
        onBack={session.closeClaim}
        onClaimed={session.onClaimed}
      />
    );
    return claimWrapperClassName ? (
      <div className={claimWrapperClassName}>{panel}</div>
    ) : (
      panel
    );
  }

  if (session.pending) {
    return <PendingVerifyCeremony token={session.token} />;
  }

  return children;
}

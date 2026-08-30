"use client";

import { TokenMintedPanel } from "@/components/token/token-minted-panel";
import { BackToCollection } from "@/components/shared/back-to-collection";
import {
  TokenClaimSessionGate,
  useTokenClaimSession,
} from "@/hooks/token/use-token-claim-session";
import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import type { PhygitalToken } from "@/lib/phygital/token";
import { cn } from "@/lib/utils";

/** Minted-token home after a check, claim, or Collection open. No Pay. */
export function TokenMintedHome({
  token: tokenProp,
  liveConfirmed: liveConfirmedProp = false,
  fromCollection = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  /** Opened from Collection hub (`from=collection`) — Back + verified copy. */
  fromCollection?: boolean;
}) {
  const session = useTokenClaimSession(tokenProp, liveConfirmedProp);

  return (
    <TokenClaimSessionGate
      session={session}
      noun="card"
      inAppBody={copy.openInBrowser}
      claimWrapperClassName={cn(galleryAnimate.fade)}
    >
      <div className="flex flex-1 flex-col">
        {fromCollection ? <BackToCollection /> : null}
        <TokenMintedPanel
          token={session.token}
          liveConfirmed={session.liveConfirmed}
          fromCollection={fromCollection}
          holdError={session.holdError}
          onHoldToCheck={() => void session.holdToCheck()}
          onClaim={session.openClaim}
        />
      </div>
    </TokenClaimSessionGate>
  );
}

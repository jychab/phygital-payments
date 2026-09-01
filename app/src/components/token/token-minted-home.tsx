"use client";

import { TokenMintedPanel } from "@/components/token/token-minted-panel";
import {
  TokenClaimSessionGate,
  useTokenClaimSession,
} from "@/hooks/token/use-token-claim-session";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";

/** Minted-token home after a check, claim, or Collection open. No Pay. */
export function TokenMintedHome({
  token: tokenProp,
  liveConfirmed: liveConfirmedProp = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}) {
  const session = useTokenClaimSession(tokenProp, liveConfirmedProp);

  return (
    <TokenClaimSessionGate
      session={session}
      noun="card"
      inAppBody={copy.gate.openInBrowserBody}
    >
        <TokenMintedPanel
          token={session.token}
          liveConfirmed={session.liveConfirmed}
          holdError={session.holdError}
          onHoldToCheck={() => void session.holdToCheck()}
          onClaim={session.openClaim}
        />
    </TokenClaimSessionGate>
  );
}

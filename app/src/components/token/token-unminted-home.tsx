"use client";

import { WalletWorkspace } from "@/components/wallet/wallet-workspace";
import {
  TokenVerifySessionGate,
  useTokenVerifySession,
} from "@/hooks/token/use-token-verify-session";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";

/** Unminted accessory home — Wallet panel is the landing. */
export function TokenUnmintedHome({
  token: tokenProp,
  liveConfirmed: liveConfirmedProp = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}) {
  const session = useTokenVerifySession(tokenProp, liveConfirmedProp);

  return (
    <TokenVerifySessionGate
      session={session}
      inAppBody={copy.gate.openInBrowserBody}
    >
      <WalletWorkspace token={session.token} />
    </TokenVerifySessionGate>
  );
}

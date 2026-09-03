"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { RouteBoot } from "@/components/layout/route-boot";
import { TokenAddressRoute } from "@/components/token/token-address-route";
import { TokenMintedHome } from "@/components/token/token-minted-home";
import { TokenNfcApp } from "@/components/token/token-nfc-app";
import { TokenUnmintedHome } from "@/components/token/token-unminted-home";
import { copy } from "@/lib/copy/phygital";
import {
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";

const TokenRouteShell = dynamic(
  () =>
    import("@/components/token/token-route-shell").then(
      (m) => m.TokenRouteShell,
    ),
  { ssr: false, loading: () => <RouteBoot /> },
);

const TOKEN_NFC_COPY = {
  inAppCheck: copy.gate.openInBrowserBody,
  holdBody: copy.verify.introBody,
  sessionExpiredTitle: copy.verify.sessionExpiredTitle,
  sessionExpiredBody: copy.verify.sessionExpiredBody,
  notSetUpTitle: copy.verify.notSetUpTitle,
  notSetUpBody: copy.verify.notSetUpBody,
};

function TokenHome({
  token,
  liveConfirmed,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}): ReactNode {
  if (tokenHasLinkedMint(token)) {
    return (
      <TokenMintedHome
        token={token}
        liveConfirmed={liveConfirmed}
      />
    );
  }
  return (
    <TokenUnmintedHome
      token={token}
      liveConfirmed={liveConfirmed}
    />
  );
}

/**
 * Route `/token` — Hold to Check, signed NFC URL, or Collection deep link.
 * Minted → card gallery UI; unminted → Wallet home.
 */
export function TokenApp() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address")?.trim() ?? "";

  if (address) {
    return (
      <TokenAddressRoute
        tokenAddress={address}
        renderHome={({ token, liveConfirmed }) => (
          <TokenHome
            token={token}
            liveConfirmed={liveConfirmed}
          />
        )}
      />
    );
  }

  return (
    <TokenRouteShell layout="compact">
      <TokenNfcApp
        nfcCopy={TOKEN_NFC_COPY}
        renderHome={({ token: loaded, liveConfirmed }) => (
          <TokenHome token={loaded} liveConfirmed={liveConfirmed} />
        )}
      />
    </TokenRouteShell>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { TokenAddressRoute } from "@/components/token/token-address-route";
import { TokenMintedHome } from "@/components/token/token-minted-home";
import { TokenNfcApp } from "@/components/token/token-nfc-app";
import { TokenUnmintedHome } from "@/components/token/token-unminted-home";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { copy } from "@/lib/copy/phygital";
import { isFromCollection } from "@/lib/journey";
import {
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";

const TokenRouteShell = dynamic(
  () =>
    import("@/components/token/token-route-shell").then(
      (m) => m.TokenRouteShell,
    ),
  { ssr: false, loading: () => <EmbedBoot /> },
);

const TOKEN_NFC_COPY = {
  inAppCheck: copy.openInBrowser,
  holdBody: copy.verifyIntroBody,
  sessionExpiredTitle: copy.verifySessionExpiredTitle,
  sessionExpiredBody: copy.verifySessionExpiredBody,
  notSetUpTitle: copy.notSetUpTitle,
  notSetUpBody: copy.notSetUpBody,
};

function TokenHome({
  token,
  liveConfirmed,
  fromCollection = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  fromCollection?: boolean;
}): ReactNode {
  if (tokenHasLinkedMint(token)) {
    return (
      <TokenMintedHome
        token={token}
        liveConfirmed={liveConfirmed}
        fromCollection={fromCollection}
      />
    );
  }
  return (
    <TokenUnmintedHome
      token={token}
      liveConfirmed={liveConfirmed}
      fromCollection={fromCollection}
    />
  );
}

/**
 * Route `/token` — Hold to Check, signed NFC URL, or Collection deep link.
 * Minted → card gallery UI; unminted → Pay / Collect UI.
 */
export function TokenApp() {
  const embedded = useIsEmbedded();
  const searchParams = useSearchParams();
  const address = searchParams.get("address")?.trim() ?? "";
  const fromCollection = isFromCollection(searchParams);

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    return (
      <EmbedError
        title="Can’t open here"
        body="Open this on your phone, not in this window."
      />
    );
  }

  if (address) {
    return (
      <TokenAddressRoute
        tokenAddress={address}
        fromCollection={fromCollection}
        renderHome={({ token, fromCollection: fromHub, liveConfirmed }) => (
          <TokenHome
            token={token}
            fromCollection={fromHub}
            liveConfirmed={liveConfirmed}
          />
        )}
      />
    );
  }

  return (
    <TokenRouteShell layout="compact">
      <TokenNfcApp
        copy={TOKEN_NFC_COPY}
        renderHome={({ token: loaded, liveConfirmed }) => (
          <TokenHome token={loaded} liveConfirmed={liveConfirmed} />
        )}
      />
    </TokenRouteShell>
  );
}

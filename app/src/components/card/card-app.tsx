"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import { CardHome } from "@/components/card/card-home";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { PhygitalByAddressHome } from "@/components/phygital/phygital-by-address-home";
import { PhygitalNfcApp } from "@/components/phygital/phygital-nfc-app";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { isDashboardBrowse } from "@/lib/journey";

const PhygitalRouteShell = dynamic(
  () =>
    import("@/components/phygital/phygital-route-shell").then(
      (m) => m.PhygitalRouteShell,
    ),
  { ssr: false, loading: () => <EmbedBoot /> },
);

const CARD_NFC_COPY = {
  inAppCheck: "To check a card, open this page in Safari or Chrome.",
  holdBody: "Hold your card to the back of this phone.",
  notSetUp: "This card isn’t set up yet.",
};

/**
 * Route `/card` — minted phygital tokens. Hold to Check, signed NFC URL,
 * or wallet finish. Tokens without a mint redirect to `/accessory`.
 */
export function CardApp() {
  const embedded = useIsEmbedded();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const address = searchParams.get("address")?.trim() ?? "";
  const browseMode = isDashboardBrowse(searchParams);

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

  if (token) {
    return <PhygitalRouteShell token={token} modeLabel="Card" />;
  }

  if (address) {
    return (
      <PhygitalRouteShell modeLabel="Card" layout="gallery">
        <PhygitalByAddressHome
          tokenAddress={address}
          surface="card"
          renderHome={({ token: loaded }) => (
            <CardHome token={loaded} browseMode={browseMode} />
          )}
        />
      </PhygitalRouteShell>
    );
  }

  return (
    <PhygitalRouteShell modeLabel="Card">
      <PhygitalNfcApp
        surface="card"
        copy={CARD_NFC_COPY}
        renderHome={({ token: loaded, liveConfirmed }) => (
          <CardHome token={loaded} liveConfirmed={liveConfirmed} />
        )}
      />
    </PhygitalRouteShell>
  );
}

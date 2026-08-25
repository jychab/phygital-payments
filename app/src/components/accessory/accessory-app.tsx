"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Nfc } from "lucide-react";

import { AccessoryHome } from "@/components/accessory/accessory-home";
import { GateMessage } from "@/components/layout/gate-message";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { LoadingStatus } from "@/components/shared/loading-status";
import { PhygitalNfcApp } from "@/components/phygital/phygital-nfc-app";
import { usePhygitalTokenByAddress } from "@/hooks/accessory/use-phygital-token";
import { useEnsurePhygitalSurface } from "@/hooks/phygital/use-ensure-phygital-surface";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { isDashboardBrowse } from "@/lib/journey";
import { toUserErrorMessage } from "@/lib/user-errors";

const PhygitalRouteShell = dynamic(
  () =>
    import("@/components/phygital/phygital-route-shell").then(
      (m) => m.PhygitalRouteShell,
    ),
  { ssr: false, loading: () => <EmbedBoot /> },
);

const ACCESSORY_NFC_COPY = {
  inAppCheck: "To check an accessory, open this page in Safari or Chrome.",
  holdBody: "Hold your accessory to the back of this phone.",
  notSetUp: "This accessory isn’t set up yet.",
};

/**
 * Route `/accessory` — Hold to Check, signed NFC URL, or wallet finish.
 * Tokens with a linked mint redirect to `/card`.
 * Authenticity does not mount Privy; Pay loads Privy only when opened.
 */
export function AccessoryApp() {
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
    return <PhygitalRouteShell token={token} modeLabel="Accessory" />;
  }

  if (address) {
    return (
      <AccessoryAddressRoute address={address} browseMode={browseMode} />
    );
  }

  return (
    <PhygitalRouteShell modeLabel="Accessory">
      <PhygitalNfcApp
        surface="accessory"
        copy={ACCESSORY_NFC_COPY}
        renderHome={({ token: loaded, liveConfirmed }) => (
          <AccessoryHome token={loaded} liveConfirmed={liveConfirmed} />
        )}
      />
    </PhygitalRouteShell>
  );
}

/** `?address=` — browse from Collection, or deep link into task home. */
function AccessoryAddressRoute({
  address,
  browseMode,
}: {
  address: string;
  browseMode: boolean;
}) {
  const tokenQuery = usePhygitalTokenByAddress(address);
  const mismatch = useEnsurePhygitalSurface(tokenQuery.data, "accessory");

  if (tokenQuery.isLoading || mismatch) {
    return (
      <PhygitalRouteShell
        modeLabel="Accessory"
        layout={browseMode ? "gallery" : "compact"}
      >
        <LoadingStatus label="Loading…" />
      </PhygitalRouteShell>
    );
  }

  if (tokenQuery.isError || !tokenQuery.data) {
    return (
      <PhygitalRouteShell
        modeLabel="Accessory"
        layout={browseMode ? "gallery" : "compact"}
      >
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title="Couldn’t load item"
          body={toUserErrorMessage(
            tokenQuery.error,
            "This item may no longer exist on chain.",
          )}
        />
      </PhygitalRouteShell>
    );
  }

  return (
    <PhygitalRouteShell
      modeLabel="Accessory"
      layout={browseMode ? "gallery" : "compact"}
    >
      <AccessoryHome token={tokenQuery.data} browseMode={browseMode} />
    </PhygitalRouteShell>
  );
}

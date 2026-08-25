"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Nfc } from "lucide-react";

import { AccessoryHome } from "@/components/accessory/accessory-home";
import { GateMessage } from "@/components/layout/gate-message";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { LoadingStatus } from "@/components/shared/loading-status";
import { PhygitalNfcApp } from "@/components/phygital/phygital-nfc-app";
import { usePhygitalTokenByAddress } from "@/hooks/accessory/use-phygital-token";
import { useEnsurePhygitalSurface } from "@/hooks/phygital/use-ensure-phygital-surface";
import { useAccessoryPayOpen } from "@/hooks/accessory/use-accessory-pay-open";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { isDashboardBrowse } from "@/lib/journey";
import { takeDiscovery } from "@/lib/phygital/discovery-handoff";
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
 * Route `/accessory` — WebAuthn/NFC first; wallet only for claim finish + Pay.
 * Confirmed badge requires tap-param verify or WebAuthn — never sessionStorage.
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

  return <AccessoryNfcRoute />;
}

function AccessoryNfcRoute() {
  const [{ open: payOpen, mode: payMode }] = useAccessoryPayOpen();
  // Hold to Pay / paste setup are API-key only — no Connect chip.
  const walletActions =
    payOpen && payMode === "manage" ? ("full" as const) : ("hidden" as const);

  return (
    <PhygitalRouteShell modeLabel="Accessory" walletActions={walletActions}>
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

/**
 * `?address=` — Collection browse, deep link, or Pay resume.
 * Confirmed only if tap params still verify (kept on Pay open) or user Holds.
 */
function AccessoryAddressRoute({
  address,
  browseMode,
}: {
  address: string;
  browseMode: boolean;
}) {
  const [{ open: payOpen, mode: payMode }] = useAccessoryPayOpen();
  const consumedHandoff = useRef(false);
  if (!browseMode && !consumedHandoff.current) {
    // Clear passkey-only stash; never used for Confirmed.
    takeDiscovery("accessory");
    consumedHandoff.current = true;
  }
  const tokenQuery = usePhygitalTokenByAddress(address);
  const mismatch = useEnsurePhygitalSurface(tokenQuery.data, "accessory");
  const walletActions =
    !browseMode && payOpen && payMode === "manage"
      ? ("full" as const)
      : ("hidden" as const);

  if (tokenQuery.isLoading || mismatch) {
    return (
      <PhygitalRouteShell
        modeLabel="Accessory"
        layout={browseMode ? "gallery" : "compact"}
        walletActions={walletActions}
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
        walletActions={walletActions}
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
      walletActions={walletActions}
    >
      <AccessoryHome token={tokenQuery.data} browseMode={browseMode} />
    </PhygitalRouteShell>
  );
}

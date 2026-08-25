"use client";

import { useState } from "react";

import { ClaimPanel } from "@/components/claim/claim-panel";
import { CardPanel } from "@/components/card/card-panel";
import { BackToDashboard } from "@/components/shared/back-to-dashboard";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { useHoldToCheck } from "@/hooks/phygital/use-hold-to-check";
import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { isUnclaimedToken, type PhygitalToken } from "@/lib/phygital/token";
import { cn } from "@/lib/utils";

/** Card home after a check or claim. Authenticate and claim only — no Pay. */
export function CardHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
  browseMode = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  browseMode?: boolean;
}) {
  const {
    liveConfirmed,
    pending,
    holdError,
    showInAppGate,
    holdToCheck,
  } = useHoldToCheck(token, liveConfirmedProp);
  const [showClaim, setShowClaim] = useState(false);

  if (showInAppGate) {
    return (
      <InAppBrowserGate body="To check a card, open this page in Safari or Chrome." />
    );
  }

  if (showClaim) {
    return (
      <div className={cn(galleryAnimate.fade)}>
        <ClaimPanel
          token={token}
          unclaimed={isUnclaimedToken(token)}
          onBack={() => setShowClaim(false)}
        />
      </div>
    );
  }

  if (pending) {
    return (
      <NfcHoldStatus
        size="lg"
        busy
        title={copy.holdStill}
        body={copy.holdStillBody}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {browseMode ? <BackToDashboard /> : null}
      <CardPanel
        token={token}
        liveConfirmed={liveConfirmed}
        holdError={holdError}
        browseMode={browseMode}
        onHoldToCheck={() => void holdToCheck()}
        onClaim={browseMode ? undefined : () => setShowClaim(true)}
      />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { AuthenticCardPanel } from "@/components/card/authentic-card-panel";
import { WalletBusyStatus } from "@/components/layout/gate-message";
import { useAuthenticateAccessory } from "@/hooks/card/use-authenticate-accessory";
import { isUnclaimedToken, type PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";

const ClaimPanel = dynamic(
  () =>
    import("@/components/accessory/claim-panel").then((m) => m.ClaimPanel),
  { loading: () => <WalletBusyStatus connecting={false} /> },
);

export function CardHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}) {
  const { authenticate, pending } = useAuthenticateAccessory();

  const [liveConfirmed, setLiveConfirmed] = useState(liveConfirmedProp);
  const [showClaim, setShowClaim] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);

  async function onHoldToCheck() {
    setHoldError(null);
    try {
      await authenticate({ expectedPublicKey: token.secp256r1PublicKey });
      setLiveConfirmed(true);
    } catch (err) {
      setHoldError(
        toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        ),
      );
    }
  }

  if (showClaim) {
    return (
      <ClaimPanel
        token={token}
        unclaimed={isUnclaimedToken(token)}
        onBack={() => setShowClaim(false)}
        onClaimed={() => {
          setShowClaim(false);
          setLiveConfirmed(true);
        }}
      />
    );
  }

  if (pending) {
    return (
      <NfcHoldStatus
        size="lg"
        busy
        title="Hold Still…"
        body="Keep holding until it reads."
      />
    );
  }

  return (
    <AuthenticCardPanel
      token={token}
      liveConfirmed={liveConfirmed}
      holdError={holdError}
      onHoldToCheck={() => void onHoldToCheck()}
      onClaim={() => setShowClaim(true)}
    />
  );
}

"use client";

import { useState } from "react";
import { address as toAddress } from "@solana/kit";

import { AuthenticAccessoryPanel } from "@/components/accessory/authentic-accessory-panel";
import { ClaimPanel } from "@/components/accessory/claim-panel";
import { useAuthenticateAccessory } from "@/hooks/accessory/use-authenticate-accessory";
import { isUnclaimedToken, type PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";

/**
 * Authentic home after a check or claim.
 */
export function AccessoryHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
  showCollectible = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  /** `/cards` only — `/` never looks up a linked mint. */
  showCollectible?: boolean;
}) {
  const { authenticate, pending } = useAuthenticateAccessory();

  const [liveConfirmed, setLiveConfirmed] = useState(liveConfirmedProp);
  const [showClaim, setShowClaim] = useState(false);
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);
  const [holdError, setHoldError] = useState<string | null>(null);

  const viewToken = claimedOwner
    ? { ...token, currentOwner: toAddress(claimedOwner) }
    : token;

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
        token={viewToken}
        unclaimed={isUnclaimedToken(viewToken)}
        onBack={() => setShowClaim(false)}
        onClaimed={(owner) => {
          setClaimedOwner(owner);
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
    <AuthenticAccessoryPanel
      token={viewToken}
      liveConfirmed={liveConfirmed}
      showCollectible={showCollectible}
      holdError={holdError}
      onHoldToCheck={() => void onHoldToCheck()}
      onClaim={() => setShowClaim(true)}
    />
  );
}

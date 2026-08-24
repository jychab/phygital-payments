"use client";

import { useState } from "react";

import { AuthenticCardPanel } from "@/components/card/authentic-card-panel";
import { ClaimPanel } from "@/components/phygital/claim-panel";
import { CheckingStatus, GateMessage } from "@/components/layout/gate-message";
import { WalletHome } from "@/components/wallet/wallet-home";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { accessoryTapView } from "@/lib/phygital/home-view";
import { isUnclaimedToken, type PhygitalToken } from "@/lib/phygital/token";
import { CircleAlert } from "lucide-react";

export function AccessoryTapFlow({ token }: { token: PhygitalToken }) {
  const { session, ready, signIn } = useSmartWallet();
  const [claimed, setClaimed] = useState(false);
  const [showClaim, setShowClaim] = useState(false);

  if (!ready) return <CheckingStatus />;

  const branch = claimed
    ? "wallet"
    : accessoryTapView(token, session?.vaultPda ?? null);

  if (branch === "unsupported") {
    return (
      <GateMessage
        icon={<CircleAlert className="size-5 text-muted-foreground" />}
        title="Not a wallet accessory"
        body="This accessory isn’t set up for this app."
      />
    );
  }

  if (branch === "claim") {
    if (showClaim) {
      return (
        <ClaimPanel
          token={token}
          unclaimed={isUnclaimedToken(token)}
          fromVerifiedTap
          onBack={() => setShowClaim(false)}
          onClaimed={() => {
            setClaimed(true);
            setShowClaim(false);
          }}
        />
      );
    }
    return (
      <AuthenticCardPanel
        token={token}
        liveConfirmed
        onClaim={() => setShowClaim(true)}
      />
    );
  }

  if (branch === "signed-out") {
    return (
      <AuthenticCardPanel
        token={token}
        liveConfirmed
        onSignIn={signIn}
      />
    );
  }

  if (branch === "foreign-owner") {
    return <AuthenticCardPanel token={token} liveConfirmed />;
  }

  return <WalletHome focusedAccessory={token} />;
}

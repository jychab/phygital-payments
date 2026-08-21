"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { AuthenticAccessoryPanel } from "@/components/accessory/authentic-accessory-panel";
import { ClaimPanel } from "@/components/accessory/claim-panel";
import { PayScreen } from "@/components/pay/pay-screen";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { PrivyGate } from "@/app/privy-wallet-root";
import { CenteredStatus } from "@/components/layout/gate-message";
import { useAccessoryPayOpen } from "@/hooks/accessory/use-accessory-pay-open";
import { useAuthenticateAccessory } from "@/hooks/accessory/use-authenticate-accessory";
import { usePreauthRequired } from "@/hooks/pay/use-preauth-required";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";

/**
 * Authentic home after a check or claim. Pay loads Privy only when opened.
 */
export function AccessoryHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}) {
  const inApp = useIsInAppBrowser();
  const { authenticate, pending } = useAuthenticateAccessory();
  const [showPay, setShowPay] = useAccessoryPayOpen();
  const owner = String(token.currentOwner);
  const canPay = token.isLocked && tokenAllowsPay(token);
  const requiredQuery = usePreauthRequired(canPay ? owner : null);
  const confirmationRequired = requiredQuery.data?.required === true;

  const [liveConfirmed, setLiveConfirmed] = useState(liveConfirmedProp);
  const [showClaim, setShowClaim] = useState(false);
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);

  async function onHoldToCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
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

  if (showInAppGate) {
    return (
      <InAppBrowserGate body="To check an accessory, open this page in Safari or Chrome." />
    );
  }

  if (showClaim) {
    return (
      <ClaimPanel
        token={token}
        unclaimed={isUnclaimedToken(token)}
        onBack={() => setShowClaim(false)}
      />
    );
  }

  if (showPay) {
    return (
      <PrivyGate
        fallback={
          <CenteredStatus>
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading Pay…</p>
          </CenteredStatus>
        }
      >
        <WalletSyncGate linkedOwner={owner}>
          <PayScreen
            owner={owner}
            tokenAddress={String(token.address)}
            onExit={() => setShowPay(false)}
          />
        </WalletSyncGate>
      </PrivyGate>
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
      token={token}
      liveConfirmed={liveConfirmed}
      holdError={holdError}
      onHoldToCheck={() => void onHoldToCheck()}
      onClaim={() => setShowClaim(true)}
      onPay={canPay ? () => setShowPay(true) : undefined}
      payLabel={confirmationRequired ? "Pay" : "Pay Settings"}
    />
  );
}

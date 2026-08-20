"use client";

import { useState } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { LoaderCircle, ShieldAlert } from "lucide-react";

import { AuthenticDevicePanel } from "@/components/device/authentic-device-panel";
import { ClaimPanel } from "@/components/device/claim-panel";
import { PayScreen } from "@/components/pay/pay-screen";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { PrivyGate } from "@/app/privy-wallet-root";
import {
  CenteredStatus,
  GateMessage,
} from "@/components/layout/gate-message";
import { useDevicePayOpen } from "@/hooks/device/use-device-pay-open";
import { usePhygitalTokenByAddress } from "@/hooks/device/use-phygital-token";
import { useAuthenticateDevice } from "@/hooks/device/use-authenticate-device";
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
 * `/device?owner=&phygital=` — load the on-chain token, then Authentic.
 */
export function DeviceHomeByAddress({
  tokenAddress,
}: {
  owner: string;
  tokenAddress: string;
}) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalTokenByAddress(tokenAddress);

  if (isRestoring || tokenQuery.isLoading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Checking…</p>
      </CenteredStatus>
    );
  }

  if (tokenQuery.isError || !tokenQuery.data) {
    return (
      <GateMessage
        icon={<ShieldAlert className="size-5 text-destructive" />}
        title="Not Set Up"
        body={toUserErrorMessage(
          tokenQuery.error,
          "This device isn’t set up yet.",
        )}
        destructive
      />
    );
  }

  return <DeviceHome token={tokenQuery.data} />;
}

/**
 * Authentic home after a check or claim. Pay loads Privy only when opened.
 */
export function DeviceHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}) {
  const inApp = useIsInAppBrowser();
  const { authenticate, pending } = useAuthenticateDevice();
  const [showPay, setShowPay] = useDevicePayOpen();

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
      <InAppBrowserGate body="To check a device, open this page in Safari or Chrome." />
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
    const owner = String(token.currentOwner);
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
    <AuthenticDevicePanel
      token={token}
      liveConfirmed={liveConfirmed}
      holdError={holdError}
      onHoldToCheck={() => void onHoldToCheck()}
      onClaim={() => setShowClaim(true)}
      onPay={tokenAllowsPay(token) ? () => setShowPay(true) : undefined}
    />
  );
}

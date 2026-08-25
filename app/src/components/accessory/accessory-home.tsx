"use client";

import { useState } from "react";

import { AuthenticAccessoryPanel } from "@/components/accessory/authentic-accessory-panel";
import { ClaimPanel } from "@/components/claim/claim-panel";
import { PayScreen } from "@/components/pay/pay-screen";
import { PastePayKeyPanel } from "@/components/pay/paste-pay-key-panel";
import { ConnectGate } from "@/components/shared/connect-gate";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { BackLink } from "@/components/shared/back-link";
import { BackToCollection } from "@/components/shared/back-to-collection";
import { PrivyGate } from "@/app/privy-wallet-root";
import { LoadingStatus } from "@/components/shared/loading-status";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import {
  useAccessoryPayOpen,
  type AccessoryPayMode,
} from "@/hooks/accessory/use-accessory-pay-open";
import { useHoldToCheck } from "@/hooks/phygital/use-hold-to-check";
import { usePreauthRequired } from "@/hooks/pay/use-preauth-required";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { copy } from "@/lib/copy/phygital";
import { shortAddress } from "@/lib/utils";

/**
 * Accessory task home after a check, claim, or Collection open.
 *
 * WebAuthn-first: authenticity + Hold to Pay never mount Privy.
 * Manage / setup CTAs warm Privy only when Connect or signing is needed.
 * Collection (`fromCollection`) shows Back; Confirmed only when session
 * matches the linked owner (see CollectionVerifiedSeed).
 */
export function AccessoryHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
  fromCollection = false,
}: {
  token: PhygitalToken;
  /**
   * True when parent proved via WebAuthn/tap, or CollectionVerifiedSeed
   * confirmed the connected wallet owns this token. Never from URL alone.
   */
  liveConfirmed?: boolean;
  /** Opened from Collection hub (`from=collection`) — Back link only. */
  fromCollection?: boolean;
}) {
  const {
    liveConfirmed,
    pending,
    holdError,
    showInAppGate,
    holdToCheck,
  } = useHoldToCheck(token, liveConfirmedProp);
  const [{ open: showPay, mode: payMode }, setShowPay] = useAccessoryPayOpen();
  const [showClaim, setShowClaim] = useState(false);

  const owner = String(token.currentOwner);
  const canPay = token.isLocked && tokenAllowsPay(token);

  function openPay(mode: AccessoryPayMode) {
    setShowPay({
      tokenAddress: String(token.address),
      passkey: token.secp256r1PublicKey,
      surface: "accessory",
      mode,
    });
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

  if (showPay && payMode === "hold") {
    return (
      <PayScreen
        intent="hold"
        owner={owner}
        tokenAddress={String(token.address)}
        onExit={() => setShowPay(false)}
        onNeedSetup={() => openPay("setup")}
        onNeedManage={() => openPay("manage")}
      />
    );
  }

  if (showPay && payMode === "setup") {
    return (
      <PastePayKeyPanel
        owner={owner}
        onBack={() => setShowPay(false)}
        onStored={() => openPay("hold")}
        onNeedWallet={() => openPay("manage")}
      />
    );
  }

  if (showPay && payMode === "manage") {
    return (
      <PrivyGate fallback={<LoadingStatus label="Loading Pay…" />}>
        <AccessoryManagePayEntry
          owner={owner}
          tokenAddress={String(token.address)}
          onExit={() => setShowPay(false)}
        />
      </PrivyGate>
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
      {fromCollection ? <BackToCollection /> : null}
      <AuthenticAccessoryPanel
        token={token}
        liveConfirmed={liveConfirmed}
        fromCollection={fromCollection}
        holdError={holdError}
        onHoldToCheck={() => void holdToCheck()}
        onClaim={() => setShowClaim(true)}
        payAction={
          canPay ? (
            <AccessoryPayCta
              owner={owner}
              onOpenHold={() => openPay("hold")}
              onOpenSetup={() => openPay("setup")}
              onOpenManage={() => openPay("manage")}
            />
          ) : undefined
        }
      />
    </div>
  );
}

/**
 * Authenticity primary CTA matrix (Confirm / key / session).
 * Hold + paste-setup never wrap Privy; Manage does when Connect is needed.
 */
function AccessoryPayCta({
  owner,
  onOpenHold,
  onOpenSetup,
  onOpenManage,
}: {
  owner: string;
  onOpenHold: () => void;
  onOpenSetup: () => void;
  onOpenManage: () => void;
}) {
  const preauth = usePreauthRequired(owner);
  const required = preauth.data?.required === true;
  const keyOk = preauth.data?.keyOk === true;

  if (preauth.isPending) {
    return (
      <Button type="button" size="lg" className="w-full" disabled>
        …
      </Button>
    );
  }

  if (required && keyOk) {
    return (
      <Button type="button" size="lg" className="w-full" onClick={onOpenHold}>
        Pay
      </Button>
    );
  }

  if (required && !keyOk) {
    return (
      <Button type="button" size="lg" className="w-full" onClick={onOpenSetup}>
        Set up Revibase Pay
      </Button>
    );
  }

  return (
    <PrivyGate
      fallback={
        <Button type="button" size="lg" className="w-full" disabled>
          Connect linked wallet
        </Button>
      }
    >
      <ManagePayButton
        label={{
          connected: "Manage Pay Settings",
          disconnected: "Connect linked wallet",
        }}
        onOpen={onOpenManage}
      />
    </PrivyGate>
  );
}

function ManagePayButton({
  label,
  onOpen,
}: {
  label: string | { connected: string; disconnected: string };
  onOpen: () => void;
}) {
  const { isConnected, ready, connect } = useSolanaAddress();
  const text =
    typeof label === "string"
      ? label
      : isConnected
        ? label.connected
        : label.disconnected;

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={!ready}
      onClick={() => {
        onOpen();
        if (ready && !isConnected) connect();
      }}
    >
      {text}
    </Button>
  );
}

/** Manage Pay entry — ConnectGate if modal dismissed; WalletSync for signing. */
function AccessoryManagePayEntry({
  owner,
  tokenAddress,
  onExit,
}: {
  owner: string;
  tokenAddress: string;
  onExit: () => void;
}) {
  const { address, isConnected, ready, connect } = useSolanaAddress();

  if (!ready) {
    return <LoadingStatus label="Loading wallet…" />;
  }

  if (!isConnected || !address) {
    return (
      <div className="flex flex-1 flex-col">
        <BackLink onClick={onExit} />
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <ConnectGate
            title="Connect linked wallet"
            body={`Connect ${shortAddress(owner)} to manage Pay on this accessory.`}
            onConnect={connect}
          />
        </div>
      </div>
    );
  }

  return (
    <WalletSyncGate linkedOwner={owner}>
      <PayScreen owner={owner} tokenAddress={tokenAddress} onExit={onExit} />
    </WalletSyncGate>
  );
}

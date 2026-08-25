"use client";

import { useEffect, useState } from "react";

import { AuthenticAccessoryPanel } from "@/components/accessory/authentic-accessory-panel";
import { ClaimPanel } from "@/components/claim/claim-panel";
import {
  HoldToPayHint,
  HoldToPayIdleActions,
  HoldToPayPhaseView,
} from "@/components/pay/hold-to-pay-panel";
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
import { useHoldToPay } from "@/hooks/pay/use-hold-to-pay";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { usePreauthRequired } from "@/hooks/pay/use-preauth-required";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { copy, payCopy } from "@/lib/copy/phygital";
import { shortAddress } from "@/lib/utils";

/**
 * Accessory task home after a check, claim, or Collection open.
 *
 * WebAuthn-first: authenticity hosts Hold-to-Pay CTAs (arm Pay in place).
 * Setup / Manage still open full screens. Privy only for Manage Connect.
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

  // Stale `?pay=hold` — Pay arms in place on authenticity now.
  useEffect(() => {
    if (showPay && payMode === "hold") setShowPay(false);
  }, [showPay, payMode, setShowPay]);

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

  if (showPay && payMode === "setup") {
    return (
      <PastePayKeyPanel
        owner={owner}
        onBack={() => setShowPay(false)}
        onStored={() => setShowPay(false)}
        onNeedWallet={() => openPay("manage")}
      />
    );
  }

  if (showPay && payMode === "manage") {
    return (
      <PrivyGate fallback={<LoadingStatus label={payCopy.loading} />}>
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

  if (canPay) {
    return (
      <AccessoryPayHome
        token={token}
        owner={owner}
        liveConfirmed={liveConfirmed}
        fromCollection={fromCollection}
        holdError={holdError}
        onHoldToCheck={() => void holdToCheck()}
        onClaim={() => setShowClaim(true)}
        onOpenSetup={() => openPay("setup")}
        onOpenManage={() => openPay("manage")}
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
      />
    </div>
  );
}

/**
 * Authenticity + real Hold-to-Pay CTAs (arm Pay in place).
 * Window / success phases replace authenticity until Done.
 */
function AccessoryPayHome({
  token,
  owner,
  liveConfirmed,
  fromCollection,
  holdError,
  onHoldToCheck,
  onClaim,
  onOpenSetup,
  onOpenManage,
}: {
  token: PhygitalToken;
  owner: string;
  liveConfirmed: boolean;
  fromCollection: boolean;
  holdError?: string | null;
  onHoldToCheck: () => void;
  onClaim: () => void;
  onOpenSetup: () => void;
  onOpenManage: () => void;
}) {
  const hold = useHoldToPay(owner);
  const delegates = useOwnerPayDelegates(owner, { live: true });

  if (hold.showPhase) {
    return (
      <div className="flex flex-1 flex-col">
        {fromCollection && hold.phase !== "window" ? (
          <BackToCollection />
        ) : null}
        <HoldToPayPhaseView
          phase={hold.phase}
          paid={hold.paid}
          secondsLeft={hold.secondsLeft}
          holdings={delegates.holdings}
          onCancelWindow={() => void hold.onCancelWindow()}
          onReset={hold.resetToIdle}
        />
      </div>
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
        onHoldToCheck={onHoldToCheck}
        onClaim={onClaim}
        payAction={
          <AccessoryIntegratedPayCta
            owner={owner}
            busy={hold.busy}
            onPay={() => void hold.onPay()}
            onOpenSetup={onOpenSetup}
            onOpenManage={onOpenManage}
          />
        }
      />
    </div>
  );
}

/**
 * Confirm / key matrix with real actions — Pay arms preauth; Set up / Manage
 * open full screens. Hold + setup never wrap Privy; Manage does for Connect.
 */
function AccessoryIntegratedPayCta({
  owner,
  busy,
  onPay,
  onOpenSetup,
  onOpenManage,
}: {
  owner: string;
  busy: boolean;
  onPay: () => void;
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

  if (required) {
    return (
      <div className="flex w-full flex-col gap-2.5">
        <p className="text-center text-sm text-muted-foreground">
          <HoldToPayHint confirmationRequired={required} keyReady={keyOk} />
        </p>
        <HoldToPayIdleActions
          confirmationRequired={required}
          keyReady={keyOk}
          busy={busy}
          onPay={onPay}
          onSetupPhone={onOpenSetup}
          onManage={onOpenManage}
        />
      </div>
    );
  }

  return (
    <PrivyGate
      fallback={
        <Button type="button" size="lg" className="w-full" disabled>
          {payCopy.connectLinked}
        </Button>
      }
    >
      <ManagePayButton
        label={{
          connected: payCopy.manage,
          disconnected: payCopy.connectLinked,
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
            title={payCopy.connectLinked}
            body={payCopy.manageConnectBody(shortAddress(owner))}
            onConnect={connect}
          />
        </div>
      </div>
    );
  }

  return (
    <WalletSyncGate linkedOwner={owner}>
      <PayScreen
        intent="manage"
        owner={owner}
        tokenAddress={tokenAddress}
        onExit={onExit}
      />
    </WalletSyncGate>
  );
}

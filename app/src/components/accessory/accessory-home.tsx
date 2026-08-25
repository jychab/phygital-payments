"use client";

import { useState } from "react";

import { AuthenticAccessoryPanel } from "@/components/accessory/authentic-accessory-panel";
import { AccessoryBrowsePanel } from "@/components/accessory/accessory-browse-panel";
import { ClaimPanel } from "@/components/claim/claim-panel";
import { PayScreen } from "@/components/pay/pay-screen";
import { PastePayKeyPanel } from "@/components/pay/paste-pay-key-panel";
import { ConnectGate } from "@/components/shared/connect-gate";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { BackLink } from "@/components/shared/back-link";
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
 * Accessory task home after a check or claim.
 *
 * WebAuthn-first: authenticity + Hold to Pay never mount Privy.
 * Manage / setup CTAs warm Privy only when Connect or signing is needed.
 */
export function AccessoryHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
  browseMode = false,
}: {
  token: PhygitalToken;
  /**
   * True only when parent just proved via WebAuthn or tap-verify in this tree.
   * Never seed from sessionStorage / claim finish / Collection browse.
   */
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
  const [{ open: showPay, mode: payMode }, setShowPay] = useAccessoryPayOpen();
  const [showClaim, setShowClaim] = useState(false);

  const owner = String(token.currentOwner);
  const canPay = !browseMode && token.isLocked && tokenAllowsPay(token);

  function openPay(mode: AccessoryPayMode) {
    setShowPay({
      tokenAddress: String(token.address),
      passkey: token.secp256r1PublicKey,
      surface: "accessory",
      mode,
    });
  }

  if (browseMode) {
    return <AccessoryBrowsePanel token={token} />;
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
    <AuthenticAccessoryPanel
      token={token}
      liveConfirmed={liveConfirmed}
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

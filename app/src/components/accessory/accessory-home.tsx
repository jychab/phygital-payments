"use client";

import { useState } from "react";

import { AuthenticAccessoryPanel } from "@/components/accessory/authentic-accessory-panel";
import { AccessoryBrowsePanel } from "@/components/accessory/accessory-browse-panel";
import { ClaimPanel } from "@/components/claim/claim-panel";
import { PayScreen } from "@/components/pay/pay-screen";
import { ConnectGate } from "@/components/shared/connect-gate";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { BackLink } from "@/components/shared/back-link";
import { PrivyGate } from "@/app/privy-wallet-root";
import { LoadingStatus } from "@/components/shared/loading-status";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { useAccessoryPayOpen } from "@/hooks/accessory/use-accessory-pay-open";
import { useHoldToCheck } from "@/hooks/phygital/use-hold-to-check";
import { usePreauthRequired } from "@/hooks/pay/use-preauth-required";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import {
  tokenAllowsPay,
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { copy } from "@/lib/copy/phygital";

/**
 * Accessory task home after a check or claim.
 *
 * WebAuthn-first: authenticity + claim capture never mount Privy.
 * Pay / connect wallet only after the accessory is already verified — so a
 * wallet in-app browser handoff never blocks NFC/passkey.
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
  const [showPay, setShowPay] = useAccessoryPayOpen();
  const [showClaim, setShowClaim] = useState(false);

  const owner = String(token.currentOwner);
  const canPay = !browseMode && token.isLocked && tokenAllowsPay(token);
  const requiredQuery = usePreauthRequired(canPay ? owner : null);
  const confirmationRequired = requiredQuery.data?.required === true;

  function openPay() {
    setShowPay({
      tokenAddress: String(token.address),
      passkey: token.secp256r1PublicKey,
      surface: "accessory",
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

  if (showPay) {
    return (
      <PrivyGate fallback={<LoadingStatus label="Loading Pay…" />}>
        <AccessoryPayEntry
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
      onPay={canPay ? openPay : undefined}
      payLabel={confirmationRequired ? "Pay" : "Pay Settings"}
    />
  );
}

/** Privy-mounted Pay entry — connect only after authenticity (WebAuthn) is done. */
function AccessoryPayEntry({
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
            title="Connect your wallet"
            body="Connect the wallet linked to this accessory to use Pay. You can open your wallet app — no need to hold the accessory again."
            onConnect={connect}
          />
        </div>
      </div>
    );
  }

  return (
    <WalletSyncGate linkedOwner={owner}>
      <PayScreen
        owner={owner}
        tokenAddress={tokenAddress}
        onExit={onExit}
      />
    </WalletSyncGate>
  );
}

"use client";

import { useState } from "react";

import { AuthenticAccessoryPanel } from "@/components/accessory/authentic-accessory-panel";
import { AccessoryBrowsePanel } from "@/components/accessory/accessory-browse-panel";
import {
  AccessoryOverflowMenu,
  AccessoryToolsPanel,
  type AccessorySubview,
} from "@/components/accessory/accessory-overflow-menu";
import { ClaimPanel } from "@/components/claim/claim-panel";
import { PayScreen } from "@/components/pay/pay-screen";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
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
 * Accessory home after a check or claim.
 * Pay loads Privy only when opened. Browse mode skips Pay/manage/ring.
 */
export function AccessoryHome({
  token,
  liveConfirmed: liveConfirmedProp = false,
  browseMode = false,
  toolsSubview = "main",
  onToolsSubviewChange,
  showOverflowMenu = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  browseMode?: boolean;
  toolsSubview?: AccessorySubview;
  onToolsSubviewChange?: (view: AccessorySubview) => void;
  /** Cold NFC entry — overflow in content when header has no menu. */
  showOverflowMenu?: boolean;
}) {
  const { address, isConnected } = useSolanaAddress();
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
  const canPay =
    !browseMode && token.isLocked && tokenAllowsPay(token);
  const requiredQuery = usePreauthRequired(canPay ? owner : null);
  const confirmationRequired = requiredQuery.data?.required === true;

  if (browseMode) {
    return <AccessoryBrowsePanel token={token} liveConfirmed={liveConfirmed} />;
  }

  if (toolsSubview === "pay" && onToolsSubviewChange && address) {
    return (
      <AccessoryToolsPanel
        owner={address}
        subview="pay"
        onSubviewChange={onToolsSubviewChange}
        tokenAddress={String(token.address)}
      />
    );
  }

  if (toolsSubview === "activity" && onToolsSubviewChange && address) {
    return (
      <AccessoryToolsPanel
        owner={address}
        subview="activity"
        onSubviewChange={onToolsSubviewChange}
      />
    );
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
        title={copy.holdStill}
        body={copy.holdStillBody}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {showOverflowMenu && isConnected && address && onToolsSubviewChange ? (
        <div className="mb-2 flex justify-end">
          <AccessoryOverflowMenu
            owner={address}
            token={token}
            subview={toolsSubview}
            onSubviewChange={onToolsSubviewChange}
          />
        </div>
      ) : null}
      <AuthenticAccessoryPanel
        token={token}
        liveConfirmed={liveConfirmed}
        holdError={holdError}
        onHoldToCheck={() => void holdToCheck()}
        onClaim={() => setShowClaim(true)}
        onPay={canPay ? () => setShowPay(true) : undefined}
        payLabel={confirmationRequired ? "Pay" : "Pay Settings"}
      />
    </div>
  );
}

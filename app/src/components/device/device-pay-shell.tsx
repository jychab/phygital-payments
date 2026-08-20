"use client";

import { useState } from "react";

import { DeviceWalletReady } from "@/components/device/wallet-ready";
import { PayTab } from "@/components/pay/pay-tab";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";

/** Post-claim / owned device: Collect + Pay, Pay opens shared PayTab. */
export function DevicePayShell({
  owner,
  pinnedAsset,
}: {
  owner: string;
  pinnedAsset: string;
}) {
  const [showPay, setShowPay] = useState(false);

  return (
    <WalletSyncGate linkedOwner={owner}>
      {showPay ? (
        <PayTab
          owner={owner}
          pinnedAsset={pinnedAsset}
          onExit={() => setShowPay(false)}
        />
      ) : (
        <DeviceWalletReady owner={owner} onPay={() => setShowPay(true)} />
      )}
    </WalletSyncGate>
  );
}

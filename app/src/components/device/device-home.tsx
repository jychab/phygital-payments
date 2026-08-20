"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { PayScreen } from "@/components/pay/pay-screen";
import { WalletAddressRow } from "@/components/shared/copyable-address";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import { SuccessStatus } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { collectHref } from "@/lib/collect/payment-request";

/**
 * Owned-device home after NFC tap or claim: Collect, or open the shared Pay screen.
 */
export function DeviceHome({
  owner,
  asset,
}: {
  owner: string;
  asset: string;
}) {
  const [showPay, setShowPay] = useState(false);

  return (
    <WalletSyncGate linkedOwner={owner}>
      {showPay ? (
        <PayScreen
          owner={owner}
          asset={asset}
          onExit={() => setShowPay(false)}
        />
      ) : (
        <OwnedDeviceReady owner={owner} onPay={() => setShowPay(true)} />
      )}
    </WalletSyncGate>
  );
}

function OwnedDeviceReady({
  owner,
  onPay,
}: {
  owner: string;
  onPay: () => void;
}) {
  const collectUrl = collectHref({ recipient: owner });

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <SuccessStatus
        icon={<CheckCircle2 className="size-7" />}
        title="Your wallet is ready."
        body="This NFC device is linked to your wallet."
        bodyClassName="max-w-64"
      />

      <WalletAddressRow address={owner} length={4} />

      <div className="mt-auto flex flex-col gap-2.5">
        <Button type="button" size="lg" className="w-full" asChild>
          <Link href={collectUrl}>Collect</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={onPay}
        >
          Pay
        </Button>
      </div>
    </div>
  );
}

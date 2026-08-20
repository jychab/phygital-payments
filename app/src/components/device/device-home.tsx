"use client";

import { useState } from "react";
import Link from "next/link";
import { useIsRestoring } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";

import { PayScreen } from "@/components/pay/pay-screen";
import { WalletAddressRow } from "@/components/shared/copyable-address";
import { WalletSyncGate } from "@/components/shared/wallet-sync-gate";
import {
  CenteredStatus,
  GateMessage,
  SuccessStatus,
} from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { usePhygitalAssetByAddress } from "@/hooks/device/use-phygital-asset";
import { collectHref } from "@/lib/collect/payment-request";
import { assetAllowsPay } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * `/device?owner=&asset=` — load the on-chain asset, then owned-device home.
 */
export function DeviceHomeByAddress({
  owner,
  asset,
}: {
  owner: string;
  asset: string;
}) {
  const isRestoring = useIsRestoring();
  const assetQuery = usePhygitalAssetByAddress(asset);

  if (isRestoring || assetQuery.isLoading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading device…</p>
      </CenteredStatus>
    );
  }

  if (assetQuery.isError || !assetQuery.data) {
    return (
      <GateMessage
        icon={<ShieldAlert className="size-5 text-destructive" />}
        title="NFC device not found"
        body={toUserErrorMessage(
          assetQuery.error,
          "We couldn’t find this NFC device. Try tapping again.",
        )}
        destructive
      />
    );
  }

  return (
    <DeviceHome
      isPayAllowed={assetAllowsPay(assetQuery.data)}
      owner={owner}
      asset={asset}
    />
  );
}

/**
 * Owned-device home after NFC tap or claim: Collect, or open the shared Pay screen.
 */
export function DeviceHome({
  owner,
  asset,
  isPayAllowed,
}: {
  isPayAllowed: boolean;
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
        <OwnedDeviceReady
          isPayAllowed={isPayAllowed}
          owner={owner}
          onPay={() => setShowPay(true)}
        />
      )}
    </WalletSyncGate>
  );
}

function OwnedDeviceReady({
  owner,
  onPay,
  isPayAllowed,
}: {
  isPayAllowed: boolean;
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

      {isPayAllowed ? (
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
      ) : null}
    </div>
  );
}

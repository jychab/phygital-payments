"use client";

import { LoaderCircle, Nfc } from "lucide-react";

import { DeviceWalletReady } from "@/components/device-wallet-ready";
import { CenteredStatus, GateMessage } from "@/components/gate-message";
import { usePaySetupSnapshot } from "@/hooks/use-pay-setup-snapshot";
import { toUserErrorMessage } from "@/lib/payments/user-errors";

export function DeviceWalletReadyLoader({
  owner,
  onSetUpPay,
}: {
  owner: string;
  onSetUpPay?: () => void;
}) {
  const { isPending, isError, error, capSet, verifierSet, next } =
    usePaySetupSnapshot(owner);

  if (isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </CenteredStatus>
    );
  }

  if (isError) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn't load device"
        body={toUserErrorMessage(
          error,
          "Check your connection and try again.",
        )}
        destructive
      />
    );
  }

  return (
    <DeviceWalletReady
      owner={owner}
      capSet={capSet}
      verifierSet={verifierSet}
      onSetUpPay={next ? onSetUpPay : undefined}
    />
  );
}

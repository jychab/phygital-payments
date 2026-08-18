"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle, Nfc } from "lucide-react";

import { DeviceWalletReady } from "@/components/device-wallet-ready";
import { CenteredStatus, GateMessage } from "@/components/gate-message";
import { usePaySetupSnapshot } from "@/hooks/use-pay-setup-snapshot";
import { deviceFinishHrefForStep } from "@/lib/payments/device-finish";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import type { PhygitalAsset } from "@/lib/phygital/asset";

/**
 * Locked, owned device after NFC tap — linked wallet, optional Pay setup.
 */
export function DeviceSetupStatus({ asset }: { asset: PhygitalAsset }) {
  const router = useRouter();
  const owner = asset.currentOwner.toString();
  const snap = usePaySetupSnapshot(owner);

  if (snap.isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading device…</p>
      </CenteredStatus>
    );
  }

  if (snap.isError) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn't load device"
        body={toUserErrorMessage(
          snap.error,
          "Check your connection and try again.",
        )}
        destructive
      />
    );
  }

  return (
    <DeviceWalletReady
      owner={owner}
      capSet={snap.capSet}
      verifierSet={snap.verifierSet}
      onSetUpPay={
        snap.next
          ? () => router.push(deviceFinishHrefForStep(snap.next!, owner))
          : undefined
      }
    />
  );
}

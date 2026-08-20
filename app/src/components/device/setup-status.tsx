"use client";

import { DevicePayShell } from "@/components/device/device-pay-shell";
import type { PhygitalAsset } from "@/lib/phygital/asset";

/** Locked, owned device after NFC tap — Collect and Pay. */
export function DeviceSetupStatus({ asset }: { asset: PhygitalAsset }) {
  return (
    <DevicePayShell
      owner={asset.currentOwner.toString()}
      pinnedAsset={String(asset.asset)}
    />
  );
}

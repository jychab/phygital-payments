"use client";

import { type ReactNode } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import {
  LoaderCircle,
  Nfc,
  ShieldAlert,
} from "lucide-react";

import { AppCard, AppShell } from "@/components/layout/app-shell";
import { ClaimPanel } from "@/components/device/claim-panel";
import { DeviceSetupStatus } from "@/components/device/setup-status";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { usePhygitalAsset } from "@/hooks/device/use-phygital-asset";
import { useTapVerify } from "@/hooks/device/use-tap-verify";
import { isUnclaimedAsset } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * Route `/device` — NFC tap, verify, then claim or Pay status (no Privy).
 */
export function DeviceTapApp() {
  const embedded = useIsEmbedded();
  const { pk, hasTapProof, verify, verifyPending, verifyError } = useTapVerify();

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    return (
      <EmbedError
        title="Can’t open here"
        body="Open this on your phone instead of inside this page."
      />
    );
  }

  if (!hasTapProof) {
    return (
      <Shell>
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title="Hold NFC device to this phone"
          body="This page only opens from an NFC tap. Hold your device flat against the back of your phone."
        />
      </Shell>
    );
  }

  if (verifyPending || verify === "pending") {
    return (
      <Shell>
        <CenteredStatus>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking NFC device…</p>
        </CenteredStatus>
      </Shell>
    );
  }

  if (verify !== "verified") {
    return (
      <Shell>
        <GateMessage
          icon={<ShieldAlert className="size-5 text-destructive" />}
          title="Verification failed or expired."
          body={toUserErrorMessage(
            verifyError,
            "Hold flat against the back of your phone and try again.",
          )}
          destructive
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <AssetFlow pk={pk} />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <AppShell walletActions="hidden" modeLabel="Device">
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}

function AssetFlow({ pk }: { pk: string | null }) {
  const isRestoring = useIsRestoring();
  const assetQuery = usePhygitalAsset(pk);

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

  const asset = assetQuery.data;

  if (isUnclaimedAsset(asset) || !asset.isLocked) {
    return (
      <ClaimPanel
        asset={asset}
        unclaimed={isUnclaimedAsset(asset)}
      />
    );
  }

  return <DeviceSetupStatus asset={asset} />;
}

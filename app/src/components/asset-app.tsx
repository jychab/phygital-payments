"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import {
  LoaderCircle,
  Lock,
  Nfc,
  ShieldAlert,
  ShieldCheck,
  Unlock,
} from "lucide-react";

import { AppCard, AppShell } from "@/components/app-shell";
import { ClaimPanel } from "@/components/claim-panel";
import { CopyableAddress } from "@/components/copyable-address";
import { EmbedBoot, EmbedError } from "@/components/embed-error";
import { CenteredStatus, GateMessage, SuccessStatus } from "@/components/gate-message";
import { Button } from "@/components/ui/button";
import { useIsEmbedded } from "@/hooks/use-is-embedded";
import { usePhygitalAsset } from "@/hooks/use-phygital-asset";
import { useTapVerify } from "@/hooks/use-tap-verify";
import { isUnclaimedAsset, type PhygitalAsset } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { shortAddress } from "@/lib/utils";

/**
 * NFC tap → verify → Safari NFC claim handoff → owner status.
 * Everyday Pay and spending limits live on Home.
 */
export function AssetApp() {
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
          title="Couldn’t check this NFC device"
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
  const assetQuery = usePhygitalAsset(pk);

  if (assetQuery.isPending) {
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

  return <DeviceStatus asset={asset} />;
}

function DeviceStatus({ asset }: { asset: PhygitalAsset }) {
  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <SuccessStatus
        icon={<ShieldCheck className="size-7" />}
        title="Verified"
        body="This NFC tap checked out. Spending limits and Ready to pay are on Home."
        bodyClassName="max-w-64"
      />

      <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/25 px-4 py-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Owner</span>
          <CopyableAddress
            address={asset.currentOwner.toString()}
            length={6}
            label="owner wallet"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Status</span>
          <span className="inline-flex items-center gap-1.5 text-foreground">
            {asset.isLocked ? (
              <Lock className="size-3.5 text-muted-foreground" />
            ) : (
              <Unlock className="size-3.5 text-muted-foreground" />
            )}
            {asset.isLocked ? "Locked" : "Unlocked"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Device</span>
          <span className="font-mono text-foreground">
            {shortAddress(asset.secp256r1PublicKey, 4)}
          </span>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button type="button" size="lg" className="w-full" asChild>
          <Link href="/">Open Home</Link>
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          On Home: set a spending limit, then Ready to pay.
        </p>
      </div>
    </div>
  );
}

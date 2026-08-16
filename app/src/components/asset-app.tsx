"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CheckCircle2,
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
import { CenteredStatus, GateMessage } from "@/components/gate-message";
import { Button } from "@/components/ui/button";
import { useIsEmbedded } from "@/hooks/use-is-embedded";
import { usePhygitalAsset } from "@/hooks/use-phygital-asset";
import { useTapVerify } from "@/hooks/use-tap-verify";
import { isUnclaimedAsset, type PhygitalAsset } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { shortAddress } from "@/lib/utils";

/**
 * NFC tap only — no Privy. Verify tap → claim if needed → show owner status.
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
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                window.location.href = "/asset";
              }}
            >
              Try again
            </Button>
          }
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
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);

  if (assetQuery.isPending && !claimedOwner) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading device…</p>
      </CenteredStatus>
    );
  }

  if ((assetQuery.isError || !assetQuery.data) && !claimedOwner) {
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

  if (claimedOwner) {
    return <DeviceStatus ownerAddress={claimedOwner} justClaimed />;
  }

  const asset = assetQuery.data;
  if (!asset) return null;

  if (isUnclaimedAsset(asset) || !asset.isLocked) {
    return (
      <ClaimPanel
        asset={asset}
        unclaimed={isUnclaimedAsset(asset)}
        onClaimed={(owner) => setClaimedOwner(owner)}
      />
    );
  }

  return <DeviceStatus ownerAddress={asset.currentOwner.toString()} asset={asset} />;
}

function DeviceStatus({
  ownerAddress,
  justClaimed = false,
  asset,
}: {
  ownerAddress: string;
  justClaimed?: boolean;
  asset?: PhygitalAsset;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <div className="space-y-1.5 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          {justClaimed ? (
            <CheckCircle2 className="size-7" />
          ) : (
            <ShieldCheck className="size-7" />
          )}
        </div>
        <p className="text-base font-medium text-foreground">
          {justClaimed ? "Device added" : "Verified"}
        </p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          {justClaimed
            ? "Next, open Home to set a spending limit and pay with this wallet."
            : "This NFC tap checked out. Spending limits and Ready to pay are on Home."}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/25 px-4 py-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Owner</span>
          <CopyableAddress
            address={ownerAddress}
            length={6}
            label="owner wallet"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Status</span>
          <span className="inline-flex items-center gap-1.5 text-foreground">
            {asset?.isLocked ? <Lock className="size-3.5 text-muted-foreground" />: <Unlock className="size-3.5 text-muted-foreground" />}
            {asset?.isLocked ? "Locked" : "Unlocked"}
          </span>
        </div>
        {asset ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Device</span>
            <span className="font-mono text-foreground">
              {shortAddress(asset.secp256r1PublicKey, 4)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button type="button" className="w-full" asChild>
          <Link href="/">Open Home</Link>
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          On Home: set a spending limit, then Ready to pay.
        </p>
      </div>
    </div>
  );
}

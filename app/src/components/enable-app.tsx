"use client";

import { useState, type ReactNode } from "react";
import { LoaderCircle, Nfc, ShieldAlert, Wallet } from "lucide-react";

import { AppCard, AppShell } from "@/components/app-shell";
import { ClaimPanel } from "@/components/claim-panel";
import { EmbedBoot, EmbedError } from "@/components/embed-error";
import { CenteredStatus, GateMessage } from "@/components/enable/gate-message";
import { LimitPanel } from "@/components/enable/limit-panel";
import { PayPanel } from "@/components/enable/pay-panel";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { useIsEmbedded } from "@/hooks/use-is-embedded";
import { usePhygitalAsset } from "@/hooks/use-phygital-asset";
import { useTapVerify } from "@/hooks/use-tap-verify";
import { isUnclaimedAsset } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/**
 * Enable Pay — tap-gated setup then everyday pay.
 * verify → claim if needed → limit (connect-if-needed) → pay.
 */
export function EnableApp() {
  const embedded = useIsEmbedded();
  const { address: walletAddress } = useSolanaAddress();
  const { pk, hasTapProof, verify, verifyPending, verifyError } = useTapVerify();

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    return (
      <EmbedError
        title="Can’t open here"
        body="Open Enable Pay on your phone instead of inside this page."
      />
    );
  }

  if (!hasTapProof) {
    return (
      <Shell recipient={walletAddress}>
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title="Hold NFC device to this phone"
          body="Hold your NFC device to this phone to turn on Pay. We’ll check it’s really yours."
        />
      </Shell>
    );
  }

  if (verifyPending || verify === "pending") {
    return (
      <Shell recipient={walletAddress}>
        <CenteredStatus>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Setting up Pay…</p>
        </CenteredStatus>
      </Shell>
    );
  }

  if (verify !== "verified") {
    return (
      <Shell recipient={walletAddress}>
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
                window.location.href = "/enable";
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
    <Shell recipient={walletAddress}>
      <OwnedGate pk={pk} />
    </Shell>
  );
}

function Shell({
  recipient,
  children,
}: {
  recipient: string | null;
  children: ReactNode;
}) {
  return (
    <AppShell recipient={recipient} modeLabel="Pay">
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}

function OwnedGate({ pk }: { pk: string | null }) {
  const { address: connectedAddress } = useSolanaAddress();
  const assetQuery = usePhygitalAsset(pk);
  const [forceLimit, setForceLimit] = useState(false);
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);

  if (assetQuery.isPending && !claimedOwner) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Setting up Pay…</p>
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
    return (
      <OwnerPayFlow
        ownerAddress={claimedOwner}
        forceLimit={forceLimit}
        onEditLimit={() => setForceLimit(true)}
        onLimitDone={() => setForceLimit(false)}
      />
    );
  }

  const asset = assetQuery.data;
  if (!asset) return null;

  const onChainOwner = asset.currentOwner.toString();
  const connectedIsOwner = connectedAddress === onChainOwner;

  if (isUnclaimedAsset(asset) || (!asset.isLocked && !connectedIsOwner)) {
    return (
      <ClaimPanel
        asset={asset}
        unclaimed={isUnclaimedAsset(asset)}
        onClaimed={(recipient) => {
          setClaimedOwner(recipient);
          setForceLimit(true);
        }}
      />
    );
  }

  if (asset.isLocked && connectedAddress && !connectedIsOwner) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-muted-foreground" />}
        title="NFC device is locked"
        body={`This NFC device belongs to ${shortAddress(onChainOwner)}. Ask them to unlock it before you can add it here.`}
        action={
          <p className="max-w-56 text-xs text-muted-foreground">
            How to unlock: open the NFC device in their vault, unlock it, then
            hold it to this phone again.
          </p>
        }
      />
    );
  }

  return (
    <OwnerPayFlow
      ownerAddress={onChainOwner}
      forceLimit={forceLimit}
      onEditLimit={() => setForceLimit(true)}
      onLimitDone={() => setForceLimit(false)}
    />
  );
}

function OwnerPayFlow({
  ownerAddress,
  forceLimit,
  onEditLimit,
  onLimitDone,
}: {
  ownerAddress: string;
  forceLimit: boolean;
  onEditLimit: () => void;
  onLimitDone: () => void;
}) {
  const { address: connectedAddress, connect, ready } = useSolanaAddress();
  const statusQuery = useDelegateStatus(ownerAddress);
  const status = statusQuery.data;
  const hasLimit =
    !!status?.isProgramAuthorityDelegate && status.delegatedAmountRaw > BigInt(0);

  if (statusQuery.isLoading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Setting up Pay…</p>
      </CenteredStatus>
    );
  }

  if (!hasLimit || forceLimit) {
    return <LimitPanel expectedOwner={ownerAddress} onEnabled={onLimitDone} />;
  }

  if (connectedAddress !== ownerAddress) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-muted-foreground" />}
        title="Connect to pay"
        body={`Connect ${shortAddress(ownerAddress, 4)} to open a spending window.`}
        action={
          <Button type="button" size="sm" disabled={!ready} onClick={connect}>
            {ready ? "Continue" : "Loading…"}
          </Button>
        }
      />
    );
  }

  return <PayPanel onChangeLimit={onEditLimit} />;
}

"use client";

import { useState, type ReactNode } from "react";
import { LoaderCircle, Nfc, ShieldAlert, Wallet } from "lucide-react";

import { AppCard, AppShell } from "@/components/app-shell";
import { ClaimPanel } from "@/components/claim-panel";
import { ConnectPrompt } from "@/components/connect-prompt";
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
 * Flow: verify → sign in → claim if needed → spending limit → ready to pay.
 * Not available inside iframes (embeds only support payment links).
 */
export function EnableApp() {
  const embedded = useIsEmbedded();
  const { address: walletAddress, isConnected } = useSolanaAddress();
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
      <Shell recipient={walletAddress} step="device">
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
      <Shell recipient={walletAddress} step="device">
        <CenteredStatus>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Setting up Pay…</p>
          <p className="text-xs text-muted-foreground/70">Checking your NFC device</p>
        </CenteredStatus>
      </Shell>
    );
  }

  if (verify !== "verified") {
    const body = toUserErrorMessage(
      verifyError,
      "Hold flat against the back of your phone and try again.",
    );
    return (
      <Shell recipient={walletAddress} step="device">
        <GateMessage
          icon={<ShieldAlert className="size-5 text-destructive" />}
          title="Couldn’t check this NFC device"
          body={body}
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

  if (!isConnected || !walletAddress) {
    return (
      <Shell recipient={walletAddress} step="account">
        <ConnectPrompt
          title="Sign in to continue"
          body="Use Google or a wallet so this NFC device can pay from your balance."
          buttonLabel="Sign in"
        />
      </Shell>
    );
  }

  return (
    <Shell recipient={walletAddress}>
      <OwnedGate pk={pk} walletAddress={walletAddress} />
    </Shell>
  );
}

type SetupStep = "device" | "account" | "limit" | "pay";

function Shell({
  recipient,
  children,
  step,
}: {
  recipient: string | null;
  children: ReactNode;
  step?: SetupStep;
}) {
  return (
    <AppShell recipient={recipient} modeLabel="Pay">
      <AppCard>
        {step && step !== "pay" ? <SetupSteps current={step} /> : null}
        {children}
      </AppCard>
    </AppShell>
  );
}

function SetupSteps({ current }: { current: SetupStep }) {
  const order: SetupStep[] = ["device", "account", "limit", "pay"];
  const labels: Record<SetupStep, string> = {
    device: "NFC device",
    account: "Account",
    limit: "Limit",
    pay: "Pay",
  };
  const idx = order.indexOf(current);

  return (
    <div className="mb-5 flex items-center justify-center gap-1.5">
      {order.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <span
            key={s}
            className={
              active
                ? "rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary"
                : done
                  ? "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                  : "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/40"
            }
          >
            {labels[s]}
          </span>
        );
      })}
    </div>
  );
}

function OwnedGate({
  pk,
  walletAddress,
}: {
  pk: string | null;
  walletAddress: string;
}) {
  const assetQuery = usePhygitalAsset(pk);
  const [forceLimit, setForceLimit] = useState(false);
  const [claimedLocal, setClaimedLocal] = useState(false);

  if (assetQuery.isPending && !claimedLocal) {
    return (
      <>
        <SetupSteps current="account" />
        <CenteredStatus>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Setting up Pay…</p>
          <p className="text-xs text-muted-foreground/70">Loading your NFC device</p>
        </CenteredStatus>
      </>
    );
  }

  if ((assetQuery.isError || !assetQuery.data) && !claimedLocal) {
    return (
      <>
        <SetupSteps current="device" />
        <GateMessage
          icon={<ShieldAlert className="size-5 text-destructive" />}
          title="NFC device not found"
          body={toUserErrorMessage(
            assetQuery.error,
            "We couldn’t find this NFC device. Try tapping again.",
          )}
          destructive
        />
      </>
    );
  }

  const asset = assetQuery.data;
  const isOwner = claimedLocal || asset?.currentOwner === walletAddress;

  if (asset && !isOwner && asset.isLocked) {
    return (
      <>
        <SetupSteps current="device" />
        <GateMessage
          icon={<Wallet className="size-5 text-muted-foreground" />}
          title="NFC device is locked"
          body={`This NFC device belongs to ${shortAddress(asset.currentOwner.toString())}. Ask them to unlock it before you can add it here.`}
          action={
            <p className="max-w-56 text-xs text-muted-foreground">
              How to unlock: open the NFC device in their vault, unlock it, then
              hold it to this phone again.
            </p>
          }
        />
      </>
    );
  }

  if (asset && !isOwner) {
    return (
      <>
        <SetupSteps current="account" />
        <ClaimPanel
          asset={asset}
          unclaimed={isUnclaimedAsset(asset)}
          onClaimed={() => {
            setClaimedLocal(true);
            setForceLimit(true);
          }}
        />
      </>
    );
  }

  return (
    <OwnerPayFlow
      walletAddress={walletAddress}
      forceLimit={forceLimit}
      onEditLimit={() => setForceLimit(true)}
      onLimitDone={() => setForceLimit(false)}
      showSteps={forceLimit}
    />
  );
}

function OwnerPayFlow({
  walletAddress,
  forceLimit,
  onEditLimit,
  onLimitDone,
  showSteps,
}: {
  walletAddress: string;
  forceLimit: boolean;
  onEditLimit: () => void;
  onLimitDone: () => void;
  showSteps: boolean;
}) {
  const statusQuery = useDelegateStatus(walletAddress);
  const status = statusQuery.data;
  const hasLimit =
    !!status?.isProgramAuthorityDelegate && status.delegatedAmountRaw > BigInt(0);

  if (statusQuery.isLoading) {
    return (
      <>
        {showSteps ? <SetupSteps current="limit" /> : null}
        <CenteredStatus>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Setting up Pay…</p>
          <p className="text-xs text-muted-foreground/70">Checking Pay</p>
        </CenteredStatus>
      </>
    );
  }

  if (!hasLimit || forceLimit) {
    return (
      <>
        <SetupSteps current="limit" />
        <LimitPanel onEnabled={onLimitDone} />
      </>
    );
  }

  return <PayPanel onChangeLimit={onEditLimit} />;
}

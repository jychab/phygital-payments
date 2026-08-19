"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { CenteredStatus, SuccessStatus } from "@/components/layout/gate-message";
import { EnablePayPanel } from "@/components/pay/enable-pay-panel";
import { LimitPanel } from "@/components/pay/pay-limit-panel";
import { Button } from "@/components/ui/button";
import { usePaySetupSnapshot } from "@/hooks/pay/use-pay-setup-snapshot";
import { markApiKeyVerified } from "@/hooks/pay/use-verified-api-key";
import { getDefaultMint } from "@/lib/tokens/payment-token";
import { queryKeys } from "@/lib/queries";

/** Spending limit then Enable Pay — used from `/device/finish` and after claim. */
export function DeviceFinishSetup({
  owner,
  asset,
  onDismiss,
}: {
  owner: string;
  asset: string;
  onDismiss?: () => void;
}) {
  const queryClient = useQueryClient();
  const snap = usePaySetupSnapshot(owner, asset);

  async function onCapEnabled() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.delegateStatus.byOwner(owner),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.ownerPayDelegates.byOwner(owner),
    });
  }

  if (snap.isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </CenteredStatus>
    );
  }

  if (!snap.capSet) {
    return (
      <LimitPanel
        expectedOwner={owner}
        asset={asset}
        mint={getDefaultMint()}
        onEnabled={() => void onCapEnabled()}
        onSkip={onDismiss}
      />
    );
  }

  if (!snap.apiKeyReady) {
    return (
      <EnablePayPanel
        expectedOwner={owner}
        onEnabled={() => markApiKeyVerified(queryClient, owner)}
        onSkip={onDismiss}
      />
    );
  }

  return <SetupComplete onDismiss={onDismiss} />;
}

function SetupComplete({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <SuccessStatus
        icon={<CheckCircle2 className="size-7" />}
        title="Pay is on"
        body="Pay from Home or tap this device again."
        bodyClassName="max-w-64"
      />
      <Button type="button" size="lg" className="w-full" asChild>
        <Link href="/">Done</Link>
      </Button>
      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={onDismiss}
        >
          Not Now
        </Button>
      ) : null}
    </div>
  );
}

"use client";

import { toast } from "sonner";
import { CheckCircle2, Copy, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { CenteredStatus, SuccessStatus } from "@/components/gate-message";
import { LimitPanel } from "@/components/pay/pay-limit-panel";
import { AllowVerifierPanel } from "@/components/pay/allow-verifier-panel";
import { Button } from "@/components/ui/button";
import { usePaySetupSnapshot } from "@/hooks/use-pay-setup-snapshot";
import { uiAmountToRaw } from "@/lib/payments/mint-delegate";
import {
  defaultTapAmountUi,
  defaultUsdcToken,
  getDefaultMint,
} from "@/lib/payments/payment-token";
import { copyPayShortcutLink } from "@/lib/payments/preauth-client";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { queryKeys } from "@/lib/queries";

/**
 * Optional Pay setup: spending limit, then Enable Pay.
 */
export function DeviceFinishSetup({
  owner,
  onDismiss,
}: {
  owner: string;
  onDismiss?: () => void;
}) {
  const queryClient = useQueryClient();
  const snap = usePaySetupSnapshot(owner);

  async function onCapEnabled() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.delegateStatus.byOwner(owner),
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
        mint={getDefaultMint()}
        onEnabled={() => void onCapEnabled()}
        onSkip={onDismiss}
      />
    );
  }

  if (!snap.verifierSet) {
    return (
      <AllowVerifierPanel
        expectedOwner={owner}
        onAllowed={() => {}}
        onSkip={onDismiss}
      />
    );
  }

  return <SetupComplete owner={owner} limitUi={snap.limitUi} onDismiss={onDismiss} />;
}

function SetupComplete({
  owner,
  limitUi,
  onDismiss,
}: {
  owner: string;
  limitUi: string | null;
  onDismiss?: () => void;
}) {
  async function onAddToShortcuts() {
    try {
      const usdc = defaultUsdcToken();
      await copyPayShortcutLink({
        wallet: owner,
        amount: uiAmountToRaw(
          defaultTapAmountUi(limitUi),
          usdc.decimals,
        ).toString(),
      });
      toast.success("Shortcut link copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't copy link"));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <SuccessStatus
        icon={<CheckCircle2 className="size-7" />}
        title="Pay is on"
        body="Pay from Home or tap this device again."
        bodyClassName="max-w-64"
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => void onAddToShortcuts()}
      >
        <Copy className="size-4" />
        Add to Shortcuts
      </Button>
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

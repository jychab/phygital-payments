"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Copy, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { CenteredStatus, SuccessStatus } from "@/components/gate-message";
import { LimitPanel } from "@/components/pay/pay-limit-panel";
import { AllowVerifierPanel } from "@/components/pay/allow-verifier-panel";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { usePreauthStatus } from "@/hooks/use-preauth-status";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";
import { getDefaultMint } from "@/lib/payments/payment-token";
import { buildPreauthOpenUrl } from "@/lib/payments/presence-grant-client";
import { queryKeys } from "@/lib/queries";

const DEFAULT_PAY_LINK_AMOUNT_UI = "100";

/**
 * After claim (or from /device status handoff): spending cap, then payment verifier.
 */
export function DeviceFinishSetup({ owner }: { owner: string }) {
  const queryClient = useQueryClient();
  const capQuery = useDelegateStatus(owner, getDefaultMint());
  const verifierQuery = usePreauthStatus(owner);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);

  const loading = capQuery.isPending || verifierQuery.isPending;
  const capSet = isDelegateEnabled(capQuery.data);
  const verifierSet = Boolean(verifierQuery.data?.enabled) || issuedKey != null;

  async function onCapEnabled() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.delegateStatus.byOwner(owner),
    });
    await capQuery.refetch();
  }

  async function onVerifierAllowed(apiKey: string) {
    setIssuedKey(apiKey);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.preauthStatus.byWallet(owner),
    });
  }

  if (loading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading setup…</p>
      </CenteredStatus>
    );
  }

  if (!capSet) {
    return (
      <LimitPanel
        expectedOwner={owner}
        mint={getDefaultMint()}
        onEnabled={() => void onCapEnabled()}
      />
    );
  }

  if (!verifierSet) {
    return (
      <AllowVerifierPanel
        expectedOwner={owner}
        onAllowed={(key) => void onVerifierAllowed(key)}
      />
    );
  }

  return <SetupComplete apiKey={issuedKey} />;
}

function SetupComplete({ apiKey }: { apiKey: string | null }) {
  async function onCopyPayLink() {
    if (!apiKey) return;
    try {
      const url = buildPreauthOpenUrl({
        apiKey,
        amountUi: DEFAULT_PAY_LINK_AMOUNT_UI,
      });
      await navigator.clipboard.writeText(url);
      toast.success("Pay link copied");
    } catch {
      toast.error("Couldn’t copy pay link");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <SuccessStatus
        icon={<CheckCircle2 className="size-7" />}
        title="Pay is ready"
        body="Get Ready on Home, then hold your NFC device to their phone. You are not charged until that tap."
        bodyClassName="max-w-64"
      />
      {apiKey ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => void onCopyPayLink()}
        >
          <Copy className="size-4" />
          Copy pay link
        </Button>
      ) : null}
      <Button type="button" size="lg" className="w-full" asChild>
        <Link href="/">Open Home</Link>
      </Button>
      {apiKey ? (
        <p className="text-center text-[11px] text-muted-foreground">
          Save the pay link as a shortcut on your phone to Get Ready without
          opening this app.
        </p>
      ) : null}
    </div>
  );
}

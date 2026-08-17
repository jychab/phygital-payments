"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, LoaderCircle, Nfc } from "lucide-react";
import Link from "next/link";

import { CopyableAddress } from "@/components/copyable-address";
import { CenteredStatus, GateMessage } from "@/components/gate-message";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { usePreauthStatus } from "@/hooks/use-preauth-status";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";
import {
  absoluteDeviceFinishUrl,
  deviceFinishHref,
  type DeviceFinishIntent,
} from "@/lib/payments/device-finish";
import { getDefaultMint } from "@/lib/payments/payment-token";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import type { PhygitalAsset } from "@/lib/phygital/asset";

/**
 * Locked, owned device after NFC tap — no Privy.
 * Shows owner / spending cap / payment verifier and hands off to /device/finish.
 */
export function DeviceSetupStatus({ asset }: { asset: PhygitalAsset }) {
  const owner = asset.currentOwner.toString();
  const capQuery = useDelegateStatus(owner, getDefaultMint());
  const verifierQuery = usePreauthStatus(owner);

  const loading = capQuery.isPending || verifierQuery.isPending;
  const failed = capQuery.isError || verifierQuery.isError;

  if (loading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading Pay setup…</p>
      </CenteredStatus>
    );
  }

  if (failed) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn’t load Pay setup"
        body={toUserErrorMessage(
          capQuery.error ?? verifierQuery.error,
          "Check your connection and try again.",
        )}
        destructive
      />
    );
  }

  const capSet = isDelegateEnabled(capQuery.data);
  const verifierSet = Boolean(verifierQuery.data?.enabled);
  const next: DeviceFinishIntent | null = !capSet
    ? "limit"
    : !verifierSet
      ? "verifier"
      : null;

  return (
    <SetupStatusCard
      owner={owner}
      capSet={capSet}
      verifierSet={verifierSet}
      next={next}
    />
  );
}

function SetupStatusCard({
  owner,
  capSet,
  verifierSet,
  next,
}: {
  owner: string;
  capSet: boolean;
  verifierSet: boolean;
  next: DeviceFinishIntent | null;
}) {
  const router = useRouter();
  const finishHref = next ? deviceFinishHref({ intent: next, owner }) : null;

  async function onCopyLink() {
    if (!next) return;
    try {
      await navigator.clipboard.writeText(
        absoluteDeviceFinishUrl({ intent: next, owner }),
      );
      toast.success("Finish link copied");
    } catch {
      toast.error("Couldn’t copy link");
    }
  }

  const cta =
    next === "limit"
      ? "Set spending cap"
      : next === "verifier"
        ? "Allow payment verifier"
        : null;

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <div className="space-y-1 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Pay setup
        </p>
        <p className="text-sm font-medium text-foreground">
          {next ? "Finish setting up Pay" : "Pay is ready"}
        </p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          {next
            ? "Continue in your wallet app to confirm. Getting Ready is not a payment."
            : "Hold this NFC device to their phone after you Get Ready on Home."}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/25 px-4 py-3 text-xs">
        <StatusRow label="Linked wallet">
          <CopyableAddress
            address={owner}
            length={4}
            label="owner wallet"
          />
        </StatusRow>
        <StatusRow label="Spending cap">
          <StatusValue ok={capSet} onLabel="Set" offLabel="Not set" />
        </StatusRow>
        <StatusRow label="Payment verifier">
          <StatusValue
            ok={verifierSet}
            onLabel="Enabled"
            offLabel="Not set"
          />
        </StatusRow>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        {finishHref && cta ? (
          <>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => router.push(finishHref)}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => void onCopyLink()}
            >
              <Copy className="size-4" />
              Copy finish link
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              {cta}. Open the link in your wallet if Connect doesn’t appear
              here.
            </p>
          </>
        ) : (
          <Button type="button" size="lg" className="w-full" asChild>
            <Link href="/">Open Home</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function StatusValue({
  ok,
  onLabel,
  offLabel,
}: {
  ok: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span className={ok ? "text-foreground" : "text-muted-foreground"}>
      {ok ? onLabel : offLabel}
    </span>
  );
}

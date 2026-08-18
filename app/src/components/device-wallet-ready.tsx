"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { CopyableAddress } from "@/components/copyable-address";
import { SuccessStatus } from "@/components/gate-message";
import { Button } from "@/components/ui/button";
import {
  isPayConfigured,
  type PaySetupSnapshot,
} from "@/lib/payments/device-setup-state";
import { collectHref } from "@/lib/payments/payment-request";

export function DeviceWalletReady({
  owner,
  capSet,
  verifierSet,
  onSetUpPay,
}: {
  owner: string;
  capSet: boolean;
  verifierSet: boolean;
  onSetUpPay?: () => void;
}) {
  const setup: PaySetupSnapshot = { capSet, verifierSet };
  const payOn = isPayConfigured(setup);
  const showSetup = !payOn && Boolean(onSetUpPay);
  const collectUrl = collectHref({ recipient: owner });

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <SuccessStatus
        icon={<CheckCircle2 className="size-7" />}
        title="Your wallet is ready."
        body="This NFC device is linked to your wallet."
        bodyClassName="max-w-64"
      />

      <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/25 px-4 py-3 text-xs">
        <StatusRow label="Wallet">
          <CopyableAddress address={owner} length={4} label="wallet" />
        </StatusRow>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <Button type="button" size="lg" className="w-full" asChild>
          <Link href={collectUrl}>Collect</Link>
        </Button>
        {showSetup ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onSetUpPay}
          >
            Set Up Pay
          </Button>
        ) : null}
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

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

export function DeviceWalletReady({
  owner,
  capSet,
  verifierSet,
  limitUi,
  onSetUpPay,
  showNotNow = true,
}: {
  owner: string;
  capSet: boolean;
  verifierSet: boolean;
  /** Human spending limit when set, e.g. "100". */
  limitUi?: string | null;
  onSetUpPay?: () => void;
  showNotNow?: boolean;
}) {
  const setup: PaySetupSnapshot = { capSet, verifierSet };
  const payOn = isPayConfigured(setup);

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
        <StatusRow label="Pay">
          <span className={payOn ? "text-foreground" : "text-muted-foreground"}>
            {payOn ? "On" : "Off"}
          </span>
        </StatusRow>
        <StatusRow label="Spending Limit">
          <span
            className={
              capSet && limitUi ? "text-foreground" : "text-muted-foreground"
            }
          >
            {capSet && limitUi ? `$${limitUi}` : "Not set"}
          </span>
        </StatusRow>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        {!payOn && onSetUpPay ? (
          <>
            <Button type="button" size="lg" className="w-full" onClick={onSetUpPay}>
              Set Up Pay
            </Button>
            {showNotNow ? (
              <Button type="button" variant="ghost" size="lg" className="w-full" asChild>
                <Link href="/">Not Now</Link>
              </Button>
            ) : null}
          </>
        ) : (
          <Button type="button" size="lg" className="w-full" asChild>
            <Link href="/">Done</Link>
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

"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { CopyableAddress } from "@/components/shared/copyable-address";
import { SuccessStatus } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { collectHref } from "@/lib/collect/payment-request";

/** Post-claim / owned-device home: Collect, Pay, and API-key next steps. */
export function DeviceWalletReady({
  owner,
  capSet,
  apiKeyReady,
  onSetUpPay,
  onAddApiKey,
  onPay,
}: {
  owner: string;
  capSet: boolean;
  apiKeyReady: boolean;
  onSetUpPay?: () => void;
  onAddApiKey?: () => void;
  onPay?: () => void;
}) {
  const collectUrl = collectHref({ recipient: owner });
  const actions: { label: string; onClick: () => void }[] = [];

  if (!capSet) {
    if (onSetUpPay) actions.push({ label: "Set up Pay", onClick: onSetUpPay });
  } else {
    if (apiKeyReady && onPay) {
      actions.push({ label: "Pay", onClick: onPay });
    }
    if (onAddApiKey) {
      actions.push({
        label: apiKeyReady ? "Replace API key" : "Add API key",
        onClick: onAddApiKey,
      });
    } else if (!apiKeyReady && onSetUpPay) {
      actions.push({ label: "Set up Pay", onClick: onSetUpPay });
    }
  }

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
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
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

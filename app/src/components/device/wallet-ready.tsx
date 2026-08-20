"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { CopyableAddress } from "@/components/shared/copyable-address";
import { SuccessStatus } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { collectHref } from "@/lib/collect/payment-request";

/** Post-claim / owned-device home: Collect and Pay. */
export function DeviceWalletReady({
  owner,
  onPay,
}: {
  owner: string;
  onPay?: () => void;
}) {
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
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Wallet</span>
          <CopyableAddress address={owner} length={4} label="wallet" />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <Button type="button" size="lg" className="w-full" asChild>
          <Link href={collectUrl}>Collect</Link>
        </Button>
        {onPay ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onPay}
          >
            Pay
          </Button>
        ) : null}
      </div>
    </div>
  );
}

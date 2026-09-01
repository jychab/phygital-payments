"use client";

import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import type { Address } from "@solana/kit";

import { TokenSymbol } from "@/components/shared/token-chip";
import { AtaSetupActions } from "@/components/shared/ata-setup-actions";
import type { PaymentToken } from "@/lib/tokens/payment-token";
import { copy } from "@/lib/copy/phygital";

/**
 * In-place receive-account setup on `/collect`.
 * Connected wallet must match `recipient`.
 */
export function CollectAtaSetup({
  recipient,
  mint,
  token,
}: {
  recipient: Address;
  mint: Address;
  token: PaymentToken;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertCircle className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <p className="text-sm font-medium text-foreground">
          {copy.collect.ataTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {copy.collect.ataNotReadyPrefix}{" "}
          <TokenSymbol
            token={token}
            size="xs"
            className="mx-0.5"
            symbolClassName="font-medium text-foreground"
          />{" "}
          {copy.collect.ataNotReadySuffix}
        </p>
        <AtaSetupActions
          expectedOwner={String(recipient)}
          recipient={recipient}
          mint={mint}
          token={token}
          createLabel={copy.collect.createAta(token.symbol)}
          pendingLabel={copy.collect.settingUp}
          setupFailed={copy.collect.setupFailed}
          onSuccess={() => toast.success(copy.collect.readyToReceive)}
        />
      </div>
    </div>
  );
}

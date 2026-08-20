"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { ApiKeyPanel } from "@/components/pay/api-key-panel";
import { ManagePayTokens } from "@/components/pay/pay-limit-panel";
import { BackLink } from "@/components/shared/back-link";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { isOwnerPayMintEnabled } from "@/lib/tokens/mint-delegate";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";

/** Pay → Manage Pay: tokens, spending limits, API keys. */
export function ManagePayPanel({
  owner,
  onBack,
  onEditTokenLimit,
  live = true,
}: {
  owner: string;
  onBack: () => void;
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
  live?: boolean;
}) {
  const [manageKeys, setManageKeys] = useState(false);
  const delegates = useOwnerPayDelegates(owner, { live });
  const enabledCount = [...(delegates.data?.byMint.values() ?? [])].filter(
    isOwnerPayMintEnabled,
  ).length;

  if (manageKeys) {
    return (
      <ApiKeyPanel
        expectedOwner={owner}
        replace
        onStored={() => setManageKeys(false)}
        onBack={() => setManageKeys(false)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <BackLink onClick={onBack} />
        <QueryRefreshButton owner={owner} />
      </div>

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Manage Pay
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Spending limits and this phone’s API key.
        </p>
      </div>

      <div className="space-y-1">
        <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Enabled tokens
        </p>
        <ManagePayTokens owner={owner} live={live} onEditLimit={onEditTokenLimit} />
      </div>
      <p className="flex items-center justify-center gap-1 px-2 text-center text-[11px] text-muted-foreground">
        <Check className="size-3" strokeWidth={2.5} />
        {enabledCount} token
        {enabledCount === 1 ? "" : "s"} enabled
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => setManageKeys(true)}
        >
          Manage API Keys
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";

import { ApiKeyPanel } from "@/components/pay/api-key-panel";
import { BackLink } from "@/components/shared/back-link";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { TokenListRow } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { usePayTokenContext } from "@/hooks/tokens/use-payment-tokens";
import type { PhygitalToken } from "@/lib/phygital/token";
import {
  isOwnerPayMintEnabled,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import {
  isDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { shortAddress } from "@/lib/utils";

/** Tokens, spending limits, and this browser's Pay key. */
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
        owner={owner}
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
          Pay Settings
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Set spending limits, or use Pay on another phone.
        </p>
      </div>

      <div className="space-y-1">
        <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Spending limits
        </p>
        <ManagePayTokens
          owner={owner}
          live={live}
          onEditLimit={onEditTokenLimit}
        />
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
          Use on Another Phone
        </Button>
      </div>
    </div>
  );
}

function ManagePayTokens({
  owner,
  onEditLimit,
  live = true,
}: {
  owner: string;
  onEditLimit: (holding: PaymentTokenHolding) => void;
  live?: boolean;
}) {
  const isRestoring = useIsRestoring();
  const payContext = usePayTokenContext(owner, { live });
  const delegates = useOwnerPayDelegates(owner, { live });

  if (isRestoring || payContext.isLoading || delegates.isLoading) {
    return (
      <div className="flex justify-center py-6 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
      </div>
    );
  }

  const list = payContext.data?.holdings ?? [];
  if (list.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-muted-foreground">
        No tokens in this wallet yet.
      </p>
    );
  }

  const tokensByAddress = new Map(
    (delegates.data?.tokens ?? []).map((item) => [String(item.address), item]),
  );

  return (
    <ul className="flex flex-col gap-0.5">
      {list.map((holding: PaymentTokenHolding) => {
        const match = delegates.data?.byMint.get(holding.mint);
        const tokenAddress = match?.token;
        return (
          <ManagePayTokenRow
            key={holding.mint}
            holding={holding}
            match={match}
            device={
              tokenAddress
                ? tokensByAddress.get(String(tokenAddress))
                : undefined
            }
            onEditLimit={onEditLimit}
          />
        );
      })}
    </ul>
  );
}

function ManagePayTokenRow({
  holding,
  match,
  device,
  onEditLimit,
}: {
  holding: PaymentTokenHolding;
  match: OwnerPayMintMatch | undefined;
  device: PhygitalToken | undefined;
  onEditLimit: (holding: PaymentTokenHolding) => void;
}) {
  const enabled = isOwnerPayMintEnabled(match);
  const usdc = isDefaultMint(holding.mint);
  const deviceLabel = device
    ? shortAddress(device.secp256r1PublicKey, 4)
    : null;
  const limitLabel = usdc
    ? `Limit $${match?.status?.delegatedAmountUi ?? "—"}`
    : `Limit ${match?.status?.delegatedAmountUi ?? "—"}`;
  const subtitle = enabled
    ? deviceLabel
      ? `${limitLabel} · ${deviceLabel} · ${holding.balanceUi} available`
      : `${limitLabel} · ${holding.balanceUi} available`
    : `No limit · ${holding.balanceUi} available`;

  return (
    <li>
      <TokenListRow
        token={holding}
        subtitle={subtitle}
        onSelect={() => onEditLimit(holding)}
        trailing={
          <span className="text-[11px] font-medium text-primary">
            {enabled ? "Edit" : "Set Limit"}
          </span>
        }
      />
    </li>
  );
}

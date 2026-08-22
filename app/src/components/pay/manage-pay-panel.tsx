"use client";

import { useState } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { ApiKeyPanel } from "@/components/pay/api-key-panel";
import { BackLink } from "@/components/shared/back-link";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { SettingsListRow } from "@/components/shared/settings-list-row";
import { TokenListRow } from "@/components/shared/token-chip";
import { ExpectedWalletConnect } from "@/components/shared/wallet-notices";
import { Button } from "@/components/ui/button";
import {
  usePreauthRequired,
  useSetPreauthRequired,
} from "@/hooks/pay/use-preauth-required";
import { useOwnerPayDelegates } from "@/hooks/pay/use-owner-pay-delegates";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import type { PhygitalToken } from "@/lib/phygital/token";
import {
  isOwnerPayMintEnabled,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import {
  isDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { cn, shortAddress } from "@/lib/utils";

/** Tokens, spending limits, and Confirm Payments. */
export function ManagePayPanel({
  owner,
  onBack,
  onEditTokenLimit,
  live = true,
}: {
  owner: string;
  onBack?: () => void;
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
  live?: boolean;
}) {
  const [manageKeys, setManageKeys] = useState(false);
  const delegates = useOwnerPayDelegates(owner, { live });
  const requiredQuery = usePreauthRequired(owner);
  const confirmationOn = requiredQuery.data?.required === true;
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
      <div className="flex items-center gap-2">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <QueryRefreshButton owner={owner} className="ml-auto" />
      </div>

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Pay Settings
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          {confirmationOn
            ? "Set spending limits, or use Pay on another phone."
            : "Set spending limits."}
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

      <div className="space-y-1">
        <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Confirmation
        </p>
        <ConfirmPaymentsRow
          owner={owner}
          on={confirmationOn}
          pending={requiredQuery.isPending}
        />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {confirmationOn ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setManageKeys(true)}
          >
            Use on Another Phone
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ConfirmPaymentsRow({
  owner,
  on,
  pending,
}: {
  owner: string;
  on: boolean;
  pending: boolean;
}) {
  const { setRequired } = useSetPreauthRequired();
  const { matched, ownerShort } = useExpectedWallet(owner);
  const [busy, setBusy] = useState(false);

  async function onToggle() {
    if (!matched) return;
    try {
      setBusy(true);
      await setRequired(owner, !on);
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t update confirmation."));
    } finally {
      setBusy(false);
    }
  }

  if (!matched) {
    return (
      <div className="px-3 py-2">
        <ExpectedWalletConnect
          owner={owner}
          hint={`Create a passkey for ${ownerShort} to change confirmation.`}
        />
      </div>
    );
  }

  return (
    <SettingsListRow
      title="Confirm Payments"
      subtitle={
        on
          ? "Press Pay on this phone before a tap goes through."
          : "Hold your accessory to their phone to pay."
      }
      truncate={false}
      onSelect={() => void onToggle()}
      disabled={busy || pending}
      trailing={
        busy || pending ? (
          <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />
        ) : (
          <span
            className={cn(
              "text-[11px] font-medium",
              on ? "text-primary" : "text-muted-foreground",
            )}
          >
            {on ? "On" : "Off"}
          </span>
        )
      }
    />
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
  const delegates = useOwnerPayDelegates(owner, { live });

  if (isRestoring || delegates.isLoading) {
    return (
      <div className="flex justify-center py-6 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
      </div>
    );
  }

  const list = delegates.holdings ?? [];
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
            accessory={
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
  accessory,
  onEditLimit,
}: {
  holding: PaymentTokenHolding;
  match: OwnerPayMintMatch | undefined;
  accessory: PhygitalToken | undefined;
  onEditLimit: (holding: PaymentTokenHolding) => void;
}) {
  const enabled = isOwnerPayMintEnabled(match);
  const usdc = isDefaultMint(holding.mint);
  const accessoryLabel = accessory
    ? shortAddress(accessory.secp256r1PublicKey, 4)
    : null;
  const limitLabel = usdc
    ? `Limit $${match?.status?.delegatedAmountUi ?? "—"}`
    : `Limit ${match?.status?.delegatedAmountUi ?? "—"}`;
  const subtitle = enabled
    ? accessoryLabel
      ? `${limitLabel} · ${accessoryLabel} · ${holding.balanceUi} available`
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

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { NavBar } from "@/components/shared/nav-bar";
import { GroupedList, GroupedRow } from "@/components/shared/grouped-list";
import { Button } from "@/components/ui/button";
import { useFeeBalance } from "@/hooks/wallet/use-fee-balance";
import { useRpcPreference } from "@/hooks/wallet/use-rpc-preference";
import { copy } from "@/lib/copy/phygital";
import { fetchEffectivePolicy } from "@/lib/wallet/policies-client";
import { queryKeys, queryOptions } from "@/lib/queries";

export type SettingsTarget =
  | "spendingLimits"
  | "recipients"
  | "allowedActions"
  | "signing"
  | "rpcConnection"
  | "feeBalance";

/** Wallet settings hub — primary policies + Advanced group. */
export function SettingsHub({
  onBack,
  onOpen,
  phygitalTokenPda,
}: {
  onBack: () => void;
  onOpen: (target: SettingsTarget) => void;
  phygitalTokenPda?: string;
}) {
  const queryClient = useQueryClient();
  const fee = useFeeBalance(phygitalTokenPda ?? null);
  const rpc = useRpcPreference();
  const feeLabel = fee.data
    ? `${copy.wallet.feeBalance} · ${fee.data.balanceUi} SOL`
    : copy.wallet.feeBalance;
  const rpcLabel = rpc.isCustom
    ? `${copy.wallet.rpcConnection} · ${copy.wallet.rpcCustom}`
    : `${copy.wallet.rpcConnection} · ${copy.wallet.rpcDefault}`;

  useEffect(() => {
    if (!phygitalTokenPda) return;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.walletPolicy.byToken(phygitalTokenPda),
      queryFn: () => fetchEffectivePolicy(phygitalTokenPda),
      ...queryOptions.default,
    });
  }, [phygitalTokenPda, queryClient]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            {copy.common.back}
          </Button>
        }
        title={copy.wallet.settings}
      />

      <GroupedList>
        <GroupedRow onClick={() => onOpen("feeBalance")}>
          <span className="flex w-full items-center justify-between gap-2">
            <span>{feeLabel}</span>
            {fee.data?.low ? (
              <span className="text-xs text-muted-foreground">
                {copy.wallet.topUpFees}
              </span>
            ) : null}
          </span>
        </GroupedRow>
      </GroupedList>

      <GroupedList footer={copy.wallet.policyDefaultSigningOnly}>
        <GroupedRow onClick={() => onOpen("spendingLimits")}>
          {copy.wallet.spendingLimits}
        </GroupedRow>
        <GroupedRow onClick={() => onOpen("recipients")}>
          {copy.wallet.recipients}
        </GroupedRow>
        <GroupedRow onClick={() => onOpen("allowedActions")}>
          {copy.wallet.allowedActions}
        </GroupedRow>
      </GroupedList>

      <GroupedList label={copy.wallet.advanced}>
        <GroupedRow onClick={() => onOpen("rpcConnection")}>
          <span className="flex w-full items-center justify-between gap-2">
            <span>{rpcLabel}</span>
            {rpc.isCustom && rpc.displayEndpoint ? (
              <span className="max-w-[40%] truncate text-xs text-muted-foreground">
                {rpc.displayEndpoint}
              </span>
            ) : null}
          </span>
        </GroupedRow>
        <GroupedRow onClick={() => onOpen("signing")}>
          {copy.wallet.signing}
        </GroupedRow>
      </GroupedList>
    </div>
  );
}

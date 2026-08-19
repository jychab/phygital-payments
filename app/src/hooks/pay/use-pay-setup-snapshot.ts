"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useDelegateStatuses } from "@/hooks/pay/use-delegate-status";
import { useVerifiedApiKey } from "@/hooks/pay/use-verified-api-key";
import { usePayTokenContext } from "@/hooks/tokens/use-verified-tokens";
import { mintsFromHoldings } from "@/lib/tokens/payment-token";

/** Spending limit + API key ready flags for a specific device. */
export function usePaySetupSnapshot(owner: string, asset: string) {
  const isRestoring = useIsRestoring();
  const payContext = usePayTokenContext(owner);
  const holdingsReady = payContext.isSuccess || payContext.isError;
  const mints = mintsFromHoldings(payContext.data?.holdings);
  const statuses = useDelegateStatuses(
    holdingsReady ? owner : null,
    asset,
    mints,
  );
  const keyQuery = useVerifiedApiKey(owner);

  return {
    isPending:
      isRestoring ||
      payContext.isLoading ||
      statuses.isLoading ||
      keyQuery.isLoading,
    isError: payContext.isError || statuses.isError || keyQuery.isError,
    error: payContext.error ?? statuses.error ?? keyQuery.error,
    capSet: statuses.enabledMints.length > 0,
    apiKeyReady: keyQuery.data === true,
  };
}

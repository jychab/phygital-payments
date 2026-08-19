"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useDelegateStatuses } from "@/hooks/pay/use-delegate-status";
import { useVerifiedApiKey } from "@/hooks/pay/use-verified-api-key";
import { usePayTokenContext } from "@/hooks/tokens/use-verified-tokens";
import { getDefaultMint } from "@/lib/tokens/payment-token";

/** Spending limit + API key ready flags for Pay setup UIs. */
export function usePaySetupSnapshot(owner: string) {
  const isRestoring = useIsRestoring();
  const payContext = usePayTokenContext(owner);
  const holdingsReady = payContext.isSuccess || payContext.isError;
  const mints =
    payContext.data?.holdings && payContext.data.holdings.length > 0
      ? payContext.data.holdings.map((h) => h.mint)
      : [String(getDefaultMint())];
  const statuses = useDelegateStatuses(
    holdingsReady ? owner : null,
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

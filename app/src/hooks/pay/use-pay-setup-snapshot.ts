"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useDelegateStatus } from "@/hooks/pay/use-delegate-status";
import { useVerifiedApiKey } from "@/hooks/pay/use-verified-api-key";
import { isDelegateEnabled } from "@/lib/tokens/mint-delegate";
import { getDefaultMint } from "@/lib/tokens/payment-token";

/** Spending limit + API key ready flags for Pay setup UIs. */
export function usePaySetupSnapshot(owner: string) {
  const isRestoring = useIsRestoring();
  const capQuery = useDelegateStatus(owner, getDefaultMint());
  const keyQuery = useVerifiedApiKey(owner);

  return {
    isPending: isRestoring || capQuery.isLoading || keyQuery.isLoading,
    isError: capQuery.isError || keyQuery.isError,
    error: capQuery.error ?? keyQuery.error,
    capSet: isDelegateEnabled(capQuery.data),
    apiKeyReady: keyQuery.data === true,
  };
}

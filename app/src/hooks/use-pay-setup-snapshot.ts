"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useDelegateStatus } from "@/hooks/use-delegate-status";
import {
  nextPaySetupStep,
  type PaySetupSnapshot,
  type PaySetupStep,
} from "@/lib/payments/device-setup-state";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";
import { getDefaultMint } from "@/lib/payments/payment-token";
import { hasStoredPayApiKey } from "@/lib/payments/pay-key-store";

export function usePaySetupSnapshot(owner: string): {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  capSet: boolean;
  verifierSet: boolean;
  limitUi: string | null;
  next: PaySetupStep | null;
  snapshot: PaySetupSnapshot;
} {
  const isRestoring = useIsRestoring();
  const capQuery = useDelegateStatus(owner, getDefaultMint());

  const capSet = isDelegateEnabled(capQuery.data);
  const verifierSet = hasStoredPayApiKey(owner);
  const snapshot = { capSet, verifierSet };

  return {
    isPending: isRestoring || capQuery.isLoading,
    isError: capQuery.isError,
    error: capQuery.error,
    capSet,
    verifierSet,
    limitUi: capQuery.data?.delegatedAmountUi ?? null,
    next: nextPaySetupStep(snapshot),
    snapshot,
  };
}

"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { usePreauthStatus } from "@/hooks/use-preauth-status";
import {
  nextPaySetupStep,
  type PaySetupSnapshot,
  type PaySetupStep,
} from "@/lib/payments/device-setup-state";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";
import { getDefaultMint } from "@/lib/payments/payment-token";

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
  const verifierQuery = usePreauthStatus(owner);

  const capSet = isDelegateEnabled(capQuery.data);
  const verifierSet = Boolean(verifierQuery.data?.enabled);
  const snapshot = { capSet, verifierSet };

  return {
    isPending:
      isRestoring || capQuery.isLoading || verifierQuery.isLoading,
    isError: capQuery.isError || verifierQuery.isError,
    error: capQuery.error ?? verifierQuery.error,
    capSet,
    verifierSet,
    limitUi: capQuery.data?.delegatedAmountUi ?? null,
    next: nextPaySetupStep(snapshot),
    snapshot,
  };
}

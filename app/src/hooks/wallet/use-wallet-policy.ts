"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { copy } from "@/lib/copy/phygital";
import { applyWalletPolicyPatch, queryKeys, queryOptions } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  fetchEffectivePolicy,
  putPolicySummary,
  type PolicySummary,
} from "@/lib/wallet/policies-client";

export function useWalletPolicy(phygitalToken: string | null) {
  return useQuery<PolicySummary, Error>({
    queryKey: queryKeys.walletPolicy.byToken(phygitalToken),
    queryFn: () => fetchEffectivePolicy(phygitalToken!),
    enabled: Boolean(phygitalToken),
    ...queryOptions.default,
  });
}

/** PUT policy + patch shared cache (or invalidate if cold). */
export function useSaveWalletPolicy(phygitalToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<PolicySummary>) =>
      putPolicySummary(phygitalToken, patch),
    onSuccess: (_data, patch) => {
      applyWalletPolicyPatch(queryClient, phygitalToken, patch);
    },
  });
}

/** Shared load / error-toast / save+toast for Settings policy sheets. */
export function usePolicyEditor(phygitalToken: string) {
  const policy = useWalletPolicy(phygitalToken);
  const savePolicy = useSaveWalletPolicy(phygitalToken);

  useEffect(() => {
    if (policy.isError) toast.error(toUserErrorMessage(policy.error));
  }, [policy.isError, policy.error]);

  async function save(patch: Partial<PolicySummary>, onBack: () => void) {
    try {
      await savePolicy.mutateAsync(patch);
      toast.success(copy.wallet.settingsSaved);
      onBack();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    }
  }

  return {
    policy,
    loading: policy.isLoading && !policy.data,
    saving: savePolicy.isPending,
    save,
  };
}

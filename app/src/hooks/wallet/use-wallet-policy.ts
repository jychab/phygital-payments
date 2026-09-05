"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PolicyDocument } from "phygital-verifier-sdk";

import { copy } from "@/lib/copy/phygital";
import { applyWalletPolicy, queryKeys, queryOptions } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import { useWalletPda } from "@/hooks/wallet/use-wallet-pda";
import {
  fetchPolicyDocument,
  putPolicyDocument,
} from "@/lib/wallet/policies-client";
import {
  applyPolicySettingsPatch,
  derivePolicySettings,
  type PolicySettings,
} from "@/lib/wallet/policy-settings";

export function useWalletPolicy(phygitalToken: string | null) {
  return useQuery<PolicyDocument, Error>({
    queryKey: queryKeys.walletPolicy.byToken(phygitalToken),
    queryFn: () => fetchPolicyDocument(phygitalToken!),
    enabled: Boolean(phygitalToken),
    ...queryOptions.default,
  });
}

/** PUT compiled document → replace cache. */
export function useSaveWalletPolicy(phygitalToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policy: PolicyDocument) =>
      putPolicyDocument(phygitalToken, policy),
    onSuccess: (policy) => {
      applyWalletPolicy(queryClient, phygitalToken, policy);
    },
  });
}

/** Shared load / derive / save for Settings policy sheets. */
export function usePolicyEditor(phygitalToken: string) {
  const policy = useWalletPolicy(phygitalToken);
  const walletPda = useWalletPda(phygitalToken);
  const savePolicy = useSaveWalletPolicy(phygitalToken);
  const [settings, setSettings] = useState<PolicySettings | null>(null);

  useEffect(() => {
    if (policy.isError) toast.error(toUserErrorMessage(policy.error));
  }, [policy.isError, policy.error]);

  useEffect(() => {
    if (!policy.data) {
      setSettings(null);
      return;
    }
    let cancelled = false;
    void derivePolicySettings(policy.data).then((next) => {
      if (!cancelled) setSettings(next);
    });
    return () => {
      cancelled = true;
    };
  }, [policy.data]);

  async function save(patch: Partial<PolicySettings>, onBack: () => void) {
    if (!policy.data) return;
    try {
      const next = await applyPolicySettingsPatch(policy.data, patch, {
        ...(walletPda.walletAddress
          ? { wallet: walletPda.walletAddress }
          : {}),
      });
      await savePolicy.mutateAsync(next);
      toast.success(copy.wallet.settingsSaved);
      onBack();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    }
  }

  return {
    policy,
    settings,
    loading:
      (policy.isLoading && !policy.data) ||
      (Boolean(policy.data) && settings == null),
    saving: savePolicy.isPending,
    save,
  };
}

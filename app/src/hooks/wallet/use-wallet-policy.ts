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
  deletePolicyDocument,
  fetchEffectivePolicy,
  putPolicyDocument,
  type EffectivePolicy,
  type PolicyStatus,
} from "@/lib/wallet/policies-client";
import {
  applyPolicySettingsPatch,
  compilePolicySettings,
  derivePolicySettings,
  FIRST_ENABLE_POLICY_SETTINGS,
  type PolicySettings,
} from "@/lib/wallet/policy-settings";
import { handleOwnerAuthFailure } from "@/lib/wallet/limits-setup-href";

export function useWalletPolicy(phygitalToken: string | null) {
  return useQuery<EffectivePolicy, Error>({
    queryKey: queryKeys.walletPolicy.byToken(phygitalToken),
    queryFn: () => fetchEffectivePolicy(phygitalToken!),
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
    onSuccess: (effective) => {
      applyWalletPolicy(queryClient, phygitalToken, effective);
    },
  });
}

/** Shared load / derive / save for Settings policy sheets. */
export function usePolicyEditor(phygitalToken: string) {
  const policy = useWalletPolicy(phygitalToken);
  const walletPda = useWalletPda(phygitalToken);
  const savePolicy = useSaveWalletPolicy(phygitalToken);
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<PolicySettings | null>(null);

  const turnOffPolicy = useMutation({
    mutationFn: () => deletePolicyDocument(phygitalToken),
    onSuccess: (effective) => {
      applyWalletPolicy(queryClient, phygitalToken, effective);
      toast.success(copy.wallet.limitsTurnedOff);
    },
  });

  const status: PolicyStatus | undefined = policy.data?.status;
  const doc = policy.data?.policy ?? null;
  const busy = savePolicy.isPending || turnOffPolicy.isPending;

  useEffect(() => {
    if (policy.isError) toast.error(toUserErrorMessage(policy.error));
  }, [policy.isError, policy.error]);

  useEffect(() => {
    if (policy.isLoading) {
      setSettings(null);
      return;
    }
    if (status === "invalid" || doc == null) {
      setSettings(FIRST_ENABLE_POLICY_SETTINGS);
      return;
    }
    let cancelled = false;
    void derivePolicySettings(doc).then((next) => {
      if (!cancelled) setSettings(next);
    });
    return () => {
      cancelled = true;
    };
  }, [doc, policy.isLoading, status]);

  async function save(patch: Partial<PolicySettings>, onBack: () => void) {
    if (!settings || busy) return;
    try {
      const opts = {
        ...(walletPda.walletAddress
          ? { wallet: walletPda.walletAddress }
          : {}),
      };
      const merged: PolicySettings = {
        ...settings,
        ...patch,
        recipientAllowlist:
          patch.recipientAllowlist ?? settings.recipientAllowlist,
        extraPrograms: patch.extraPrograms ?? settings.extraPrograms,
      };
      const next =
        doc == null || status === "invalid"
          ? await compilePolicySettings(merged, opts)
          : await applyPolicySettingsPatch(doc, patch, opts);
      await savePolicy.mutateAsync(next);
      toast.success(copy.wallet.settingsSaved);
      onBack();
    } catch (e) {
      if (handleOwnerAuthFailure(phygitalToken, e)) return;
      toast.error(toUserErrorMessage(e));
    }
  }

  async function turnOff(onBack: () => void) {
    if (busy) return;
    try {
      await turnOffPolicy.mutateAsync();
      onBack();
    } catch (e) {
      if (handleOwnerAuthFailure(phygitalToken, e)) return;
      toast.error(toUserErrorMessage(e));
    }
  }

  return {
    policy,
    settings,
    status,
    loading:
      (policy.isLoading && policy.data === undefined) ||
      (policy.isSuccess && settings == null),
    saving: savePolicy.isPending,
    turningOff: turnOffPolicy.isPending,
    busy,
    save,
    turnOff,
    policyEnabled: status === "ok" && doc != null,
    policyInvalid: status === "invalid",
  };
}

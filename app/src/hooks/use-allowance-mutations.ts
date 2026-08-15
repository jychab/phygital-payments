"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys, type UsdcDelegateStatus } from "@/lib/queries";
import {
  buildDelegateInstructions,
  buildRevokeDelegateInstructions,
  formatTokenAmount,
} from "@/lib/payments/usdc-allowance";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";

type OptimisticContext = { previous?: UsdcDelegateStatus };

/**
 * Approve the program authority as USDC delegate for `rawAmount`. The allowance
 * card flips immediately (optimistic), then the on-chain confirmation resolves;
 * if it fails we roll the cache back.
 */
export function useSetAllowanceMutation(
  owner: string | null,
  options?: { onSuccess?: (signature: string) => void },
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const key = queryKeys.delegateStatus.byOwner(owner);

  return useMutation<
    string,
    Error,
    { rawAmount: bigint; decimals: number },
    OptimisticContext
  >({
    mutationFn: async ({ rawAmount }) => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildDelegateInstructions({
        signer,
        rawAmount,
      });
      const { signature } = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      return signature;
    },
    onMutate: async ({ rawAmount, decimals }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UsdcDelegateStatus>(key);
      queryClient.setQueryData<UsdcDelegateStatus>(key, (prev) =>
        prev
          ? {
              ...prev,
              isProgramAuthorityDelegate: true,
              delegatedAmountRaw: rawAmount,
              delegatedAmountUi: formatTokenAmount(rawAmount, decimals),
            }
          : prev,
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: (signature) => options?.onSuccess?.(signature),
  });
}

/** Revoke the USDC delegate. Optimistically clears the allowance, rolls back on error. */
export function useRevokeAllowanceMutation(
  owner: string | null,
  options?: { onSuccess?: (signature: string) => void },
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const key = queryKeys.delegateStatus.byOwner(owner);

  return useMutation<string, Error, void, OptimisticContext>({
    mutationFn: async () => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildRevokeDelegateInstructions({ signer });
      const { signature } = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      return signature;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UsdcDelegateStatus>(key);
      queryClient.setQueryData<UsdcDelegateStatus>(key, (prev) =>
        prev
          ? {
              ...prev,
              isProgramAuthorityDelegate: false,
              delegatedAmountRaw: BigInt(0),
              delegatedAmountUi: "0",
            }
          : prev,
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: (signature) => options?.onSuccess?.(signature),
  });
}

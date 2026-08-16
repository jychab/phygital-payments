"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import { queryKeys, type MintDelegateStatus } from "@/lib/queries";
import {
  buildDelegateInstructions,
  buildRevokeDelegateInstructions,
  formatTokenAmount,
} from "@/lib/payments/mint-delegate";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";

type OptimisticContext = { previous?: MintDelegateStatus };

type AllowanceOptions = {
  mint: Address | string;
  onSuccess?: (signature: string) => void;
};

/**
 * Approve the program authority as mint delegate for `rawAmount`. The allowance
 * card flips immediately (optimistic), then the on-chain confirmation resolves;
 * if it fails we roll the cache back.
 */
export function useSetDelegateMutation(
  owner: string | null,
  options: AllowanceOptions,
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const mintStr = String(options.mint);
  const key = queryKeys.delegateStatus.byOwnerMint(owner, mintStr);

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
        mint: address(mintStr),
      });
      const { signature } = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      return signature;
    },
    onMutate: async ({ rawAmount, decimals }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MintDelegateStatus>(key);
      queryClient.setQueryData<MintDelegateStatus>(key, (prev) =>
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
    onSuccess: (signature) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.holdings.byOwner(owner),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.delegateStatus.byOwner(owner),
      });
      options.onSuccess?.(signature);
    },
  });
}

/** Revoke the mint delegate. Optimistically clears the allowance, rolls back on error. */
export function useRevokeDelegateMutation(
  owner: string | null,
  options: AllowanceOptions,
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const mintStr = String(options.mint);
  const key = queryKeys.delegateStatus.byOwnerMint(owner, mintStr);

  return useMutation<string, Error, void, OptimisticContext>({
    mutationFn: async () => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildRevokeDelegateInstructions({
        signer,
        mint: address(mintStr),
      });
      const { signature } = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      return signature;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MintDelegateStatus>(key);
      queryClient.setQueryData<MintDelegateStatus>(key, (prev) =>
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
    onSuccess: (signature) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.holdings.byOwner(owner),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.delegateStatus.byOwner(owner),
      });
      options.onSuccess?.(signature);
    },
  });
}

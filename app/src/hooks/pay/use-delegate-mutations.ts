"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import { queryKeys, type MintDelegateStatus } from "@/lib/queries";
import {
  buildDelegateInstructions,
  buildRevokeDelegateInstructions,
  formatTokenAmount,
} from "@/lib/tokens/mint-delegate";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";

type AllowanceOptions = {
  mint: Address | string;
  onSuccess?: (signature: string) => void;
};

async function applyDelegateAfterSend(args: {
  queryClient: ReturnType<typeof useQueryClient>;
  owner: string | null;
  key: ReturnType<typeof queryKeys.delegateStatus.byOwnerMint>;
  confirmed: Promise<void>;
  apply: (
    prev: MintDelegateStatus | undefined,
  ) => MintDelegateStatus | undefined;
}) {
  const previous = args.queryClient.getQueryData<MintDelegateStatus>(args.key);
  args.queryClient.setQueryData<MintDelegateStatus>(args.key, args.apply);
  try {
    await args.confirmed;
  } catch (error) {
    if (previous !== undefined) {
      args.queryClient.setQueryData(args.key, previous);
    }
    throw error;
  }
  void args.queryClient.invalidateQueries({
    queryKey: queryKeys.holdings.byOwner(args.owner),
  });
  void args.queryClient.invalidateQueries({
    queryKey: queryKeys.payContext.byOwner(args.owner),
  });
  void args.queryClient.invalidateQueries({
    queryKey: queryKeys.delegateStatus.byOwner(args.owner),
  });
}

/**
 * Approve the program authority as mint delegate for `rawAmount`.
 * Status updates after broadcast; confirm refreshes or rolls back.
 */
export function useSetDelegateMutation(
  owner: string | null,
  options: AllowanceOptions,
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const mintStr = String(options.mint);
  const key = queryKeys.delegateStatus.byOwnerMint(owner, mintStr);

  return useMutation<string, Error, { rawAmount: bigint; decimals: number }>({
    mutationFn: async ({ rawAmount, decimals }) => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildDelegateInstructions({
        signer,
        rawAmount,
        mint: address(mintStr),
      });
      const sent = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      await applyDelegateAfterSend({
        queryClient,
        owner,
        key,
        confirmed: sent.confirmed,
        apply: (prev) =>
          prev
            ? {
                ...prev,
                isProgramAuthorityDelegate: true,
                delegatedAmountRaw: rawAmount,
                delegatedAmountUi: formatTokenAmount(rawAmount, decimals),
              }
            : prev,
      });
      return sent.signature;
    },
    onSuccess: (signature) => options.onSuccess?.(signature),
  });
}

/**
 * Revoke the mint delegate. Status updates after broadcast; confirm refreshes
 * or rolls back.
 */
export function useRevokeDelegateMutation(
  owner: string | null,
  options: AllowanceOptions,
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const mintStr = String(options.mint);
  const key = queryKeys.delegateStatus.byOwnerMint(owner, mintStr);

  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildRevokeDelegateInstructions({
        signer,
        mint: address(mintStr),
      });
      const sent = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      await applyDelegateAfterSend({
        queryClient,
        owner,
        key,
        confirmed: sent.confirmed,
        apply: (prev) =>
          prev
            ? {
                ...prev,
                isProgramAuthorityDelegate: false,
                delegatedAmountRaw: BigInt(0),
                delegatedAmountUi: "0",
              }
            : prev,
      });
      return sent.signature;
    },
    onSuccess: (signature) => options.onSuccess?.(signature),
  });
}

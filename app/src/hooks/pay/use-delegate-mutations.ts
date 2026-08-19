"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import { queryKeys, type MintDelegateStatus, type OwnerPayDelegates } from "@/lib/queries";
import {
  buildDelegateInstructions,
  buildRevokeDelegateInstructions,
  formatTokenAmount,
  isOwnerPayMintEnabled,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";

type AllowanceOptions = {
  mint: Address | string;
  asset: Address | string;
  onSuccess?: (signature: string) => void;
};

async function applyDelegateAfterSend(args: {
  queryClient: ReturnType<typeof useQueryClient>;
  owner: string | null;
  mint: string;
  key: ReturnType<typeof queryKeys.delegateStatus.byOwnerAssetMint>;
  confirmed: Promise<void>;
  apply: (
    prev: MintDelegateStatus | undefined,
  ) => MintDelegateStatus | undefined;
  applyMatch: (prev: OwnerPayMintMatch | undefined) => OwnerPayMintMatch;
}) {
  const previous = args.queryClient.getQueryData<MintDelegateStatus>(args.key);
  args.queryClient.setQueryData<MintDelegateStatus>(args.key, args.apply);

  const delegateQueries = args.queryClient.getQueriesData<OwnerPayDelegates>({
    queryKey: queryKeys.ownerPayDelegates.byOwner(args.owner),
  });
  args.queryClient.setQueriesData<OwnerPayDelegates>(
    { queryKey: queryKeys.ownerPayDelegates.byOwner(args.owner) },
    (prev) => {
      if (!prev) return prev;
      const byMint = new Map(prev.byMint);
      byMint.set(args.mint, args.applyMatch(byMint.get(args.mint)));
      return {
        ...prev,
        byMint,
        tokenEnabled: [...byMint.values()].some(isOwnerPayMintEnabled),
      };
    },
  );

  try {
    await args.confirmed;
  } catch (error) {
    if (previous !== undefined) {
      args.queryClient.setQueryData(args.key, previous);
    }
    for (const [queryKey, data] of delegateQueries) {
      args.queryClient.setQueryData(queryKey, data);
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
  void args.queryClient.invalidateQueries({
    queryKey: queryKeys.ownerPayDelegates.byOwner(args.owner),
  });
}

/**
 * Approve the asset's program authority as mint delegate for `rawAmount`.
 * Status updates after broadcast; confirm refreshes or rolls back.
 */
export function useSetDelegateMutation(
  owner: string | null,
  options: AllowanceOptions,
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const mintStr = String(options.mint);
  const assetStr = String(options.asset);
  const key = queryKeys.delegateStatus.byOwnerAssetMint(
    owner,
    assetStr,
    mintStr,
  );

  return useMutation<string, Error, { rawAmount: bigint; decimals: number }>({
    mutationFn: async ({ rawAmount, decimals }) => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildDelegateInstructions({
        signer,
        rawAmount,
        mint: address(mintStr),
        asset: address(assetStr),
      });
      const sent = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      await applyDelegateAfterSend({
        queryClient,
        owner,
        mint: mintStr,
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
        applyMatch: (prev) => {
          const asset = address(assetStr);
          if (!prev?.status) {
            return { asset, status: prev?.status ?? null };
          }
          return {
            asset,
            status: {
              ...prev.status,
              isProgramAuthorityDelegate: true,
              delegatedAmountRaw: rawAmount,
              delegatedAmountUi: formatTokenAmount(rawAmount, decimals),
            },
          };
        },
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
  const assetStr = String(options.asset);
  const key = queryKeys.delegateStatus.byOwnerAssetMint(
    owner,
    assetStr,
    mintStr,
  );

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
        mint: mintStr,
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
        applyMatch: (prev) => ({
          asset: null,
          status: prev?.status
            ? {
                ...prev.status,
                isProgramAuthorityDelegate: false,
                delegatedAmountRaw: BigInt(0),
                delegatedAmountUi: "0",
              }
            : null,
        }),
      });
      return sent.signature;
    },
    onSuccess: (signature) => options.onSuccess?.(signature),
  });
}

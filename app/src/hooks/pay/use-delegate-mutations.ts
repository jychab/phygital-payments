"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { address, createNoopSigner, type Address } from "@solana/kit";

import { invalidateOwnerQueries, queryKeys, type MintDelegateStatus, type PayBootstrap } from "@/lib/queries";
import {
  buildDelegateInstructions,
  buildRevokeDelegateInstructions,
  formatTokenAmount,
  isOwnerPayMintEnabled,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { feePayerAddress } from "@/lib/lazorkit/sponsor";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";

type AllowanceOptions = {
  mint: Address | string;
  token: Address | string;
  onSuccess?: (signature: string) => void;
};

async function applyDelegateAfterSend(args: {
  queryClient: ReturnType<typeof useQueryClient>;
  owner: string | null;
  mint: string;
  key: ReturnType<typeof queryKeys.delegateStatus.byOwnerTokenMint>;
  confirmed: Promise<void>;
  apply: (
    prev: MintDelegateStatus | undefined,
  ) => MintDelegateStatus | undefined;
  applyMatch: (prev: OwnerPayMintMatch | undefined) => OwnerPayMintMatch;
}) {
  const previous = args.queryClient.getQueryData<MintDelegateStatus>(args.key);
  args.queryClient.setQueryData<MintDelegateStatus>(args.key, args.apply);

  const delegateQueries = args.queryClient.getQueriesData<PayBootstrap>({
    queryKey: queryKeys.ownerPayDelegates.byOwner(args.owner),
  });
  args.queryClient.setQueriesData<PayBootstrap>(
    { queryKey: queryKeys.ownerPayDelegates.byOwner(args.owner) },
    (prev) => {
      if (!prev) return prev;
      const byMint = new Map(prev.delegates.byMint);
      byMint.set(args.mint, args.applyMatch(byMint.get(args.mint)));
      return {
        ...prev,
        delegates: {
          ...prev.delegates,
          byMint,
          tokenEnabled: [...byMint.values()].some(isOwnerPayMintEnabled),
        },
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
  if (args.owner) {
    invalidateOwnerQueries(args.queryClient, args.owner);
  }
}

/**
 * Approve the token's program authority as mint delegate for `rawAmount`.
 * Status updates after broadcast; confirm refreshes or rolls back.
 */
export function useSetDelegateMutation(
  owner: string | null,
  options: AllowanceOptions,
) {
  const { session } = useSmartWallet();
  const queryClient = useQueryClient();
  const mintStr = String(options.mint);
  const tokenStr = String(options.token);
  const key = queryKeys.delegateStatus.byOwnerTokenMint(
    owner,
    tokenStr,
    mintStr,
  );

  return useMutation<string, Error, { rawAmount: bigint; decimals: number }>({
    mutationFn: async ({ rawAmount, decimals }) => {
      if (!session) throw new Error("Create a passkey first");
      const { prefix, inner } = await buildDelegateInstructions({
        owner: session.vaultPda,
        payer: createNoopSigner(feePayerAddress()),
        rawAmount,
        mint: address(mintStr),
        token: address(tokenStr),
      });
      const sent = await executeAsVault({
        session,
        extraPrefix: prefix,
        inner,
      });
      await applyDelegateAfterSend({
        queryClient,
        owner,
        mint: mintStr,
        key,
        confirmed: Promise.resolve(),
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
          const token = address(tokenStr);
          if (!prev?.status) {
            return { token, status: prev?.status ?? null };
          }
          return {
            token,
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
  const { session } = useSmartWallet();
  const queryClient = useQueryClient();
  const mintStr = String(options.mint);
  const tokenStr = String(options.token);
  const key = queryKeys.delegateStatus.byOwnerTokenMint(
    owner,
    tokenStr,
    mintStr,
  );

  return useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!session) throw new Error("Create a passkey first");
      const { inner } = await buildRevokeDelegateInstructions({
        owner: session.vaultPda,
        mint: address(mintStr),
      });
      const sent = await executeAsVault({
        session,
        inner,
      });
      await applyDelegateAfterSend({
        queryClient,
        owner,
        mint: mintStr,
        key,
        confirmed: Promise.resolve(),
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
          token: null,
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

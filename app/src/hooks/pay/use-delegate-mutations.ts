"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import {
  invalidatePayDelegateQueries,
  queryKeys,
  type MintDelegateStatus,
  type PayBootstrap,
} from "@/lib/queries";
import {
  buildDelegateInstructions,
  buildRevokeDelegateInstructions,
  isOwnerPayMintEnabled,
  patchDelegateAllowance,
  patchRevokedDelegate,
  type OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";

type AllowanceOptions = {
  mint: Address | string;
  token: Address | string;
  onSuccess?: (signature: string) => void;
};

async function applyDelegateAfterSend(args: {
  queryClient: ReturnType<typeof useQueryClient>;
  owner: string | null;
  token: string;
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
      const statusByTokenMint = new Map(prev.delegates.statusByTokenMint);
      const status = args.queryClient.getQueryData<MintDelegateStatus>(args.key);
      if (status) {
        statusByTokenMint.set(`${args.token}|${args.mint}`, status);
      }
      return {
        ...prev,
        delegates: {
          ...prev.delegates,
          byMint,
          statusByTokenMint,
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
    invalidatePayDelegateQueries(args.queryClient, args.owner, {
      token: args.token,
      mint: args.mint,
    });
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
  const signer = useWalletKitSigner();
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
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildDelegateInstructions({
        signer,
        rawAmount,
        mint: address(mintStr),
        token: address(tokenStr),
      });
      const sent = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      await applyDelegateAfterSend({
        queryClient,
        owner,
        token: tokenStr,
        mint: mintStr,
        key,
        confirmed: sent.confirmed,
        apply: (prev) =>
          prev ? patchDelegateAllowance(prev, rawAmount, decimals) : prev,
        applyMatch: (prev) => {
          const token = address(tokenStr);
          if (!prev?.status) {
            return { token, status: prev?.status ?? null };
          }
          return {
            token,
            status: patchDelegateAllowance(prev.status, rawAmount, decimals),
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
  const tokenStr = String(options.token);
  const key = queryKeys.delegateStatus.byOwnerTokenMint(
    owner,
    tokenStr,
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
        token: tokenStr,
        mint: mintStr,
        key,
        confirmed: sent.confirmed,
        apply: (prev) => (prev ? patchRevokedDelegate(prev) : prev),
        applyMatch: (prev) => ({
          token: null,
          status: prev?.status ? patchRevokedDelegate(prev.status) : null,
        }),
      });
      return sent.signature;
    },
    onSuccess: (signature) => options.onSuccess?.(signature),
  });
}

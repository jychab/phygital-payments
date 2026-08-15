"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";
import {
  getRemoveOwnershipInstruction,
  getSetLockStateInstruction,
} from "phygital-token-sdk";

import type { PhygitalAsset } from "@/lib/phygital/asset";
import { queryKeys } from "@/lib/queries";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";

type AssetsContext = { previous?: PhygitalAsset[] };

/**
 * Toggle lock on a Lockable phygital asset. Optimistically updates the owner's
 * device list, then confirms on-chain (rolls back on failure).
 */
export function useSetLockStateMutation(owner: string | null) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const key = queryKeys.asset.byOwner(owner);

  return useMutation<
    string,
    Error,
    { asset: Address; isLocked: boolean },
    AssetsContext
  >({
    mutationFn: async ({ asset, isLocked }) => {
      if (!signer) throw new Error("Connect your wallet");
      const instruction = getSetLockStateInstruction({
        owner: signer,
        asset,
        isLocked,
      });
      const { signature } = await sendTransaction({
        instructions: [instruction],
        feePayer: signer,
      });
      return signature;
    },
    onMutate: async ({ asset, isLocked }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PhygitalAsset[]>(key);
      queryClient.setQueryData<PhygitalAsset[]>(key, (prev) =>
        prev?.map((row) =>
          row.asset === asset ? { ...row, isLocked } : row,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
  });
}

/**
 * Forfeit ownership of an asset. Optimistically removes it from the owner's
 * device list, then confirms on-chain (rolls back on failure).
 */
export function useRemoveOwnershipMutation(owner: string | null) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const key = queryKeys.asset.byOwner(owner);

  return useMutation<string, Error, { asset: Address }, AssetsContext>({
    mutationFn: async ({ asset }) => {
      if (!signer) throw new Error("Connect your wallet");
      const instruction = getRemoveOwnershipInstruction({
        owner: signer,
        asset,
      });
      const { signature } = await sendTransaction({
        instructions: [instruction],
        feePayer: signer,
      });
      return signature;
    },
    onMutate: async ({ asset }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PhygitalAsset[]>(key);
      queryClient.setQueryData<PhygitalAsset[]>(key, (prev) =>
        prev?.filter((row) => row.asset !== asset),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
  });
}

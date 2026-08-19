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
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";

/**
 * Toggle lock on a Lockable phygital asset. The row flips after broadcast;
 * confirm refreshes the list, or a failed land rolls the lock state back.
 */
export function useSetLockStateMutation(owner: string | null) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const key = queryKeys.asset.byOwner(owner);

  return useMutation<string, Error, { asset: Address; isLocked: boolean }>({
    mutationFn: async ({ asset, isLocked }) => {
      if (!signer) throw new Error("Connect your wallet");
      const instruction = getSetLockStateInstruction({
        owner: signer,
        asset,
        isLocked,
      });
      const sent = await sendTransaction({
        instructions: [instruction],
        feePayer: signer,
      });
      const previous = queryClient.getQueryData<PhygitalAsset[]>(key);
      queryClient.setQueryData<PhygitalAsset[]>(key, (prev) =>
        prev?.map((row) =>
          row.asset === asset ? { ...row, isLocked } : row,
        ),
      );
      try {
        await sent.confirmed;
      } catch (error) {
        if (previous !== undefined) queryClient.setQueryData(key, previous);
        throw error;
      }
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.asset.byAddress(String(asset)),
      });
      return sent.signature;
    },
  });
}

/**
 * Forfeit ownership of an asset. The row drops after broadcast; a failed land
 * puts it back.
 */
export function useRemoveOwnershipMutation(owner: string | null) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const key = queryKeys.asset.byOwner(owner);

  return useMutation<string, Error, { asset: Address }>({
    mutationFn: async ({ asset }) => {
      if (!signer) throw new Error("Connect your wallet");
      const instruction = getRemoveOwnershipInstruction({
        owner: signer,
        asset,
      });
      const sent = await sendTransaction({
        instructions: [instruction],
        feePayer: signer,
      });
      const previous = queryClient.getQueryData<PhygitalAsset[]>(key);
      queryClient.setQueryData<PhygitalAsset[]>(key, (prev) =>
        prev?.filter((row) => row.asset !== asset),
      );
      try {
        await sent.confirmed;
      } catch (error) {
        if (previous !== undefined) queryClient.setQueryData(key, previous);
        throw error;
      }
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.asset.byAddress(String(asset)),
      });
      return sent.signature;
    },
  });
}

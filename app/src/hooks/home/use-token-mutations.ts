"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";
import { getRemoveOwnershipInstruction } from "phygital-token-sdk";

import type { PhygitalToken } from "@/lib/phygital/token";
import { queryKeys } from "@/lib/queries";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";

/**
 * Forfeit ownership of a token. The row drops after broadcast; a failed land
 * puts it back.
 */
export function useRemoveOwnershipMutation(owner: string | null) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();
  const key = queryKeys.phygitalToken.byOwner(owner);

  return useMutation<string, Error, { token: Address }>({
    mutationFn: async ({ token }) => {
      if (!signer) throw new Error("Connect your wallet");
      const instruction = getRemoveOwnershipInstruction({
        owner: signer,
        phygitalToken: token,
      });
      const sent = await sendTransaction({
        instructions: [instruction],
        feePayer: signer,
      });
      const previous = queryClient.getQueryData<PhygitalToken[]>(key);
      queryClient.setQueryData<PhygitalToken[]>(key, (prev) =>
        prev?.filter((row) => row.address !== token),
      );
      try {
        await sent.confirmed;
      } catch (error) {
        if (previous !== undefined) queryClient.setQueryData(key, previous);
        throw error;
      }
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.phygitalToken.byAddress(String(token)),
      });
      return sent.signature;
    },
  });
}

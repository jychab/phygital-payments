"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryKeys } from "@/lib/queries";
import {
  buildCreateAtaInstructions,
  type RecipientAtaStatus,
} from "@/lib/tokens/ata";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";

/**
 * Create a wallet's SPL token account for `mint` (connected wallet pays rent).
 * Status flips to ready after broadcast; confirm refreshes or rolls back.
 */
export function useCreateAtaMutation(
  mint: Address,
  options?: { onSuccess?: () => void },
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recipient: Address }>({
    mutationFn: async ({ recipient }) => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildCreateAtaInstructions({
        signer,
        mint,
        owner: recipient,
      });
      if (instructions.length === 0) return;

      const key = queryKeys.ataStatus.byOwnerMint(recipient, mint);
      const sent = await sendTransaction({ instructions, feePayer: signer });
      const previous = queryClient.getQueryData<RecipientAtaStatus>(key);
      queryClient.setQueryData<RecipientAtaStatus>(key, (prev) =>
        prev ? { ...prev, exists: true } : prev,
      );
      try {
        await sent.confirmed;
      } catch (error) {
        if (previous !== undefined) queryClient.setQueryData(key, previous);
        throw error;
      }
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onSuccess: () => options?.onSuccess?.(),
  });
}

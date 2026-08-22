"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNoopSigner, type Address } from "@solana/kit";

import { queryKeys, type RecipientAtaStatus } from "@/lib/queries";
import { buildCreateRecipientAtaInstructions } from "@/lib/collect/collect-settle";
import { feePayerAddress, sponsorInstructions } from "@/lib/lazorkit/sponsor";

/**
 * Create the recipient's token account (fee-payer sponsors rent).
 */
export function useCreateAtaMutation(
  mint: Address,
  options?: { onSuccess?: () => void },
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recipient: Address }>({
    mutationFn: async ({ recipient }) => {
      const { instructions } = await buildCreateRecipientAtaInstructions({
        payer: createNoopSigner(feePayerAddress()),
        mint,
        owner: recipient,
      });
      if (instructions.length === 0) return;

      const key = queryKeys.ataStatus.byOwnerMint(recipient, mint);
      await sponsorInstructions(instructions);
      queryClient.setQueryData<RecipientAtaStatus>(key, (prev) =>
        prev ? { ...prev, exists: true } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onSuccess: () => options?.onSuccess?.(),
  });
}

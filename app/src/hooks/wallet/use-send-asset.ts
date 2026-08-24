"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { queryKeys } from "@/lib/queries";
import type { WalletHolding } from "@/lib/wallet/portfolio";
import { buildSendAssetInners } from "@/lib/wallet/transfer-asset";

export function useSendAsset() {
  const queryClient = useQueryClient();
  const { session } = useSmartWallet();

  return useMutation({
    mutationFn: async (input: {
      holding: WalletHolding;
      destination: Address;
      uiAmount: string;
    }) => {
      if (!session) throw new Error("Not connected");
      const { inners } = await buildSendAssetInners({
        vaultPda: session.vaultPda,
        holding: input.holding,
        destination: input.destination,
        uiAmount: input.uiAmount,
      });
      return executeAsVault({
        session,
        inner: inners,
      });
    },
    onSuccess: async () => {
      if (!session) return;
      const vault = String(session.vaultPda);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.walletPortfolio.byVault(vault),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.walletActivity.byVault(vault),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.nfcAccessories.byVault(vault),
        }),
      ]);
    },
  });
}

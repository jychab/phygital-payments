"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { buildRevokeSessionInner } from "@/lib/lazorkit/session";
import { queryFetch, queryKeys, readJson } from "@/lib/queries";
import { fetchWalletAuthProof } from "@/lib/wallet/wallet-auth-client";
import { createAgentSessionOnChain } from "@/lib/wallet/agent-client";

export function useCreateAgentSession() {
  const queryClient = useQueryClient();
  const { session } = useSmartWallet();

  return useMutation({
    mutationFn: async (input: {
      grantBody: Record<string, unknown>;
      lockTokenAddress?: Address;
    }) => {
      if (!session) throw new Error("Not connected");
      await createAgentSessionOnChain({
        session,
        grantBody: input.grantBody,
        lockTokenAddress: input.lockTokenAddress,
      });
      return String(session.vaultPda);
    },
    onSuccess: async (vault) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.agentSession.byVault(vault),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.nfcAccessories.byVault(vault),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.walletDashboard.byVault(vault),
        }),
      ]);
    },
  });
}

export function useCloseAgentSession() {
  const queryClient = useQueryClient();
  const { session } = useSmartWallet();

  return useMutation({
    mutationFn: async (sessionPda: string) => {
      if (!session) throw new Error("Not connected");
      await executeAsVault({
        session,
        inner: [
          buildRevokeSessionInner({
            vaultPda: session.vaultPda,
            walletPda: session.walletPda,
            authorityPda: session.authorityPda,
            sessionPda: address(sessionPda),
          }),
        ],
      }).catch(() => {
        /* API cleanup still stops signing */
      });
      const walletAuth = await fetchWalletAuthProof(session);
      await queryFetch("/api/wallet/grant", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionPda, walletAuth }),
      }).then((res) => readJson(res, "Couldn’t turn off spending"));
      return String(session.vaultPda);
    },
    onSuccess: async (vault) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.agentSession.byVault(vault),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.walletDashboard.byVault(vault),
        }),
      ]);
    },
  });
}

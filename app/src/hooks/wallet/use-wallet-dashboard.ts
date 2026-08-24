"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryFetch, queryKeys, queryOptions, readJson } from "@/lib/queries";
import type { PhygitalTokenWire } from "@/lib/phygital/token-wire";
import type { AgentSessionDetail } from "@/lib/wallet/agent-policy";
import type { WalletPortfolio } from "@/lib/wallet/portfolio";

async function fetchWalletDashboard(vaultPda: Address) {
  const res = await queryFetch(
    `/api/wallet/dashboard?vault=${encodeURIComponent(String(vaultPda))}`,
  );
  return readJson<{
    portfolio: WalletPortfolio;
    accessories: PhygitalTokenWire[];
    agents: AgentSessionDetail[];
  }>(res, "Couldn’t load wallet");
}

/** Portfolio + NFC accessories + agents in one request (wallet home). */
export function useWalletDashboard(vaultPda: Address | null, enabled = true) {
  const queryClient = useQueryClient();
  const vaultKey = vaultPda ? String(vaultPda) : null;

  return useQuery({
    queryKey: queryKeys.walletDashboard.byVault(vaultKey),
    queryFn: async () => {
      if (!vaultPda) throw new Error("Missing wallet");
      const data = await fetchWalletDashboard(vaultPda);
      queryClient.setQueryData(
        queryKeys.walletPortfolio.byVault(vaultKey),
        data.portfolio,
      );
      queryClient.setQueryData(
        queryKeys.nfcAccessories.byVault(vaultKey),
        data.accessories,
      );
      queryClient.setQueryData(
        queryKeys.agentSession.byVault(vaultKey),
        data.agents,
      );
      return data;
    },
    enabled: Boolean(vaultPda) && enabled,
    ...queryOptions.wallet,
  });
}

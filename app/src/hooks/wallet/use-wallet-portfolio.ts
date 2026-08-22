"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryFetch, queryKeys, queryOptions, readJson } from "@/lib/queries";
import type { WalletPortfolio } from "@/lib/wallet/portfolio";

async function fetchWalletPortfolio(vaultPda: Address) {
  const res = await queryFetch(
    `/api/wallet/assets?vault=${encodeURIComponent(String(vaultPda))}`,
  );
  const body = await readJson<{ portfolio: WalletPortfolio }>(
    res,
    "Couldn’t load portfolio",
  );
  return body.portfolio;
}

export function useWalletPortfolio(vaultPda: Address | null) {
  return useQuery({
    queryKey: queryKeys.walletPortfolio.byVault(
      vaultPda ? String(vaultPda) : null,
    ),
    queryFn: async () => {
      if (!vaultPda) throw new Error("Missing wallet");
      return fetchWalletPortfolio(vaultPda);
    },
    enabled: Boolean(vaultPda),
    ...queryOptions.recent,
  });
}

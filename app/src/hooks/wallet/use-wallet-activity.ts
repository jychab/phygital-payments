"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryFetch, queryKeys, queryOptions, readJson } from "@/lib/queries";
import type { WalletActivityItem } from "@/lib/wallet/activity";

export async function fetchWalletActivity(vaultPda: Address) {
  const res = await queryFetch(
    `/api/wallet/activity?vault=${encodeURIComponent(String(vaultPda))}`,
  );
  const body = await readJson<{ activity: WalletActivityItem[] }>(
    res,
    "Couldn’t load activity",
  );
  return body.activity;
}

export function useWalletActivity(vaultPda: Address | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.walletActivity.byVault(
      vaultPda ? String(vaultPda) : null,
    ),
    queryFn: async () => {
      if (!vaultPda) return [];
      return fetchWalletActivity(vaultPda);
    },
    enabled: Boolean(vaultPda) && enabled,
    ...queryOptions.wallet,
  });
}

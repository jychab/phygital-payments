import { getRpcUrl } from "@/solana/cluster";
import { fetchWithTimeout } from "@/platform/fetch-with-timeout";
import {
  labelFromBalanceChanges,
  type WalletActivityItem,
} from "@/wallet/activity-types";

export async function fetchWalletActivity(
  vaultPda: string,
  limit = 20,
): Promise<WalletActivityItem[]> {
  const url = new URL(
    `${getRpcUrl()}/v1/wallet/${encodeURIComponent(vaultPda)}/history`,
  );
  url.searchParams.set("limit", String(Math.min(100, Math.max(1, limit))));
  url.searchParams.set("tokenAccounts", "balanceChanged");

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(`Wallet history failed (${res.status})`);
  }

  const body = (await res.json()) as {
    data?: {
      signature: string;
      timestamp?: number | null;
      slot: number;
      error?: string | null;
      balanceChanges?: { mint: string; amount: number; decimals: number }[];
    }[];
  };

  return (body.data ?? []).map((tx) => {
    const failed = tx.error != null && tx.error !== "";
    return {
      signature: tx.signature,
      slot: tx.slot,
      err: failed,
      blockTime: tx.timestamp ?? null,
      label: labelFromBalanceChanges(tx.balanceChanges ?? [], failed),
    };
  });
}

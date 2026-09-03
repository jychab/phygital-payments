import { queryFetch, readJson } from "@/lib/queries/http";
import type { WalletActivityItem } from "@/lib/wallet/portfolio-types";

export async function fetchWalletActivity(args: {
  walletAddress: string;
  limit?: number;
  before?: string | null;
}): Promise<{ items: WalletActivityItem[]; nextCursor: string | null }> {
  const params = new URLSearchParams({
    wallet: args.walletAddress,
    limit: String(args.limit ?? 20),
  });
  if (args.before) params.set("before", args.before);

  const res = await queryFetch(`/wallet/activity?${params.toString()}`);
  const data = await readJson<{
    items?: WalletActivityItem[];
    nextCursor?: string | null;
  }>(res, "Couldn’t load activity");

  return {
    items: Array.isArray(data.items) ? data.items : [],
    nextCursor: data.nextCursor ?? null,
  };
}

import { queryFetch, readJson } from "@/lib/queries/http";

export async function fetchFeeBalance(phygitalToken: string) {
  const res = await queryFetch(
    `/tokens/fee-balance?phygitalToken=${encodeURIComponent(phygitalToken)}`,
  );
  const data = await readJson<{
    balanceLamports?: string | number;
    balanceUi?: string;
    low?: boolean;
  }>(res, "Couldn’t load fee balance");

  const balanceLamports = Number(data.balanceLamports ?? 0);

  return {
    balanceLamports: Number.isFinite(balanceLamports) ? balanceLamports : 0,
    balanceUi: data.balanceUi ?? "0",
    low: Boolean(data.low),
  };
}

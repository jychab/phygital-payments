import { queryFetch, readJson } from "@/lib/queries/http";

export async function fetchFeeBalance(phygitalToken: string) {
  const res = await queryFetch(
    `/tokens/fee-balance?phygitalToken=${encodeURIComponent(phygitalToken)}`,
  );
  const data = await readJson<{
    balanceUi?: string;
    low?: boolean;
  }>(res, "Couldn’t load fee balance");

  return {
    balanceUi: data.balanceUi ?? "0",
    low: Boolean(data.low),
  };
}

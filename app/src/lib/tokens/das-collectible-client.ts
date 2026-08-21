import { queryFetch, readJson } from "@/lib/queries/http";
import type { Collectible } from "@/lib/tokens/collectible";

export async function fetchDasCollectibleClient(
  mint: string,
): Promise<Collectible | null> {
  const res = await queryFetch(
    `/api/tokens/collectible?id=${encodeURIComponent(mint)}`,
  );
  if (!res.ok) return null;
  const body = await readJson<{ collectible?: Collectible | null }>(
    res,
    "Couldn’t load collectible",
  );
  return body.collectible ?? null;
}

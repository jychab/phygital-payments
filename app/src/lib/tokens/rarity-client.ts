import { queryFetch, readJson } from "@/lib/queries/http";
import type { CollectibleRarity } from "@/lib/tokens/collectible";

export async function fetchCollectibleRarityClient(
  mint: string,
): Promise<CollectibleRarity | null> {
  const res = await queryFetch(
    `/api/tokens/rarity?id=${encodeURIComponent(mint)}`,
  );
  if (!res.ok) return null;
  const body = await readJson<{ rarity?: CollectibleRarity | null }>(
    res,
    "Couldn’t load rarity",
  );
  return body.rarity ?? null;
}

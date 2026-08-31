import { queryFetch, readJson } from "@/lib/queries/http";
import type { CollectibleRarity } from "@/lib/tokens/collectible";

export type CollectibleRarityResponse = {
  rarity: CollectibleRarity | null;
};

export async function fetchCollectibleRarityClient(
  mint: string,
): Promise<CollectibleRarityResponse> {
  const res = await queryFetch(
    `/api/tokens/rarity?id=${encodeURIComponent(mint)}`,
  );
  const body = await readJson<CollectibleRarityResponse>(
    res,
    "Couldn’t load rarity",
  );
  return { rarity: body.rarity ?? null };
}

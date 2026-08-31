import { queryFetch, readJson } from "@/lib/queries/http";
import type { CollectibleRarity } from "@/lib/tokens/collectible";

/** Mirrors server `CollectionRarityStatus` — keep client-safe (no server-only import). */
export type CollectionRarityStatus =
  | "scanning"
  | "scoring"
  | "ready"
  | "failed";

export type CollectibleRarityResponse = {
  rarity: CollectibleRarity | null;
  status: CollectionRarityStatus | null;
  collectionMint?: string | null;
  totalSupply?: number;
  scanPage?: number;
  errorMessage?: string | null;
  reason?: string;
};

export async function fetchCollectibleRarityClient(
  mint: string,
): Promise<CollectibleRarityResponse> {
  const res = await queryFetch(
    `/api/tokens/rarity?id=${encodeURIComponent(mint)}`,
  );
  const body = await readJson<
    CollectibleRarityResponse & { error?: string }
  >(res, "Couldn’t load rarity");

  if (!res.ok) {
    throw new Error(body.error ?? `Rarity request failed (${res.status})`);
  }

  return {
    rarity: body.rarity ?? null,
    status: body.status ?? null,
    collectionMint: body.collectionMint,
    totalSupply: body.totalSupply,
    scanPage: body.scanPage,
    errorMessage: body.errorMessage,
    reason: body.reason,
  };
}

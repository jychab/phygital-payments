import { queryFetch, readJson } from "@/lib/queries/http";
import type { Collectible, CollectibleRarity } from "@/lib/tokens/collectible";
import type { CollectibleShortcut } from "@/lib/tokens/shortcuts";

export type MintedCollectibleView = {
  collectible: Collectible | null;
  rarity: CollectibleRarity | null;
  shortcuts: CollectibleShortcut[];
};

export async function fetchMintedCollectibleViewClient(
  mint: string,
): Promise<MintedCollectibleView> {
  const res = await queryFetch(
    `/api/tokens/minted?id=${encodeURIComponent(mint)}`,
  );
  const body = await readJson<MintedCollectibleView & { error?: string }>(
    res,
    "Couldn’t load collectible",
  );
  return {
    collectible: body.collectible ?? null,
    rarity: body.rarity ?? null,
    shortcuts: Array.isArray(body.shortcuts) ? body.shortcuts : [],
  };
}

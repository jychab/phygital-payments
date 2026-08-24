import { postDasRpc } from "@/solana/das-rpc";
import {
  collectibleFromDas,
  type Collectible,
  type DasCollectibleAsset,
} from "@/solana/collectible";

const COLLECTIBLE_TTL_MS = 15 * 60 * 1000;

const collectibleCache = new Map<
  string,
  { value: Collectible | null; fetchedAt: number }
>();
const collectibleInflight = new Map<string, Promise<Collectible | null>>();

async function fetchDasCollectibleFromRpc(
  mint: string,
): Promise<Collectible | null> {
  try {
    const result = await postDasRpc<DasCollectibleAsset | null>({
      method: "getAsset",
      id: "collectible",
      params: {
        id: mint,
        displayOptions: { showCollectionMetadata: true },
      },
    });
    return collectibleFromDas(result);
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}

/**
 * Helius DAS `getAsset` for a mint. Returns `null` when the asset is missing
 * or has no name/image. Isolate cache (15 min) coalesces repeats across
 * `/api/tokens/collectible` — not an HTTP cache.
 */
export async function fetchDasCollectible(
  mint: string,
): Promise<Collectible | null> {
  const now = Date.now();
  const hit = collectibleCache.get(mint);
  if (hit && now - hit.fetchedAt < COLLECTIBLE_TTL_MS) return hit.value;

  const pending = collectibleInflight.get(mint);
  if (pending) return pending;

  const request = fetchDasCollectibleFromRpc(mint)
    .then((value) => {
      collectibleCache.set(mint, { value, fetchedAt: Date.now() });
      return value;
    })
    .finally(() => {
      collectibleInflight.delete(mint);
    });
  collectibleInflight.set(mint, request);
  return request;
}

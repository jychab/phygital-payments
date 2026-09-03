
import { postDasRpc } from "@/tokens/das-rpc";
import {
  collectibleFromDas,
  type Collectible,
  type DasCollectibleAsset,
} from "@/tokens/collectible";

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
        displayOptions: {
          showCollectionMetadata: true,
        },
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

function cacheGet(mint: string, now: number): Collectible | null | undefined {
  const hit = collectibleCache.get(mint);
  if (hit && now - hit.fetchedAt < COLLECTIBLE_TTL_MS) return hit.value;
  return undefined;
}

function cacheSet(mint: string, value: Collectible | null) {
  collectibleCache.set(mint, { value, fetchedAt: Date.now() });
}

/**
 * Helius DAS `getAsset` for a mint. Returns `null` when the asset is missing
 * or has no name/image. Isolate cache (15 min) coalesces repeats across
 * `/tokens/collectible` — not an HTTP cache.
 */
export async function fetchDasCollectible(
  mint: string,
): Promise<Collectible | null> {
  const cached = cacheGet(mint, Date.now());
  if (cached !== undefined) return cached;

  const pending = collectibleInflight.get(mint);
  if (pending) return pending;

  const request = fetchDasCollectibleFromRpc(mint)
    .then((value) => {
      cacheSet(mint, value);
      return value;
    })
    .finally(() => {
      collectibleInflight.delete(mint);
    });
  collectibleInflight.set(mint, request);
  return request;
}

/**
 * Batch DAS `getAssetBatch` for binder grids. Returns a mint → collectible map.
 * Cache hits skip RPC; remaining IDs go in one round-trip.
 */
export async function fetchDasCollectibles(
  mints: string[],
): Promise<Record<string, Collectible | null>> {
  const unique = [...new Set(mints.map((m) => m.trim()).filter(Boolean))];
  const out: Record<string, Collectible | null> = {};
  const missing: string[] = [];
  const now = Date.now();

  for (const mint of unique) {
    const cached = cacheGet(mint, now);
    if (cached !== undefined) {
      out[mint] = cached;
    } else {
      missing.push(mint);
    }
  }

  if (missing.length === 0) return out;

  if (missing.length === 1) {
    const mint = missing[0]!;
    out[mint] = await fetchDasCollectible(mint);
    return out;
  }

  try {
    const result = await postDasRpc<DasCollectibleAsset[]>({
      method: "getAssetBatch",
      id: "collectible-batch",
      params: {
        ids: missing,
        displayOptions: {
          showCollectionMetadata: true,
        },
      },
    });
    const byId = new Map<string, DasCollectibleAsset>();
    for (const asset of result ?? []) {
      const id = asset?.id?.trim();
      if (id) byId.set(id, asset);
    }
    for (const mint of missing) {
      const value = collectibleFromDas(byId.get(mint) ?? null);
      cacheSet(mint, value);
      out[mint] = value;
    }
  } catch {
    // Batch unsupported / failed — fall back per mint so the binder still loads.
    await Promise.all(
      missing.map(async (mint) => {
        out[mint] = await fetchDasCollectible(mint);
      }),
    );
  }

  return out;
}

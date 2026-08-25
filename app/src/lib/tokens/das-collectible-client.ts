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

/** Batch DAS metadata for binder grids — one HTTP round-trip. */
export async function fetchDasCollectiblesClient(
  mints: string[],
): Promise<Record<string, Collectible | null>> {
  const unique = [...new Set(mints.filter(Boolean))];
  if (unique.length === 0) return {};
  if (unique.length === 1) {
    const mint = unique[0]!;
    return { [mint]: await fetchDasCollectibleClient(mint) };
  }

  const res = await queryFetch("/api/tokens/collectible/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: unique }),
  });
  if (!res.ok) return {};
  const body = await readJson<{
    collectibles?: Record<string, Collectible | null>;
  }>(res, "Couldn’t load collectibles");
  return body.collectibles ?? {};
}

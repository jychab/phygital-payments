import { queryFetch, readJson } from "@/lib/queries/http";
import type { CollectibleShortcut } from "@/lib/tokens/shortcuts";

export async function fetchCollectibleShortcutsClient(
  externalUrl: string,
  collectionMint: string | null,
): Promise<CollectibleShortcut[]> {
  const params = new URLSearchParams({ externalUrl });
  if (collectionMint) params.set("collectionMint", collectionMint);
  const res = await queryFetch(`/api/tokens/shortcuts?${params}`);
  if (!res.ok) return [];
  const body = await readJson<{ shortcuts?: CollectibleShortcut[] }>(
    res,
    "Couldn’t load shortcuts",
  );
  return Array.isArray(body.shortcuts) ? body.shortcuts : [];
}

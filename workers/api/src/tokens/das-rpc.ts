import { getRpcUrl } from "@/shared/solana/cluster";
import type { DasAsset, DasAssetList } from "@/tokens/das-schema";

type DasJsonRpcBody<T> = {
  result?: T;
  error?: { message?: string };
  id?: string | number;
};

type DasRpcCall = {
  method: string;
  params: unknown;
  id: string;
};

/** Helius DAS JSON-RPC POST. Keep in sync with `app/src/lib/solana/das-rpc.ts`. */
async function postDasRpc<T>(args: DasRpcCall): Promise<T | undefined> {
  const res = await fetch(getRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: args.id,
      method: args.method,
      params: args.params,
    }),
  });

  if (!res.ok) {
    throw new Error(`${args.method} RPC failed (${res.status})`);
  }

  const body = (await res.json()) as DasJsonRpcBody<T>;
  if (body.error?.message) {
    throw new Error(body.error.message);
  }
  return body.result;
}

/**
 * Multiple DAS methods in one HTTP round-trip (JSON-RPC batch).
 * Results are returned in the same order as `calls`.
 */
export async function postDasRpcBatch<T extends unknown[]>(
  calls: { [K in keyof T]: DasRpcCall },
): Promise<{ [K in keyof T]: T[K] | undefined }> {
  if (calls.length === 0) {
    return [] as { [K in keyof T]: T[K] | undefined };
  }
  if (calls.length === 1) {
    const only = calls[0]!;
    const result = await postDasRpc<T[0]>(only);
    return [result] as { [K in keyof T]: T[K] | undefined };
  }

  const res = await fetch(getRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      calls.map((c) => ({
        jsonrpc: "2.0",
        id: c.id,
        method: c.method,
        params: c.params,
      })),
    ),
  });

  if (!res.ok) {
    throw new Error(`DAS batch RPC failed (${res.status})`);
  }

  const bodies = (await res.json()) as DasJsonRpcBody<unknown>[];
  if (!Array.isArray(bodies)) {
    throw new Error("DAS batch RPC returned a non-array body");
  }

  const byId = new Map<string | number, DasJsonRpcBody<unknown>>();
  for (const body of bodies) {
    if (body.id !== undefined) byId.set(body.id, body);
  }

  return calls.map((c) => {
    const body = byId.get(c.id);
    if (!body) throw new Error(`Missing DAS batch result for id=${c.id}`);
    if (body.error?.message) throw new Error(body.error.message);
    return body.result as T[number] | undefined;
  }) as { [K in keyof T]: T[K] | undefined };
}

export async function dasGetAssetsByGroup(args: {
  groupKey: string;
  groupValue: string;
  page: number;
  limit?: number;
}): Promise<DasAsset[]> {
  const result = await postDasRpc<DasAssetList>({
    method: "getAssetsByGroup",
    id: `getAssetsByGroup-${args.page}`,
    params: {
      groupKey: args.groupKey,
      groupValue: args.groupValue,
      page: args.page,
      limit: args.limit ?? 1000,
    },
  });
  return Array.isArray(result?.items) ? result.items : [];
}

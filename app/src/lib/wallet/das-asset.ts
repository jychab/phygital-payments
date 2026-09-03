import { RPC_URL } from "@/lib/solana/cluster";

type DasJsonRpcBody<T> = {
  result?: T;
  error?: { message?: string };
};

async function postDasRpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: method,
      method,
      params,
    }),
  });
  if (!res.ok) {
    throw new Error(`${method} RPC failed (${res.status})`);
  }
  const body = (await res.json()) as DasJsonRpcBody<T>;
  if (body.error?.message) {
    throw new Error(body.error.message);
  }
  if (body.result === undefined) {
    throw new Error(`${method} returned no result`);
  }
  return body.result;
}

type DasGetAssetResponse = {
  id: string;
  compression?: {
    compressed?: boolean;
    leaf_id?: number;
    data_hash?: string;
    creator_hash?: string;
  };
  ownership?: {
    owner?: string;
    delegate?: string | null;
  };
  grouping?: { group_key: string; group_value: string }[];
};

type DasAssetProof = {
  root: string;
  proof: string[];
  node_index: number;
  leaf: string;
  tree_id: string;
};

export async function fetchDasAsset(
  assetId: string,
): Promise<DasGetAssetResponse> {
  return postDasRpc<DasGetAssetResponse>("getAsset", { id: assetId });
}

export async function fetchDasAssetProof(
  assetId: string,
): Promise<DasAssetProof> {
  return postDasRpc<DasAssetProof>("getAssetProof", { id: assetId });
}

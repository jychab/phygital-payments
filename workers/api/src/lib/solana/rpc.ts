import { createSolanaRpc, type Rpc, type SolanaRpcApi } from "@solana/kit";

import { getRpcUrl } from "./cluster";

let cached: { url: string; client: Rpc<SolanaRpcApi> } | null = null;

export function getSolanaRpc() {
  const url = getRpcUrl();
  if (!cached || cached.url !== url) {
    cached = { url, client: createSolanaRpc(url) };
  }
  return cached.client;
}

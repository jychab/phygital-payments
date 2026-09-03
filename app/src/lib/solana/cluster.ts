import { resolveSolanaRpcUrl } from "@/lib/solana/rpc-preference";

export type Cluster = "devnet" | "mainnet";

const CLUSTER = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as Cluster) || "devnet";

/**
 * Active Solana / DAS RPC. Honors a user custom endpoint from settings
 * (localStorage), else `NEXT_PUBLIC_SOLANA_RPC_URL`.
 */
export function getSolanaRpcUrl(): string {
  return resolveSolanaRpcUrl();
}

export function rpcSubscriptionsUrl(): string {
  return getSolanaRpcUrl().replace(/^http/, "ws");
}

export function getChainId(): `solana:${string}` {
  return CLUSTER === "mainnet" ? "solana:mainnet" : "solana:devnet";
}

export function isMainnet() {
  return CLUSTER === "mainnet";
}

export function explorerTxUrl(signature: string): string {
  const suffix = isMainnet() ? "" : `?cluster=${CLUSTER}`;
  return `https://explorer.solana.com/tx/${signature}${suffix}`;
}

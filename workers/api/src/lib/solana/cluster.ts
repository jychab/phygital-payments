import { getEnv } from "@/lib/server/request-context";

export type Cluster = "devnet" | "mainnet";

function getCluster(): Cluster {
  return (getEnv().NEXT_PUBLIC_SOLANA_CLUSTER as Cluster) || "devnet";
}

export function getRpcUrl(): string {
  return getEnv().NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
}

export function isMainnet() {
  return getCluster() === "mainnet";
}

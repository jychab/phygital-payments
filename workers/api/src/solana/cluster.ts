import { getEnv } from "@/platform/request-context";

export type Cluster = "devnet" | "mainnet";

function getCluster(): Cluster {
  return (getEnv().NEXT_PUBLIC_SOLANA_CLUSTER as Cluster);
}

export function getRpcUrl(): string {
  return getEnv().NEXT_PUBLIC_SOLANA_RPC_URL;
}

export function isMainnet() {
  return getCluster() === "mainnet";
}

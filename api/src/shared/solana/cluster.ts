export type Cluster = "devnet" | "mainnet";

import { getEnv } from "@/shared/request-context";

function getCluster(): Cluster {
  const raw = getEnv().SOLANA_CLUSTER?.trim().toLowerCase();
  return raw === "mainnet" ? "mainnet" : "devnet";
}

export function getRpcUrl(): string {
  return (
    getEnv().SOLANA_RPC_URL?.trim() ||
    (getCluster() === "mainnet"
      ? "https://rpc.revibase.com"
      : "https://api.devnet.solana.com")
  );
}

export function isMainnet(): boolean {
  return getCluster() === "mainnet";
}

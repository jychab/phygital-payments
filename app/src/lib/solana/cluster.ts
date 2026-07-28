export type Cluster = "devnet" | "mainnet";

const CLUSTER = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER as Cluster) || "devnet";

export const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export function rpcSubscriptionsUrl(): string {
  return RPC_URL.replace(/^http/, "ws");
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

"use client";

import { type PrivyClientConfig } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";

import { getChainId, rpcSubscriptionsUrl, RPC_URL } from "@/lib/solana/cluster";

type PrivyUserLike = {
  linkedAccounts?: Array<{
    type: string;
    chainType?: string;
    address?: string;
  }>;
};

/** First Solana wallet address linked to the Privy user, if any. */
export function solanaAddressFromLinkedAccounts(
  user: PrivyUserLike | null | undefined,
): string | null {
  for (const account of user?.linkedAccounts ?? []) {
    if (
      account.type === "wallet" &&
      account.chainType === "solana" &&
      typeof account.address === "string" &&
      account.address.length > 0
    ) {
      return account.address;
    }
  }
  return null;
}

const solanaConnectors = toSolanaWalletConnectors();
const chainId = getChainId();

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    walletChainType: "solana-only",
    showWalletLoginFirst: true,
    walletList: [
      "phantom",
      "solflare",
      "backpack",
      "detected_solana_wallets",
      "wallet_connect_qr_solana",
    ],
  },
  loginMethods: ["google", "wallet"],
  embeddedWallets: {
    solana: { createOnLogin: "users-without-wallets" },
  },
  externalWallets: {
    solana: { connectors: solanaConnectors },
  },
  solana: {
    rpcs: {
      [chainId]: {
        rpc: createSolanaRpc(RPC_URL),
        rpcSubscriptions: createSolanaRpcSubscriptions(rpcSubscriptionsUrl()),
      },
    },
  },
};

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

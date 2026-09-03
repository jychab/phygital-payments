import { formatTokenAmount } from "@/tokens/amount";
import {
  CLASSIC_TOKEN_PROGRAM,
  isSupportedTokenProgram,
  NATIVE_SOL_MINT,
  nativeSolHolding,
  type PaymentToken,
  type PaymentTokenHolding,
} from "@/tokens/payment-token";
import { fetchVerifiedTokens } from "@/tokens/verified-tokens";
import { postDasRpc } from "@/tokens/das-rpc";
import type { WalletCollectible } from "@/tokens/portfolio-types";

type DasAsset = {
  id?: string;
  interface?: string;
  content?: {
    metadata?: { name?: string; symbol?: string };
    links?: { image?: string };
  };
  grouping?: {
    group_key?: string;
    group_value?: string;
    collection_metadata?: { name?: string };
  }[];
  compression?: { compressed?: boolean };
  token_info?: {
    balance?: number | string;
    decimals?: number;
    symbol?: string;
    token_program?: string;
  };
};

type DasResponse = {
  items?: DasAsset[];
};

async function fetchAssetsByOwner(owner: string): Promise<DasAsset[]> {
  const result = await postDasRpc<DasResponse>({
    method: "getAssetsByOwner",
    id: "portfolio",
    params: {
      ownerAddress: owner,
      page: 1,
      limit: 1000,
      displayOptions: {
        showFungible: true,
        showZeroBalance: false,
        showCollectionMetadata: true,
      },
    },
  });
  const items = result?.items ?? [];
  return Array.isArray(items) ? items : [];
}

async function fetchNativeSolLamports(owner: string): Promise<bigint> {
  try {
    const result = await postDasRpc<{ value?: number | string }>({
      method: "getBalance",
      params: [owner],
      id: "balance",
    });
    const value = result?.value;
    if (value == null) return 0n;
    return BigInt(value);
  } catch (error) {
    console.error("getBalance failed", error);
    return 0n;
  }
}

function resolveTokenProgram(program: string | null | undefined): string {
  if (program && isSupportedTokenProgram(program)) return String(program);
  return String(CLASSIC_TOKEN_PROGRAM);
}

/** All fungible DAS assets with balance; enrich from verified registry when known. */
function buildFungibleHoldings(
  verified: PaymentToken[],
  assets: DasAsset[],
): PaymentTokenHolding[] {
  const verifiedByMint = new Map(verified.map((t) => [t.mint, t]));
  const holdings: PaymentTokenHolding[] = [];
  const seen = new Set<string>();

  for (const asset of assets) {
    const iface = asset.interface ?? "";
    if (iface && iface !== "FungibleToken" && iface !== "FungibleAsset") {
      continue;
    }
    const mint = asset.id?.trim();
    if (!mint || seen.has(mint)) continue;
    // Native SOL is added separately from getBalance.
    if (mint === NATIVE_SOL_MINT) continue;

    const tokenInfo = asset.token_info;
    const program = tokenInfo?.token_program;
    if (program && !isSupportedTokenProgram(program)) continue;

    const meta = verifiedByMint.get(mint);
    const decimals =
      typeof tokenInfo?.decimals === "number"
        ? tokenInfo.decimals
        : (meta?.decimals ?? 0);
    const balanceRaw = BigInt(
      tokenInfo?.balance != null ? String(tokenInfo.balance) : "0",
    );
    if (balanceRaw <= 0n) continue;

    seen.add(mint);
    holdings.push({
      mint,
      symbol:
        meta?.symbol ||
        tokenInfo?.symbol ||
        asset.content?.metadata?.symbol ||
        "TOKEN",
      name:
        meta?.name ||
        asset.content?.metadata?.name ||
        meta?.symbol ||
        "Token",
      icon: meta?.icon || asset.content?.links?.image || null,
      decimals,
      tokenProgram: resolveTokenProgram(program ?? meta?.tokenProgram),
      balanceRaw: balanceRaw.toString(),
      balanceUi: formatTokenAmount(balanceRaw, decimals),
    });
  }

  holdings.sort(
    (a, b) => Number(b.balanceRaw) - Number(a.balanceRaw),
  );

  return holdings;
}

function buildCollectibles(assets: DasAsset[]): WalletCollectible[] {
  const out: WalletCollectible[] = [];
  for (const asset of assets) {
    const iface = asset.interface ?? "";
    if (iface === "FungibleToken" || iface === "FungibleAsset" || !asset.id) {
      continue;
    }
    if (
      iface &&
      !iface.includes("NFT") &&
      iface !== "V1_NFT" &&
      iface !== "ProgrammableNFT" &&
      iface !== "MplCoreAsset" &&
      iface !== "Legacy"
    ) {
      if (!asset.content?.links?.image && !asset.content?.metadata?.name) {
        continue;
      }
    }

    const group = asset.grouping?.find((g) => g.group_key === "collection");
    const collectionName =
      group?.collection_metadata?.name?.trim() ||
      null;

    out.push({
      mint: asset.id,
      name: asset.content?.metadata?.name?.trim() || "Collectible",
      image: asset.content?.links?.image ?? null,
      collectionName,
      interface: iface || "Unknown",
      compressed: Boolean(asset.compression?.compressed),
      tokenProgram: asset.token_info?.token_program
        ? String(asset.token_info.token_program)
        : iface === "ProgrammableNFT" || iface.includes("NFT")
          ? String(CLASSIC_TOKEN_PROGRAM)
          : null,
    });
    if (out.length >= 40) break;
  }
  return out;
}

export async function fetchWalletPortfolioServer(owner: string): Promise<{
  holdings: PaymentTokenHolding[];
  collectibles: WalletCollectible[];
}> {
  const [verified, assetsResult, solLamports] = await Promise.all([
    fetchVerifiedTokens(),
    fetchAssetsByOwner(owner).then(
      (assets) => ({ ok: true as const, assets }),
      (error: unknown) => {
        console.error("getAssetsByOwner failed", error);
        return { ok: false as const, assets: [] as DasAsset[] };
      },
    ),
    fetchNativeSolLamports(owner),
  ]);

  if (!assetsResult.ok) {
    const holdings: PaymentTokenHolding[] = [];
    if (solLamports > 0n) {
      holdings.push(
        nativeSolHolding(solLamports, formatTokenAmount(solLamports, 9)),
      );
    }
    return { holdings, collectibles: [] };
  }

  const holdings = buildFungibleHoldings(verified, assetsResult.assets);
  if (solLamports > 0n) {
    holdings.unshift(
      nativeSolHolding(solLamports, formatTokenAmount(solLamports, 9)),
    );
  }

  return {
    holdings,
    collectibles: buildCollectibles(assetsResult.assets),
  };
}

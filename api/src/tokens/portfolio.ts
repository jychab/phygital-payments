
import { formatTokenAmount } from "@/tokens/amount";
import {
  CLASSIC_TOKEN_PROGRAM,
  defaultUsdcToken,
  isClassicTokenProgram,
  zeroUsdcHolding,
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
  grouping?: { group_key?: string; group_value?: string }[];
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
      },
    },
  });
  const items = result?.items ?? [];
  return Array.isArray(items) ? items : [];
}

function buildVerifiedHoldings(
  verified: PaymentToken[],
  assets: DasAsset[],
): PaymentTokenHolding[] {
  const verifiedByMint = new Map(verified.map((t) => [t.mint, t]));
  const usdc = defaultUsdcToken();
  const holdings: PaymentTokenHolding[] = [];
  const seen = new Set<string>();

  for (const asset of assets) {
    const iface = asset.interface ?? "";
    if (iface && iface !== "FungibleToken" && iface !== "FungibleAsset") {
      continue;
    }
    const mint = asset.id?.trim();
    if (!mint || seen.has(mint)) continue;

    const tokenInfo = asset.token_info;
    const program = tokenInfo?.token_program;
    if (program && !isClassicTokenProgram(program)) continue;

    const meta = verifiedByMint.get(mint);
    if (!meta) continue;

    const decimals =
      typeof tokenInfo?.decimals === "number" ? tokenInfo.decimals : meta.decimals;
    const balanceRaw = BigInt(
      tokenInfo?.balance != null ? String(tokenInfo.balance) : "0",
    );
    if (balanceRaw <= BigInt(0) && mint !== usdc.mint) continue;

    seen.add(mint);
    holdings.push({
      mint,
      symbol:
        meta.symbol ||
        tokenInfo?.symbol ||
        asset.content?.metadata?.symbol ||
        "TOKEN",
      name: meta.name || asset.content?.metadata?.name || meta.symbol,
      icon: meta.icon || asset.content?.links?.image || null,
      decimals,
      tokenProgram: String(CLASSIC_TOKEN_PROGRAM),
      balanceRaw: balanceRaw.toString(),
      balanceUi: formatTokenAmount(balanceRaw, decimals),
    });
  }

  if (!seen.has(usdc.mint)) {
    holdings.unshift(zeroUsdcHolding());
  } else {
    holdings.sort((a, b) => {
      if (a.mint === usdc.mint) return -1;
      if (b.mint === usdc.mint) return 1;
      return Number(b.balanceRaw) - Number(a.balanceRaw);
    });
  }

  return holdings;
}

function buildCollectibles(assets: DasAsset[]): WalletCollectible[] {
  const out: WalletCollectible[] = [];
  for (const asset of assets) {
    const iface = asset.interface ?? "";
    if (
      iface === "FungibleToken" ||
      iface === "FungibleAsset" ||
      !asset.id
    ) {
      continue;
    }
    // V1/ProgrammableNFT / MplCoreAsset etc.
    if (
      iface &&
      !iface.includes("NFT") &&
      iface !== "V1_NFT" &&
      iface !== "ProgrammableNFT" &&
      iface !== "MplCoreAsset" &&
      iface !== "Legacy"
    ) {
      // Keep unknown non-fungibles that look like art
      if (!asset.content?.links?.image && !asset.content?.metadata?.name) {
        continue;
      }
    }
    const collection =
      asset.grouping?.find((g) => g.group_key === "collection")?.group_value ??
      null;
    out.push({
      mint: asset.id,
      name: asset.content?.metadata?.name?.trim() || "Collectible",
      image: asset.content?.links?.image ?? null,
      collectionName: collection,
    });
    if (out.length >= 40) break;
  }
  return out;
}

export async function fetchWalletPortfolioServer(owner: string): Promise<{
  holdings: PaymentTokenHolding[];
  collectibles: WalletCollectible[];
}> {
  const [verified, assetsResult] = await Promise.all([
    fetchVerifiedTokens(),
    fetchAssetsByOwner(owner).then(
      (assets) => ({ ok: true as const, assets }),
      (error: unknown) => {
        console.error("getAssetsByOwner failed", error);
        return { ok: false as const, assets: [] as DasAsset[] };
      },
    ),
  ]);

  if (!assetsResult.ok) {
    return { holdings: [zeroUsdcHolding()], collectibles: [] };
  }

  return {
    holdings: buildVerifiedHoldings(verified, assetsResult.assets),
    collectibles: buildCollectibles(assetsResult.assets),
  };
}

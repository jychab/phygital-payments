import "server-only";

import { postDasRpc } from "@/lib/server/das-rpc";
import type { WalletHolding, WalletPortfolio } from "@/lib/wallet/portfolio";

const PAGE_LIMIT = 100;
const MAX_PAGES = 10;
const MIN_USD_VALUE = 0.01;
const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

type DasTokenInfo = {
  balance?: number;
  decimals?: number;
  symbol?: string;
  price_info?: {
    price_per_token?: number;
    total_price?: number;
  };
};

type DasAsset = {
  id?: string;
  interface?: string;
  compression?: { compressed?: boolean };
  token_info?: DasTokenInfo;
  content?: {
    metadata?: { name?: string; symbol?: string };
    links?: { image?: string };
    files?: Array<{ uri?: string; cdn_uri?: string }>;
  };
};

type DasNativeBalance = {
  lamports?: number;
  price_per_sol?: number;
  total_price?: number;
};

type GetAssetsByOwnerResult = {
  total?: number;
  items?: DasAsset[];
  nativeBalance?: DasNativeBalance;
};

function firstImage(asset: DasAsset): string | null {
  for (const file of asset.content?.files ?? []) {
    const url = file.cdn_uri?.trim() || file.uri?.trim();
    if (url?.startsWith("https://")) return url;
  }
  const link = asset.content?.links?.image?.trim();
  return link?.startsWith("https://") ? link : null;
}

function isFungible(asset: DasAsset): boolean {
  const iface = asset.interface ?? "";
  return (
    iface === "FungibleToken" ||
    iface === "FungibleAsset" ||
    iface.includes("Fungible")
  );
}

function isCollectible(asset: DasAsset): boolean {
  if (asset.compression?.compressed) return true;
  const iface = asset.interface ?? "";
  return (
    iface.includes("NFT") ||
    iface === "ProgrammableNFT" ||
    iface === "MplCoreAsset"
  );
}

function usdFromTokenInfo(info: DasTokenInfo | undefined): number | null {
  const total = info?.price_info?.total_price;
  if (total != null && Number.isFinite(total) && total > 0) return total;
  const per = info?.price_info?.price_per_token;
  const balance = info?.balance;
  const decimals = info?.decimals ?? 0;
  if (
    per != null &&
    balance != null &&
    Number.isFinite(per) &&
    per > 0 &&
    Number.isFinite(balance)
  ) {
    return (balance / 10 ** decimals) * per;
  }
  return null;
}

function nativeUsdFromDas(
  lamports: bigint,
  nativeBalance: DasNativeBalance | undefined,
): number | null {
  if (lamports <= 0n) return null;
  const total = nativeBalance?.total_price;
  if (total != null && Number.isFinite(total) && total > 0) return total;
  const pricePerSol = nativeBalance?.price_per_sol;
  if (pricePerSol != null && Number.isFinite(pricePerSol) && pricePerSol > 0) {
    return (Number(lamports) / 1e9) * pricePerSol;
  }
  return null;
}

async function fetchAllDasAssets(ownerAddress: string): Promise<{
  items: DasAsset[];
  nativeBalance: DasNativeBalance | undefined;
}> {
  const items: DasAsset[] = [];
  let nativeBalance: DasNativeBalance | undefined;
  let page = 1;

  while (page <= MAX_PAGES) {
    const result = await postDasRpc<GetAssetsByOwnerResult>({
      method: "getAssetsByOwner",
      id: `wallet-assets-${page}`,
      params: {
        ownerAddress,
        page,
        limit: PAGE_LIMIT,
        displayOptions: {
          showFungible: true,
          showCollectionMetadata: true,
        },
      },
    });
    if (!result) break;
    if (page === 1) nativeBalance = result.nativeBalance;
    const batch = result.items ?? [];
    items.push(...batch);
    const total = result.total ?? batch.length;
    if (page * PAGE_LIMIT >= total || batch.length < PAGE_LIMIT) break;
    page += 1;
  }

  return { items, nativeBalance };
}

export async function fetchWalletPortfolio(
  vaultPda: string,
): Promise<WalletPortfolio> {
  return buildWalletPortfolio(vaultPda);
}

async function buildWalletPortfolio(vaultPda: string): Promise<WalletPortfolio> {
  const { items, nativeBalance } = await fetchAllDasAssets(vaultPda);

  const nativeLamports = BigInt(nativeBalance?.lamports ?? 0);
  const nativeUsd = nativeUsdFromDas(nativeLamports, nativeBalance);

  const tokens: WalletHolding[] = [
    {
      kind: "native",
      id: WRAPPED_SOL_MINT,
      symbol: "SOL",
      name: "Solana",
      image: null,
      balance: nativeLamports.toString(),
      decimals: 9,
      uiAmount: Number(nativeLamports) / 1e9,
      usdValue: nativeUsd,
    },
  ];

  for (const asset of items.filter(isFungible)) {
    const id = asset.id?.trim();
    if (!id || id === WRAPPED_SOL_MINT) continue;

    const decimals = asset.token_info?.decimals ?? 0;
    const balance = asset.token_info?.balance ?? 0;
    const uiAmount = balance / 10 ** decimals;
    if (uiAmount <= 0) continue;

    const usdValue = usdFromTokenInfo(asset.token_info);
    if (usdValue != null && usdValue < MIN_USD_VALUE) continue;

    tokens.push({
      kind: "fungible",
      id,
      symbol:
        asset.token_info?.symbol?.trim() ||
        asset.content?.metadata?.symbol?.trim() ||
        id.slice(0, 4),
      name:
        asset.content?.metadata?.name?.trim() ||
        asset.token_info?.symbol?.trim() ||
        id.slice(0, 8),
      image: firstImage(asset),
      balance: BigInt(Math.trunc(balance)).toString(),
      decimals,
      uiAmount,
      usdValue,
    });
  }

  tokens.sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));

  const collectibles: WalletHolding[] = items
    .filter(isCollectible)
    .flatMap((asset) => {
      const id = asset.id?.trim();
      if (!id) return [];
      return [
        {
          kind: "collectible" as const,
          id,
          symbol: "NFT",
          name: asset.content?.metadata?.name?.trim() || id.slice(0, 8),
          image: firstImage(asset),
          balance: "1",
          decimals: 0,
          uiAmount: 1,
          usdValue: null,
        },
      ];
    });

  let pricedTotalUsd = 0;
  let hasPricedAsset = false;
  for (const holding of tokens) {
    if (holding.usdValue != null && holding.usdValue > 0) {
      pricedTotalUsd += holding.usdValue;
      hasPricedAsset = true;
    }
  }

  const solPrice = nativeBalance?.price_per_sol ?? null;
  const solEquivalent =
    solPrice != null && hasPricedAsset ? pricedTotalUsd / solPrice : null;

  return {
    vaultPda,
    nativeLamports: nativeLamports.toString(),
    totalUsd: hasPricedAsset ? pricedTotalUsd : null,
    solEquivalent,
    tokens,
    collectibles,
  };
}

import "server-only";

import { formatTokenAmount } from "@/lib/tokens/mint-delegate";
import {
  CLASSIC_TOKEN_PROGRAM,
  defaultUsdcToken,
  isClassicTokenProgram,
  zeroUsdcHolding,
  type PaymentToken,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { fetchVerifiedTokens } from "@/lib/server/verified-tokens";
import { postDasRpc } from "@/lib/server/das-rpc";

type DasAsset = {
  id?: string;
  interface?: string;
  content?: {
    metadata?: { name?: string; symbol?: string };
    links?: { image?: string };
  };
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
    id: "holdings",
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

/**
 * Wallet fungible holdings ∩ Jupiter verified (classic SPL).
 * Pass `verifiedCatalog` when the caller already loaded the catalog.
 */
export async function fetchVerifiedHoldings(
  owner: string,
  verifiedCatalog?: PaymentToken[],
): Promise<PaymentTokenHolding[]> {
  const [verified, assetsResult] = await Promise.all([
    verifiedCatalog ? Promise.resolve(verifiedCatalog) : fetchVerifiedTokens(),
    fetchAssetsByOwner(owner).then(
      (assets) => ({ ok: true as const, assets }),
      (error: unknown) => {
        console.error("getAssetsByOwner failed", error);
        return { ok: false as const, assets: [] as DasAsset[] };
      },
    ),
  ]);

  if (!assetsResult.ok) {
    return [zeroUsdcHolding()];
  }

  return buildVerifiedHoldings(verified, assetsResult.assets);
}

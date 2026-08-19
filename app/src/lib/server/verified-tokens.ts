import "server-only";

import {
  CLASSIC_TOKEN_PROGRAM,
  defaultUsdcToken,
  isClassicTokenProgram,
  type PaymentToken,
} from "@/lib/tokens/payment-token";
import { isMainnet } from "@/lib/solana/cluster";

const JUPITER_TAG_URL = "https://api.jup.ag/tokens/v2/tag?query=verified";
const CATALOG_TTL_MS = 15 * 60 * 1000;

type JupiterToken = {
  id?: string;
  name?: string;
  symbol?: string;
  icon?: string | null;
  decimals?: number;
  tokenProgram?: string;
};

let catalogCache: { tokens: PaymentToken[]; fetchedAt: number } | null = null;
let catalogInflight: Promise<PaymentToken[]> | null = null;

function jupiterApiKey(): string | null {
  return process.env.JUPITER_API_KEY?.trim() || null;
}

function mapToken(raw: JupiterToken): PaymentToken | null {
  const mint = raw.id?.trim();
  if (!mint) return null;
  if (!isClassicTokenProgram(raw.tokenProgram ?? String(CLASSIC_TOKEN_PROGRAM))) {
    return null;
  }
  if (typeof raw.decimals !== "number" || raw.decimals < 0) return null;
  const symbol = (raw.symbol ?? "").trim() || mint.slice(0, 4);
  const name = (raw.name ?? "").trim() || symbol;
  return {
    mint,
    symbol,
    name,
    icon: raw.icon?.trim() || null,
    decimals: raw.decimals,
    tokenProgram: String(CLASSIC_TOKEN_PROGRAM),
  };
}

function pinUsdc(tokens: PaymentToken[]): PaymentToken[] {
  const usdc = defaultUsdcToken();
  const rest = tokens.filter((t) => t.mint !== usdc.mint);
  return [usdc, ...rest];
}

async function fetchVerifiedTokensFromNetwork(): Promise<PaymentToken[]> {
  if (!isMainnet()) {
    return [defaultUsdcToken()];
  }

  const apiKey = jupiterApiKey();
  if (!apiKey) {
    return [defaultUsdcToken()];
  }

  try {
    const res = await fetch(JUPITER_TAG_URL, {
      headers: { "x-api-key": apiKey },
      cache: "force-cache",
    });
    if (!res.ok) {
      console.error("Jupiter verified tag failed", res.status);
      return [defaultUsdcToken()];
    }
    const body = (await res.json()) as JupiterToken[];
    if (!Array.isArray(body)) return [defaultUsdcToken()];
    const mapped = body
      .map(mapToken)
      .filter((t): t is PaymentToken => t != null);
    return pinUsdc(mapped);
  } catch (error) {
    console.error("Jupiter verified tag error", error);
    return [defaultUsdcToken()];
  }
}

/**
 * Jupiter verified classic-SPL tokens. Isolate-level cache (15 min) shared by
 * `/api/tokens/verified`, `/api/tokens/holdings`, and `/api/tokens/pay-context`.
 */
export async function fetchVerifiedTokens(): Promise<PaymentToken[]> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.fetchedAt < CATALOG_TTL_MS) {
    return catalogCache.tokens;
  }

  if (!catalogInflight) {
    catalogInflight = fetchVerifiedTokensFromNetwork()
      .then((tokens) => {
        catalogCache = { tokens, fetchedAt: Date.now() };
        return tokens;
      })
      .finally(() => {
        catalogInflight = null;
      });
  }

  return catalogInflight;
}

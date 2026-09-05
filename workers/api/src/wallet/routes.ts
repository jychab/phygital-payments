import { Hono } from "hono";

import { getRpcUrl } from "@/shared/solana/cluster";
import { json } from "@/shared/http";
import { tryParseAddress } from "@/shared/solana/address";
import { getErrorMessage } from "@/shared/utils";
import { getEnv } from "@/shared/request-context";

type HeliusHistoryRequest = {
  address: string;
  limit?: number;
  beforeSignature?: string;
  afterSignature?: string;
  order?: "asc" | "desc";
};

type HeliusTransfer = {
  fromUserAccount?: string;
  toUserAccount?: string;
  amount?: number;
  mint?: string;
  decimals?: number;
};

type HeliusNativeTransfer = {
  fromUserAccount?: string;
  toUserAccount?: string;
  amount?: number;
};

type HeliusSummary = {
  type?: string;
  description?: string;
};

type ParsedHistoryTx = {
  signature?: string;
  slot?: number;
  timestamp?: number;
  fee?: number;
  feePayer?: string;
  transactionError?: string | null;
  description?: string | null;
  nativeTransfers?: HeliusNativeTransfer[];
  tokenTransfers?: HeliusTransfer[];
  summary?: HeliusSummary | null;
};

type ParsedHistoryItem = {
  signature?: string;
  parserStatus?: string;
  data?: ParsedHistoryTx;
  error?: { message?: string };
};

type ParsedHistoryResponse = {
  data?: ParsedHistoryItem[];
  paginationToken?: string | null;
};

const NATIVE_SOL_MINT =
  "So11111111111111111111111111111111111111112" as const;

function toUiAmount(amountRaw: number, decimals: number): string {
  if (!Number.isFinite(amountRaw)) return "0";
  return (amountRaw / 10 ** decimals).toLocaleString(undefined, {
    maximumFractionDigits: Math.min(Math.max(decimals, 0), 6),
  });
}

function mapHistoryItem(walletAddress: string, item: ParsedHistoryItem) {
  const tx = item.data;
  const signature = tx?.signature ?? item.signature ?? null;
  if (!tx || !signature) return null;

  type DeltaKey = `${string}:${"in" | "out"}`;
  const deltasMap = new Map<
    DeltaKey,
    { mint: string; direction: "in" | "out"; rawSum: number; decimals: number }
  >();

  let counterparty: string | null = null;
  let hasIn = false;
  let hasOut = false;

  function upsertDelta(args: {
    mint: string;
    direction: "in" | "out";
    rawAmount: number;
    decimals: number;
  }) {
    const rawAmount = args.rawAmount;
    if (!Number.isFinite(rawAmount)) return;
    const decimals = Number.isFinite(args.decimals) ? args.decimals : 0;
    const key = `${args.mint}:${args.direction}` as DeltaKey;
    const prev = deltasMap.get(key);
    if (!prev) {
      deltasMap.set(key, {
        mint: args.mint,
        direction: args.direction,
        rawSum: rawAmount,
        decimals,
      });
      return;
    }
    deltasMap.set(key, {
      ...prev,
      rawSum: prev.rawSum + rawAmount,
      // If decimals differ (rare), prefer the latest.
      decimals,
    });
  }

  for (const t of tx.tokenTransfers ?? []) {
    const mint = t.mint?.trim();
    if (!mint) continue;
    const decimals = typeof t.decimals === "number" ? t.decimals : 0;
    const raw = typeof t.amount === "number" ? t.amount : 0;

    if (t.fromUserAccount === walletAddress) {
      hasOut = true;
      upsertDelta({ mint, direction: "out", rawAmount: raw, decimals });
      if (!counterparty && t.toUserAccount) counterparty = t.toUserAccount;
    } else if (t.toUserAccount === walletAddress) {
      hasIn = true;
      upsertDelta({ mint, direction: "in", rawAmount: raw, decimals });
      if (!counterparty && t.fromUserAccount) counterparty = t.fromUserAccount;
    }
  }

  for (const n of tx.nativeTransfers ?? []) {
    const raw = typeof n.amount === "number" ? n.amount : 0;
    if (n.fromUserAccount === walletAddress) {
      hasOut = true;
      upsertDelta({
        mint: NATIVE_SOL_MINT,
        direction: "out",
        rawAmount: raw,
        decimals: 9,
      });
      if (!counterparty && n.toUserAccount) counterparty = n.toUserAccount;
    } else if (n.toUserAccount === walletAddress) {
      hasIn = true;
      upsertDelta({
        mint: NATIVE_SOL_MINT,
        direction: "in",
        rawAmount: raw,
        decimals: 9,
      });
      if (!counterparty && n.fromUserAccount) counterparty = n.fromUserAccount;
    }
  }

  const balanceDeltas = [...deltasMap.values()].map((d) => ({
    mint: d.mint,
    direction: d.direction,
    amountUi: toUiAmount(d.rawSum, d.decimals),
  }));

  const kind: "failed" | "sent" | "received" | "other" = tx.transactionError
    ? "failed"
    : hasOut && !hasIn
      ? "sent"
      : hasIn && !hasOut
        ? "received"
        : "other";

  const primary = balanceDeltas[0] ?? null;
  const amountLabel = primary
    ? `${primary.direction === "in" ? "+" : "-"}${primary.amountUi}`
    : null;
  const mint = primary ? primary.mint : null;

  const summaryType = tx.summary?.type?.trim();
  const title =
    tx.transactionError
      ? "Failed"
      : kind === "sent" && summaryType === "transfer"
        ? "Sent"
        : kind === "received" && summaryType === "transfer"
          ? "Received"
          : tx.summary?.description?.trim() ||
              tx.description?.trim() ||
              "Transaction";

  return {
    id: signature,
    walletAddress,
    kind,
    title,
    subtitle: counterparty,
    amountLabel,
    statusLabel: tx.transactionError ? "Failed" : null,
    timestamp: tx.timestamp ?? null,
    signature,
    mint,
    balanceDeltas,
    source: "helius" as const,
  };
}

async function fetchParsedHistory(body: HeliusHistoryRequest): Promise<ParsedHistoryResponse> {
  const res = await fetch(`${getRpcUrl()}/v1/parsed-events/transaction-history}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Helius activity failed (${res.status})`);
  }
  return (await res.json()) as ParsedHistoryResponse;
}

export const walletRoutes = new Hono();

walletRoutes.get("/wallet/activity", async (c) => {
  const walletRaw = c.req.query("wallet")?.trim() ?? "";
  const wallet = tryParseAddress(walletRaw);
  if (!wallet) {
    return json({ error: "Query param wallet must be a valid Solana address" }, { status: 400 });
  }

  const before = c.req.query("before")?.trim() || undefined;
  const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? 20) || 20));

  try {
    const response = await fetchParsedHistory({
      address: String(wallet),
      limit,
      beforeSignature: before,
      order: "desc",
    });

    const items = (response.data ?? [])
      .map((item) => mapHistoryItem(String(wallet), item))
      .filter((item): item is NonNullable<typeof item> => item != null);

    return json({
      items,
      nextCursor: response.paginationToken ?? null,
    });
  } catch (error) {
    return json(
      { error: getErrorMessage(error, "Failed to load wallet activity") },
      { status: 502 },
    );
  }
});

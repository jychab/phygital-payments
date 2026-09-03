import { PHYGITAL_WALLET_PROGRAM_ADDRESS } from "phygital-wallet-sdk";

import { MEMO_PROGRAM_ADDRESS } from "@/fees/constants";
import { isDefaultConfigVerifier } from "@/fees/default-verifier";
import {
  creditFeeBalance,
  debitFeeBalance,
} from "@/fees/fee-balance-db";
import { getEnv } from "@/shared/request-context";
import { tryParseAddress } from "@/shared/solana/address";

/** Minimal Helius enhanced / raw tx shape we care about. */
export type HeliusTxLike = {
  signature?: string;
  feePayer?: string;
  accountData?: Array<{
    account?: string;
    nativeBalanceChange?: number;
  }>;
  instructions?: Array<{
    programId?: string;
    accounts?: string[];
    data?: string;
    innerInstructions?: unknown[];
  }>;
  /** Some payloads nest under `transaction` */
  transaction?: HeliusTxLike;
};

function unwrapTx(raw: HeliusTxLike): HeliusTxLike {
  return raw.transaction && typeof raw.transaction === "object"
    ? { ...raw, ...raw.transaction }
    : raw;
}

function nativeChange(
  tx: HeliusTxLike,
  account: string,
): number {
  for (const row of tx.accountData ?? []) {
    if (row.account === account && typeof row.nativeBalanceChange === "number") {
      return row.nativeBalanceChange;
    }
  }
  return 0;
}

/** Decode memo instruction data (base58 or base64 or utf8 string). */
export function decodeMemoText(data: string | undefined): string | null {
  if (!data) return null;
  // Helius often gives utf8 already for memo
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(data)) {
    return data;
  }
  try {
    // base64
    if (/^[A-Za-z0-9+/=]+$/.test(data) && data.length % 4 === 0) {
      const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
      const text = new TextDecoder().decode(bytes).trim();
      if (text) return text;
    }
  } catch {
    /* ignore */
  }
  const trimmed = data.trim();
  return trimmed || null;
}

function findMemoPhygitalToken(tx: HeliusTxLike): string | null {
  for (const ix of tx.instructions ?? []) {
    if (ix.programId !== MEMO_PROGRAM_ADDRESS) continue;
    const text = decodeMemoText(ix.data);
    if (!text) continue;
    const addr = tryParseAddress(text);
    if (addr) return String(addr);
  }
  return null;
}

/** Execute account metas: 0 verifier, 1 config, 2 phygital_token */
function findExecuteAccounts(
  tx: HeliusTxLike,
): { verifier: string; phygitalToken: string } | null {
  for (const ix of tx.instructions ?? []) {
    if (ix.programId !== PHYGITAL_WALLET_PROGRAM_ADDRESS) continue;
    const accounts = ix.accounts ?? [];
    if (accounts.length < 3) continue;
    const verifier = accounts[0];
    const phygitalToken = accounts[2];
    if (!verifier || !phygitalToken) continue;
    if (!tryParseAddress(verifier) || !tryParseAddress(phygitalToken)) {
      continue;
    }
    return { verifier, phygitalToken };
  }
  return null;
}

/**
 * Process one Helius tx: credit top-ups, debit default-verifier execute fees.
 * Pure side-effects via D1; safe to call repeatedly (idempotent by signature).
 */
export async function processHeliusFeeTx(
  raw: HeliusTxLike,
): Promise<{ credited: boolean; debited: boolean }> {
  const tx = unwrapTx(raw);
  const signature = tx.signature?.trim();
  if (!signature) return { credited: false, debited: false };

  const accumulator = getEnv().TOP_UP_ACCUMULATOR?.trim() ?? "";
  let credited = false;
  let debited = false;

  // --- Credit: SOL landed on accumulator with memo = phygitalToken ---
  if (accumulator) {
    const change = nativeChange(tx, accumulator);
    if (change > 0) {
      const token = findMemoPhygitalToken(tx);
      if (token) {
        credited = await creditFeeBalance({
          phygitalToken: token,
          lamports: change,
          signature: `${signature}:credit`,
        });
      }
    }
  }

  // --- Debit: execute with default verifier fee spend ---
  const execute = findExecuteAccounts(tx);
  if (execute) {
    const feePayer = tx.feePayer ?? execute.verifier;
    const isDefault = await isDefaultConfigVerifier(feePayer);
    if (isDefault) {
      const change = nativeChange(tx, feePayer);
      if (change < 0) {
        debited = await debitFeeBalance({
          phygitalToken: execute.phygitalToken,
          lamports: -change,
          signature: `${signature}:debit`,
        });
      }
    }
  }

  return { credited, debited };
}

export async function processHeliusWebhookPayload(
  body: unknown,
): Promise<{ processed: number; credited: number; debited: number }> {
  const list: HeliusTxLike[] = Array.isArray(body)
    ? (body as HeliusTxLike[])
    : body && typeof body === "object"
      ? [body as HeliusTxLike]
      : [];

  let processed = 0;
  let credited = 0;
  let debited = 0;

  for (const item of list) {
    const result = await processHeliusFeeTx(item);
    processed += 1;
    if (result.credited) credited += 1;
    if (result.debited) debited += 1;
  }

  return { processed, credited, debited };
}

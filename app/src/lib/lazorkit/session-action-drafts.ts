/**
 * JSON-safe LazorKit session action drafts (amounts/addresses as strings).
 * Converted to on-chain SessionAction[] via `toSessionActions`.
 */
import { address, type Address } from "@solana/kit";
import {
  Actions,
  MAX_SESSION_ACTIONS,
  serializeActions,
  type SessionAction,
} from "lazor-kit";

import { SLOTS_PER_DAY } from "@/lib/wallet/agent-policy";
import { shortAddress } from "@/lib/utils";
import { formatUiAmount } from "@/lib/wallet/parse-amount";
import { formatSol } from "@/lib/wallet/sol";

export { MAX_SESSION_ACTIONS };

export type SessionActionDraft =
  | { type: "solLimit"; remaining: string; expiresAt?: string }
  | {
      type: "solRecurringLimit";
      limit: string;
      windowSlots: string;
      expiresAt?: string;
    }
  | { type: "solMaxPerTx"; max: string; expiresAt?: string }
  | {
      type: "tokenLimit";
      mint: string;
      remaining: string;
      /** Display-only; not encoded on-chain. */
      decimals?: number;
      expiresAt?: string;
    }
  | {
      type: "tokenRecurringLimit";
      mint: string;
      limit: string;
      windowSlots: string;
      /** Display-only; not encoded on-chain. */
      decimals?: number;
      expiresAt?: string;
    }
  | {
      type: "tokenMaxPerTx";
      mint: string;
      max: string;
      /** Display-only; not encoded on-chain. */
      decimals?: number;
      expiresAt?: string;
    }
  | { type: "programWhitelist"; programId: string; expiresAt?: string }
  | { type: "programBlacklist"; programId: string; expiresAt?: string };

function parsePositiveBigInt(raw: string, label: string): bigint {
  let value: bigint;
  try {
    value = BigInt(raw.trim());
  } catch {
    throw new Error(`Invalid ${label}`);
  }
  if (value <= 0n) throw new Error(`${label} must be positive`);
  return value;
}

function parseOptionalExpiresAt(raw: string | undefined): bigint | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const value = BigInt(raw.trim());
  if (value < 0n) throw new Error("Action expiry must be non-negative");
  return value === 0n ? undefined : value;
}

function parseAddress(raw: string, label: string): Address {
  try {
    return address(raw.trim());
  } catch {
    throw new Error(`Invalid ${label}`);
  }
}

/** Validate and convert drafts into LazorKit SessionAction[]. */
export function toSessionActions(
  drafts: readonly SessionActionDraft[] | null | undefined,
): SessionAction[] {
  if (!drafts?.length) return [];
  if (drafts.length > MAX_SESSION_ACTIONS) {
    throw new Error(`At most ${MAX_SESSION_ACTIONS} session actions`);
  }

  return drafts.map((draft): SessionAction => {
    const expiresAt = parseOptionalExpiresAt(draft.expiresAt);
    switch (draft.type) {
      case "solLimit":
        return Actions.solLimit(
          parsePositiveBigInt(draft.remaining, "SOL lifetime limit"),
          expiresAt,
        );
      case "solRecurringLimit":
        return Actions.solRecurringLimit({
          limit: parsePositiveBigInt(draft.limit, "SOL recurring limit"),
          window: parsePositiveBigInt(draft.windowSlots, "SOL window"),
          expiresAt,
        });
      case "solMaxPerTx":
        return Actions.solMaxPerTx(
          parsePositiveBigInt(draft.max, "SOL per-tx max"),
          expiresAt,
        );
      case "tokenLimit":
        return Actions.tokenLimit({
          mint: parseAddress(draft.mint, "token mint"),
          remaining: parsePositiveBigInt(draft.remaining, "token lifetime limit"),
          expiresAt,
        });
      case "tokenRecurringLimit":
        return Actions.tokenRecurringLimit({
          mint: parseAddress(draft.mint, "token mint"),
          limit: parsePositiveBigInt(draft.limit, "token recurring limit"),
          window: parsePositiveBigInt(draft.windowSlots, "token window"),
          expiresAt,
        });
      case "tokenMaxPerTx":
        return Actions.tokenMaxPerTx({
          mint: parseAddress(draft.mint, "token mint"),
          max: parsePositiveBigInt(draft.max, "token per-tx max"),
          expiresAt,
        });
      case "programWhitelist":
        return Actions.programWhitelist(
          parseAddress(draft.programId, "program whitelist"),
          expiresAt,
        );
      case "programBlacklist":
        return Actions.programBlacklist(
          parseAddress(draft.programId, "program blacklist"),
          expiresAt,
        );
      default: {
        const _exhaustive: never = draft;
        void _exhaustive;
        throw new Error("Unknown session action");
      }
    }
  });
}

export function encodeSessionActionDrafts(
  drafts: readonly SessionActionDraft[] | null | undefined,
): Uint8Array {
  return serializeActions(toSessionActions(drafts));
}

/** Convert UI day window into Solana slots (~2 days = 2 * SLOTS_PER_DAY). */
export function daysToSlots(days: number): bigint {
  if (!Number.isFinite(days) || days < 1) {
    throw new Error("Window must be at least 1 day");
  }
  return BigInt(Math.ceil(days)) * SLOTS_PER_DAY;
}

export function parseSessionActionDrafts(
  raw: unknown,
): SessionActionDraft[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) throw new Error("Invalid session actions");
  // Structural validation happens in toSessionActions.
  return raw as SessionActionDraft[];
}

function groupInt(raw: string): string {
  const negative = raw.startsWith("-");
  const digits = negative ? raw.slice(1) : raw;
  if (!/^\d+$/.test(digits)) return raw;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return negative ? `-${grouped}` : grouped;
}

function formatSolDraft(lamports: string): string {
  try {
    return `${formatSol(BigInt(lamports))} SOL`;
  } catch {
    return `${groupInt(lamports)} lamports`;
  }
}

function formatWindow(windowSlots: string): string {
  try {
    const days = Number(BigInt(windowSlots) / SLOTS_PER_DAY);
    if (days >= 1) return days === 1 ? "1 day" : `${days} days`;
  } catch {
    /* fall through */
  }
  return `${windowSlots} slots`;
}

function formatTokenDraft(
  atoms: string,
  mint: string,
  decimals?: number,
): string {
  const label = shortAddress(mint, 4);
  if (
    decimals == null ||
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 18
  ) {
    return `${groupInt(atoms)} ${label}`;
  }
  try {
    return `${formatUiAmount(BigInt(atoms), decimals)} ${label}`;
  } catch {
    return `${groupInt(atoms)} ${label}`;
  }
}

export function summarizeSessionActions(
  drafts: readonly SessionActionDraft[] | null | undefined,
): string[] {
  if (!drafts?.length) return ["No spending caps"];
  return drafts.map((draft) => {
    switch (draft.type) {
      case "solLimit":
        return `${formatSolDraft(draft.remaining)} lifetime`;
      case "solRecurringLimit":
        return `${formatSolDraft(draft.limit)} every ${formatWindow(draft.windowSlots)}`;
      case "solMaxPerTx":
        return `${formatSolDraft(draft.max)} per tap`;
      case "tokenLimit":
        return `${formatTokenDraft(draft.remaining, draft.mint, draft.decimals)} lifetime`;
      case "tokenRecurringLimit":
        return `${formatTokenDraft(draft.limit, draft.mint, draft.decimals)} every ${formatWindow(draft.windowSlots)}`;
      case "tokenMaxPerTx":
        return `${formatTokenDraft(draft.max, draft.mint, draft.decimals)} per tap`;
      case "programWhitelist":
        return `Allow ${shortAddress(draft.programId, 4)}`;
      case "programBlacklist":
        return `Block ${shortAddress(draft.programId, 4)}`;
    }
  });
}

/** Home-row caption: tap-to-pay when uncapped, otherwise the rule list. */
export function accessorySpendCaption(
  drafts: readonly SessionActionDraft[] | null | undefined,
): string {
  if (!drafts?.length) return "Tap to pay on";
  return summarizeSessionActions(drafts).join(" · ");
}

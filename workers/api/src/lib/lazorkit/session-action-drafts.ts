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
function toSessionActions(
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

export function parseSessionActionDrafts(
  raw: unknown,
): SessionActionDraft[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) throw new Error("Invalid session actions");
  const drafts = raw as SessionActionDraft[];
  toSessionActions(drafts);
  return drafts;
}

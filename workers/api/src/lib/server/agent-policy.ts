import type { SessionActionDraft } from "@/lib/lazorkit/session-action-drafts";

export const AGENT_DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** LazorKit sessions expire within ~30 days (absolute slot cap). */
export const AGENT_MAX_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const CHALLENGE_TTL_MS = 2 * 60 * 1000;
export const SLOTS_PER_DAY = 216_000n;
export const MS_PER_SLOT = 86_400_000 / Number(SLOTS_PER_DAY);

/** New grants are NFC-only. `autonomous` is kept for existing sessions. */
export type AgentKind = "nfc" | "autonomous";

export type AgentSessionRecord = {
  kind: AgentKind;
  vaultPda: string;
  walletPda: string;
  sessionPublicKey: string;
  sessionPda: string;
  expiresAtSlot: string;
  phygitalPasskey?: string;
  task?: { label: string; spendingLimitLamports: string | null };
  /** LazorKit on-chain action constraints (immutable after create). */
  actions?: SessionActionDraft[];
};

export type AgentSessionDetail = AgentSessionRecord & {
  /** Approximate wall-clock expiry from current slot. */
  expiresAtMs: number;
  /** Phygital token still claimed to this wallet (NFC agents only). */
  hasPhygitalToken?: boolean;
};

export function expiresAtSlotToMs(
  expiresAtSlot: bigint,
  currentSlot: bigint,
): number {
  const remaining = expiresAtSlot - currentSlot;
  if (remaining <= 0n) return Date.now();
  return Date.now() + Number(remaining) * MS_PER_SLOT;
}

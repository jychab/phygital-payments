/** Solana SlotHashes sysvar capacity (on-chain lookup window). */
export const SLOT_HASHES_CAPACITY = 512;

/** Mainnet-typical slot time (ms); used for wall-clock TTL approximation. */
export const MS_PER_SLOT = 400;

/** Max wall-clock validity from tap when bound to the latest slot. */
export const SLOT_HASHES_MAX_VALIDITY_MS =
  SLOT_HASHES_CAPACITY * MS_PER_SLOT;

/** KV `expirationTtl` (seconds) aligned with SlotHashes max validity. */
export const SLOT_HASHES_KV_TTL_SECONDS = Math.ceil(
  SLOT_HASHES_MAX_VALIDITY_MS / 1000,
);

export function slotHashesExpiresAtMs(createdAtMs: number): number {
  return createdAtMs + SLOT_HASHES_MAX_VALIDITY_MS;
}

export function isSlotHashesExpired(
  createdAtMs: number,
  nowMs = Date.now(),
): boolean {
  return nowMs >= slotHashesExpiresAtMs(createdAtMs);
}

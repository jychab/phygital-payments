/**
 * Pure preauth grant status logic — shared by the Durable Object and tests.
 * No Cloudflare / Next imports.
 */

export const GRANT_RING_CAP = 2;
/** Extra wait after TTL only when the grant was claimed (submit in flight). */
export const PREAUTH_WEBHOOK_GRACE_SECONDS = 15;

export const GRANT_NOT_FOUND = "Preauth grant not found";

export type GrantPayment = {
  recipient: string;
  amount: string;
  mint: string;
  signature: string;
};

export type StoredGrant = {
  id: string;
  openedAt: number;
  expiresAt: number;
  consumedAt: number | null;
  claimedAt: number | null;
  claimedBy: string | null;
  closedReason: "cancelled" | null;
  payment: GrantPayment | null;
};

export type PreauthStatusResult =
  | { status: "cancelled"; grantId: string }
  | { status: "expired"; grantId: string }
  | {
      status: "success";
      grantId: string;
      recipient: string;
      amount: string;
      mint: string;
      signature: string;
    };

export function newStoredGrant(now: number, ttlSeconds: number): StoredGrant {
  return {
    id: crypto.randomUUID(),
    openedAt: now,
    expiresAt: now + ttlSeconds,
    consumedAt: null,
    claimedAt: null,
    claimedBy: null,
    closedReason: null,
    payment: null,
  };
}

/** Newest first, cap 2. */
export function prependGrant(
  grants: readonly StoredGrant[],
  next: StoredGrant,
): StoredGrant[] {
  return [next, ...grants].slice(0, GRANT_RING_CAP);
}

/**
 * Close the current window so a new open can replace it.
 * Returns true when waiters for this grant should be aborted.
 * A stamped payment is left as success.
 */
export function closeGrantForReplacement(
  grant: StoredGrant,
  now: number,
): boolean {
  if (grant.payment) return false;
  if (grant.closedReason === "cancelled") return false;
  grant.closedReason = "cancelled";
  grant.consumedAt = now;
  return true;
}

/** Newest grant that can still be claimed / cancelled. */
export function currentActiveGrant(
  grants: readonly StoredGrant[],
  now: number,
): StoredGrant | null {
  const grant = grants[0];
  if (!grant) return null;
  if (
    grant.closedReason != null ||
    grant.consumedAt != null ||
    grant.expiresAt <= now
  ) {
    return null;
  }
  return grant;
}

export function findGrant(
  grants: readonly StoredGrant[],
  grantId: string,
): StoredGrant | undefined {
  return grants.find((grant) => grant.id === grantId);
}

/**
 * Stamp only the current uncancelled grant when `blockTime` falls in the
 * window. Missing `blockTime` still matches the current window.
 */
export function shouldStampPayment(
  current: StoredGrant | undefined,
  blockTime: number | null,
): boolean {
  if (!current || current.closedReason != null || current.payment) {
    return false;
  }
  if (blockTime == null) return true;
  return blockTime >= current.openedAt && blockTime <= current.expiresAt;
}

export function resolvePreauthStatus(
  grant: StoredGrant,
): PreauthStatusResult | "pending" {
  if (grant.payment) {
    return {
      status: "success",
      grantId: grant.id,
      recipient: grant.payment.recipient,
      amount: grant.payment.amount,
      mint: grant.payment.mint,
      signature: grant.payment.signature,
    };
  }
  if (grant.closedReason === "cancelled") {
    return { status: "cancelled", grantId: grant.id };
  }
  return "pending";
}

/**
 * Remaining wall-clock wait. Zero means return a terminal status now
 * (`success` / `cancelled` from {@link resolvePreauthStatus}, else `expired`).
 * Grace applies only when the grant was claimed (submit started).
 */
export function remainingWaitMs(grant: StoredGrant, nowMs: number): number {
  if (grant.payment || grant.closedReason === "cancelled") return 0;
  const graceMs =
    grant.claimedAt != null ? PREAUTH_WEBHOOK_GRACE_SECONDS * 1000 : 0;
  return Math.max(0, grant.expiresAt * 1000 + graceMs - nowMs);
}

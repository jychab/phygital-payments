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
  closedReason: "cancelled" | "replaced" | null;
  payment: GrantPayment | null;
};

/** Shortcut / notification copy for a terminal grant status. */
export type PreauthStatusCopy = {
  body: string;
};

export type PreauthStatusResult = PreauthStatusCopy &
  (
    | { status: "cancelled"; grantId: string }
    | { status: "replaced"; grantId: string }
    | { status: "expired"; grantId: string }
    | {
        status: "success";
        grantId: string;
        recipient: string;
        amount: string;
        mint: string;
        signature: string;
      }
  );

const USDC_DECIMALS = 6;
const USDC_MINTS = new Set([
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDnm3",
]);

function shortAddress(value: string, length = 4): string {
  if (value.length <= length * 2 + 1) return value;
  return `${value.slice(0, length)}…${value.slice(-length)}`;
}

function formatRawAmount(raw: string, decimals: number): string {
  if (!/^\d+$/.test(raw)) return "—";
  const value = BigInt(raw);
  if (value === 0n) return "0";
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const frac = (value % base)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return frac.length > 0 ? `${whole}.${frac}` : whole.toString();
}

export type PreauthMintDisplay = {
  symbol: string;
  decimals: number;
};

/** Fallback when the verified-token catalog is unavailable. */
export function fallbackMintDisplay(mint: string): PreauthMintDisplay {
  if (USDC_MINTS.has(mint)) return { symbol: "USDC", decimals: USDC_DECIMALS };
  return { symbol: shortAddress(mint), decimals: USDC_DECIMALS };
}

export function successPreauthCopy(
  payment: Pick<GrantPayment, "amount" | "mint" | "recipient">,
  token: PreauthMintDisplay,
): PreauthStatusCopy {
  return {
    body: `Paid ${formatRawAmount(payment.amount, token.decimals)} ${token.symbol} to ${shortAddress(payment.recipient)}`,
  };
}

export function cancelledPreauthStatus(grantId: string): PreauthStatusResult {
  return {
    status: "cancelled",
    grantId,
    body: "Cancelled. Nothing was charged.",
  };
}

export function replacedPreauthStatus(grantId: string): PreauthStatusResult {
  return {
    status: "replaced",
    grantId,
    body: "A new payment started.",
  };
}

export function expiredPreauthStatus(grantId: string): PreauthStatusResult {
  return {
    status: "expired",
    grantId,
    body: "Time expired. Press Pay again to continue.",
  };
}

/** Copy for a freshly opened spending window (Shortcuts notification). */
export function openedPreauthCopy(ttlSeconds: number): PreauthStatusCopy {
  const minutes = Math.max(1, Math.round(ttlSeconds / 60));
  const remaining =
    minutes === 1 ? "1 minute remaining" : `${minutes} minutes remaining`;
  return { body: `Tap to Pay. ${remaining}` };
}

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
  if (grant.closedReason != null) return false;
  grant.closedReason = "replaced";
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
      ...successPreauthCopy(
        grant.payment,
        fallbackMintDisplay(grant.payment.mint),
      ),
    };
  }
  if (grant.closedReason === "cancelled") {
    return cancelledPreauthStatus(grant.id);
  }
  if (grant.closedReason === "replaced") {
    return replacedPreauthStatus(grant.id);
  }
  return "pending";
}

/**
 * Remaining wall-clock wait. Zero means return a terminal status now
 * (`success` / `cancelled` / `replaced` from {@link resolvePreauthStatus},
 * else `expired`). Grace applies only when the grant was claimed (submit
 * started).
 */
export function remainingWaitMs(grant: StoredGrant, nowMs: number): number {
  if (grant.payment || grant.closedReason != null) return 0;
  const graceMs =
    grant.claimedAt != null ? PREAUTH_WEBHOOK_GRACE_SECONDS * 1000 : 0;
  return Math.max(0, grant.expiresAt * 1000 + graceMs - nowMs);
}

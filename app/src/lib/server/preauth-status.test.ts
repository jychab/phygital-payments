import { describe, expect, it } from "vitest";

import { PREAUTH_TTL_SECONDS } from "../../../worker/preauth-grant-types";
import {
  GRANT_RING_CAP,
  PREAUTH_WEBHOOK_GRACE_SECONDS,
  closeGrantForReplacement,
  currentActiveGrant,
  newStoredGrant,
  prependGrant,
  remainingWaitMs,
  resolvePreauthStatus,
  shouldStampPayment,
  type StoredGrant,
} from "../../../shared/preauth-status";

function grant(overrides: Partial<StoredGrant> = {}): StoredGrant {
  return {
    id: "grant-a",
    openedAt: 1_000,
    expiresAt: 1_000 + PREAUTH_TTL_SECONDS,
    consumedAt: null,
    claimedAt: null,
    claimedBy: null,
    closedReason: null,
    payment: null,
    ...overrides,
  };
}

const payment = {
  recipient: "Recipient111111111111111111111111111111111",
  amount: "1000000",
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  signature: "sig",
};

describe("resolvePreauthStatus", () => {
  it("returns success when a payment is stamped, even if cancelled", () => {
    expect(
      resolvePreauthStatus(
        grant({ closedReason: "cancelled", payment }),
      ),
    ).toEqual({
      status: "success",
      grantId: "grant-a",
      ...payment,
    });
  });

  it("returns cancelled when closed without payment", () => {
    expect(
      resolvePreauthStatus(grant({ closedReason: "cancelled" })),
    ).toEqual({ status: "cancelled", grantId: "grant-a" });
  });

  it("returns pending until the waiter deadline", () => {
    expect(resolvePreauthStatus(grant())).toBe("pending");
  });
});

describe("remainingWaitMs", () => {
  it("is zero for success and cancelled", () => {
    expect(remainingWaitMs(grant({ payment }), 1_000_000)).toBe(0);
    expect(
      remainingWaitMs(grant({ closedReason: "cancelled" }), 1_000_000),
    ).toBe(0);
  });

  it("waits until expiresAt when idle", () => {
    const openedAt = 1_000;
    const g = grant({ openedAt, expiresAt: openedAt + 120 });
    expect(remainingWaitMs(g, openedAt * 1000)).toBe(120_000);
    expect(remainingWaitMs(g, (openedAt + 120) * 1000)).toBe(0);
  });

  it("adds webhook grace only after a claim", () => {
    const expiresAt = 1_120;
    const idle = grant({ expiresAt });
    const claimed = grant({ expiresAt, claimedAt: 1_010 });
    expect(remainingWaitMs(idle, expiresAt * 1000)).toBe(0);
    expect(remainingWaitMs(claimed, expiresAt * 1000)).toBe(
      PREAUTH_WEBHOOK_GRACE_SECONDS * 1000,
    );
  });
});

describe("closeGrantForReplacement", () => {
  it("cancels an unpaid current grant", () => {
    const current = grant();
    expect(closeGrantForReplacement(current, 1_050)).toBe(true);
    expect(current.closedReason).toBe("cancelled");
    expect(current.consumedAt).toBe(1_050);
  });

  it("leaves a stamped payment as success", () => {
    const current = grant({ payment });
    expect(closeGrantForReplacement(current, 1_050)).toBe(false);
    expect(current.closedReason).toBeNull();
    expect(current.payment).toEqual(payment);
  });
});

describe("shouldStampPayment", () => {
  const current = grant({ openedAt: 1_000, expiresAt: 1_120 });

  it("stamps the current uncancelled grant inside the window", () => {
    expect(shouldStampPayment(current, 1_060)).toBe(true);
    expect(shouldStampPayment(current, null)).toBe(true);
  });

  it("rejects replaced grants and times outside the window", () => {
    expect(shouldStampPayment(current, 999)).toBe(false);
    expect(shouldStampPayment(current, 1_121)).toBe(false);
    expect(
      shouldStampPayment(grant({ closedReason: "cancelled" }), 1_060),
    ).toBe(false);
    expect(shouldStampPayment(grant({ payment }), 1_060)).toBe(false);
    expect(shouldStampPayment(undefined, 1_060)).toBe(false);
  });
});

describe("grant ring", () => {
  it("keeps only the current grant plus one predecessor", () => {
    const a = newStoredGrant(1, PREAUTH_TTL_SECONDS);
    const b = newStoredGrant(2, PREAUTH_TTL_SECONDS);
    const c = newStoredGrant(3, PREAUTH_TTL_SECONDS);
    const ring = prependGrant(prependGrant([a], b), c);
    expect(ring).toHaveLength(GRANT_RING_CAP);
    expect(ring.map((g) => g.id)).toEqual([c.id, b.id]);
  });

  it("hides cancelled and expired grants from claim/cancel", () => {
    expect(currentActiveGrant([grant({ closedReason: "cancelled" })], 1_010)).toBeNull();
    expect(currentActiveGrant([grant({ expiresAt: 1_000 })], 1_001)).toBeNull();
    expect(currentActiveGrant([grant()], 1_010)?.id).toBe("grant-a");
  });
});

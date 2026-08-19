import { describe, expect, it } from "vitest";

import { PREAUTH_TTL_SECONDS } from "../../../worker/preauth-grant-types";
import {
  GRANT_RING_CAP,
  PREAUTH_WEBHOOK_GRACE_SECONDS,
  closeGrantForReplacement,
  currentActiveGrant,
  expiredPreauthStatus,
  newStoredGrant,
  openedPreauthCopy,
  prependGrant,
  remainingWaitMs,
  resolvePreauthStatus,
  shouldStampPayment,
  successPreauthCopy,
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
      body: "Paid 1 USDC to Reci…1111",
    });
  });

  it("returns cancelled when closed without payment", () => {
    expect(
      resolvePreauthStatus(grant({ closedReason: "cancelled" })),
    ).toEqual({
      status: "cancelled",
      grantId: "grant-a",
      body: "Cancelled. Nothing was charged.",
    });
  });

  it("returns pending until the waiter deadline", () => {
    expect(resolvePreauthStatus(grant())).toBe("pending");
  });

  it("formats fractional USDC for the shortcut notification", () => {
    expect(
      resolvePreauthStatus(
        grant({ payment: { ...payment, amount: "1230000" } }),
      ),
    ).toMatchObject({
      body: "Paid 1.23 USDC to Reci…1111",
    });
  });

  it("formats the UI amount from catalog mint decimals and symbol", () => {
    expect(
      successPreauthCopy(
        {
          ...payment,
          mint: "So11111111111111111111111111111111111111112",
          amount: "1500000000",
        },
        { symbol: "SOL", decimals: 9 },
      ),
    ).toEqual({
      body: "Paid 1.5 SOL to Reci…1111",
    });
  });
});

describe("expiredPreauthStatus", () => {
  it("includes shortcut notification copy", () => {
    expect(expiredPreauthStatus("grant-a")).toEqual({
      status: "expired",
      grantId: "grant-a",
      body: "Time Expired. Tap Pay again to continue.",
    });
  });
});

describe("openedPreauthCopy", () => {
  it("matches the Hold to Pay window for the default TTL", () => {
    expect(openedPreauthCopy(PREAUTH_TTL_SECONDS)).toEqual({
      body: "Hold to Pay. 2 minutes remaining",
    });
  });

  it("singularizes a one-minute window", () => {
    expect(openedPreauthCopy(60)).toEqual({
      body: "Hold to Pay. 1 minute remaining",
    });
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

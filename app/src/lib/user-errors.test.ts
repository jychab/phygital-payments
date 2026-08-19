import { describe, expect, it } from "vitest";

import { toUserErrorMessage, toUserFacingError } from "./user-errors";

describe("toUserFacingError", () => {
  it("tells the collector when Pay is not enabled", () => {
    const facing = toUserFacingError(
      new Error("No active preauth grant for this wallet"),
    );
    expect(facing.title).toBe("Payment Not Enabled");
    expect(facing.body).toMatch(/enable Pay/i);
  });

  it("names insufficient balance instead of a generic Pay setup error", () => {
    const facing = toUserFacingError(
      new Error("They don't have enough balance for this payment."),
    );
    expect(facing.title).toBe("Not Enough Money");
    expect(facing.body).toMatch(/enough/i);
  });

  it("maps on-chain insufficient funds, including simulation logs", () => {
    const sim = toUserFacingError(
      new Error(
        "Transaction would fail on-chain:\nProgram log: Error: insufficient funds",
      ),
    );
    expect(sim.title).toBe("Not Enough Money");
  });

  it("tells the collector when this token is not turned on for Pay", () => {
    const facing = toUserFacingError(
      new Error("They haven't enabled this token for Pay."),
    );
    expect(facing.title).toBe("Pay Isn’t Turned On");
  });

  it("tells the collector when the amount is over the spending limit", () => {
    const facing = toUserFacingError(
      new Error("This is more than their spending limit."),
    );
    expect(facing.title).toBe("Over the Limit");
  });

  it("rejects an API key for a different wallet", () => {
    const facing = toUserFacingError(
      new Error("This API key is for a different wallet"),
    );
    expect(facing.title).toBe("Wrong Wallet");
  });

  it("maps an invalid API key", () => {
    expect(
      toUserErrorMessage(new Error("Invalid or revoked API key")),
    ).toBe("Invalid API Key");
  });

  it("distinguishes an already-used Pay from not enabled", () => {
    const used = toUserFacingError(new Error("Preauth grant already used"));
    expect(used.title).toBe("Already Used");
  });
});

describe("toUserErrorMessage", () => {
  it("returns a short toast when Pay is not enabled", () => {
    expect(
      toUserErrorMessage(new Error("No active preauth grant for this wallet")),
    ).toBe("Payment Not Enabled");
  });

  it("does not call insufficient funds a Pay-setup problem", () => {
    expect(
      toUserErrorMessage(new Error("Error: insufficient funds")),
    ).toBe("Not Enough Money");
  });
});

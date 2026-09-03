import { describe, expect, it } from "vitest";

import { toUserErrorMessage, toUserFacingError } from "./user-errors";

describe("toUserFacingError", () => {
  it("names insufficient balance", () => {
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

  it("maps a passkey mismatch to Different item", () => {
    expect(
      toUserErrorMessage(new Error("This is not the same NFC accessory.")),
    ).toBe("Different item");
  });

  it("maps an unverified live check", () => {
    const facing = toUserFacingError(
      new Error("Couldn't verify this NFC accessory."),
    );
    expect(facing.title).toBe("Couldn’t verify");
  });

  it("maps amount precision", () => {
    const facing = toUserFacingError(
      new Error("Amount supports at most 6 decimals"),
    );
    expect(facing.title).toBe("Amount Too Precise");
  });
});

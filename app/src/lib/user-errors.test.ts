import { describe, expect, it } from "vitest";

import {
  toUserErrorMessage,
  toUserFacingBody,
  toUserFacingError,
} from "./user-errors";

describe("toUserFacingError", () => {
  it("tells the collector when Pay is not ready", () => {
    const facing = toUserFacingError(
      new Error("No active preauth grant for this wallet"),
    );
    expect(facing.title).toBe("Pay Isn’t Ready");
    expect(facing.body).toMatch(/press Pay/i);
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
    expect(facing.title).toBe("This Token Isn’t On");
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
    ).toBe("That Didn’t Work");
  });

  it("maps a passkey mismatch to Wrong item", () => {
    expect(
      toUserErrorMessage(new Error("This is not the same NFC accessory.")),
    ).toBe("Wrong item");
  });

  it("maps an unverified live check", () => {
    const facing = toUserFacingError(
      new Error("Couldn't verify this NFC accessory."),
    );
    expect(facing.title).toBe("Couldn't verify");
  });
});

describe("toUserErrorMessage", () => {
  it("returns a short toast when Pay is not enabled", () => {
    expect(
      toUserErrorMessage(new Error("No active preauth grant for this wallet")),
    ).toBe("Pay Isn’t Ready");
  });

  it("maps a closed wallet sheet to Cancelled", () => {
    expect(
      toUserErrorMessage(new Error("The user closed the flow")),
    ).toBe("Cancelled");
  });
});

describe("toUserFacingBody", () => {
  it("folds rate-limit copy into one Shortcuts line", () => {
    expect(
      toUserFacingBody(new Error("Preauth rate limited — try again in a moment")),
    ).toBe("Try Again Shortly. Too many attempts. Wait a moment and try again.");
  });

  it("folds an invalid API key into one Shortcuts line", () => {
    expect(toUserFacingBody("Invalid or revoked API key")).toBe(
      "That Didn’t Work. Check what you pasted and try again.",
    );
  });

  it("folds a missing grant into one Shortcuts line", () => {
    expect(toUserFacingBody("Preauth grant not found")).toBe(
      "Payment Not Found. Press Pay again to continue.",
    );
  });

  it("folds a missing apiKey header into one Shortcuts line", () => {
    expect(toUserFacingBody("Missing x-api-key header")).toBe(
      "Revibase Pay Isn’t Set Up. Generate or import an API key in this browser first.",
    );
  });
});

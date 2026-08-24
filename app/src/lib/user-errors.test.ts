import { describe, expect, it } from "vitest";

import {
  toUserErrorMessage,
  toUserFacingBody,
  toUserFacingError,
} from "./user-errors";

describe("toUserFacingError", () => {
  it("maps a passkey mismatch to Couldn’t Verify", () => {
    expect(
      toUserErrorMessage(new Error("This is not the same phygital token.")),
    ).toBe("Couldn’t Verify");
  });

  it("maps an unverified live check", () => {
    const facing = toUserFacingError(
      new Error("Couldn't verify this phygital token."),
    );
    expect(facing.title).toBe("Couldn’t Verify");
  });

  it("maps a locked accessory", () => {
    const facing = toUserFacingError(
      new Error(
        "This accessory is locked. Unlock it before adding it to a wallet.",
      ),
    );
    expect(facing.title).toBe("Accessory Locked");
  });

  it("maps an already-claimed wallet", () => {
    const facing = toUserFacingError(
      new Error("This accessory is already on that wallet."),
    );
    expect(facing.title).toBe("Already Added");
  });
});

describe("toUserErrorMessage", () => {
  it("maps a closed passkey prompt to Cancelled", () => {
    expect(
      toUserErrorMessage(new Error("The user closed the flow")),
    ).toBe("Cancelled");
  });
});

describe("toUserFacingBody", () => {
  it("folds a replayed tap into one line", () => {
    expect(toUserFacingBody("This tap was already used.")).toBe(
      "Already Used. Hold your accessory to this phone again.",
    );
  });
});

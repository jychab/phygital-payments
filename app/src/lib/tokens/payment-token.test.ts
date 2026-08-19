import { describe, expect, it } from "vitest";

import { defaultTapAmountUi, getDefaultMint } from "@/lib/tokens/payment-token";

const OTHER = "OtherMint111111111111111111111111111111111";

describe("defaultTapAmountUi", () => {
  it("defaults to 100 when neither cap is set (USDC / omitted mint)", () => {
    expect(defaultTapAmountUi()).toBe("100");
    expect(defaultTapAmountUi(null, null)).toBe("100");
    expect(defaultTapAmountUi(null, null, getDefaultMint())).toBe("100");
  });

  it("does not default max tap for non-USDC mints", () => {
    expect(defaultTapAmountUi(null, null, OTHER)).toBe("");
    expect(defaultTapAmountUi("50", null, OTHER)).toBe("");
    expect(defaultTapAmountUi("50", "10", OTHER)).toBe("10");
  });

  it("uses min(max tap, spending limit)", () => {
    expect(defaultTapAmountUi("50", "100")).toBe("50");
    expect(defaultTapAmountUi("500", "100")).toBe("100");
    expect(defaultTapAmountUi("80", "40")).toBe("40");
  });

  it("falls back to the stored max tap when there is no spending limit", () => {
    expect(defaultTapAmountUi(null, "25")).toBe("25");
  });
});

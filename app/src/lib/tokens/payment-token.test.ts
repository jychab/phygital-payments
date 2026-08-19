import { describe, expect, it } from "vitest";

import { defaultTapAmountUi } from "@/lib/tokens/payment-token";

describe("defaultTapAmountUi", () => {
  it("defaults to 100 when neither cap is set", () => {
    expect(defaultTapAmountUi()).toBe("100");
    expect(defaultTapAmountUi(null, null)).toBe("100");
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

import { describe, expect, it } from "vitest";

import { formatUiAmount, parseUiAmount } from "./parse-amount";

describe("parseUiAmount", () => {
  it("parses SOL-scale 9 decimals", () => {
    expect(parseUiAmount("1.5", 9)).toBe(1_500_000_000n);
  });

  it("parses 6-decimal tokens", () => {
    expect(parseUiAmount("2", 6)).toBe(2_000_000n);
    expect(parseUiAmount("0.000001", 6)).toBe(1n);
  });

  it("rejects extra fractional digits", () => {
    expect(parseUiAmount("1.0000001", 6)).toBeNull();
  });
});

describe("formatUiAmount", () => {
  it("round-trips 6-decimal tokens", () => {
    expect(formatUiAmount(2_000_000n, 6)).toBe("2");
    expect(formatUiAmount(1n, 6)).toBe("0.000001");
  });
});

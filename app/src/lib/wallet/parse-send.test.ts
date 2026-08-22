import { describe, expect, it } from "vitest";

import { parseSendIntent } from "./parse-send";
import { formatSol, parseSolAmount } from "./sol";

describe("parseSolAmount", () => {
  it("parses whole and fractional SOL", () => {
    expect(parseSolAmount("1")).toBe(1_000_000_000n);
    expect(parseSolAmount("0.5")).toBe(500_000_000n);
    expect(parseSolAmount("1.000000001")).toBe(1_000_000_001n);
  });

  it("rejects junk", () => {
    expect(parseSolAmount("")).toBeNull();
    expect(parseSolAmount("1.0000000001")).toBeNull();
    expect(parseSolAmount("sol")).toBeNull();
  });
});

describe("formatSol", () => {
  it("trims trailing zeros", () => {
    expect(formatSol(500_000_000n)).toBe("0.5");
    expect(formatSol(1_000_000_000n)).toBe("1");
  });
});

describe("parseSendIntent", () => {
  const dest = "2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU";

  it("parses send 0.5 SOL to address", () => {
    const parsed = parseSendIntent(`Send 0.5 SOL to ${dest}`);
    expect(parsed?.lamports).toBe(500_000_000n);
    expect(parsed?.destination).toBe(dest);
  });

  it("rejects missing amount or address", () => {
    expect(parseSendIntent("send alice 1 sol")).toBeNull();
    expect(parseSendIntent("hello")).toBeNull();
  });
});

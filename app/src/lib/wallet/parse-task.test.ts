import { describe, expect, it } from "vitest";

import { parseTaskIntent } from "./parse-task";

describe("parseTaskIntent", () => {
  it("parses dca with amount", () => {
    expect(parseTaskIntent("DCA 0.5 SOL into BTC daily")).toEqual({
      label: "Swap 0.5 SOL to BTC daily",
      spendingLimitSol: "0.5",
    });
  });

  it("parses swap without amount", () => {
    expect(parseTaskIntent("swap into ETH weekly")).toEqual({
      label: "DCA into ETH weekly",
      spendingLimitSol: null,
    });
  });

  it("returns null for send-like text", () => {
    expect(parseTaskIntent("Send 1 SOL to abc")).toBeNull();
  });
});

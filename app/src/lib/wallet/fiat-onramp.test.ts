import { describe, expect, it } from "vitest";

import { USDC_MINT_MAINNET } from "@/lib/tokens/usdc-mint";
import {
  isOnrampUserExit,
  SOLANA_ONRAMP_CHAIN,
  SOLANA_ONRAMP_USDC,
} from "./fiat-onramp";

describe("fiat onramp", () => {
  it("targets Solana mainnet USDC", () => {
    expect(SOLANA_ONRAMP_USDC).toBe(String(USDC_MINT_MAINNET));
    expect(SOLANA_ONRAMP_CHAIN).toBe("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp");
  });

  it("treats a closed provider sheet as a user exit", () => {
    expect(isOnrampUserExit(new Error("USER_EXITED"))).toBe(true);
    expect(isOnrampUserExit({ code: "user_exited" })).toBe(true);
    expect(isOnrampUserExit(new Error("The user closed the flow"))).toBe(true);
    expect(isOnrampUserExit(new Error("provider session failed"))).toBe(false);
  });
});

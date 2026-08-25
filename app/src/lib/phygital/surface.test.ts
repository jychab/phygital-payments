import { address } from "@solana/kit";
import { describe, expect, it } from "vitest";

import { DEFAULT_TOKEN_OWNER, type PhygitalToken } from "@/lib/phygital/token";
import { claimHref, phygitalHref, surfaceForToken } from "@/lib/phygital/surface";

const MINT = address("So11111111111111111111111111111111111111112");

function token(mint: PhygitalToken["mint"]): Pick<PhygitalToken, "mint"> {
  return { mint };
}

describe("surfaceForToken", () => {
  it("sends minted tokens to /card", () => {
    expect(surfaceForToken(token(MINT))).toBe("card");
  });

  it("keeps unset-mint tokens on /accessory", () => {
    expect(surfaceForToken(token(DEFAULT_TOKEN_OWNER))).toBe("accessory");
  });
});

describe("phygitalHref", () => {
  it("preserves the query string on the target surface", () => {
    expect(phygitalHref("card", "pk=abc&s=1")).toBe("/card?pk=abc&s=1");
    expect(phygitalHref("accessory", "?token=xyz")).toBe("/accessory?token=xyz");
  });
});

describe("claimHref", () => {
  it("routes a minted claim to /card", () => {
    expect(claimHref("pending-1", token(MINT))).toBe("/card?token=pending-1");
  });

  it("defaults to /accessory when the token is unknown", () => {
    expect(claimHref("pending-2")).toBe("/accessory?token=pending-2");
  });
});

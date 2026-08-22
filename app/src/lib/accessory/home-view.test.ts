import { address } from "@solana/kit";
import { PhygitalTokenType } from "phygital-token-sdk";
import { describe, expect, it } from "vitest";

import { accessoryHomeView } from "./home-view";
import { DEFAULT_TOKEN_OWNER } from "@/lib/phygital/token";

const vault = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");
const other = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

describe("accessoryHomeView", () => {
  it("sends a Controlled unclaimed token to claim", () => {
    expect(
      accessoryHomeView(
        {
          tokenType: PhygitalTokenType.Controlled,
          currentOwner: DEFAULT_TOKEN_OWNER,
        },
        vault,
      ),
    ).toBe("claim");
  });

  it("sends a Controlled token owned by this vault to wallet", () => {
    expect(
      accessoryHomeView(
        { tokenType: PhygitalTokenType.Controlled, currentOwner: vault },
        vault,
      ),
    ).toBe("wallet");
  });

  it("sends a Controlled token owned by someone else to foreign-owner", () => {
    expect(
      accessoryHomeView(
        { tokenType: PhygitalTokenType.Controlled, currentOwner: other },
        vault,
      ),
    ).toBe("foreign-owner");
  });

  it("does not treat Bearer tokens as this wallet route", () => {
    expect(
      accessoryHomeView(
        {
          tokenType: PhygitalTokenType.Bearer,
          currentOwner: DEFAULT_TOKEN_OWNER,
        },
        vault,
      ),
    ).toBe("unsupported");
    expect(
      accessoryHomeView(
        { tokenType: PhygitalTokenType.Bearer, currentOwner: vault },
        vault,
      ),
    ).toBe("unsupported");
  });
});

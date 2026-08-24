import { address } from "@solana/kit";
import { PhygitalTokenType } from "phygital-token-sdk";
import { describe, expect, it } from "vitest";

import { accessoryTapView } from "./home-view";
import { DEFAULT_TOKEN_OWNER } from "@/lib/phygital/token";

const vault = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");
const other = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

describe("accessoryTapView", () => {
  it("sends a Controlled unclaimed token to claim", () => {
    expect(
      accessoryTapView(
        {
          tokenType: PhygitalTokenType.Controlled,
          currentOwner: DEFAULT_TOKEN_OWNER,
        },
        vault,
      ),
    ).toBe("claim");
    expect(
      accessoryTapView(
        {
          tokenType: PhygitalTokenType.Controlled,
          currentOwner: DEFAULT_TOKEN_OWNER,
        },
        null,
      ),
    ).toBe("claim");
  });

  it("sends a Controlled token owned by this vault to wallet", () => {
    expect(
      accessoryTapView(
        { tokenType: PhygitalTokenType.Controlled, currentOwner: vault },
        vault,
      ),
    ).toBe("wallet");
  });

  it("asks a signed-out visitor to sign in when the token is claimed", () => {
    expect(
      accessoryTapView(
        { tokenType: PhygitalTokenType.Controlled, currentOwner: vault },
        null,
      ),
    ).toBe("signed-out");
  });

  it("sends a Controlled token owned by someone else to foreign-owner", () => {
    expect(
      accessoryTapView(
        { tokenType: PhygitalTokenType.Controlled, currentOwner: other },
        vault,
      ),
    ).toBe("foreign-owner");
  });

  it("does not treat Bearer tokens as this wallet route", () => {
    expect(
      accessoryTapView(
        {
          tokenType: PhygitalTokenType.Bearer,
          currentOwner: DEFAULT_TOKEN_OWNER,
        },
        vault,
      ),
    ).toBe("unsupported");
    expect(
      accessoryTapView(
        { tokenType: PhygitalTokenType.Bearer, currentOwner: vault },
        vault,
      ),
    ).toBe("unsupported");
  });
});

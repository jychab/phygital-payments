import { describe, expect, it } from "vitest";

import {
  isPolicySetupScreen,
  limitsSetupHomeHref,
  parseLimitsSetupIntent,
  parseSetupReturnPath,
  tokenLimitsReturnPath,
} from "./limits-setup-href";

describe("parseSetupReturnPath", () => {
  const token = "TokenPda111111111111111111111111111111111";

  it("accepts a matching /token return path", () => {
    const raw = tokenLimitsReturnPath(token, "spendingLimits");
    expect(parseSetupReturnPath(raw)).toEqual({
      token,
      screen: "spendingLimits",
      path: raw,
    });
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(parseSetupReturnPath("https://evil.example/phish")).toBeNull();
    expect(parseSetupReturnPath("//evil.example/phish")).toBeNull();
  });

  it("rejects other app routes and missing screen", () => {
    expect(parseSetupReturnPath("/home")).toBeNull();
    expect(parseSetupReturnPath(`/token?address=${token}`)).toBeNull();
  });

  it("isPolicySetupScreen only allows known sheets", () => {
    expect(isPolicySetupScreen("spendingLimits")).toBe(true);
    expect(isPolicySetupScreen("settings")).toBe(false);
  });
});

describe("limits setup intent", () => {
  const token = "TokenPda111111111111111111111111111111111";

  it("home href only carries setup + return (no duplicate token/screen)", () => {
    const href = limitsSetupHomeHref({ token, screen: "recipients" });
    const u = new URL(href, "https://revibase.invalid");
    expect(u.searchParams.get("setup")).toBe("limits");
    expect(u.searchParams.get("return")).toBe(
      tokenLimitsReturnPath(token, "recipients"),
    );
    expect(u.searchParams.get("token")).toBeNull();
    expect(u.searchParams.get("screen")).toBeNull();
  });

  it("parseLimitsSetupIntent requires setup=limits and a valid return", () => {
    const returnPath = tokenLimitsReturnPath(token, "spendingLimits");
    expect(
      parseLimitsSetupIntent({ setup: "limits", returnPath }),
    ).toEqual({
      token,
      screen: "spendingLimits",
      returnTo: returnPath,
    });
    expect(
      parseLimitsSetupIntent({ setup: "limits", returnPath: null }),
    ).toBeNull();
    expect(
      parseLimitsSetupIntent({ setup: null, returnPath }),
    ).toBeNull();
  });
});

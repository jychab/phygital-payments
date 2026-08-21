import { describe, expect, it } from "vitest";

import { resolveRequirePreauth } from "../../../shared/preauth-required";

describe("resolveRequirePreauth", () => {
  it("is off for a new wallet (generation 0, never toggled)", () => {
    expect(resolveRequirePreauth(null, 0)).toBe(false);
    expect(resolveRequirePreauth(undefined, 0)).toBe(false);
  });

  it("is on for an existing key user who never toggled", () => {
    expect(resolveRequirePreauth(null, 1)).toBe(true);
    expect(resolveRequirePreauth(undefined, 3)).toBe(true);
  });

  it("honors an explicit toggle over generation", () => {
    expect(resolveRequirePreauth(false, 2)).toBe(false);
    expect(resolveRequirePreauth(true, 0)).toBe(true);
  });
});

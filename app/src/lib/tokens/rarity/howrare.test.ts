import { describe, expect, it } from "vitest";

import {
  enrichAttributes,
  scoreMintHowRare,
  traitRarityPercent,
} from "./howrare";

describe("traitRarityPercent", () => {
  it("computes frequency as percentage of supply", () => {
    expect(traitRarityPercent(1, 5000)).toBeCloseTo(0.02, 5);
    expect(traitRarityPercent(2500, 5000)).toBe(50);
  });
});

describe("scoreMintHowRare", () => {
  it("sums 1/rarity% per present trait (no attribute-count)", () => {
    const counts = new Map<string, number>([
      ["Background|Blue", 1],
      ["Background|Red", 2500],
      ["Hat|Crown", 50],
    ]);
    const total = 5000;

    const scoreA = scoreMintHowRare({
      attributes: [
        { traitType: "Background", value: "Blue" },
        { traitType: "Hat", value: "Crown" },
      ],
      totalSupply: total,
      getTraitCount: (t, v) => counts.get(`${t}|${v}`) ?? 0,
    });

    // Blue: 5000/(1*100)=50, Crown: 5000/(50*100)=1
    expect(scoreA).toBeCloseTo(51, 5);

    const scoreB = scoreMintHowRare({
      attributes: [{ traitType: "Background", value: "Red" }],
      totalSupply: total,
      getTraitCount: (t, v) => counts.get(`${t}|${v}`) ?? 0,
    });

    // Red: 5000/(2500*100)=0.02
    expect(scoreB).toBeCloseTo(0.02, 5);
    expect(scoreA).toBeGreaterThan(scoreB);
  });
});

describe("enrichAttributes", () => {
  it("adds rarity percent and tier per trait", () => {
    const enriched = enrichAttributes({
      attributes: [{ traitType: "Background", value: "Blue" }],
      totalSupply: 5000,
      getTraitCount: () => 1,
    });
    expect(enriched[0]?.rarityPercent).toBeCloseTo(0.02, 5);
    expect(enriched[0]?.tier).toBe("mythic");
  });
});

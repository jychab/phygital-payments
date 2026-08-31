import { describe, expect, it } from "vitest";

import {
  ATTR_COUNT_TRAIT_TYPE,
  enrichAttributes,
  scoreMintFromCounts,
  traitRarityPercent,
} from "./trait-normalized";

describe("traitRarityPercent", () => {
  it("computes frequency as percentage of supply", () => {
    expect(traitRarityPercent(1, 5000)).toBeCloseTo(0.02, 5);
    expect(traitRarityPercent(2500, 5000)).toBe(50);
  });
});

describe("scoreMintFromCounts", () => {
  it("sums maxCount/count per trait plus attribute-count pseudo-trait", () => {
    const counts = new Map<string, number>([
      ["Background|Blue", 1],
      ["Background|Red", 3],
      ["Hat|Crown", 1],
    ]);
    const maxByType = new Map<string, number>([
      ["Background", 3],
      ["Hat", 1],
    ]);

    const scoreA = scoreMintFromCounts({
      attributes: [
        { traitType: "Background", value: "Blue" },
        { traitType: "Hat", value: "Crown" },
      ],
      attrCount: 2,
      getTraitCount: (t, v) => counts.get(`${t}|${v}`) ?? 0,
      maxCountByTraitType: maxByType,
      attrCountFrequency: 2,
      maxAttrCountFrequency: 3,
    });

    // Background Blue: 3/1 = 3, Hat Crown: 1/1 = 1, attr count: 3/2 = 1.5
    expect(scoreA).toBeCloseTo(5.5, 5);

    const scoreB = scoreMintFromCounts({
      attributes: [{ traitType: "Background", value: "Red" }],
      attrCount: 1,
      getTraitCount: (t, v) => counts.get(`${t}|${v}`) ?? 0,
      maxCountByTraitType: maxByType,
      attrCountFrequency: 1,
      maxAttrCountFrequency: 3,
    });

    // Background Red: 3/3 = 1, attr count: 3/1 = 3
    expect(scoreB).toBeCloseTo(4, 5);
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
    expect(ATTR_COUNT_TRAIT_TYPE).toBe("Attribute Count");
  });
});

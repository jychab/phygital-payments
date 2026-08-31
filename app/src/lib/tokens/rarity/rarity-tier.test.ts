import { describe, expect, it } from "vitest";

import { tierFromPercentile, tierFromRank } from "./rarity-tier";

describe("tierFromPercentile", () => {
  it("maps Tensor percentile breakpoints", () => {
    expect(tierFromPercentile(0.5)).toBe("mythic");
    expect(tierFromPercentile(1)).toBe("mythic");
    expect(tierFromPercentile(1.01)).toBe("legendary");
    expect(tierFromPercentile(5)).toBe("legendary");
    expect(tierFromPercentile(5.01)).toBe("epic");
    expect(tierFromPercentile(15)).toBe("epic");
    expect(tierFromPercentile(15.01)).toBe("rare");
    expect(tierFromPercentile(35)).toBe("rare");
    expect(tierFromPercentile(35.01)).toBe("uncommon");
    expect(tierFromPercentile(60)).toBe("uncommon");
    expect(tierFromPercentile(60.01)).toBe("common");
    expect(tierFromPercentile(100)).toBe("common");
  });
});

describe("tierFromRank", () => {
  it("derives tier from rank position", () => {
    expect(tierFromRank(10, 1000)).toBe("mythic");
    expect(tierFromRank(50, 1000)).toBe("legendary");
    expect(tierFromRank(756, 5000)).toBe("rare");
  });
});

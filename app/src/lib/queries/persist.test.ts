import { describe, expect, it } from "vitest";
import { type PersistedClient } from "@tanstack/react-query-persist-client";

import {
  deserializeQueryCache,
  isPersistedQueryKey,
  serializeQueryCache,
} from "./persist";

function roundTrip(value: unknown): unknown {
  const client = { payload: value } as unknown as PersistedClient;
  return (deserializeQueryCache(serializeQueryCache(client)) as { payload: unknown })
    .payload;
}

describe("serializeQueryCache / deserializeQueryCache", () => {
  it("round-trips bigint fields", () => {
    expect(roundTrip({ delegatedAmountRaw: 1_000_000n })).toEqual({
      delegatedAmountRaw: 1_000_000n,
    });
  });

  it("round-trips a Map of mint statuses with bigint amounts", () => {
    const status = {
      delegatedAmountRaw: 250_000n,
      balanceRaw: 1n,
    };
    const restored = roundTrip(new Map([["mint", status]]));
    expect(restored).toBeInstanceOf(Map);
    expect(restored).toEqual(new Map([["mint", status]]));
  });

  it("does not throw on bigint the way JSON.stringify does", () => {
    expect(() => JSON.stringify({ n: 1n })).toThrow(TypeError);
    expect(() => serializeQueryCache({ n: 1n } as unknown as PersistedClient)).not.toThrow();
  });
});

describe("isPersistedQueryKey", () => {
  it("allows instant-paint roots", () => {
    expect(isPersistedQueryKey(["holdings", "owner"])).toBe(true);
    expect(isPersistedQueryKey(["delegateStatus", "owner", "mint"])).toBe(true);
    expect(isPersistedQueryKey(["assets", "owner", "owner"])).toBe(true);
    expect(isPersistedQueryKey(["preauthStatus", "wallet"])).toBe(true);
    expect(isPersistedQueryKey(["verifiedTokens"])).toBe(true);
  });

  it("skips growing or one-shot caches", () => {
    expect(isPersistedQueryKey(["history", "owner"])).toBe(false);
    expect(isPersistedQueryKey(["tapVerify", "pk=1"])).toBe(false);
    expect(isPersistedQueryKey(["pendingClaim", "token"])).toBe(false);
    expect(isPersistedQueryKey(["ataStatus", "owner", "mint"])).toBe(false);
    expect(isPersistedQueryKey(["mintProgram", "mint"])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { type PersistedClient } from "@tanstack/react-query-persist-client";

import {
  deserializeQueryCache,
  isPersistedQueryKey,
  serializeQueryCache,
} from "./persist";
import { isOwnerDataQuery } from "./index";

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
    expect(isPersistedQueryKey(["delegateStatus", "owner", "token", "mint"])).toBe(
      true,
    );
    expect(isPersistedQueryKey(["phygitalTokens", "owner", "owner"])).toBe(true);
    expect(isPersistedQueryKey(["ownerPayDelegates", "owner"])).toBe(true);
  });

  it("skips growing or one-shot caches", () => {
    expect(isPersistedQueryKey(["payContext", "owner"])).toBe(false);
    expect(isPersistedQueryKey(["verifiedTokens"])).toBe(false);
    expect(isPersistedQueryKey(["history", "owner"])).toBe(false);
    expect(isPersistedQueryKey(["tapVerify", "pk=1"])).toBe(false);
    expect(isPersistedQueryKey(["pendingClaim", "token"])).toBe(false);
    expect(isPersistedQueryKey(["ataStatus", "owner", "mint"])).toBe(false);
    expect(isPersistedQueryKey(["mintProgram", "mint"])).toBe(false);
  });
});

describe("isOwnerDataQuery", () => {
  it("matches owner-scoped live and default reads", () => {
    expect(isOwnerDataQuery(["holdings", "owner"], "owner")).toBe(true);
    expect(
      isOwnerDataQuery(["delegateStatus", "owner", "token", "mint"], "owner"),
    ).toBe(true);
    expect(isOwnerDataQuery(["history", "owner"], "owner")).toBe(true);
    expect(isOwnerDataQuery(["ownerPayDelegates", "owner"], "owner")).toBe(
      true,
    );
    expect(isOwnerDataQuery(["phygitalTokens", "owner", "owner"], "owner")).toBe(
      true,
    );
  });

  it("skips other wallets and one-shot queries", () => {
    expect(isOwnerDataQuery(["holdings", "other"], "owner")).toBe(false);
    expect(
      isOwnerDataQuery(["phygitalTokens", "identifier", "pk"], "owner"),
    ).toBe(false);
    expect(isOwnerDataQuery(["tapVerify", "pk=1"], "owner")).toBe(false);
    expect(isOwnerDataQuery(["payContext", "owner"], "owner")).toBe(false);
    expect(isOwnerDataQuery(["verifiedTokens"], "owner")).toBe(false);
  });
});

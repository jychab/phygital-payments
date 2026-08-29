import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { type PersistedClient } from "@tanstack/react-query-persist-client";

import {
  deserializeQueryCache,
  isPersistedQueryKey,
  serializeQueryCache,
} from "./persist";
import {
  invalidatePhygitalTokenQueries,
  isOwnerDataQuery,
  queryKeys,
} from "./index";

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
    expect(isPersistedQueryKey(["dasCollectible", "mint"])).toBe(true);
  });

  it("skips growing or one-shot caches", () => {
    expect(isPersistedQueryKey(["payContext", "owner"])).toBe(false);
    expect(isPersistedQueryKey(["verifiedTokens"])).toBe(false);
    expect(isPersistedQueryKey(["history", "owner"])).toBe(false);
    expect(isPersistedQueryKey(["tapVerify", "pk=1"])).toBe(false);
    expect(isPersistedQueryKey(["ataStatus", "owner", "mint"])).toBe(false);
    expect(isPersistedQueryKey(["mintProgram", "mint"])).toBe(false);
    expect(isPersistedQueryKey(["preauthRequired", "owner"])).toBe(false);
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
    expect(isOwnerDataQuery(["preauthRequired", "owner"], "owner")).toBe(true);
  });

  it("skips other wallets and one-shot queries", () => {
    expect(isOwnerDataQuery(["holdings", "other"], "owner")).toBe(false);
    expect(
      isOwnerDataQuery(["phygitalTokens", "identifier", "pk"], "owner"),
    ).toBe(false);
    expect(isOwnerDataQuery(["tapVerify", "pk=1"], "owner")).toBe(false);
    expect(isOwnerDataQuery(["payContext", "owner"], "owner")).toBe(false);
    expect(isOwnerDataQuery(["verifiedTokens"], "owner")).toBe(false);
    expect(isOwnerDataQuery(["dasCollectible", "mint"], "owner")).toBe(false);
  });
});

describe("invalidatePhygitalTokenQueries", () => {
  it("invalidates address, identifier, passkey, and owner keys", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await invalidatePhygitalTokenQueries(queryClient, {
      address: "token",
      identifier: "pk",
      secp256r1PublicKey: "passkey",
      currentOwner: "owner",
    });

    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toEqual([
      queryKeys.phygitalToken.byAddress("token"),
      queryKeys.phygitalToken.byIdentifier("pk"),
      queryKeys.phygitalToken.byPasskey("passkey"),
      queryKeys.phygitalToken.byOwner("owner"),
    ]);
  });
});

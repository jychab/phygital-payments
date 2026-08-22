import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { type PersistedClient } from "@tanstack/react-query-persist-client";

import {
  deserializeQueryCache,
  isPersistedQueryKey,
  serializeQueryCache,
} from "./persist";
import { invalidatePhygitalTokenQueries, queryKeys } from "./index";

function roundTrip(value: unknown): unknown {
  const client = { payload: value } as unknown as PersistedClient;
  return (
    deserializeQueryCache(serializeQueryCache(client)) as unknown as {
      payload: unknown;
    }
  ).payload;
}

describe("serializeQueryCache / deserializeQueryCache", () => {
  it("round-trips bigint fields", () => {
    expect(roundTrip({ lastSignCount: 1_000_000n })).toEqual({
      lastSignCount: 1_000_000n,
    });
  });

  it("does not throw on bigint the way JSON.stringify does", () => {
    expect(() => JSON.stringify({ n: 1n })).toThrow(TypeError);
    expect(() => serializeQueryCache({ n: 1n } as unknown as PersistedClient)).not.toThrow();
  });
});

describe("isPersistedQueryKey", () => {
  it("allows instant-paint roots", () => {
    expect(isPersistedQueryKey(["phygitalTokens", "address", "token"])).toBe(
      true,
    );
    expect(isPersistedQueryKey(["dasCollectible", "mint"])).toBe(true);
  });

  it("skips one-shot caches", () => {
    expect(isPersistedQueryKey(["tapVerify", "pk=1"])).toBe(false);
  });
});

describe("invalidatePhygitalTokenQueries", () => {
  it("invalidates address, identifier, and passkey keys", async () => {
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
    ]);
  });
});

import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import type { PolicyDocument } from "phygital-verifier-sdk";

import { queryKeys } from "./index";
import { applyWalletPolicy, invalidatePhygitalToken } from "./mutations";

const base: PolicyDocument = {
  version: "2.0",
  programs: [{ programId: "11111111111111111111111111111111", allowAll: true }],
};

describe("applyWalletPolicy", () => {
  it("replaces cached policy with stored document", () => {
    const qc = new QueryClient();
    const key = queryKeys.walletPolicy.byToken("token");
    qc.setQueryData(key, base);
    const nextDoc: PolicyDocument = {
      ...base,
      programs: [
        ...base.programs,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", allowAll: true },
      ],
    };
    applyWalletPolicy(qc, "token", nextDoc);
    const next = qc.getQueryData<PolicyDocument>(key);
    expect(next?.programs).toHaveLength(2);
  });
});

describe("invalidatePhygitalToken", () => {
  it("matches identifier-keyed cache by data.address", () => {
    const qc = new QueryClient();
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    qc.setQueryData(queryKeys.phygitalToken.byIdentifier("pk"), {
      address: "token-pda",
    });
    invalidatePhygitalToken(qc, "token-pda");
    const predicate = invalidate.mock.calls[0]?.[0]?.predicate;
    expect(predicate).toBeTypeOf("function");
    const identifierQuery = qc.getQueryCache().find({
      queryKey: queryKeys.phygitalToken.byIdentifier("pk"),
    });
    expect(identifierQuery && predicate?.(identifierQuery)).toBe(true);
  });
});

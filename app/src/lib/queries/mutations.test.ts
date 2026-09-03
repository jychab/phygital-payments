import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "./index";
import { applyWalletPolicyPatch, invalidatePhygitalToken } from "./mutations";
import type { PolicySummary } from "@/lib/wallet/policies-client";

const base: PolicySummary = {
  maxTransferUsdc: "50",
  maxTransferSol: null,
  recipientMode: "anyone",
  recipientAllowlist: [],
  recipientDenylist: [],
  allowedPrograms: [],
};

describe("applyWalletPolicyPatch", () => {
  it("merges into cached policy", () => {
    const qc = new QueryClient();
    const key = queryKeys.walletPolicy.byToken("token");
    qc.setQueryData(key, base);
    applyWalletPolicyPatch(qc, "token", { maxTransferUsdc: "10" });
    expect(qc.getQueryData<PolicySummary>(key)?.maxTransferUsdc).toBe("10");
    expect(qc.getQueryData<PolicySummary>(key)?.recipientMode).toBe("anyone");
  });

  it("invalidates when cache is cold", () => {
    const qc = new QueryClient();
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    applyWalletPolicyPatch(qc, "token", { maxTransferUsdc: "10" });
    expect(invalidate).toHaveBeenCalled();
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

import { describe, expect, it } from "vitest";
import { address } from "@solana/kit";

import {
  needsAtaBeforeDelegate,
  patchDelegateAllowance,
  patchRevokedDelegate,
  delegateStatusKey,
  type MintDelegateStatus,
} from "@/lib/tokens/mint-delegate";

const baseStatus: MintDelegateStatus = {
  programAuthority: address("11111111111111111111111111111111"),
  ata: address("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
  ataExists: false,
  isProgramAuthorityDelegate: false,
  delegatedAmountRaw: 0n,
  delegatedAmountUi: "0",
  balanceRaw: 0n,
  balanceUi: "0",
};

describe("needsAtaBeforeDelegate", () => {
  it("returns false while status is still loading", () => {
    expect(needsAtaBeforeDelegate(undefined, false)).toBe(false);
  });

  it("returns true when status is ready, no delegate, and ATA is missing", () => {
    expect(needsAtaBeforeDelegate(baseStatus, true)).toBe(true);
  });

  it("returns false when ATA exists even with zero balance", () => {
    expect(
      needsAtaBeforeDelegate({ ...baseStatus, ataExists: true }, true),
    ).toBe(false);
  });

  it("returns false when delegate is already enabled", () => {
    expect(
      needsAtaBeforeDelegate(
        {
          ...baseStatus,
          ataExists: false,
          isProgramAuthorityDelegate: true,
          delegatedAmountRaw: 1_000_000n,
        },
        true,
      ),
    ).toBe(false);
  });
});

describe("delegateStatusKey", () => {
  it("joins token and mint with a separator", () => {
    expect(delegateStatusKey("tokenA", "mintB")).toBe("tokenA|mintB");
  });
});

describe("patchDelegateAllowance", () => {
  it("sets delegate fields and keeps balance", () => {
    const patched = patchDelegateAllowance(baseStatus, 2_000_000n, 6);
    expect(patched.isProgramAuthorityDelegate).toBe(true);
    expect(patched.delegatedAmountRaw).toBe(2_000_000n);
    expect(patched.delegatedAmountUi).toBe("2");
    expect(patched.ataExists).toBe(true);
    expect(patched.balanceRaw).toBe(baseStatus.balanceRaw);
  });
});

describe("patchRevokedDelegate", () => {
  it("clears delegate fields", () => {
    const active: MintDelegateStatus = {
      ...baseStatus,
      ataExists: true,
      isProgramAuthorityDelegate: true,
      delegatedAmountRaw: 1_000_000n,
      delegatedAmountUi: "1",
      balanceRaw: 5n,
      balanceUi: "0.000005",
    };
    const patched = patchRevokedDelegate(active);
    expect(patched.isProgramAuthorityDelegate).toBe(false);
    expect(patched.delegatedAmountRaw).toBe(0n);
    expect(patched.balanceRaw).toBe(5n);
  });
});

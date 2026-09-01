import { describe, expect, it } from "vitest";
import { address } from "@solana/kit";

import {
  needsAtaBeforeDelegate,
  patchDelegateAllowance,
  patchRevokedDelegate,
  delegateStatusKey,
  computeSpendableRaw,
  computeSpendableUi,
  isBalanceLimited,
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

describe("computeSpendableRaw", () => {
  it("returns 0 without an active delegate", () => {
    expect(computeSpendableRaw(baseStatus)).toBe(0n);
    expect(computeSpendableRaw(undefined)).toBe(0n);
  });

  it("returns balance when wallet is the constraint", () => {
    const status: MintDelegateStatus = {
      ...baseStatus,
      isProgramAuthorityDelegate: true,
      delegatedAmountRaw: 50_000_000n,
      balanceRaw: 10_000_000n,
    };
    expect(computeSpendableRaw(status)).toBe(10_000_000n);
  });

  it("returns allowance when wallet has plenty", () => {
    const status: MintDelegateStatus = {
      ...baseStatus,
      isProgramAuthorityDelegate: true,
      delegatedAmountRaw: 30_000_000n,
      balanceRaw: 100_000_000n,
    };
    expect(computeSpendableRaw(status)).toBe(30_000_000n);
  });

  it("returns 0 when both balance and allowance are zero", () => {
    const status: MintDelegateStatus = {
      ...baseStatus,
      isProgramAuthorityDelegate: true,
      delegatedAmountRaw: 0n,
      balanceRaw: 0n,
    };
    expect(computeSpendableRaw(status)).toBe(0n);
  });
});

describe("computeSpendableUi", () => {
  it("formats spendable with decimals", () => {
    const status: MintDelegateStatus = {
      ...baseStatus,
      isProgramAuthorityDelegate: true,
      delegatedAmountRaw: 1_500_000n,
      balanceRaw: 2_000_000n,
    };
    expect(computeSpendableUi(status, 6)).toBe("1.5");
  });
});

describe("isBalanceLimited", () => {
  it("is false without delegate or when balance covers allowance", () => {
    expect(isBalanceLimited(baseStatus)).toBe(false);
    expect(
      isBalanceLimited({
        ...baseStatus,
        isProgramAuthorityDelegate: true,
        delegatedAmountRaw: 10n,
        balanceRaw: 10n,
      }),
    ).toBe(false);
    expect(
      isBalanceLimited({
        ...baseStatus,
        isProgramAuthorityDelegate: true,
        delegatedAmountRaw: 10n,
        balanceRaw: 20n,
      }),
    ).toBe(false);
  });

  it("is true when balance is below remaining allowance", () => {
    expect(
      isBalanceLimited({
        ...baseStatus,
        isProgramAuthorityDelegate: true,
        delegatedAmountRaw: 50n,
        balanceRaw: 10n,
      }),
    ).toBe(true);
  });
});

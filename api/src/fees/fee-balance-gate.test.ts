import { describe, expect, it, vi, beforeEach } from "vitest";

import { runWithRequestStore } from "@/shared/request-context";
import {
  isFeeBalanceTopUpIntent,
  assertFeeBalance,
} from "@/fees/fee-balance-gate";
import { MEMO_PROGRAM_ADDRESS, requiredFeeLamports } from "@/fees/constants";
import { SYSTEM_PROGRAM, type IntentInstruction } from "@/verifier/constants";

const ACCUMULATOR = "FeeAccum11111111111111111111111111111111111";
const TOKEN = "Token111111111111111111111111111111111111111";

vi.mock("@/fees/default-verifier", () => ({
  usesDefaultVerifierPaymaster: vi.fn(async () => true),
}));

vi.mock("@/fees/fee-balance-db", () => ({
  getFeeBalanceLamports: vi.fn(async () => 0),
}));

import { usesDefaultVerifierPaymaster } from "@/fees/default-verifier";
import { getFeeBalanceLamports } from "@/fees/fee-balance-db";

const mockEnv = {
  SOLANA_CLUSTER: "mainnet",
  SOLANA_RPC_URL: "https://example.invalid",
  TOP_UP_ACCUMULATOR: ACCUMULATOR,
} as unknown as Env;

function withEnv<T>(fn: () => T): T {
  return runWithRequestStore(
    { env: mockEnv, waitUntil: () => undefined },
    fn,
  );
}

function transferTo(dest: string): IntentInstruction {
  return {
    programAddress: SYSTEM_PROGRAM,
    accounts: [
      { address: "Source1111111111111111111111111111111111111", role: "writable" },
      { address: dest, role: "writable" },
    ],
    data: new Uint8Array([2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]),
  };
}

function memoIx(): IntentInstruction {
  return {
    programAddress: MEMO_PROGRAM_ADDRESS,
    accounts: [],
    data: new TextEncoder().encode(TOKEN),
  };
}

describe("requiredFeeLamports", () => {
  it("scales with instruction count", () => {
    expect(requiredFeeLamports(0)).toBe(5_000);
    expect(requiredFeeLamports(2)).toBe(5_000 + 100_000);
  });
});

describe("isFeeBalanceTopUpIntent", () => {
  it("accepts transfer to accumulator plus memo", () => {
    expect(
      isFeeBalanceTopUpIntent([transferTo(ACCUMULATOR), memoIx()], ACCUMULATOR),
    ).toBe(true);
  });

  it("rejects other destinations", () => {
    expect(
      isFeeBalanceTopUpIntent(
        [transferTo("Other11111111111111111111111111111111111111")],
        ACCUMULATOR,
      ),
    ).toBe(false);
  });
});

describe("assertFeeBalance", () => {
  beforeEach(() => {
    vi.mocked(usesDefaultVerifierPaymaster).mockResolvedValue(true);
    vi.mocked(getFeeBalanceLamports).mockResolvedValue(0);
  });

  it("skips top-up intents", async () => {
    const result = await withEnv(() =>
      assertFeeBalance({
        phygitalToken: TOKEN,
        instructions: [transferTo(ACCUMULATOR), memoIx()],
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("hard-denies insufficient balance on default verifier", async () => {
    vi.mocked(getFeeBalanceLamports).mockResolvedValue(1_000);
    const ixs = [transferTo("Dest111111111111111111111111111111111111111")];
    const result = await withEnv(() =>
      assertFeeBalance({ phygitalToken: TOKEN, instructions: ixs }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("insufficient_fee_balance");
      expect(result.soft).toBe(false);
      expect(result.details.requiredLamports).toBe(requiredFeeLamports(1));
    }
  });

  it("skips when custom verifier", async () => {
    vi.mocked(usesDefaultVerifierPaymaster).mockResolvedValue(false);
    const result = await withEnv(() =>
      assertFeeBalance({
        phygitalToken: TOKEN,
        instructions: [transferTo("Dest111111111111111111111111111111111111111")],
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("passes when balance covers estimate", async () => {
    vi.mocked(getFeeBalanceLamports).mockResolvedValue(1_000_000);
    const result = await withEnv(() =>
      assertFeeBalance({
        phygitalToken: TOKEN,
        instructions: [transferTo("Dest111111111111111111111111111111111111111")],
      }),
    );
    expect(result.ok).toBe(true);
  });
});

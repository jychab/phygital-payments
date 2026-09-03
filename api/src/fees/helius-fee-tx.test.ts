import { describe, expect, it, vi, beforeEach } from "vitest";

import { runWithRequestStore } from "@/shared/request-context";
import { MEMO_PROGRAM_ADDRESS } from "@/fees/constants";
import {
  decodeMemoText,
  processHeliusFeeTx,
} from "@/fees/helius-fee-tx";
import { PHYGITAL_WALLET_PROGRAM_ADDRESS } from "phygital-wallet-sdk";

const ACC = "11111111111111111111111111111111";
const VER = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOK = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
const CFG = "SysvarRent111111111111111111111111111111111";

vi.mock("@/fees/default-verifier", () => ({
  isDefaultConfigVerifier: vi.fn(async () => true),
}));

vi.mock("@/fees/fee-balance-db", () => ({
  creditFeeBalance: vi.fn(async () => true),
  debitFeeBalance: vi.fn(async () => true),
}));

import { isDefaultConfigVerifier } from "@/fees/default-verifier";
import { creditFeeBalance, debitFeeBalance } from "@/fees/fee-balance-db";

const mockEnv = {
  TOP_UP_ACCUMULATOR: ACC,
} as unknown as Env;

function withEnv<T>(fn: () => T): T {
  return runWithRequestStore(
    { env: mockEnv, waitUntil: () => undefined },
    fn,
  );
}

describe("decodeMemoText", () => {
  it("returns address-looking strings", () => {
    expect(decodeMemoText(TOK)).toBe(TOK);
  });
});

describe("processHeliusFeeTx", () => {
  beforeEach(() => {
    vi.mocked(creditFeeBalance).mockClear();
    vi.mocked(debitFeeBalance).mockClear();
    vi.mocked(creditFeeBalance).mockResolvedValue(true);
    vi.mocked(debitFeeBalance).mockResolvedValue(true);
    vi.mocked(isDefaultConfigVerifier).mockResolvedValue(true);
  });

  it("credits top-up to accumulator with memo", async () => {
    await withEnv(() =>
      processHeliusFeeTx({
        signature: "sigCredit111",
        accountData: [{ account: ACC, nativeBalanceChange: 2_000_000 }],
        instructions: [
          {
            programId: MEMO_PROGRAM_ADDRESS,
            data: TOK,
          },
        ],
      }),
    );
    expect(creditFeeBalance).toHaveBeenCalledWith(
      expect.objectContaining({
        phygitalToken: TOK,
        lamports: 2_000_000,
      }),
    );
  });

  it("debits default verifier fee on execute", async () => {
    await withEnv(() =>
      processHeliusFeeTx({
        signature: "sigDebit111",
        feePayer: VER,
        accountData: [{ account: VER, nativeBalanceChange: -12_345 }],
        instructions: [
          {
            programId: PHYGITAL_WALLET_PROGRAM_ADDRESS,
            accounts: [VER, CFG, TOK],
          },
        ],
      }),
    );
    expect(debitFeeBalance).toHaveBeenCalledWith(
      expect.objectContaining({
        phygitalToken: TOK,
        lamports: 12_345,
      }),
    );
  });

  it("skips debit for non-default verifier", async () => {
    vi.mocked(isDefaultConfigVerifier).mockResolvedValue(false);
    await withEnv(() =>
      processHeliusFeeTx({
        signature: "sigSkip111",
        feePayer: VER,
        accountData: [{ account: VER, nativeBalanceChange: -9_000 }],
        instructions: [
          {
            programId: PHYGITAL_WALLET_PROGRAM_ADDRESS,
            accounts: [VER, CFG, TOK],
          },
        ],
      }),
    );
    expect(debitFeeBalance).not.toHaveBeenCalled();
  });
});

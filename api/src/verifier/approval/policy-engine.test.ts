import { describe, expect, it } from "vitest";
import { address } from "@solana/kit";
import { findAssociatedTokenPda } from "@solana-program/token";
import { getTransferCheckedInstructionDataEncoder } from "@solana-program/token";
import { getTransferSolInstructionDataEncoder } from "@solana-program/system";

import { runWithRequestStore } from "@/shared/request-context";
import {
  ATA_PROGRAM,
  SYSTEM_PROGRAM,
  TOKEN_PROGRAM,
  type IntentInstruction,
} from "@/verifier/constants";
import { buildDefaultPolicy } from "@/verifier/approval/policy-defaults";
import {
  compileSummaryToPolicy,
  deriveSummary,
  evaluatePolicy,
} from "@/verifier/approval/policy-engine";

const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OWNER_A = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const OWNER_B = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

const mockEnv = {
  SOLANA_CLUSTER: "mainnet",
  SOLANA_RPC_URL: "https://example.invalid",
} as unknown as Env;

function withEnv<T>(fn: () => T): T {
  return runWithRequestStore(
    { env: mockEnv, waitUntil: () => undefined },
    fn,
  );
}

function transferChecked(
  amount: bigint,
  destination: string,
  mint = USDC,
): IntentInstruction {
  const data = new Uint8Array(
    getTransferCheckedInstructionDataEncoder().encode({
      amount,
      decimals: 6,
    }),
  );
  return {
    programAddress: TOKEN_PROGRAM,
    accounts: [
      { address: "Src111111111111111111111111111111111111111" },
      { address: mint },
      { address: destination },
      { address: "Auth11111111111111111111111111111111111111" },
    ],
    data,
  };
}

function transferSol(lamports: bigint, to: string): IntentInstruction {
  const data = new Uint8Array(
    getTransferSolInstructionDataEncoder().encode({ amount: lamports }),
  );
  return {
    programAddress: SYSTEM_PROGRAM,
    accounts: [
      { address: "From11111111111111111111111111111111111111" },
      { address: to },
    ],
    data,
  };
}

function createAta(owner: string): IntentInstruction {
  return {
    programAddress: ATA_PROGRAM,
    accounts: [
      { address: "Payer1111111111111111111111111111111111111" },
      { address: "Ata111111111111111111111111111111111111111" },
      { address: owner },
      { address: USDC },
    ],
    data: new Uint8Array(),
  };
}

describe("evaluatePolicy", () => {
  it("allows default under-cap USDC transfer + ATA create", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = await evaluatePolicy(policy, [
        createAta(OWNER_A),
        transferChecked(10_000_000n, "Dst111111111111111111111111111111111111111"),
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("soft-denies over-cap USDC with spend_limit", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = await evaluatePolicy(policy, [
        transferChecked(100_000_000n, "Dst111111111111111111111111111111111111111"),
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("spend_limit");
      expect(verdict.soft).toBe(true);
      expect(verdict.details?.limitUi).toBe("50.00");
    });
  });

  it("soft-denies over-cap SOL transfer", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = await evaluatePolicy(policy, [
        transferSol(200_000_000n, OWNER_A),
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("spend_limit");
      expect(verdict.soft).toBe(true);
    });
  });

  it("hard-denies nested phygital-wallet CPI", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = await evaluatePolicy(policy, [
        {
          programAddress: "Fjbi9JrRAmSBdxQxbkcxYDp6JUwnLbFhU2GsieWQBLSg",
          accounts: [],
          data: new Uint8Array(),
        },
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("program_not_allowed");
      expect(verdict.soft).toBe(false);
    });
  });

  it("soft-denies TransferChecked-only to non-allowlisted owner ATA", async () => {
    await withEnv(async () => {
      const base = buildDefaultPolicy();
      const policy = compileSummaryToPolicy(
        {
          recipientMode: "allowlist",
          recipientAllowlist: [OWNER_A],
        },
        base,
      );
      const [ownerBAta] = await findAssociatedTokenPda({
        mint: address(USDC),
        owner: address(OWNER_B),
        tokenProgram: address(TOKEN_PROGRAM),
      });
      const deny = await evaluatePolicy(policy, [
        transferChecked(1_000_000n, String(ownerBAta)),
      ]);
      expect(deny.ok).toBe(false);
      if (deny.ok) return;
      expect(deny.code).toBe("recipient_not_allowed");
      expect(deny.soft).toBe(true);

      const [ownerAAta] = await findAssociatedTokenPda({
        mint: address(USDC),
        owner: address(OWNER_A),
        tokenProgram: address(TOKEN_PROGRAM),
      });
      const allow = await evaluatePolicy(policy, [
        createAta(OWNER_A),
        transferChecked(1_000_000n, String(ownerAAta)),
      ]);
      expect(allow).toEqual({ ok: true });
    });
  });

  it("allows non-USDC SPL TransferChecked", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const otherMint = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
      const verdict = await evaluatePolicy(policy, [
        transferChecked(
          1_000_000_000n,
          "Dst111111111111111111111111111111111111111",
          otherMint,
        ),
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("allows Token Metadata program id", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = await evaluatePolicy(policy, [
        {
          programAddress: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
          accounts: [],
          data: new Uint8Array(),
        },
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });
});

describe("compileSummaryToPolicy / deriveSummary", () => {
  it("round-trips maxTransferUsdc, maxTransferSol, and allowedPrograms", async () => {
    await withEnv(async () => {
      const base = buildDefaultPolicy();
      const next = compileSummaryToPolicy(
        { maxTransferUsdc: "25.00", maxTransferSol: "0.0500" },
        base,
      );
      const summary = deriveSummary(next);
      expect(summary.maxTransferUsdc).toBe("25.00");
      expect(summary.maxTransferSol).toBe("0.0500");
      expect(summary.allowedPrograms).toContain(TOKEN_PROGRAM);
    });
  });
});

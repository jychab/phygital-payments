import { describe, expect, it } from "vitest";
import { AccountRole, address, type Address } from "@solana/kit";
import { findAssociatedTokenPda } from "@solana-program/token";
import { getTransferCheckedInstructionDataEncoder } from "@solana-program/token";
import { getTransferSolInstructionDataEncoder } from "@solana-program/system";

import { runWithRequestStore } from "@/shared/request-context";
import type {
  Instruction,
  PolicyCondition,
  PolicyDocument,
  PolicyExpr,
} from "phygital-verifier-sdk";
import {
  ATA_PROGRAM,
  SYSTEM_PROGRAM,
  TOKEN_PROGRAM,
} from "@/verifier/constants";
import {
  PHYGITAL_TOKEN_PROGRAM_ADDRESS,
  PHYGITAL_WALLET_PROGRAM_ADDRESS,
} from "phygital-wallet-sdk";
import { buildDefaultPolicy } from "@/verifier/approval/policy-defaults";
import { evaluatePolicy } from "@/verifier/approval/policy-engine";

const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OWNER_A = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const OWNER_B = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";


function addr(s: string): Address {
  return s as Address;
}

function meta(s: string, role: AccountRole = AccountRole.READONLY) {
  return { address: addr(s), role };
}

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

function andWhen(existing: PolicyExpr | undefined, cond: PolicyCondition): PolicyExpr {
  if (!existing) return cond;
  if ("and" in existing && Array.isArray(existing.and)) {
    return { and: [...existing.and, cond] };
  }
  return { and: [existing, cond] };
}

/** Test helper: bake destination `in` onto transferChecked / create ATA allows. */
function withRecipientAllowlist(
  policy: PolicyDocument,
  recipients: readonly string[],
): PolicyDocument {
  const list = [...recipients];
  return {
    ...policy,
    programs: policy.programs.map((block) => {
      if (!block.allows?.length) return block;
      return {
        ...block,
        allows: block.allows.map((a) => {
          const field =
            a.instruction === "transferChecked" ||
            a.instruction === "create" ||
            a.instruction === "createIdempotent"
              ? a.instruction === "transferChecked"
                ? "destination"
                : "wallet"
              : null;
          if (!field) return a;
          const cond: PolicyCondition = {
            field,
            type: "string",
            op: "in",
            value: list,
          };
          return { ...a, when: andWhen(a.when, cond) };
        }),
      };
    }),
  };
}

function transferChecked(
  amount: bigint,
  destination: string,
  mint = USDC,
): Instruction {
  const data = new Uint8Array(
    getTransferCheckedInstructionDataEncoder().encode({
      amount,
      decimals: 6,
    }),
  );
  return {
    programAddress: addr(TOKEN_PROGRAM),
    accounts: [
      meta("Src111111111111111111111111111111111111111"),
      meta(mint),
      meta(destination),
      meta("Auth11111111111111111111111111111111111111"),
    ],
    data,
  };
}

function transferSol(lamports: bigint, to: string): Instruction {
  const data = new Uint8Array(
    getTransferSolInstructionDataEncoder().encode({ amount: lamports }),
  );
  return {
    programAddress: addr(SYSTEM_PROGRAM),
    accounts: [
      meta("From11111111111111111111111111111111111111"),
      meta(to),
    ],
    data,
  };
}

function createAta(owner: string): Instruction {
  return {
    programAddress: addr(ATA_PROGRAM),
    accounts: [
      meta("Payer1111111111111111111111111111111111111"),
      meta("Ata111111111111111111111111111111111111111"),
      meta(owner),
      meta(USDC),
      meta(SYSTEM_PROGRAM),
      meta(TOKEN_PROGRAM),
    ],
    data: new Uint8Array([1]), // createIdempotent
  };
}

function metadataTransferAccounts(destinationOwner: string) {
  return [
    meta("Token11111111111111111111111111111111111111"),
    meta("TokenOwner11111111111111111111111111111111"),
    meta("DestAta11111111111111111111111111111111111"),
    meta(destinationOwner),
    meta("Mint11111111111111111111111111111111111111"),
    meta("Metadata111111111111111111111111111111111"),
    meta("Edition1111111111111111111111111111111111"), // optional
    meta("OwnerRec111111111111111111111111111111111"), // optional
    meta("DestRec1111111111111111111111111111111111"), // optional
    meta("Auth11111111111111111111111111111111111111"),
    meta("Payer1111111111111111111111111111111111111"),
    meta(SYSTEM_PROGRAM),
    meta("Sysvar1nstructions1111111111111111111111111"),
    meta(TOKEN_PROGRAM),
    meta(ATA_PROGRAM),
  ];
}

describe("evaluatePolicy", () => {
  it("allows default under-cap USDC transfer + ATA create", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
        createAta(OWNER_A),
        transferChecked(10_000_000n, "Dst111111111111111111111111111111111111111"),
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("strips Compute Budget before SDK verify", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr(
            "ComputeBudget111111111111111111111111111111",
          ),
          data: new Uint8Array([2, 0, 0, 0]),
        },
        createAta(OWNER_A),
        transferChecked(10_000_000n, "Dst111111111111111111111111111111111111111"),
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("hard-denies Compute Budget-only transactions", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr(
            "ComputeBudget111111111111111111111111111111",
          ),
          data: new Uint8Array([2, 0, 0, 0]),
        },
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("unexpected_instruction");
      expect(verdict.soft).toBe(false);
    });
  });

  it("soft-denies over-cap USDC with spend_limit", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
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
      const verdict = evaluatePolicy(policy, [
        transferSol(200_000_000n, OWNER_A),
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("spend_limit");
      expect(verdict.soft).toBe(true);
    });
  });

  it("hard-denies top-level phygital-wallet instruction (guaranteed fail)", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr(PHYGITAL_WALLET_PROGRAM_ADDRESS),
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

  it("hard-denies top-level phygital-token instruction (guaranteed fail)", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr(PHYGITAL_TOKEN_PROGRAM_ADDRESS),
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
      const [ownerAAta] = await findAssociatedTokenPda({
        mint: address(USDC),
        owner: address(OWNER_A),
        tokenProgram: address(TOKEN_PROGRAM),
      });
      const [ownerBAta] = await findAssociatedTokenPda({
        mint: address(USDC),
        owner: address(OWNER_B),
        tokenProgram: address(TOKEN_PROGRAM),
      });
      const policy = withRecipientAllowlist(buildDefaultPolicy(), [
        OWNER_A,
        String(ownerAAta),
      ]);
      const tokenAllows = policy.programs.find(
        (p) => p.programId === TOKEN_PROGRAM,
      )?.allows;
      const tc = tokenAllows?.find((a) => a.instruction === "transferChecked");
      expect(JSON.stringify(tc?.when)).toContain('"op":"in"');

      const deny = evaluatePolicy(policy, [
        transferChecked(1_000_000n, String(ownerBAta)),
      ]);
      expect(deny.ok).toBe(false);
      if (deny.ok) return;
      expect(deny.code).toBe("recipient_not_allowed");
      expect(deny.soft).toBe(true);

      const allow = evaluatePolicy(policy, [
        createAta(OWNER_A),
        transferChecked(1_000_000n, String(ownerAAta)),
      ]);
      expect(allow).toEqual({ ok: true });
    });
  });

  it("soft-denies non-USDC SPL TransferChecked (requires approval)", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const otherMint = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
      const verdict = evaluatePolicy(policy, [
        transferChecked(
          1_000_000_000n,
          "Dst111111111111111111111111111111111111111",
          otherMint,
        ),
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("approval_required");
      expect(verdict.soft).toBe(true);
      expect(verdict.details?.mint).toBe(otherMint);
      expect(verdict.details?.destination).toBe(
        "Dst111111111111111111111111111111111111111",
      );
    });
  });

  it("soft-denies unknown Token Metadata instruction (wrong disc)", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
          accounts: [],
          data: new Uint8Array([0xff]),
        },
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("instruction_not_allowed");
      expect(verdict.soft).toBe(true);
      expect(verdict.details?.programId).toBe(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
      );
      expect(verdict.details?.instructionName).toBe("Unknown");
    });
  });

  it("allows Token Metadata Transfer with amount 1", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const data = new Uint8Array(11);
      data[0] = 0x31;
      data[1] = 0;
      new DataView(data.buffer).setBigUint64(2, 1n, true);
      data[10] = 0;
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
          accounts: metadataTransferAccounts("DestOwner111111111111111111111111111111111"),
          data,
        },
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("allows Bubblegum transfer", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const data = new Uint8Array(8 + 32 + 32 + 32 + 8 + 4);
      data.set([163, 52, 200, 231, 140, 3, 69, 186], 0);
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"),
          accounts: [
            meta("TreeCfg11111111111111111111111111111111111"),
            meta("LeafOwn11111111111111111111111111111111111"),
            meta("LeafDel11111111111111111111111111111111111"),
            meta("NewLeafOwner111111111111111111111111111111"),
            meta("Merkle111111111111111111111111111111111111"),
            meta("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
            meta("cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"),
            meta("11111111111111111111111111111111"),
          ],
          data,
        },
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("allows Bubblegum transferV2 when collectibles enabled", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const data = new Uint8Array(8 + 32 + 32 + 32 + 1 + 1 + 8 + 4);
      data.set([180, 155, 21, 130, 73, 72, 72, 197], 0);
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"),
          accounts: [
            meta("TreeCfg11111111111111111111111111111111111"),
            meta("Payer1111111111111111111111111111111111111"),
            meta("Auth11111111111111111111111111111111111111"),
            meta("LeafOwn11111111111111111111111111111111111"),
            meta("LeafDel11111111111111111111111111111111111"),
            meta("NewLeafOwner111111111111111111111111111111"),
            meta("Merkle111111111111111111111111111111111111"),
            meta("CoreColl1111111111111111111111111111111111"),
            meta("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
            meta("cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"),
            meta("11111111111111111111111111111111"),
          ],
          data,
        },
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("allows NFT transferChecked amount 1 when collectibles enabled", async () => {
    await withEnv(async () => {
      const nftMint = "NftMint111111111111111111111111111111111111";
      const on = buildDefaultPolicy();
      expect(
        evaluatePolicy(on, [
          transferChecked(1n, "Dst111111111111111111111111111111111111111", nftMint),
        ]),
      ).toEqual({ ok: true });

      const over = evaluatePolicy(on, [
        transferChecked(2n, "Dst111111111111111111111111111111111111111", nftMint),
      ]);
      expect(over.ok).toBe(false);
    });
  });

  it("keeps NFT transferChecked allow under custom USDC cap", async () => {
    await withEnv(async () => {
      const next = buildDefaultPolicy({ maxMintRaw: "25000000" });
      const token = next.programs.find((p) => p.programId === TOKEN_PROGRAM);
      expect(
        (token?.allows ?? []).some(
          (a) =>
            a.instruction === "transferChecked" &&
            a.when &&
            "field" in a.when &&
            a.when.field === "amount" &&
            a.when.value === "1",
        ),
      ).toBe(true);
      const nftMint = "NftMint111111111111111111111111111111111111";
      expect(
        evaluatePolicy(next, [
          transferChecked(1n, "Dst111111111111111111111111111111111111111", nftMint),
        ]),
      ).toEqual({ ok: true });
    });
  });

  it("allows Core TransferV1", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"),
          accounts: [
            meta("Asset11111111111111111111111111111111111111"),
            meta("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"),
            meta("Payer1111111111111111111111111111111111111"),
            meta("Auth11111111111111111111111111111111111111"),
            meta("CoreNewOwner111111111111111111111111111111"),
            meta("11111111111111111111111111111111"),
            meta("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
          ],
          data: new Uint8Array([0x0e, 0]),
        },
      ]);
      expect(verdict).toEqual({ ok: true });
    });
  });

  it("soft-denies Token Metadata Transfer with amount > 1", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const data = new Uint8Array(11);
      data[0] = 0x31;
      data[1] = 0;
      new DataView(data.buffer).setBigUint64(2, 5n, true);
      data[10] = 0;
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
          accounts: metadataTransferAccounts("DestOwner111111111111111111111111111111111"),
          data,
        },
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("spend_limit");
      expect(verdict.soft).toBe(true);
    });
  });

  it("default policy allowAlls collectible companion programs", async () => {
    await withEnv(async () => {
      const policy = buildDefaultPolicy();
      const noop = policy.programs.find(
        (p) => p.programId === "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
      );
      expect(noop).toEqual({
        programId: "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
        allowAll: true,
      });
    });
  });

  it("soft-denies closeAccount when rent destination is not wallet (SDK policy)", async () => {
    await withEnv(async () => {
      const wallet = OWNER_A;
      const policy = buildDefaultPolicy({ wallet });
      const verdict = evaluatePolicy(policy, [
        {
          programAddress: addr(TOKEN_PROGRAM),
          accounts: [
            meta("11111111111111111111111111111112"),
            meta(OWNER_B), // destination ≠ wallet
            meta(wallet),
          ],
          data: new Uint8Array([9]), // CloseAccount discriminator
        },
      ]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.soft).toBe(true);
      expect(verdict.code).toBe("instruction_not_allowed");
    });
  });

  it("soft-denies recipient allowlist miss", async () => {
    await withEnv(async () => {
      const policy = withRecipientAllowlist(buildDefaultPolicy(), [OWNER_B]);
      const verdict = evaluatePolicy(policy, [createAta(OWNER_A)]);
      expect(verdict.ok).toBe(false);
      if (verdict.ok) return;
      expect(verdict.code).toBe("recipient_not_allowed");
      expect(verdict.soft).toBe(true);
    });
  });
});

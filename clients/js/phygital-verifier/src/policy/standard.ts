/**
 * STANDARD policy preset — safe defaults for USDC/SOL wallets.
 *
 * Prefer `defineStandardPolicy()` for the full document
 * (program allows + per-tx aggregates).
 */
import {
  ataParser,
  bubblegumParser,
  coreParser,
  systemParser,
  token2022Parser,
  tokenMetadataParser,
  tokenParser,
} from "../parsers/index.js";
import { definePolicy, defineProgram } from "../core/policy-builder.js";
import type {
  PolicyDocument,
  ProgramPolicy,
  TransactionConstraints,
} from "../core/types.js";

const DEFAULT_STANDARD_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as const;
const DEFAULT_MAX_MINT_RAW = "50000000" as const;
const DEFAULT_MAX_SOL_LAMPORTS = "100000000" as const;

/**
 * Metaplex / compression companion programs used alongside collectible sends.
 * Included as `{ programId, allowAll: true }` when collectibles are enabled
 * (no STANDARD instruction parsers for these).
 */
export const COLLECTIBLE_COMPANION_PROGRAMS = [
  "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
  "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
  "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
] as const;

/** Convert UI amount to raw token units for policy authoring. */
export function uiAmountToRaw(ui: number, decimals: number): bigint {
  if (!Number.isFinite(ui) || !Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError("uiAmountToRaw: ui must be finite and decimals >= 0");
  }
  // Avoid float drift for common decimals by scaling via string when possible.
  const [whole, frac = ""] = String(ui).split(".");
  const padded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const negative = whole.startsWith("-");
  const absWhole = negative ? whole.slice(1) : whole;
  const raw =
    BigInt(absWhole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");
  return negative ? -raw : raw;
}

export type StandardPolicyOptions = {
  /** Mint for transferChecked eq condition. Default: mainnet USDC. */
  mint?: string;
  /** Raw per-transaction cap for that mint (Token + Token-2022 combined). Default: 50 USDC. */
  maxMintRaw?: string;
  /** Lamports per-transaction cap for System transferSol. Default 0.1 SOL. */
  maxSolLamports?: string;
  /**
   * Wallet address for rent destination checks on closeAccount.
   * Required for closeAccount to be included when `includeTokenCloseAccount` is true.
   */
  wallet?: string;
  /**
   * Token Metadata Transfer, Bubblegum transfer/transferV2, Core TransferV1,
   * SPL transferChecked with amount ≤ 1, plus companion `allowAll` programs.
   * Default **true**.
   */
  includeCollectibles?: boolean;
  includeAta?: boolean;
  includeSystemSetup?: boolean;
  includeTokenCloseAccount?: boolean;
  /**
   * Allow SPL Token `transfer` with amount ≤ 1 (no mint binding).
   * Prefer `includeCollectibles` (uses transferChecked) for wallet NFT sends.
   */
  includeNftTokenTransfer?: boolean;
  /** Which SPL token program blocks to include. Default both. */
  tokenPrograms?: ReadonlyArray<"token" | "token2022">;
};

/**
 * Transaction-level caps for STANDARD policies (amount aggregates).
 * Pair with `standardPolicy` via `definePolicy(programs, transaction)`.
 *
 * Compute Budget instructions are rejected by `createVerifier` itself (wallet
 * injects them at send time) — they are not part of STANDARD policy.
 */
export function standardTransaction(
  opts: StandardPolicyOptions = {},
): TransactionConstraints {
  const mint = opts.mint ?? DEFAULT_STANDARD_MINT;
  const maxMint = opts.maxMintRaw ?? DEFAULT_MAX_MINT_RAW;
  const maxSol = opts.maxSolLamports ?? DEFAULT_MAX_SOL_LAMPORTS;
  const tokenPrograms = opts.tokenPrograms ?? (["token", "token2022"] as const);

  const mintFields = [];
  if (tokenPrograms.includes("token")) {
    mintFields.push({
      programId: tokenParser.programId,
      instruction: "transferChecked",
      field: "amount",
      when: {
        field: "mint",
        type: "string" as const,
        op: "eq" as const,
        value: mint,
      },
    });
  }
  if (tokenPrograms.includes("token2022")) {
    mintFields.push({
      programId: token2022Parser.programId,
      instruction: "transferChecked",
      field: "amount",
      when: {
        field: "mint",
        type: "string" as const,
        op: "eq" as const,
        value: mint,
      },
    });
  }

  const aggregates = [];
  if (mintFields.length > 0) {
    aggregates.push({
      fields: mintFields,
      op: "lte" as const,
      value: maxMint,
    });
  }
  aggregates.push({
    fields: [
      {
        programId: systemParser.programId,
        instruction: "transferSol",
        field: "amount",
      },
    ],
    op: "lte" as const,
    value: maxSol,
  });

  return { aggregates };
}

/**
 * Spread-friendly STANDARD policy program blocks.
 *
 * Instruction names match generated FIELD_SCHEMA exactly.
 * Spend caps are **per transaction** via `standardTransaction` —
 * always compose both (see `defineStandardPolicy`).
 */
export function standardPolicy(
  opts: StandardPolicyOptions = {},
): ProgramPolicy[] {
  const mint = opts.mint ?? DEFAULT_STANDARD_MINT;
  const maxMint = opts.maxMintRaw ?? DEFAULT_MAX_MINT_RAW;
  const maxSol = opts.maxSolLamports ?? DEFAULT_MAX_SOL_LAMPORTS;
  const includeCollectibles = opts.includeCollectibles ?? true;
  const includeAta = opts.includeAta ?? true;
  /** Off by default — createAccount/allocate/assign are powerful. */
  const includeSystemSetup = opts.includeSystemSetup ?? false;
  const includeTokenCloseAccount = opts.includeTokenCloseAccount ?? true;
  const includeNftTokenTransfer = opts.includeNftTokenTransfer ?? false;
  const tokenPrograms = opts.tokenPrograms ?? (["token", "token2022"] as const);
  const wallet = opts.wallet;

  const programs: ProgramPolicy[] = [];

  if (includeAta) {
    programs.push(
      defineProgram(ataParser, {
        allows: [
          { instruction: "create" },
          { instruction: "createIdempotent" },
        ],
      }),
    );
  }

  {
    const allows: ProgramPolicy["allows"] = [
      {
        instruction: "transferSol",
        when: { field: "amount", type: "bigint", op: "lte", value: maxSol },
      },
    ];
    if (includeSystemSetup) {
      allows.push(
        { instruction: "createAccount" },
        { instruction: "allocate" },
        { instruction: "assign" },
      );
    }
    programs.push(defineProgram(systemParser, { allows }));
  }

  const tokenAllows = (): ProgramPolicy["allows"] => {
    // Collectibles transferChecked first so verify's lastPredFail prefers the
    // mint-bound USDC allow (recipient / spend_limit) when both paths fail.
    const allows: ProgramPolicy["allows"] = [];
    if (includeCollectibles) {
      allows.push({
        instruction: "transferChecked",
        when: { field: "amount", type: "bigint", op: "lte", value: "1" },
      });
    }
    allows.push({
      instruction: "transferChecked",
      when: {
        and: [
          { field: "mint", type: "string", op: "eq", value: mint },
          { field: "amount", type: "bigint", op: "lte", value: maxMint },
        ],
      },
    });
    if (includeNftTokenTransfer) {
      allows.push({
        instruction: "transfer",
        when: { field: "amount", type: "bigint", op: "lte", value: "1" },
      });
    }
    if (includeTokenCloseAccount && wallet) {
      allows.push({
        instruction: "closeAccount",
        when: {
          field: "destination",
          type: "string",
          op: "eq",
          value: wallet,
        },
      });
    }
    return allows;
  };

  if (tokenPrograms.includes("token")) {
    programs.push(defineProgram(tokenParser, { allows: tokenAllows() }));
  }
  if (tokenPrograms.includes("token2022")) {
    programs.push(defineProgram(token2022Parser, { allows: tokenAllows() }));
  }

  if (includeCollectibles) {
    programs.push(
      defineProgram(tokenMetadataParser, {
        allows: [
          {
            instruction: "Transfer",
            when: {
              field: "transferArgs.amount",
              type: "bigint",
              op: "lte",
              value: "1",
            },
          },
        ],
      }),
      defineProgram(bubblegumParser, {
        allows: [
          { instruction: "transfer" },
          { instruction: "transferV2" },
        ],
      }),
      defineProgram(coreParser, {
        allows: [{ instruction: "TransferV1" }],
      }),
    );
    for (const programId of COLLECTIBLE_COMPANION_PROGRAMS) {
      programs.push(defineProgram(programId, { allowAll: true }));
    }
  }

  return programs;
}

/**
 * Full STANDARD policy: program allows + per-tx aggregates.
 */
export function defineStandardPolicy(
  opts: StandardPolicyOptions = {},
): PolicyDocument {
  return definePolicy(standardPolicy(opts), standardTransaction(opts));
}

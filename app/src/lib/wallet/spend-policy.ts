import {
  accessorySpendCaption,
  daysToSlots,
  summarizeSessionActions,
  type SessionActionDraft,
} from "@/lib/lazorkit/session-action-drafts";
import { isMainnet } from "@/lib/solana/cluster";
import { formatSol } from "@/lib/wallet/sol";
import {
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "@/lib/wallet/transfer-asset";

/** Circle USDC on Solana mainnet. */
export const USDC_MINT_MAINNET =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

/** Circle USDC on Solana devnet. */
export const USDC_MINT_DEVNET =
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/** Jupiter aggregator v6. */
export const JUPITER_V6_PROGRAM_ADDRESS =
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";

/** Compute Budget program. */
export const COMPUTE_BUDGET_PROGRAM_ADDRESS =
  "ComputeBudget111111111111111111111111111111";

export const DEFAULT_SPEND_DAYS = 30;
export const DEFAULT_SOL_PER_TAP_LAMPORTS = 500_000_000n;
export const DEFAULT_SOL_PER_DAY_LAMPORTS = 2_000_000_000n;
export const DEFAULT_USDC_PER_DAY = 1_000;
/** Contactless-style cap so one tap cannot spend the whole daily budget. */
export const DEFAULT_USDC_PER_TAP = 100;
export const USDC_DECIMALS = 6;

export function usdcMint(): string {
  return isMainnet() ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
}

export function isUsdcMint(mint: string): boolean {
  return mint === USDC_MINT_MAINNET || mint === USDC_MINT_DEVNET;
}

export function defaultUsdcAtomsPerDay(): bigint {
  return BigInt(DEFAULT_USDC_PER_DAY) * 10n ** BigInt(USDC_DECIMALS);
}

export function defaultUsdcAtomsPerTap(): bigint {
  return BigInt(DEFAULT_USDC_PER_TAP) * 10n ** BigInt(USDC_DECIMALS);
}

function defaultWindowSlots(): string {
  return daysToSlots(1).toString();
}

/** Recommended tap-to-pay policy: 2 SOL/day, 1,000 USDC/day, Token + ATA + Jupiter. */
export function defaultSpendActions(): SessionActionDraft[] {
  const mint = usdcMint();
  const windowSlots = defaultWindowSlots();
  return [
    {
      type: "solMaxPerTx",
      max: DEFAULT_SOL_PER_TAP_LAMPORTS.toString(),
    },
    {
      type: "solRecurringLimit",
      limit: DEFAULT_SOL_PER_DAY_LAMPORTS.toString(),
      windowSlots,
    },
    {
      type: "tokenMaxPerTx",
      mint,
      max: defaultUsdcAtomsPerTap().toString(),
      decimals: USDC_DECIMALS,
    },
    {
      type: "tokenRecurringLimit",
      mint,
      limit: defaultUsdcAtomsPerDay().toString(),
      windowSlots,
      decimals: USDC_DECIMALS,
    },
    {
      type: "programWhitelist",
      programId: String(TOKEN_PROGRAM_ADDRESS),
    },
    {
      type: "programWhitelist",
      programId: String(ASSOCIATED_TOKEN_PROGRAM_ADDRESS),
    },
    {
      type: "programWhitelist",
      programId: JUPITER_V6_PROGRAM_ADDRESS,
    },
    {
      type: "programWhitelist",
      programId: COMPUTE_BUDGET_PROGRAM_ADDRESS,
    },
  ];
}

export function isDefaultSpendPolicy(
  drafts: readonly SessionActionDraft[] | null | undefined,
): boolean {
  if (!drafts?.length) return false;
  return normalize(drafts) === normalize(defaultSpendActions());
}

function normalize(drafts: readonly SessionActionDraft[]): string {
  return [...drafts]
    .map((draft) => {
      if (draft.type === "solRecurringLimit") {
        return [draft.type, draft.limit, draft.windowSlots].join(":");
      }
      if (draft.type === "solMaxPerTx") {
        return [draft.type, draft.max].join(":");
      }
      if (draft.type === "tokenRecurringLimit") {
        return [draft.type, draft.mint, draft.limit, draft.windowSlots].join(
          ":",
        );
      }
      if (draft.type === "tokenMaxPerTx") {
        return [draft.type, draft.mint, draft.max].join(":");
      }
      if (
        draft.type === "programWhitelist" ||
        draft.type === "programBlacklist"
      ) {
        return `${draft.type}:${draft.programId}`;
      }
      return JSON.stringify(draft);
    })
    .sort()
    .join("|");
}

/** Home-row line: keep the default policy to one everyday phrase. */
export function spendRowCaption(
  drafts: readonly SessionActionDraft[] | null | undefined,
): string {
  if (isDefaultSpendPolicy(drafts)) {
    return `${formatSol(DEFAULT_SOL_PER_DAY_LAMPORTS)} SOL and ${DEFAULT_USDC_PER_DAY} USDC a day`;
  }
  return accessorySpendCaption(drafts);
}

/** Detail list: collapse the recommended policy into a few human lines. */
export function summarizeSpendPolicy(
  drafts: readonly SessionActionDraft[] | null | undefined,
): string[] {
  if (isDefaultSpendPolicy(drafts)) {
    return [
      `${formatSol(DEFAULT_SOL_PER_DAY_LAMPORTS)} SOL a day`,
      `${formatSol(DEFAULT_SOL_PER_TAP_LAMPORTS)} SOL per tap`,
      `${DEFAULT_USDC_PER_DAY} USDC a day`,
      `${DEFAULT_USDC_PER_TAP} USDC per tap`,
      "SOL, USDC, and Jupiter",
    ];
  }
  return summarizeSessionActions(drafts);
}

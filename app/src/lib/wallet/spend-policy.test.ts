import { describe, expect, it } from "vitest";

import { daysToSlots } from "@/lib/lazorkit/session-action-drafts";
import {
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "@/lib/wallet/transfer-asset";
import {
  COMPUTE_BUDGET_PROGRAM_ADDRESS,
  DEFAULT_SOL_PER_DAY_LAMPORTS,
  DEFAULT_SOL_PER_TAP_LAMPORTS,
  DEFAULT_USDC_PER_DAY,
  DEFAULT_USDC_PER_TAP,
  JUPITER_V6_PROGRAM_ADDRESS,
  defaultSpendActions,
  defaultUsdcAtomsPerDay,
  defaultUsdcAtomsPerTap,
  isDefaultSpendPolicy,
  spendRowCaption,
  summarizeSpendPolicy,
  usdcMint,
} from "./spend-policy";

describe("default spend policy", () => {
  it("caps SOL and USDC per day and per tap, and allows Token, ATA, Jupiter, and compute budget", () => {
    const actions = defaultSpendActions();
    const windowSlots = daysToSlots(1).toString();

    expect(actions.find((a) => a.type === "solMaxPerTx")).toMatchObject({
      type: "solMaxPerTx",
      max: DEFAULT_SOL_PER_TAP_LAMPORTS.toString(),
    });
    expect(actions.find((a) => a.type === "solRecurringLimit")).toMatchObject({
      type: "solRecurringLimit",
      limit: DEFAULT_SOL_PER_DAY_LAMPORTS.toString(),
      windowSlots,
    });

    const recurring = actions.find((a) => a.type === "tokenRecurringLimit");
    expect(recurring).toMatchObject({
      type: "tokenRecurringLimit",
      mint: usdcMint(),
      limit: defaultUsdcAtomsPerDay().toString(),
      windowSlots,
      decimals: 6,
    });
    const maxPerTap = actions.find((a) => a.type === "tokenMaxPerTx");
    expect(maxPerTap).toMatchObject({
      type: "tokenMaxPerTx",
      mint: usdcMint(),
      max: defaultUsdcAtomsPerTap().toString(),
      decimals: 6,
    });
    const allow = actions.filter((a) => a.type === "programWhitelist");
    expect(allow.map((a) => a.programId)).toEqual([
      String(TOKEN_PROGRAM_ADDRESS),
      String(ASSOCIATED_TOKEN_PROGRAM_ADDRESS),
      JUPITER_V6_PROGRAM_ADDRESS,
      COMPUTE_BUDGET_PROGRAM_ADDRESS,
    ]);
  });

  it("captions the default as daily SOL and USDC limits", () => {
    const actions = defaultSpendActions();
    expect(isDefaultSpendPolicy(actions)).toBe(true);
    expect(spendRowCaption(actions)).toBe(
      `2 SOL and ${DEFAULT_USDC_PER_DAY} USDC a day`,
    );
    expect(summarizeSpendPolicy(actions)).toEqual([
      "2 SOL a day",
      "0.5 SOL per tap",
      `${DEFAULT_USDC_PER_DAY} USDC a day`,
      `${DEFAULT_USDC_PER_TAP} USDC per tap`,
      "SOL, USDC, and Jupiter",
    ]);
  });

  it("does not treat a custom mint as the default", () => {
    const actions = defaultSpendActions().map((draft) =>
      draft.type === "tokenRecurringLimit"
        ? { ...draft, mint: "So11111111111111111111111111111111111111112" }
        : draft,
    );
    expect(isDefaultSpendPolicy(actions)).toBe(false);
  });
});

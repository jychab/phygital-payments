import { describe, expect, it } from "vitest";

import { daysToSlots } from "@/lib/lazorkit/session-action-drafts";
import { TOKEN_PROGRAM_ADDRESS } from "@/lib/wallet/transfer-asset";
import {
  DEFAULT_USDC_PER_DAY,
  DEFAULT_USDC_PER_TAP,
  defaultSpendActions,
  defaultUsdcAtomsPerDay,
  defaultUsdcAtomsPerTap,
  isDefaultSpendPolicy,
  spendRowCaption,
  summarizeSpendPolicy,
  usdcMint,
} from "./spend-policy";

describe("default spend policy", () => {
  it("caps USDC at 200 per day, 50 per tap, and SPL token programs only", () => {
    const actions = defaultSpendActions();
    const recurring = actions.find((a) => a.type === "tokenRecurringLimit");
    expect(recurring).toMatchObject({
      type: "tokenRecurringLimit",
      mint: usdcMint(),
      limit: defaultUsdcAtomsPerDay().toString(),
      windowSlots: daysToSlots(1).toString(),
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
    expect(allow).toHaveLength(2);
    expect(allow.map((a) => a.programId)).toContain(
      String(TOKEN_PROGRAM_ADDRESS),
    );
  });

  it("captions the default as a daily USDC limit", () => {
    const actions = defaultSpendActions();
    expect(isDefaultSpendPolicy(actions)).toBe(true);
    expect(spendRowCaption(actions)).toBe(`${DEFAULT_USDC_PER_DAY} USDC a day`);
    expect(summarizeSpendPolicy(actions)).toEqual([
      `${DEFAULT_USDC_PER_DAY} USDC a day`,
      `${DEFAULT_USDC_PER_TAP} USDC per tap`,
      "USDC transfers only",
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

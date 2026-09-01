import { describe, expect, it } from "vitest";
import { address } from "@solana/kit";

import { buildAccessoryHoldingRows } from "@/lib/pay/accessory-pay-state";
import type { OwnerPayDelegates } from "@/lib/tokens/mint-delegate";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";

const TOKEN = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const MINT_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const MINT_SOL = "So11111111111111111111111111111111111111112";

function holding(
  overrides: Partial<PaymentTokenHolding> & Pick<PaymentTokenHolding, "mint" | "symbol">,
): PaymentTokenHolding {
  return {
    name: overrides.symbol,
    icon: null,
    decimals: 6,
    tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    balanceRaw: "0",
    balanceUi: "0",
    ...overrides,
  };
}

function delegatesForMint(args: {
  mint: string;
  balanceRaw: bigint;
  delegatedAmountRaw: bigint;
  balanceUi: string;
  delegatedAmountUi: string;
}): OwnerPayDelegates {
  const status = {
    programAuthority: address("11111111111111111111111111111111"),
    ata: address("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    ataExists: true,
    isProgramAuthorityDelegate: true,
    delegatedAmountRaw: args.delegatedAmountRaw,
    delegatedAmountUi: args.delegatedAmountUi,
    balanceRaw: args.balanceRaw,
    balanceUi: args.balanceUi,
  };
  return {
    tokens: [],
    tokenEnabled: true,
    byMint: new Map([
      [
        args.mint,
        {
          token: address(TOKEN),
          status,
        },
      ],
    ]),
    statusByTokenMint: new Map([[`${TOKEN}|${args.mint}`, status]]),
  };
}

describe("buildAccessoryHoldingRows spendable subtitles", () => {
  it("shows available when wallet balance is limiting", () => {
    const rows = buildAccessoryHoldingRows(
      [
        holding({
          mint: MINT_USDC,
          symbol: "USDC",
          decimals: 6,
          balanceUi: "10",
        }),
      ],
      delegatesForMint({
        mint: MINT_USDC,
        balanceRaw: 10_000_000n,
        delegatedAmountRaw: 50_000_000n,
        balanceUi: "10",
        delegatedAmountUi: "50",
      }),
      TOKEN,
    );

    expect(rows[0]?.subtitle).toBe("10 USDC available");
  });

  it("shows available when allowance is limiting", () => {
    const rows = buildAccessoryHoldingRows(
      [
        holding({
          mint: MINT_SOL,
          symbol: "SOL",
          decimals: 9,
          balanceUi: "2",
        }),
      ],
      delegatesForMint({
        mint: MINT_SOL,
        balanceRaw: 2_000_000_000n,
        delegatedAmountRaw: 500_000_000n,
        balanceUi: "2",
        delegatedAmountUi: "0.5",
      }),
      TOKEN,
    );

    expect(rows[0]?.subtitle).toBe("0.5 SOL available");
  });

  it("shows balance and symbol for disabled rows", () => {
    const rows = buildAccessoryHoldingRows(
      [
        holding({
          mint: MINT_SOL,
          symbol: "SOL",
          balanceUi: "0.25",
        }),
      ],
      undefined,
      TOKEN,
    );

    expect(rows[0]?.enabled).toBe(false);
    expect(rows[0]?.subtitle).toBe("0.25 SOL");
  });
});

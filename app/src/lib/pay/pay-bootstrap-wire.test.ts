import { describe, expect, it } from "vitest";
import { address } from "@solana/kit";
import { PhygitalTokenType } from "phygital-token-sdk";

import { parsePayBootstrap, serializePayBootstrap } from "./pay-bootstrap-wire";

const OWNER = "11111111111111111111111111111111";
const TOKEN = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const ATA = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";

describe("serializePayBootstrap / parsePayBootstrap", () => {
  it("round-trips holdings, tokens, and bigint delegate amounts", () => {
    const token = {
      tokenType: PhygitalTokenType.Controlled,
      identifier: "id",
      secp256r1PublicKey: "pk",
      address: address(TOKEN),
      isLocked: false,
      currentOwner: address(OWNER),
      lastSignCount: 3,
      mint: address(MINT),
    };
    const status = {
      programAuthority: address(TOKEN),
      ata: address(ATA),
      ataExists: true,
      isProgramAuthorityDelegate: true,
      delegatedAmountRaw: 1_000_000n,
      delegatedAmountUi: "1",
      balanceRaw: 5n,
      balanceUi: "0.000005",
    };
    const restored = parsePayBootstrap(
      serializePayBootstrap({
        holdings: [
          {
            mint: MINT,
            symbol: "USDC",
            name: "USD Coin",
            icon: null,
            decimals: 6,
            tokenProgram: TOKEN,
            balanceRaw: "5",
            balanceUi: "0.000005",
          },
        ],
        delegates: {
          tokens: [token],
          tokenEnabled: true,
          byMint: new Map([
            [MINT, { token: address(TOKEN), status }],
          ]),
          statusByTokenMint: new Map([[`${TOKEN}|${MINT}`, status]]),
        },
      }),
    );

    expect(restored.holdings).toHaveLength(1);
    expect(restored.delegates.tokenEnabled).toBe(true);
    expect(restored.delegates.tokens[0]?.address).toBe(TOKEN);
    const match = restored.delegates.byMint.get(MINT);
    expect(match?.token).toBe(TOKEN);
    expect(match?.status?.delegatedAmountRaw).toBe(1_000_000n);
    expect(match?.status?.balanceRaw).toBe(5n);
    expect(match?.status?.ataExists).toBe(true);
    expect(restored.delegates.statusByTokenMint.get(`${TOKEN}|${MINT}`)).toEqual(
      status,
    );
  });

  it("defaults ataExists from legacy wire without the field", () => {
    const wire = serializePayBootstrap({
      holdings: [],
      delegates: {
        tokens: [],
        tokenEnabled: false,
        byMint: new Map([
          [
            MINT,
            {
              token: null,
              status: {
                programAuthority: TOKEN,
                ata: ATA,
                isProgramAuthorityDelegate: false,
                delegatedAmountRaw: "0",
                delegatedAmountUi: "0",
                balanceRaw: "0",
                balanceUi: "0",
              },
            },
          ],
        ]),
        statusByTokenMint: new Map(),
      },
    });
    delete (wire.byMint[0]![1].status as { ataExists?: boolean }).ataExists;

    const restored = parsePayBootstrap(wire);
    expect(restored.delegates.byMint.get(MINT)?.status?.ataExists).toBe(false);
  });

  it("defaults ataExists to true for legacy wire with balance", () => {
    const wire = serializePayBootstrap({
      holdings: [],
      delegates: {
        tokens: [],
        tokenEnabled: true,
        byMint: new Map([
          [
            MINT,
            {
              token: address(TOKEN),
              status: {
                programAuthority: TOKEN,
                ata: ATA,
                ataExists: true,
                isProgramAuthorityDelegate: true,
                delegatedAmountRaw: "1000000",
                delegatedAmountUi: "1",
                balanceRaw: "5",
                balanceUi: "0.000005",
              },
            },
          ],
        ]),
        statusByTokenMint: new Map(),
      },
    });
    delete (wire.byMint[0]![1].status as { ataExists?: boolean }).ataExists;

    const restored = parsePayBootstrap(wire);
    expect(restored.delegates.byMint.get(MINT)?.status?.ataExists).toBe(true);
  });
});

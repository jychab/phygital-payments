import { address } from "@solana/kit";
import { Actions, serializeActions, deserializeActions, SessionActionType } from "lazor-kit";
import { describe, expect, it } from "vitest";

import {
  accessorySpendCaption,
  daysToSlots,
  encodeSessionActionDrafts,
  summarizeSessionActions,
  toSessionActions,
} from "@/lib/lazorkit/session-action-drafts";

describe("serializeActions", () => {
  it("encodes solLimit with header + remaining", () => {
    const bytes = serializeActions([Actions.solLimit(1_000_000_000n)]);
    expect(bytes[0]).toBe(SessionActionType.SolLimit);
    expect(bytes[1]).toBe(8);
    expect(bytes[2]).toBe(0);
    // expires_at = 0
    expect([...bytes.slice(3, 11)]).toEqual(Array(8).fill(0));
    const remaining = new DataView(
      bytes.buffer,
      bytes.byteOffset + 11,
      8,
    ).getBigUint64(0, true);
    expect(remaining).toBe(1_000_000_000n);
  });

  it("encodes program whitelist as 32-byte address", () => {
    const program = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const bytes = serializeActions([Actions.programWhitelist(program)]);
    expect(bytes[0]).toBe(SessionActionType.ProgramWhitelist);
    expect(bytes.length).toBe(11 + 32);
  });

  it("rejects more than 16 actions", () => {
    const many = Array.from({ length: 17 }, () => Actions.solMaxPerTx(1n));
    expect(() => serializeActions(many)).toThrow(/16/);
  });

  it("round-trips through deserializeActions", () => {
    const program = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const decoded = deserializeActions(
      serializeActions([
        Actions.solMaxPerTx(500_000_000n),
        Actions.solRecurringLimit({
          limit: 2_000_000_000n,
          window: 216_000n,
        }),
        Actions.programWhitelist(program),
      ]),
    );
    expect(decoded[0]).toMatchObject({
      type: SessionActionType.SolMaxPerTx,
      max: 500_000_000n,
    });
    expect(decoded[1]).toMatchObject({
      type: SessionActionType.SolRecurringLimit,
      limit: 2_000_000_000n,
      window: 216_000n,
    });
    expect(decoded[2]).toMatchObject({
      type: SessionActionType.ProgramWhitelist,
      programId: program,
    });
  });
});

describe("session action drafts", () => {
  it("round-trips sol recurring + whitelist drafts", () => {
    const actions = toSessionActions([
      {
        type: "solRecurringLimit",
        limit: "1000000000",
        windowSlots: daysToSlots(1).toString(),
      },
      {
        type: "programWhitelist",
        programId: "11111111111111111111111111111111",
      },
    ]);
    expect(actions).toHaveLength(2);
    const bytes = encodeSessionActionDrafts([
      {
        type: "solRecurringLimit",
        limit: "1000000000",
        windowSlots: daysToSlots(1).toString(),
      },
      {
        type: "programWhitelist",
        programId: "11111111111111111111111111111111",
      },
    ]);
    expect(bytes.length).toBeGreaterThan(0);
  });

  it("summarizes a token mint that is not in holdings", () => {
    const mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    expect(
      summarizeSessionActions([
        {
          type: "tokenLimit",
          mint,
          remaining: "1000000",
          decimals: 6,
        },
      ]),
    ).toEqual(["1 EPjF…Dt1v lifetime"]);
  });

  it("captions an empty policy as tap to pay", () => {
    expect(accessorySpendCaption([])).toBe("Tap to pay on");
    expect(accessorySpendCaption(undefined)).toBe("Tap to pay on");
  });
});

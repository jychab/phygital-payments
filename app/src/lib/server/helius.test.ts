import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { parseTransferEvents } from "./helius";

/** On-chain TransferEvent from sig 4BZjKBd…N57CpB (1 USDC). */
const TRANSFER_LOG =
  "Program data: ZAoucQgcs3107EgTuMp+jB98MMHwJkFD/WHh4fNE1ToWiHG733I5D+AorVHITUdiMpVzN6HUGskAExxxlGTG1emwqy9fzH0lAmHsQUBLJ4gga1bezMLp91uKXleBM6QcI+MK4fpfxgC5xvp6877brTo9ZfNqq8l0MbG75MLS9uDkfKYCA0UvXWFAQg8AAAAAAAJUhWoAAAAA";

/** phygital-token VerifyAsset event in the same tx — must be ignored. */
const VERIFY_LOG =
  "Program data: pn1LlfpZS36W5qA2FUWZOOqAw0/d6kIryj+PyBQXjRPIqaLdJZrMXuAorVHITUdiMpVzN6HUGskAExxxlGTG1emwqy9fzH0lAmHsQUBLJ4gga1bezMLp91uKXleBM6QcI+MK4fpfxgC5Am8A9keCvU/PmOpoDy/8afUe9vIGeVlJAY5v50WLGpGuAlSFagAAAAA=";

const SIG =
  "4BZjKBdVbYLVBSZVPoWizbUnZ1MpviA8jBQbpVpEdaFVSUJQwGTjC4A8y49yFnLhuh6KZAuQVTL1M1NEc9N57CpB";

const logs = [
  "Program EMxvE5xxqXTWwTt391NsULydeT2QyG2UdN45VHpFxeVH invoke [1]",
  "Program log: Instruction: Transfer",
  VERIFY_LOG,
  TRANSFER_LOG,
  "Program EMxvE5xxqXTWwTt391NsULydeT2QyG2UdN45VHpFxeVH success",
];

const expected = {
  signature: SIG,
  transferIndex: 0,
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  amount: "1000000",
  senderOwner: "G62JMk2vhw4FmQa6v2DhHxwMaUz3ZyaxUxCKxWhggCZJ",
  recipientOwner: "8sRGApwANaQ7cW7REMxuhcnfb5Kw2NrjHmLRGcu91dMx",
  senderTokenAccount: null,
  recipientTokenAccount: null,
};

describe("parseTransferEvents", () => {
  it("decodes TransferEvent from the documented Helius raw webhook shape", () => {
    const body = [
      {
        slot: 440217737,
        blockTime: 1787122690,
        indexWithinBlock: 1025,
        meta: { err: null, logMessages: logs },
        transaction: { signatures: [SIG], message: {} },
      },
    ];
    expect(parseTransferEvents(body)).toEqual([
      { ...expected, slot: 440217737, blockTime: 1787122690 },
    ]);
  });

  it("reads logs nested under transaction.meta (geyser / LaserStream)", () => {
    const body = [
      {
        slot: "440217737",
        transaction: {
          signature: SIG,
          transaction: { signatures: [SIG], message: {} },
          meta: { err: null, logMessages: logs },
        },
      },
    ];
    expect(parseTransferEvents(body)).toEqual([
      { ...expected, slot: 440217737, blockTime: 1787122690 },
    ]);
  });

  it("reads a [transaction, meta] tuple", () => {
    const body = [
      {
        slot: 440217737,
        blockTime: 1787122690,
        transaction: [
          { signatures: [SIG], message: {} },
          { err: null, logMessages: logs },
        ],
      },
    ];
    expect(parseTransferEvents(body)).toEqual([
      { ...expected, slot: 440217737, blockTime: 1787122690 },
    ]);
  });

  it("unwraps a JSON-RPC transactionNotification", () => {
    const body = {
      jsonrpc: "2.0",
      method: "transactionNotification",
      params: {
        result: {
          signature: SIG,
          slot: 440217737,
          transaction: {
            transaction: { signatures: [SIG], message: {} },
            meta: { err: null, logMessages: logs },
          },
        },
      },
    };
    expect(parseTransferEvents(body)).toHaveLength(1);
    expect(parseTransferEvents(body)[0]).toMatchObject(expected);
  });

  it("skips failed transactions", () => {
    const body = [
      {
        signature: SIG,
        meta: { err: { InstructionError: [0, "Custom"] }, logMessages: logs },
        transaction: { signatures: [SIG] },
      },
    ];
    expect(parseTransferEvents(body)).toEqual([]);
  });

  it("returns nothing for enhanced payloads that have no program logs", () => {
    const body = [
      {
        signature: SIG,
        type: "TRANSFER",
        tokenTransfers: [
          {
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            tokenAmount: 1,
            fromUserAccount: expected.senderOwner,
            toUserAccount: expected.recipientOwner,
          },
        ],
      },
    ];
    expect(parseTransferEvents(body)).toEqual([]);
  });
});

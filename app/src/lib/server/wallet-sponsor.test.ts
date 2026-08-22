import { address } from "@solana/kit";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { SYSTEM_PROGRAM_ADDRESS } from "@/lib/lazorkit/constants";
import { validateSponsoredInstructions } from "./wallet-sponsor";

const feePayer = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");

describe("validateSponsoredInstructions", () => {
  it("accepts System Program with the fee payer as signer", () => {
    const ixs = validateSponsoredInstructions(
      [
        {
          programAddress: String(SYSTEM_PROGRAM_ADDRESS),
          accounts: [
            { address: String(feePayer), writable: true, signer: true },
            {
              address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              writable: true,
              signer: false,
            },
          ],
          data: "AA==",
        },
      ],
      feePayer,
    );
    expect(ixs).toHaveLength(1);
  });

  it("rejects an unknown program", () => {
    expect(() =>
      validateSponsoredInstructions(
        [
          {
            programAddress: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
            accounts: [],
            data: "AA==",
          },
        ],
        feePayer,
      ),
    ).toThrow(/not allowed/);
  });

  it("rejects a non-fee-payer signer", () => {
    expect(() =>
      validateSponsoredInstructions(
        [
          {
            programAddress: String(SYSTEM_PROGRAM_ADDRESS),
            accounts: [
              {
                address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                writable: true,
                signer: true,
              },
            ],
            data: "AA==",
          },
        ],
        feePayer,
      ),
    ).toThrow(/fee payer/);
  });
});

import { address } from "@solana/kit";
import { describe, expect, it } from "vitest";

import { EXECUTE_DISCRIMINATOR } from "lazor-kit";

import { LAZORKIT_PROGRAM_MAINNET, SYSTEM_PROGRAM_ADDRESS } from "@/lib/lazorkit/constants";
import { bytesToBase64 } from "@/shared/base64";
import {
  assertSponsoredInstructionsForSession,
  isCreateWalletOnlyBatch,
  validateSponsoredInstructions,
} from "./wallet-sponsor";

const feePayer = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");
const vault = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const wallet = "So11111111111111111111111111111111111111112";
const authority = "2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU";

describe("validateSponsoredInstructions", () => {
  it("rejects a System transfer from the fee payer", () => {
    const data = new Uint8Array(12);
    data[0] = 2;
    expect(() =>
      validateSponsoredInstructions(
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
            data: bytesToBase64(data),
          },
        ],
        feePayer,
      ),
    ).toThrow(/Direct SOL transfers aren't allowed/);
  });

  it("rejects a top-level System transfer from any account", () => {
    const data = new Uint8Array(12);
    data[0] = 2;
    expect(() =>
      validateSponsoredInstructions(
        [
          {
            programAddress: String(SYSTEM_PROGRAM_ADDRESS),
            accounts: [
              {
                address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                writable: true,
                signer: false,
              },
              {
                address: "So11111111111111111111111111111111111111112",
                writable: true,
                signer: false,
              },
            ],
            data: bytesToBase64(data),
          },
        ],
        feePayer,
      ),
    ).toThrow(/Direct SOL transfers aren't allowed/);
  });

  it("accepts System CreateAccount with the fee payer as signer", () => {
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

describe("session-bound sponsorship", () => {
  const createWalletWire = {
    programAddress: String(LAZORKIT_PROGRAM_MAINNET),
    accounts: [
      { address: String(feePayer), writable: true, signer: true },
      { address: wallet, writable: true, signer: false },
      { address: vault, writable: true, signer: false },
      { address: authority, writable: true, signer: false },
    ],
    data: bytesToBase64(Uint8Array.of(0)),
  };

  it("detects createWallet-only batches", () => {
    expect(
      isCreateWalletOnlyBatch(
        validateSponsoredInstructions([createWalletWire], feePayer),
      ),
    ).toBe(true);
    expect(
      isCreateWalletOnlyBatch(
        validateSponsoredInstructions(
          [
            createWalletWire,
            {
              programAddress: String(LAZORKIT_PROGRAM_MAINNET),
              accounts: [{ address: vault, writable: false, signer: false }],
              data: bytesToBase64(Uint8Array.of(EXECUTE_DISCRIMINATOR)),
            },
          ],
          feePayer,
        ),
      ),
    ).toBe(false);
  });

  it("requires session PDAs on LazorKit instructions", () => {
    expect(() =>
      assertSponsoredInstructionsForSession([createWalletWire], {
        vaultPda: address(vault),
        walletPda: address(wallet),
        authorityPda: address(authority),
      }),
    ).not.toThrow();
    expect(() =>
      assertSponsoredInstructionsForSession([createWalletWire], {
        vaultPda: address("11111111111111111111111111111111"),
        walletPda: address(wallet),
        authorityPda: address(authority),
      }),
    ).toThrow(/don't match your wallet/);
  });
});

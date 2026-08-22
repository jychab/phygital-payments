import { address, createNoopSigner } from "@solana/kit";
import {
  getTransferOwnershipInstruction,
  parseTransferOwnershipInstruction,
} from "phygital-token-sdk";
import { describe, expect, it } from "vitest";

import { CLAIM_VERIFY_RELATIVE_INDEX, transferOwnershipForVault } from "./claim";

const vault = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");
const token = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

describe("claim transfer_ownership relative index", () => {
  it("encodes -2 so NFC verify sits two ixs before Execute", () => {
    const ix = transferOwnershipForVault({
      token,
      slotNumber: 1n,
      vaultPda: vault,
      secp256r1VerifyArgs: {
        verifyArgsRelativeIndex: CLAIM_VERIFY_RELATIVE_INDEX,
        signedMessageIndex: 0,
        clientDataJson: new Uint8Array([1, 2, 3]),
      },
    });
    const parsed = parseTransferOwnershipInstruction(ix);
    expect(parsed.data.secp256r1VerifyArgs.verifyArgsRelativeIndex).toBe(-2n);
    expect(ix.accounts?.[0]?.address).toBe(vault);
  });

  it("SDK default remains -1 (used only when NFC immediately precedes the ix)", () => {
    const ix = getTransferOwnershipInstruction({
      recipient: createNoopSigner(vault),
      token,
      slotNumber: 1n,
      secp256r1VerifyArgs: {
        verifyArgsRelativeIndex: -1,
        signedMessageIndex: 0,
        clientDataJson: new Uint8Array([1]),
      },
    });
    expect(
      parseTransferOwnershipInstruction(ix).data.secp256r1VerifyArgs
        .verifyArgsRelativeIndex,
    ).toBe(-1n);
  });
});

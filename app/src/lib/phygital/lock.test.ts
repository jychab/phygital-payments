import { address } from "@solana/kit";
import { parseSetLockStateInstruction } from "phygital-token-sdk";
import { describe, expect, it } from "vitest";

import { lockAccessoryForVault } from "./lock";

const vault = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");
const token = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

describe("lockAccessoryForVault", () => {
  it("sets isLocked with the vault as owner signer", () => {
    const ix = lockAccessoryForVault({ token, vaultPda: vault });
    const parsed = parseSetLockStateInstruction(ix);
    expect(parsed.data.isLocked).toBe(true);
    expect(parsed.accounts.owner.address).toBe(vault);
    expect(parsed.accounts.token.address).toBe(token);
  });
});

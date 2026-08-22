import { AccountRole, address, type Instruction } from "@solana/kit";
import {
  AUTH_TYPE_SECP256R1,
  CREATE_WALLET_DISCRIMINATOR,
  EXECUTE_DISCRIMINATOR,
  SECP_MESSAGE_OFFSET,
  SECP_PUBKEY_OFFSET,
  SECP_SIG_OFFSET,
  assembleExecuteInstructions,
  buildCreateWalletInstruction,
  buildLazorKitSecp256r1Instruction,
  encodeAuthPrefix,
  executeChallengeHash,
  hashPackedAccounts,
  packExecute,
  parseCompactInstructions,
  parseCreateWalletInstruction,
  parseExecuteInstruction,
  prepareExecute,
  serializeCompactInstructions,
  sha256,
  userSeedFromPubkey,
} from "lazor-kit";
import { describe, expect, it } from "vitest";

import { USER_SEED_DOMAIN } from "./constants";

const payer = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");
const wallet = address("LazorjRFNavitUaBu5m3WaNPjU1maipvSW2rZfAFAKi");
const authority = address("FLb7fyAtkfA4TSa2uYcAT8QKHd2pkoMHgmqfnXFXo7ao");
const vault = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const tokenProgram = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const token = address("So11111111111111111111111111111111111111112");
const program = address("LazorjRFNavitUaBu5m3WaNPjU1maipvSW2rZfAFAKi");

describe("userSeedFromPubkey", () => {
  it("is sha256(domain || compressed pubkey)", async () => {
    const pubkey = new Uint8Array(33);
    pubkey[0] = 2;
    pubkey.fill(7, 1);
    const seed = await userSeedFromPubkey(pubkey, USER_SEED_DOMAIN);
    const domain = new TextEncoder().encode(USER_SEED_DOMAIN);
    const preimage = new Uint8Array(domain.length + pubkey.length);
    preimage.set(domain);
    preimage.set(pubkey, domain.length);
    expect([...seed]).toEqual([...(await sha256(preimage))]);
    expect(seed.length).toBe(32);
  });
});

describe("buildCreateWalletInstruction", () => {
  it("encodes create_wallet through the generated client", () => {
    const userSeed = new Uint8Array(32).fill(1);
    const cred = new Uint8Array(32).fill(2);
    const pubkey = new Uint8Array(33).fill(3);
    pubkey[0] = 2;
    const ix = buildCreateWalletInstruction({
      payer,
      pdas: {
        walletPda: wallet,
        vaultPda: vault,
        authorityPda: authority,
        walletBump: 255,
        vaultBump: 254,
        authorityBump: 253,
      },
      userSeed,
      credentialIdHash: cred,
      compressedPubkey: pubkey,
      programAddress: program,
    });
    const parsed = parseCreateWalletInstruction(ix);
    expect([...parsed.data.discriminator]).toEqual([
      ...CREATE_WALLET_DISCRIMINATOR,
    ]);
    expect(parsed.data.authType).toBe(AUTH_TYPE_SECP256R1);
    expect([...parsed.data.userSeed]).toEqual([...userSeed]);
    expect([...parsed.data.credentialHash]).toEqual([...cred]);
    expect([...parsed.data.authPubkey]).toEqual([...pubkey]);
    expect(parsed.accounts.payer.address).toBe(payer);
    expect(parsed.accounts.wallet.address).toBe(wallet);
    expect(parsed.accounts.vault.address).toBe(vault);
    expect(parsed.accounts.authority.address).toBe(authority);
    expect(ix.programAddress).toBe(program);
  });
});

describe("compact instructions", () => {
  it("round-trips program index, accounts, and data", () => {
    const original = [
      { programIdIndex: 5, accounts: [3, 6], data: Uint8Array.from([9, 8, 7]) },
      { programIdIndex: 0, accounts: [], data: new Uint8Array() },
    ];
    const bytes = serializeCompactInstructions(original);
    const parsed = parseCompactInstructions(bytes);
    expect(parsed.consumed).toBe(bytes.length);
    expect(parsed.instructions).toHaveLength(2);
    expect(parsed.instructions[0]!.programIdIndex).toBe(5);
    expect(parsed.instructions[0]!.accounts).toEqual([3, 6]);
    expect([...parsed.instructions[0]!.data]).toEqual([9, 8, 7]);
    expect(parsed.instructions[1]!.accounts).toEqual([]);
  });

  it("reuses vault index 3 and does not mark vault as a tx signer", async () => {
    const inner: Instruction[] = [
      {
        programAddress: tokenProgram,
        accounts: [
          { address: vault, role: AccountRole.READONLY_SIGNER },
          { address: token, role: AccountRole.WRITABLE },
        ],
        data: Uint8Array.from([1, 2, 3]),
      },
    ];
    const packed = packExecute({
      payer,
      walletPda: wallet,
      authorityPda: authority,
      vaultPda: vault,
      inner,
    });
    expect(packed.accounts[3]!.address).toBe(vault);
    expect(packed.accounts[3]!.role).toBe(AccountRole.WRITABLE);
    const { instructions } = parseCompactInstructions(packed.compactBytes);
    expect(instructions[0]!.accounts[0]).toBe(3);
    const hash = await hashPackedAccounts(packed);
    expect(hash.length).toBe(32);
  });
});

describe("lazorkit secp256r1 layout", () => {
  it("uses fixed offsets 16/80/114 and 0xFFFF instruction indexes", () => {
    const pubkey = new Uint8Array(33).fill(2);
    const signature = new Uint8Array(64).fill(0xab);
    const authenticatorData = new Uint8Array(37).fill(0x11);
    const clientDataHash = new Uint8Array(32).fill(0x22);
    const ix = buildLazorKitSecp256r1Instruction({
      compressedPubkey: pubkey,
      signature,
      authenticatorData,
      clientDataHash,
    });
    const data = Uint8Array.from(ix.data ?? []);
    expect(data[0]).toBe(1);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    expect(view.getUint16(2, true)).toBe(SECP_SIG_OFFSET);
    expect(view.getUint16(4, true)).toBe(0xffff);
    expect(view.getUint16(6, true)).toBe(SECP_PUBKEY_OFFSET);
    expect(view.getUint16(8, true)).toBe(0xffff);
    expect(view.getUint16(10, true)).toBe(SECP_MESSAGE_OFFSET);
    expect(view.getUint16(12, true)).toBe(37 + 32);
    expect(view.getUint16(14, true)).toBe(0xffff);
    expect(data.subarray(SECP_MESSAGE_OFFSET, SECP_MESSAGE_OFFSET + 37)).toEqual(
      authenticatorData,
    );
  });
});

describe("execute challenge hash", () => {
  it("binds disc, 14-byte prefix, compact, accounts hash, payer, counter, program", async () => {
    const prefix = encodeAuthPrefix({
      slot: 99n,
      counter: 3,
      sysvarIxIndex: 4,
    });
    expect(prefix.length).toBe(14);
    const compact = Uint8Array.from([1, 0, 0, 0, 0]);
    const accountsHash = new Uint8Array(32).fill(9);
    const disc = Uint8Array.from(EXECUTE_DISCRIMINATOR);
    const hash = await executeChallengeHash({
      discriminator: disc,
      authPrefix: prefix,
      compactBytes: compact,
      accountsHash,
      payer,
      counter: 3,
      programAddress: program,
    });
    expect(hash.length).toBe(32);
    const again = await executeChallengeHash({
      discriminator: disc,
      authPrefix: prefix,
      compactBytes: compact,
      accountsHash,
      payer,
      counter: 3,
      programAddress: program,
    });
    expect([...hash]).toEqual([...again]);
    const other = await executeChallengeHash({
      discriminator: disc,
      authPrefix: prefix,
      compactBytes: compact,
      accountsHash,
      payer,
      counter: 4,
      programAddress: program,
    });
    expect([...hash]).not.toEqual([...other]);
  });
});

describe("assembleExecuteInstructions", () => {
  it("encodes execute through the generated client and keeps remaining accounts", async () => {
    const inner: Instruction[] = [
      {
        programAddress: tokenProgram,
        accounts: [
          { address: vault, role: AccountRole.READONLY_SIGNER },
          { address: token, role: AccountRole.WRITABLE },
        ],
        data: Uint8Array.from([1, 2, 3]),
      },
    ];
    const prepared = await prepareExecute({
      payer,
      walletPda: wallet,
      authorityPda: authority,
      vaultPda: vault,
      inner,
      programAddress: program,
    });
    const prefix = encodeAuthPrefix({
      slot: 1n,
      counter: 1,
      sysvarIxIndex: 4,
    });
    const { executeIx } = await assembleExecuteInstructions({
      prepared,
      authPrefix: prefix,
      compressedPubkey: new Uint8Array(33).fill(2),
      signatureDer: Uint8Array.from([
        0x30, 0x44, 0x02, 0x20,
        ...new Uint8Array(32).fill(1),
        0x02, 0x20,
        ...new Uint8Array(32).fill(2),
      ]),
      authenticatorData: new Uint8Array(37).fill(0x11),
      clientDataJSON: new TextEncoder().encode("{}"),
    });
    const parsed = parseExecuteInstruction(executeIx);
    expect([...parsed.data.discriminator]).toEqual([...EXECUTE_DISCRIMINATOR]);
    expect(parsed.accounts.payer.address).toBe(payer);
    expect(parsed.accounts.wallet.address).toBe(wallet);
    expect(parsed.accounts.authority.address).toBe(authority);
    expect(parsed.accounts.vault.address).toBe(vault);
    expect(executeIx.accounts?.some((account) => account.address === token)).toBe(
      true,
    );
    expect(
      executeIx.accounts?.some((account) => account.address === tokenProgram),
    ).toBe(true);
  });
});

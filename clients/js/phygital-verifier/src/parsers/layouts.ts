/**
 * Fixed layouts for STANDARD program instructions used by policies.
 * Offsets match generated tryDecode (disc size + fixed fields).
 * `exactDataLength` mirrors generated `o === data.length` checks.
 */
import type { InstructionLayout, ProgramLayouts } from "../core/layout.js";
import { discEq } from "./codec-readers.js";

const TOKEN = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const SYSTEM = "11111111111111111111111111111111";
const ATA = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
const TOKEN_METADATA = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const BUBBLEGUM = "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY";
const CORE = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";

function tokenFamilyLayouts(): InstructionLayout[] {
  return [
    {
      name: "transfer",
      discriminator: new Uint8Array([3]),
      exactDataLength: 9, // 1 disc + 8 amount
      fields: {
        source: { kind: "account", index: 0 },
        destination: { kind: "account", index: 1 },
        authority: { kind: "account", index: 2 },
        amount: { kind: "data", offset: 1, size: 8, type: "u64" },
      },
    },
    {
      name: "transferChecked",
      discriminator: new Uint8Array([12]),
      exactDataLength: 10, // 1 disc + 8 amount + 1 decimals
      fields: {
        source: { kind: "account", index: 0 },
        mint: { kind: "account", index: 1 },
        destination: { kind: "account", index: 2 },
        authority: { kind: "account", index: 3 },
        amount: { kind: "data", offset: 1, size: 8, type: "u64" },
        decimals: { kind: "data", offset: 9, size: 1, type: "u8" },
      },
    },
    {
      name: "closeAccount",
      discriminator: new Uint8Array([9]),
      exactDataLength: 1,
      fields: {
        account: { kind: "account", index: 0 },
        destination: { kind: "account", index: 1 },
        owner: { kind: "account", index: 2 },
      },
    },
  ];
}

export const STANDARD_PROGRAM_LAYOUTS: readonly ProgramLayouts[] = [
  { programId: TOKEN, instructions: tokenFamilyLayouts() },
  { programId: TOKEN_2022, instructions: tokenFamilyLayouts() },
  {
    programId: SYSTEM,
    instructions: [
      {
        name: "transferSol",
        discriminator: new Uint8Array([2, 0, 0, 0]),
        exactDataLength: 12, // 4 disc + 8 amount
        fields: {
          source: { kind: "account", index: 0 },
          destination: { kind: "account", index: 1 },
          amount: { kind: "data", offset: 4, size: 8, type: "u64" },
        },
      },
      {
        name: "createAccount",
        discriminator: new Uint8Array([0, 0, 0, 0]),
        exactDataLength: 52, // 4 + 8 + 8 + 32
        fields: {
          payer: { kind: "account", index: 0 },
          newAccount: { kind: "account", index: 1 },
          lamports: { kind: "data", offset: 4, size: 8, type: "u64" },
          space: { kind: "data", offset: 12, size: 8, type: "u64" },
          owner: { kind: "data", offset: 20, size: 32, type: "pubkey" },
        },
      },
      {
        name: "allocate",
        discriminator: new Uint8Array([8, 0, 0, 0]),
        exactDataLength: 12,
        fields: {
          account: { kind: "account", index: 0 },
          space: { kind: "data", offset: 4, size: 8, type: "u64" },
        },
      },
      {
        name: "assign",
        discriminator: new Uint8Array([1, 0, 0, 0]),
        exactDataLength: 36,
        fields: {
          account: { kind: "account", index: 0 },
          owner: { kind: "data", offset: 4, size: 32, type: "pubkey" },
        },
      },
    ],
  },
  {
    programId: ATA,
    instructions: [
      {
        name: "create",
        discriminator: new Uint8Array([0]),
        exactDataLength: 1,
        fields: {
          funder: { kind: "account", index: 0 },
          associatedTokenAccount: { kind: "account", index: 1 },
          wallet: { kind: "account", index: 2 },
          mint: { kind: "account", index: 3 },
        },
      },
      {
        name: "createIdempotent",
        discriminator: new Uint8Array([1]),
        exactDataLength: 1,
        fields: {
          funder: { kind: "account", index: 0 },
          associatedTokenAccount: { kind: "account", index: 1 },
          wallet: { kind: "account", index: 2 },
          mint: { kind: "account", index: 3 },
        },
      },
    ],
  },
  {
    programId: TOKEN_METADATA,
    instructions: [
      {
        name: "Transfer",
        discriminator: new Uint8Array([49]),
        // Variable-length authorization data — must full-parse.
        fields: {
          token: { kind: "account", index: 0 },
          tokenOwner: { kind: "account", index: 1 },
          destination: { kind: "account", index: 2 },
          destinationOwner: { kind: "account", index: 3 },
          mint: { kind: "account", index: 4 },
          "transferArgs.amount": { kind: "dynamic" },
        },
      },
    ],
  },
  {
    programId: BUBBLEGUM,
    instructions: [
      {
        name: "transfer",
        discriminator: new Uint8Array([163, 52, 200, 231, 140, 3, 69, 186]),
        // Bubblegum transfer has large hashed args — parse to confirm.
        fields: {
          treeConfig: { kind: "account", index: 0 },
          leafOwner: { kind: "account", index: 1 },
          leafDelegate: { kind: "account", index: 2 },
          newLeafOwner: { kind: "account", index: 3 },
        },
      },
      {
        name: "transferV2",
        discriminator: new Uint8Array([180, 155, 21, 130, 73, 72, 72, 197]),
        fields: {
          treeConfig: { kind: "account", index: 0 },
        },
      },
    ],
  },
  {
    programId: CORE,
    instructions: [
      {
        name: "TransferV1",
        discriminator: new Uint8Array([14]),
        // Core TransferV1 has optional compression args — parse to confirm.
        fields: {
          asset: { kind: "account", index: 0 },
          collection: { kind: "account", index: 1 },
          payer: { kind: "account", index: 2 },
          authority: { kind: "account", index: 3 },
          newOwner: { kind: "account", index: 4 },
        },
      },
    ],
  },
];

/** Lookup map: programId → instruction name → layout */
export function indexProgramLayouts(
  programs: readonly ProgramLayouts[] = STANDARD_PROGRAM_LAYOUTS,
): Map<string, Map<string, InstructionLayout>> {
  const byProgram = new Map<string, Map<string, InstructionLayout>>();
  for (const p of programs) {
    const byName = new Map<string, InstructionLayout>();
    for (const ix of p.instructions) byName.set(ix.name, ix);
    byProgram.set(p.programId, byName);
  }
  return byProgram;
}

/**
 * Longest-discriminator layout match (respects `exactDataLength`).
 * Prefer over a hand-rolled disc scan when identifying fixed STANDARD ixs.
 */
export function matchLayoutByDisc(
  data: Uint8Array,
  layouts: Iterable<InstructionLayout>,
): InstructionLayout | undefined {
  let matched: InstructionLayout | undefined;
  for (const lay of layouts) {
    if (lay.discriminator.length === 0) continue;
    if (!discEq(data, lay.discriminator)) continue;
    if (
      lay.exactDataLength != null &&
      data.length !== lay.exactDataLength
    ) {
      continue;
    }
    if (
      !matched ||
      lay.discriminator.length > matched.discriminator.length
    ) {
      matched = lay;
    }
  }
  return matched;
}

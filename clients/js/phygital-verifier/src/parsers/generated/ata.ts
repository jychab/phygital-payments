/** Auto-generated from IDL — do not edit by hand. */
import {
  discEq,
  encodeBase58,
  readBool,
  readFloatLe,
  readPubkey,
  readU16Le,
  readU32Le,
  readU64Le,
  readU128Le,
  readUtf8,
} from "../codec-readers.js";

export const PROGRAM_ID = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" as const;

export type GeneratedIx = {
  name: string;
  fields: Record<string, { type: "bigint" | "number" | "string" | "bool" | "bytes" | "json"; value: bigint | number | string | boolean }>;
};

const DISC_CREATE = new Uint8Array([0]);
const DISC_CREATEIDEMPOTENT = new Uint8Array([1]);
const DISC_RECOVERNESTED = new Uint8Array([2]);
const DISC_CREATEWITHARGS = new Uint8Array([3]);

export function tryDecode(
  data: Uint8Array,
  accounts: readonly { address: string }[],
): GeneratedIx | null {
  if (discEq(data, DISC_CREATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["funder"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["associatedTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["wallet"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "create", fields };
  }
  if (discEq(data, DISC_CREATEIDEMPOTENT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["funder"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["associatedTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["wallet"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "createIdempotent", fields };
  }
  if (discEq(data, DISC_RECOVERNESTED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["nestedAssociatedTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["nestedMint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["destinationAssociatedTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["ownerAssociatedTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["ownerMint"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["wallet"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["ownerTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["nestedTokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "recoverNested", fields };
  }
  if (discEq(data, DISC_CREATEWITHARGS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["funder"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["associatedTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["wallet"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["rentSysvar"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["mode"] = { type: "string", value: "always" };
      }
      if (tag === 1) {
        fields["mode"] = { type: "string", value: "idempotent" };
      }
    }
    if (data.length <= o) return null;
    fields["bump"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["accountLen"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "createWithArgs", fields };
  }
  return null;
}

export const FIELD_SCHEMA = [
  {
    "instruction": "create",
    "fields": [
      {
        "name": "funder",
        "type": "string"
      },
      {
        "name": "associatedTokenAccount",
        "type": "string"
      },
      {
        "name": "wallet",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "createIdempotent",
    "fields": [
      {
        "name": "funder",
        "type": "string"
      },
      {
        "name": "associatedTokenAccount",
        "type": "string"
      },
      {
        "name": "wallet",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "recoverNested",
    "fields": [
      {
        "name": "nestedAssociatedTokenAccount",
        "type": "string"
      },
      {
        "name": "nestedMint",
        "type": "string"
      },
      {
        "name": "destinationAssociatedTokenAccount",
        "type": "string"
      },
      {
        "name": "ownerAssociatedTokenAccount",
        "type": "string"
      },
      {
        "name": "ownerMint",
        "type": "string"
      },
      {
        "name": "wallet",
        "type": "string"
      },
      {
        "name": "ownerTokenProgram",
        "type": "string"
      },
      {
        "name": "nestedTokenProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "createWithArgs",
    "fields": [
      {
        "name": "funder",
        "type": "string"
      },
      {
        "name": "associatedTokenAccount",
        "type": "string"
      },
      {
        "name": "wallet",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "rentSysvar",
        "type": "string"
      },
      {
        "name": "mode",
        "type": "string"
      },
      {
        "name": "bump",
        "type": "number"
      },
      {
        "name": "accountLen",
        "type": "number"
      }
    ]
  }
] as const;

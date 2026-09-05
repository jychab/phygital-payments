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

export const PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as const;

export type GeneratedIx = {
  name: string;
  fields: Record<string, { type: "bigint" | "number" | "string" | "bool" | "bytes" | "json"; value: bigint | number | string | boolean }>;
};

const DISC_INITIALIZEMINT = new Uint8Array([0]);
const DISC_INITIALIZEACCOUNT = new Uint8Array([1]);
const DISC_INITIALIZEMULTISIG = new Uint8Array([2]);
const DISC_TRANSFER = new Uint8Array([3]);
const DISC_APPROVE = new Uint8Array([4]);
const DISC_REVOKE = new Uint8Array([5]);
const DISC_SETAUTHORITY = new Uint8Array([6]);
const DISC_MINTTO = new Uint8Array([7]);
const DISC_BURN = new Uint8Array([8]);
const DISC_CLOSEACCOUNT = new Uint8Array([9]);
const DISC_FREEZEACCOUNT = new Uint8Array([10]);
const DISC_THAWACCOUNT = new Uint8Array([11]);
const DISC_TRANSFERCHECKED = new Uint8Array([12]);
const DISC_APPROVECHECKED = new Uint8Array([13]);
const DISC_MINTTOCHECKED = new Uint8Array([14]);
const DISC_BURNCHECKED = new Uint8Array([15]);
const DISC_INITIALIZEACCOUNT2 = new Uint8Array([16]);
const DISC_SYNCNATIVE = new Uint8Array([17]);
const DISC_INITIALIZEACCOUNT3 = new Uint8Array([18]);
const DISC_INITIALIZEMULTISIG2 = new Uint8Array([19]);
const DISC_INITIALIZEMINT2 = new Uint8Array([20]);
const DISC_GETACCOUNTDATASIZE = new Uint8Array([21]);
const DISC_INITIALIZEIMMUTABLEOWNER = new Uint8Array([22]);
const DISC_AMOUNTTOUIAMOUNT = new Uint8Array([23]);
const DISC_UIAMOUNTTOAMOUNT = new Uint8Array([24]);
const DISC_WITHDRAWEXCESSLAMPORTS = new Uint8Array([38]);
const DISC_UNWRAPLAMPORTS = new Uint8Array([45]);
const DISC_BATCH = new Uint8Array([255]);

export function tryDecode(
  data: Uint8Array,
  accounts: readonly { address: string }[],
): GeneratedIx | null {
  if (discEq(data, DISC_INITIALIZEMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["mintAuthority"] = { type: "string", value: v };
      o += 32;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["freezeAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeMint", fields };
  }
  if (discEq(data, DISC_INITIALIZEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "initializeAccount", fields };
  }
  if (discEq(data, DISC_INITIALIZEMULTISIG)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["multisig"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["m"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "initializeMultisig", fields };
  }
  if (discEq(data, DISC_TRANSFER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "transfer", fields };
  }
  if (discEq(data, DISC_APPROVE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["delegate"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "approve", fields };
  }
  if (discEq(data, DISC_REVOKE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "revoke", fields };
  }
  if (discEq(data, DISC_SETAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["owned"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["authorityType"] = { type: "string", value: "mintTokens" };
      }
      if (tag === 1) {
        fields["authorityType"] = { type: "string", value: "freezeAccount" };
      }
      if (tag === 2) {
        fields["authorityType"] = { type: "string", value: "accountOwner" };
      }
      if (tag === 3) {
        fields["authorityType"] = { type: "string", value: "closeAccount" };
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["newAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "setAuthority", fields };
  }
  if (discEq(data, DISC_MINTTO)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "mintTo", fields };
  }
  if (discEq(data, DISC_BURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "burn", fields };
  }
  if (discEq(data, DISC_CLOSEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "closeAccount", fields };
  }
  if (discEq(data, DISC_FREEZEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "freezeAccount", fields };
  }
  if (discEq(data, DISC_THAWACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "thawAccount", fields };
  }
  if (discEq(data, DISC_TRANSFERCHECKED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "transferChecked", fields };
  }
  if (discEq(data, DISC_APPROVECHECKED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["delegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "approveChecked", fields };
  }
  if (discEq(data, DISC_MINTTOCHECKED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "mintToChecked", fields };
  }
  if (discEq(data, DISC_BURNCHECKED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "burnChecked", fields };
  }
  if (discEq(data, DISC_INITIALIZEACCOUNT2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["owner"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "initializeAccount2", fields };
  }
  if (discEq(data, DISC_SYNCNATIVE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "syncNative", fields };
  }
  if (discEq(data, DISC_INITIALIZEACCOUNT3)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["owner"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "initializeAccount3", fields };
  }
  if (discEq(data, DISC_INITIALIZEMULTISIG2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["multisig"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["m"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "initializeMultisig2", fields };
  }
  if (discEq(data, DISC_INITIALIZEMINT2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["mintAuthority"] = { type: "string", value: v };
      o += 32;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["freezeAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeMint2", fields };
  }
  if (discEq(data, DISC_GETACCOUNTDATASIZE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "getAccountDataSize", fields };
  }
  if (discEq(data, DISC_INITIALIZEIMMUTABLEOWNER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "initializeImmutableOwner", fields };
  }
  if (discEq(data, DISC_AMOUNTTOUIAMOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "amountToUiAmount", fields };
  }
  if (discEq(data, DISC_UIAMOUNTTOAMOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["uiAmount"] = { type: "string", value: s };
      o += n;
    }
    if (o !== data.length) return null;
    return { name: "uiAmountToAmount", fields };
  }
  if (discEq(data, DISC_WITHDRAWEXCESSLAMPORTS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "withdrawExcessLamports", fields };
  }
  if (discEq(data, DISC_UNWRAPLAMPORTS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["amount"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "unwrapLamports", fields };
  }
  if (discEq(data, DISC_BATCH)) {
    const fields: GeneratedIx["fields"] = {};
    let o = 1;
    {
      const arr: unknown[] = [];
      let _guard = 0;
      while (o < data.length) {
        if (++_guard > 4096) return null;
        {
          const obj: Record<string, unknown> = {};
          if (data.length <= o) return null; obj["numberOfAccounts"] = data[o]!; o += 1;
          {
            if (data.length <= o) return null;
            const len = data[o]!; o += 1;
            if (data.length < o + len) return null;
            obj["instructionData"] = encodeBase58(data.subarray(o, o + len)); o += len;
          }
          arr.push(obj);
        }
      }
      fields["data"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "batch", fields };
  }
  return null;
}

export const FIELD_SCHEMA = [
  {
    "instruction": "initializeMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "decimals",
        "type": "number"
      },
      {
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "freezeAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeAccount",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeMultisig",
    "fields": [
      {
        "name": "multisig",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "m",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "transfer",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "approve",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "delegate",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "revoke",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "setAuthority",
    "fields": [
      {
        "name": "owned",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "authorityType",
        "type": "string"
      },
      {
        "name": "newAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "mintTo",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "burn",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "closeAccount",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "freezeAccount",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "thawAccount",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "transferChecked",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "decimals",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "approveChecked",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "delegate",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "decimals",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "mintToChecked",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "decimals",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "burnChecked",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "decimals",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "initializeAccount2",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "syncNative",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeAccount3",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeMultisig2",
    "fields": [
      {
        "name": "multisig",
        "type": "string"
      },
      {
        "name": "m",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "initializeMint2",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "decimals",
        "type": "number"
      },
      {
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "freezeAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "getAccountDataSize",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeImmutableOwner",
    "fields": [
      {
        "name": "account",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "amountToUiAmount",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "uiAmountToAmount",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "uiAmount",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "withdrawExcessLamports",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "unwrapLamports",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "batch",
    "fields": [
      {
        "name": "data",
        "type": "json"
      }
    ]
  }
] as const;

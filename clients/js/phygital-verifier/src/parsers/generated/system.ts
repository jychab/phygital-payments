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

export const PROGRAM_ID = "11111111111111111111111111111111" as const;

export type GeneratedIx = {
  name: string;
  fields: Record<string, { type: "bigint" | "number" | "string" | "bool" | "bytes" | "json"; value: bigint | number | string | boolean }>;
};

const DISC_CREATEACCOUNT = new Uint8Array([0,0,0,0]);
const DISC_ASSIGN = new Uint8Array([1,0,0,0]);
const DISC_TRANSFERSOL = new Uint8Array([2,0,0,0]);
const DISC_CREATEACCOUNTWITHSEED = new Uint8Array([3,0,0,0]);
const DISC_ADVANCENONCEACCOUNT = new Uint8Array([4,0,0,0]);
const DISC_WITHDRAWNONCEACCOUNT = new Uint8Array([5,0,0,0]);
const DISC_INITIALIZENONCEACCOUNT = new Uint8Array([6,0,0,0]);
const DISC_AUTHORIZENONCEACCOUNT = new Uint8Array([7,0,0,0]);
const DISC_ALLOCATE = new Uint8Array([8,0,0,0]);
const DISC_ALLOCATEWITHSEED = new Uint8Array([9,0,0,0]);
const DISC_ASSIGNWITHSEED = new Uint8Array([10,0,0,0]);
const DISC_TRANSFERSOLWITHSEED = new Uint8Array([11,0,0,0]);
const DISC_UPGRADENONCEACCOUNT = new Uint8Array([12,0,0,0]);
const DISC_CREATEACCOUNTALLOWPREFUND = new Uint8Array([13,0,0,0]);

export function tryDecode(
  data: Uint8Array,
  accounts: readonly { address: string }[],
): GeneratedIx | null {
  if (discEq(data, DISC_CREATEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["newAccount"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["lamports"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["space"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["programAddress"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "createAccount", fields };
  }
  if (discEq(data, DISC_ASSIGN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["programAddress"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "assign", fields };
  }
  if (discEq(data, DISC_TRANSFERSOL)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "transferSol", fields };
  }
  if (discEq(data, DISC_CREATEACCOUNTWITHSEED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["newAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["baseAccount"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["base"] = { type: "string", value: v };
      o += 32;
    }
    {
      const len = readU64Le(data, o);
      if (len == null) return null;
      if (len > 4096n) return null;
      o += 8;
      const n = Number(len);
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["seed"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["space"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["programAddress"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "createAccountWithSeed", fields };
  }
  if (discEq(data, DISC_ADVANCENONCEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["nonceAccount"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["recentBlockhashesSysvar"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["nonceAuthority"] = { type: "string", value: a }; }
    let o = 4;
    if (o !== data.length) return null;
    return { name: "advanceNonceAccount", fields };
  }
  if (discEq(data, DISC_WITHDRAWNONCEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["nonceAccount"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["recipientAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["recentBlockhashesSysvar"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["rentSysvar"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["nonceAuthority"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["withdrawAmount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "withdrawNonceAccount", fields };
  }
  if (discEq(data, DISC_INITIALIZENONCEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["nonceAccount"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["recentBlockhashesSysvar"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["rentSysvar"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["nonceAuthority"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "initializeNonceAccount", fields };
  }
  if (discEq(data, DISC_AUTHORIZENONCEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["nonceAccount"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["nonceAuthority"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["newNonceAuthority"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "authorizeNonceAccount", fields };
  }
  if (discEq(data, DISC_ALLOCATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["newAccount"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["space"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "allocate", fields };
  }
  if (discEq(data, DISC_ALLOCATEWITHSEED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["newAccount"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["baseAccount"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["base"] = { type: "string", value: v };
      o += 32;
    }
    {
      const len = readU64Le(data, o);
      if (len == null) return null;
      if (len > 4096n) return null;
      o += 8;
      const n = Number(len);
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["seed"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["space"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["programAddress"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "allocateWithSeed", fields };
  }
  if (discEq(data, DISC_ASSIGNWITHSEED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["baseAccount"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["base"] = { type: "string", value: v };
      o += 32;
    }
    {
      const len = readU64Le(data, o);
      if (len == null) return null;
      if (len > 4096n) return null;
      o += 8;
      const n = Number(len);
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["seed"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["programAddress"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "assignWithSeed", fields };
  }
  if (discEq(data, DISC_TRANSFERSOLWITHSEED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["baseAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const len = readU64Le(data, o);
      if (len == null) return null;
      if (len > 4096n) return null;
      o += 8;
      const n = Number(len);
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["fromSeed"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["fromOwner"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "transferSolWithSeed", fields };
  }
  if (discEq(data, DISC_UPGRADENONCEACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["nonceAccount"] = { type: "string", value: a }; }
    let o = 4;
    if (o !== data.length) return null;
    return { name: "upgradeNonceAccount", fields };
  }
  if (discEq(data, DISC_CREATEACCOUNTALLOWPREFUND)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["newAccount"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["payer"] = { type: "string", value: a }; }
    let o = 4;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["lamports"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["space"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["programAddress"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "createAccountAllowPrefund", fields };
  }
  return null;
}

export const FIELD_SCHEMA = [
  {
    "instruction": "createAccount",
    "fields": [
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "newAccount",
        "type": "string"
      },
      {
        "name": "lamports",
        "type": "bigint"
      },
      {
        "name": "space",
        "type": "bigint"
      },
      {
        "name": "programAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "assign",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "programAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "transferSol",
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
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "createAccountWithSeed",
    "fields": [
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "newAccount",
        "type": "string"
      },
      {
        "name": "baseAccount",
        "type": "string"
      },
      {
        "name": "base",
        "type": "string"
      },
      {
        "name": "seed",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "space",
        "type": "bigint"
      },
      {
        "name": "programAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "advanceNonceAccount",
    "fields": [
      {
        "name": "nonceAccount",
        "type": "string"
      },
      {
        "name": "recentBlockhashesSysvar",
        "type": "string"
      },
      {
        "name": "nonceAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "withdrawNonceAccount",
    "fields": [
      {
        "name": "nonceAccount",
        "type": "string"
      },
      {
        "name": "recipientAccount",
        "type": "string"
      },
      {
        "name": "recentBlockhashesSysvar",
        "type": "string"
      },
      {
        "name": "rentSysvar",
        "type": "string"
      },
      {
        "name": "nonceAuthority",
        "type": "string"
      },
      {
        "name": "withdrawAmount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "initializeNonceAccount",
    "fields": [
      {
        "name": "nonceAccount",
        "type": "string"
      },
      {
        "name": "recentBlockhashesSysvar",
        "type": "string"
      },
      {
        "name": "rentSysvar",
        "type": "string"
      },
      {
        "name": "nonceAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "authorizeNonceAccount",
    "fields": [
      {
        "name": "nonceAccount",
        "type": "string"
      },
      {
        "name": "nonceAuthority",
        "type": "string"
      },
      {
        "name": "newNonceAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "allocate",
    "fields": [
      {
        "name": "newAccount",
        "type": "string"
      },
      {
        "name": "space",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "allocateWithSeed",
    "fields": [
      {
        "name": "newAccount",
        "type": "string"
      },
      {
        "name": "baseAccount",
        "type": "string"
      },
      {
        "name": "base",
        "type": "string"
      },
      {
        "name": "seed",
        "type": "string"
      },
      {
        "name": "space",
        "type": "bigint"
      },
      {
        "name": "programAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "assignWithSeed",
    "fields": [
      {
        "name": "account",
        "type": "string"
      },
      {
        "name": "baseAccount",
        "type": "string"
      },
      {
        "name": "base",
        "type": "string"
      },
      {
        "name": "seed",
        "type": "string"
      },
      {
        "name": "programAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "transferSolWithSeed",
    "fields": [
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "baseAccount",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "fromSeed",
        "type": "string"
      },
      {
        "name": "fromOwner",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "upgradeNonceAccount",
    "fields": [
      {
        "name": "nonceAccount",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "createAccountAllowPrefund",
    "fields": [
      {
        "name": "newAccount",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "lamports",
        "type": "bigint"
      },
      {
        "name": "space",
        "type": "bigint"
      },
      {
        "name": "programAddress",
        "type": "string"
      }
    ]
  }
] as const;

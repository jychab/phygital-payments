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

export const PROGRAM_ID = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d" as const;

export type GeneratedIx = {
  name: string;
  fields: Record<string, { type: "bigint" | "number" | "string" | "bool" | "bytes" | "json"; value: bigint | number | string | boolean }>;
};

const DISC_CREATEV1 = new Uint8Array([0]);
const DISC_CREATECOLLECTIONV1 = new Uint8Array([1]);
const DISC_ADDPLUGINV1 = new Uint8Array([2]);
const DISC_ADDCOLLECTIONPLUGINV1 = new Uint8Array([3]);
const DISC_REMOVEPLUGINV1 = new Uint8Array([4]);
const DISC_REMOVECOLLECTIONPLUGINV1 = new Uint8Array([5]);
const DISC_UPDATEPLUGINV1 = new Uint8Array([6]);
const DISC_UPDATECOLLECTIONPLUGINV1 = new Uint8Array([7]);
const DISC_APPROVEPLUGINAUTHORITYV1 = new Uint8Array([8]);
const DISC_APPROVECOLLECTIONPLUGINAUTHORITYV1 = new Uint8Array([9]);
const DISC_REVOKEPLUGINAUTHORITYV1 = new Uint8Array([10]);
const DISC_REVOKECOLLECTIONPLUGINAUTHORITYV1 = new Uint8Array([11]);
const DISC_BURNV1 = new Uint8Array([12]);
const DISC_BURNCOLLECTIONV1 = new Uint8Array([13]);
const DISC_TRANSFERV1 = new Uint8Array([14]);
const DISC_UPDATEV1 = new Uint8Array([15]);
const DISC_UPDATECOLLECTIONV1 = new Uint8Array([16]);
const DISC_COMPRESSV1 = new Uint8Array([17]);
const DISC_DECOMPRESSV1 = new Uint8Array([18]);
const DISC_COLLECT = new Uint8Array([19]);
const DISC_CREATEV2 = new Uint8Array([20]);
const DISC_CREATECOLLECTIONV2 = new Uint8Array([21]);
const DISC_ADDEXTERNALPLUGINADAPTERV1 = new Uint8Array([22]);
const DISC_ADDCOLLECTIONEXTERNALPLUGINADAPTERV1 = new Uint8Array([23]);
const DISC_REMOVEEXTERNALPLUGINADAPTERV1 = new Uint8Array([24]);
const DISC_REMOVECOLLECTIONEXTERNALPLUGINADAPTERV1 = new Uint8Array([25]);
const DISC_UPDATEEXTERNALPLUGINADAPTERV1 = new Uint8Array([26]);
const DISC_UPDATECOLLECTIONEXTERNALPLUGINADAPTERV1 = new Uint8Array([27]);
const DISC_WRITEEXTERNALPLUGINADAPTERDATAV1 = new Uint8Array([28]);
const DISC_WRITECOLLECTIONEXTERNALPLUGINADAPTERDATAV1 = new Uint8Array([29]);
const DISC_UPDATEV2 = new Uint8Array([30]);
const DISC_EXECUTEV1 = new Uint8Array([31]);
const DISC_UPDATECOLLECTIONINFOV1 = new Uint8Array([32]);
const DISC_ADDCOLLECTIONSTOGROUPV1 = new Uint8Array([33]);
const DISC_REMOVECOLLECTIONSFROMGROUPV1 = new Uint8Array([34]);
const DISC_ADDASSETSTOGROUPV1 = new Uint8Array([35]);
const DISC_REMOVEASSETSFROMGROUPV1 = new Uint8Array([36]);
const DISC_ADDGROUPSTOGROUPV1 = new Uint8Array([37]);
const DISC_REMOVEGROUPSFROMGROUPV1 = new Uint8Array([38]);
const DISC_CREATEGROUPV1 = new Uint8Array([39]);
const DISC_CLOSEGROUPV1 = new Uint8Array([40]);
const DISC_UPDATEGROUPV1 = new Uint8Array([41]);

export function tryDecode(
  data: Uint8Array,
  accounts: readonly { address: string }[],
): GeneratedIx | null {
  if (discEq(data, DISC_CREATEV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["createV1Args.dataState"] = { type: "string", value: "AccountState" };
      }
      if (tag === 1) {
        fields["createV1Args.dataState"] = { type: "string", value: "LedgerState" };
      }
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["createV1Args.name"] = { type: "string", value: s };
      o += n;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["createV1Args.uri"] = { type: "string", value: s };
      o += n;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Royalties";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["creators"] = arr;
                    }
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "ProgramAllowList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      if (tag === 2) {
                        nested["variant"] = "ProgramDenyList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      nested["ruleSet"] = nested;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 1) {
                  nested["variant"] = "FreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 2) {
                  nested["variant"] = "BurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 3) {
                  nested["variant"] = "TransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 4) {
                  nested["variant"] = "UpdateDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["additionalDelegates"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 5) {
                  nested["variant"] = "PermanentFreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 6) {
                  nested["variant"] = "Attributes";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["attributeList"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 7) {
                  nested["variant"] = "PermanentTransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 8) {
                  nested["variant"] = "PermanentBurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 9) {
                  nested["variant"] = "Edition";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 10) {
                  nested["variant"] = "MasterEdition";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 11) {
                  nested["variant"] = "AddBlocker";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 12) {
                  nested["variant"] = "ImmutableMetadata";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 13) {
                  nested["variant"] = "VerifiedCreators";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 14) {
                  nested["variant"] = "Autograph";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 15) {
                  nested["variant"] = "BubblegumV2";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 16) {
                  nested["variant"] = "FreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 17) {
                  nested["variant"] = "PermanentFreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 18) {
                  nested["variant"] = "Groups";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["groups"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                obj["plugin"] = nested;
              }
              if (data.length <= o) return null;
              { const opt = data[o]!; o += 1; if (opt === 1) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "None";
                  }
                  if (tag === 1) {
                    nested["variant"] = "Owner";
                  }
                  if (tag === 2) {
                    nested["variant"] = "UpdateAuthority";
                  }
                  if (tag === 3) {
                    nested["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                  }
                  obj["authority"] = nested;
                }
              } }
              arr.push(obj);
            }
          }
          fields["createV1Args.plugins"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "CreateV1", fields };
  }
  if (discEq(data, DISC_CREATECOLLECTIONV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
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
      fields["createCollectionV1Args.name"] = { type: "string", value: s };
      o += n;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["createCollectionV1Args.uri"] = { type: "string", value: s };
      o += n;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Royalties";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["creators"] = arr;
                    }
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "ProgramAllowList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      if (tag === 2) {
                        nested["variant"] = "ProgramDenyList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      nested["ruleSet"] = nested;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 1) {
                  nested["variant"] = "FreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 2) {
                  nested["variant"] = "BurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 3) {
                  nested["variant"] = "TransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 4) {
                  nested["variant"] = "UpdateDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["additionalDelegates"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 5) {
                  nested["variant"] = "PermanentFreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 6) {
                  nested["variant"] = "Attributes";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["attributeList"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 7) {
                  nested["variant"] = "PermanentTransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 8) {
                  nested["variant"] = "PermanentBurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 9) {
                  nested["variant"] = "Edition";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 10) {
                  nested["variant"] = "MasterEdition";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 11) {
                  nested["variant"] = "AddBlocker";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 12) {
                  nested["variant"] = "ImmutableMetadata";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 13) {
                  nested["variant"] = "VerifiedCreators";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 14) {
                  nested["variant"] = "Autograph";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 15) {
                  nested["variant"] = "BubblegumV2";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 16) {
                  nested["variant"] = "FreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 17) {
                  nested["variant"] = "PermanentFreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 18) {
                  nested["variant"] = "Groups";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["groups"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                obj["plugin"] = nested;
              }
              if (data.length <= o) return null;
              { const opt = data[o]!; o += 1; if (opt === 1) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "None";
                  }
                  if (tag === 1) {
                    nested["variant"] = "Owner";
                  }
                  if (tag === 2) {
                    nested["variant"] = "UpdateAuthority";
                  }
                  if (tag === 3) {
                    nested["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                  }
                  obj["authority"] = nested;
                }
              } }
              arr.push(obj);
            }
          }
          fields["createCollectionV1Args.plugins"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "CreateCollectionV1", fields };
  }
  if (discEq(data, DISC_ADDPLUGINV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "Royalties" };
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["addPluginV1Args.plugin.field0.basisPoints"] = { type: "number", value: v };
          o += 2;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
              arr.push(obj);
            }
          }
          fields["addPluginV1Args.plugin.field0.creators"] = { type: "json", value: JSON.stringify(arr) };
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramAllowList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["addPluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
          if (tag === 2) {
            fields["addPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramDenyList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["addPluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
      }
      if (tag === 1) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "FreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 2) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "UpdateDelegate" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["addPluginV1Args.plugin.field0.additionalDelegates"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 5) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 6) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "Attributes" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["addPluginV1Args.plugin.field0.attributeList"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 7) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "Edition" };
        {
          const v = readU32Le(data, o);
          if (v == null) return null;
          fields["addPluginV1Args.plugin.field0.number"] = { type: "number", value: v };
          o += 4;
        }
      }
      if (tag === 10) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "MasterEdition" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const v = readU32Le(data, o);
              if (v == null) return null;
              fields["addPluginV1Args.plugin.field0.maxSupply"] = { type: "number", value: v };
              o += 4;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["addPluginV1Args.plugin.field0.name"] = { type: "string", value: s };
              o += n;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["addPluginV1Args.plugin.field0.uri"] = { type: "string", value: s };
              o += n;
            }
          }
        }
      }
      if (tag === 11) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "VerifiedCreators" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
              arr.push(obj);
            }
          }
          fields["addPluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 14) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "Autograph" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["addPluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 15) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "FreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 17) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 18) {
        fields["addPluginV1Args.plugin"] = { type: "string", value: "Groups" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["addPluginV1Args.plugin.field0.groups"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addPluginV1Args.initAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addPluginV1Args.initAuthority"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["addPluginV1Args.initAuthority"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["addPluginV1Args.initAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addPluginV1Args.initAuthority.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "AddPluginV1", fields };
  }
  if (discEq(data, DISC_ADDCOLLECTIONPLUGINV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "Royalties" };
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["addCollectionPluginV1Args.plugin.field0.basisPoints"] = { type: "number", value: v };
          o += 2;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
              arr.push(obj);
            }
          }
          fields["addCollectionPluginV1Args.plugin.field0.creators"] = { type: "json", value: JSON.stringify(arr) };
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addCollectionPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addCollectionPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramAllowList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["addCollectionPluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
          if (tag === 2) {
            fields["addCollectionPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramDenyList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["addCollectionPluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
      }
      if (tag === 1) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "FreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 2) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "UpdateDelegate" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["addCollectionPluginV1Args.plugin.field0.additionalDelegates"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 5) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 6) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "Attributes" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["addCollectionPluginV1Args.plugin.field0.attributeList"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 7) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "Edition" };
        {
          const v = readU32Le(data, o);
          if (v == null) return null;
          fields["addCollectionPluginV1Args.plugin.field0.number"] = { type: "number", value: v };
          o += 4;
        }
      }
      if (tag === 10) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "MasterEdition" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const v = readU32Le(data, o);
              if (v == null) return null;
              fields["addCollectionPluginV1Args.plugin.field0.maxSupply"] = { type: "number", value: v };
              o += 4;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["addCollectionPluginV1Args.plugin.field0.name"] = { type: "string", value: s };
              o += n;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["addCollectionPluginV1Args.plugin.field0.uri"] = { type: "string", value: s };
              o += n;
            }
          }
        }
      }
      if (tag === 11) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "VerifiedCreators" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
              arr.push(obj);
            }
          }
          fields["addCollectionPluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 14) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "Autograph" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["addCollectionPluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 15) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "FreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 17) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["addCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 18) {
        fields["addCollectionPluginV1Args.plugin"] = { type: "string", value: "Groups" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["addCollectionPluginV1Args.plugin.field0.groups"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addCollectionPluginV1Args.initAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addCollectionPluginV1Args.initAuthority"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["addCollectionPluginV1Args.initAuthority"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["addCollectionPluginV1Args.initAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addCollectionPluginV1Args.initAuthority.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "AddCollectionPluginV1", fields };
  }
  if (discEq(data, DISC_REMOVEPLUGINV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "Royalties" };
      }
      if (tag === 1) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "FreezeDelegate" };
      }
      if (tag === 2) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "UpdateDelegate" };
      }
      if (tag === 5) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "PermanentFreezeDelegate" };
      }
      if (tag === 6) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "Attributes" };
      }
      if (tag === 7) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "Edition" };
      }
      if (tag === 10) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "MasterEdition" };
      }
      if (tag === 11) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "VerifiedCreators" };
      }
      if (tag === 14) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "Autograph" };
      }
      if (tag === 15) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "FreezeExecute" };
      }
      if (tag === 17) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "PermanentFreezeExecute" };
      }
      if (tag === 18) {
        fields["removePluginV1Args.pluginType"] = { type: "string", value: "Groups" };
      }
    }
    if (o !== data.length) return null;
    return { name: "RemovePluginV1", fields };
  }
  if (discEq(data, DISC_REMOVECOLLECTIONPLUGINV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "Royalties" };
      }
      if (tag === 1) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "FreezeDelegate" };
      }
      if (tag === 2) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "UpdateDelegate" };
      }
      if (tag === 5) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "PermanentFreezeDelegate" };
      }
      if (tag === 6) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "Attributes" };
      }
      if (tag === 7) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "Edition" };
      }
      if (tag === 10) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "MasterEdition" };
      }
      if (tag === 11) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "VerifiedCreators" };
      }
      if (tag === 14) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "Autograph" };
      }
      if (tag === 15) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "FreezeExecute" };
      }
      if (tag === 17) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "PermanentFreezeExecute" };
      }
      if (tag === 18) {
        fields["removeCollectionPluginV1Args.pluginType"] = { type: "string", value: "Groups" };
      }
    }
    if (o !== data.length) return null;
    return { name: "RemoveCollectionPluginV1", fields };
  }
  if (discEq(data, DISC_UPDATEPLUGINV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "Royalties" };
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["updatePluginV1Args.plugin.field0.basisPoints"] = { type: "number", value: v };
          o += 2;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
              arr.push(obj);
            }
          }
          fields["updatePluginV1Args.plugin.field0.creators"] = { type: "json", value: JSON.stringify(arr) };
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updatePluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updatePluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramAllowList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["updatePluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
          if (tag === 2) {
            fields["updatePluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramDenyList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["updatePluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
      }
      if (tag === 1) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "FreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updatePluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 2) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "UpdateDelegate" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["updatePluginV1Args.plugin.field0.additionalDelegates"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 5) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updatePluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 6) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "Attributes" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["updatePluginV1Args.plugin.field0.attributeList"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 7) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "Edition" };
        {
          const v = readU32Le(data, o);
          if (v == null) return null;
          fields["updatePluginV1Args.plugin.field0.number"] = { type: "number", value: v };
          o += 4;
        }
      }
      if (tag === 10) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "MasterEdition" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const v = readU32Le(data, o);
              if (v == null) return null;
              fields["updatePluginV1Args.plugin.field0.maxSupply"] = { type: "number", value: v };
              o += 4;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["updatePluginV1Args.plugin.field0.name"] = { type: "string", value: s };
              o += n;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["updatePluginV1Args.plugin.field0.uri"] = { type: "string", value: s };
              o += n;
            }
          }
        }
      }
      if (tag === 11) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "VerifiedCreators" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
              arr.push(obj);
            }
          }
          fields["updatePluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 14) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "Autograph" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["updatePluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 15) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "FreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updatePluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 17) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updatePluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 18) {
        fields["updatePluginV1Args.plugin"] = { type: "string", value: "Groups" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["updatePluginV1Args.plugin.field0.groups"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdatePluginV1", fields };
  }
  if (discEq(data, DISC_UPDATECOLLECTIONPLUGINV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "Royalties" };
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["updateCollectionPluginV1Args.plugin.field0.basisPoints"] = { type: "number", value: v };
          o += 2;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
              arr.push(obj);
            }
          }
          fields["updateCollectionPluginV1Args.plugin.field0.creators"] = { type: "json", value: JSON.stringify(arr) };
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateCollectionPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateCollectionPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramAllowList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["updateCollectionPluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
          if (tag === 2) {
            fields["updateCollectionPluginV1Args.plugin.field0.ruleSet"] = { type: "string", value: "ProgramDenyList" };
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
              }
              fields["updateCollectionPluginV1Args.plugin.field0.ruleSet.field0"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
      }
      if (tag === 1) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "FreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 2) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "UpdateDelegate" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["updateCollectionPluginV1Args.plugin.field0.additionalDelegates"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 5) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeDelegate" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 6) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "Attributes" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["updateCollectionPluginV1Args.plugin.field0.attributeList"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 7) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "Edition" };
        {
          const v = readU32Le(data, o);
          if (v == null) return null;
          fields["updateCollectionPluginV1Args.plugin.field0.number"] = { type: "number", value: v };
          o += 4;
        }
      }
      if (tag === 10) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "MasterEdition" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const v = readU32Le(data, o);
              if (v == null) return null;
              fields["updateCollectionPluginV1Args.plugin.field0.maxSupply"] = { type: "number", value: v };
              o += 4;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["updateCollectionPluginV1Args.plugin.field0.name"] = { type: "string", value: s };
              o += n;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["updateCollectionPluginV1Args.plugin.field0.uri"] = { type: "string", value: s };
              o += n;
            }
          }
        }
      }
      if (tag === 11) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "VerifiedCreators" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
              arr.push(obj);
            }
          }
          fields["updateCollectionPluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 14) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "Autograph" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              {
                const len = readU32Le(data, o); if (len == null) return null;
                if (len > 4096) return null;
                o += 4;
                if (data.length < o + len) return null;
                obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
              }
              arr.push(obj);
            }
          }
          fields["updateCollectionPluginV1Args.plugin.field0.signatures"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
      if (tag === 15) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "FreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 17) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "PermanentFreezeExecute" };
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateCollectionPluginV1Args.plugin.field0.frozen"] = { type: "bool", value: v };
          o += 1;
        }
      }
      if (tag === 18) {
        fields["updateCollectionPluginV1Args.plugin"] = { type: "string", value: "Groups" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
          }
          fields["updateCollectionPluginV1Args.plugin.field0.groups"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateCollectionPluginV1", fields };
  }
  if (discEq(data, DISC_APPROVEPLUGINAUTHORITYV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Royalties" };
      }
      if (tag === 1) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeDelegate" };
      }
      if (tag === 2) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "UpdateDelegate" };
      }
      if (tag === 5) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeDelegate" };
      }
      if (tag === 6) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Attributes" };
      }
      if (tag === 7) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Edition" };
      }
      if (tag === 10) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "MasterEdition" };
      }
      if (tag === 11) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "VerifiedCreators" };
      }
      if (tag === 14) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Autograph" };
      }
      if (tag === 15) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeExecute" };
      }
      if (tag === 17) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeExecute" };
      }
      if (tag === 18) {
        fields["approvePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Groups" };
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["approvePluginAuthorityV1Args.newAuthority"] = { type: "string", value: "None" };
      }
      if (tag === 1) {
        fields["approvePluginAuthorityV1Args.newAuthority"] = { type: "string", value: "Owner" };
      }
      if (tag === 2) {
        fields["approvePluginAuthorityV1Args.newAuthority"] = { type: "string", value: "UpdateAuthority" };
      }
      if (tag === 3) {
        fields["approvePluginAuthorityV1Args.newAuthority"] = { type: "string", value: "Address" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["approvePluginAuthorityV1Args.newAuthority.address"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "ApprovePluginAuthorityV1", fields };
  }
  if (discEq(data, DISC_APPROVECOLLECTIONPLUGINAUTHORITYV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Royalties" };
      }
      if (tag === 1) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeDelegate" };
      }
      if (tag === 2) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "UpdateDelegate" };
      }
      if (tag === 5) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeDelegate" };
      }
      if (tag === 6) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Attributes" };
      }
      if (tag === 7) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Edition" };
      }
      if (tag === 10) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "MasterEdition" };
      }
      if (tag === 11) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "VerifiedCreators" };
      }
      if (tag === 14) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Autograph" };
      }
      if (tag === 15) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeExecute" };
      }
      if (tag === 17) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeExecute" };
      }
      if (tag === 18) {
        fields["approveCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Groups" };
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["approveCollectionPluginAuthorityV1Args.newAuthority"] = { type: "string", value: "None" };
      }
      if (tag === 1) {
        fields["approveCollectionPluginAuthorityV1Args.newAuthority"] = { type: "string", value: "Owner" };
      }
      if (tag === 2) {
        fields["approveCollectionPluginAuthorityV1Args.newAuthority"] = { type: "string", value: "UpdateAuthority" };
      }
      if (tag === 3) {
        fields["approveCollectionPluginAuthorityV1Args.newAuthority"] = { type: "string", value: "Address" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["approveCollectionPluginAuthorityV1Args.newAuthority.address"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "ApproveCollectionPluginAuthorityV1", fields };
  }
  if (discEq(data, DISC_REVOKEPLUGINAUTHORITYV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Royalties" };
      }
      if (tag === 1) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeDelegate" };
      }
      if (tag === 2) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "UpdateDelegate" };
      }
      if (tag === 5) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeDelegate" };
      }
      if (tag === 6) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Attributes" };
      }
      if (tag === 7) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Edition" };
      }
      if (tag === 10) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "MasterEdition" };
      }
      if (tag === 11) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "VerifiedCreators" };
      }
      if (tag === 14) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Autograph" };
      }
      if (tag === 15) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeExecute" };
      }
      if (tag === 17) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeExecute" };
      }
      if (tag === 18) {
        fields["revokePluginAuthorityV1Args.pluginType"] = { type: "string", value: "Groups" };
      }
    }
    if (o !== data.length) return null;
    return { name: "RevokePluginAuthorityV1", fields };
  }
  if (discEq(data, DISC_REVOKECOLLECTIONPLUGINAUTHORITYV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Royalties" };
      }
      if (tag === 1) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeDelegate" };
      }
      if (tag === 2) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "BurnDelegate" };
      }
      if (tag === 3) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "TransferDelegate" };
      }
      if (tag === 4) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "UpdateDelegate" };
      }
      if (tag === 5) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeDelegate" };
      }
      if (tag === 6) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Attributes" };
      }
      if (tag === 7) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentTransferDelegate" };
      }
      if (tag === 8) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentBurnDelegate" };
      }
      if (tag === 9) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Edition" };
      }
      if (tag === 10) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "MasterEdition" };
      }
      if (tag === 11) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "AddBlocker" };
      }
      if (tag === 12) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "ImmutableMetadata" };
      }
      if (tag === 13) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "VerifiedCreators" };
      }
      if (tag === 14) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Autograph" };
      }
      if (tag === 15) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "BubblegumV2" };
      }
      if (tag === 16) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "FreezeExecute" };
      }
      if (tag === 17) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "PermanentFreezeExecute" };
      }
      if (tag === 18) {
        fields["revokeCollectionPluginAuthorityV1Args.pluginType"] = { type: "string", value: "Groups" };
      }
    }
    if (o !== data.length) return null;
    return { name: "RevokeCollectionPluginAuthorityV1", fields };
  }
  if (discEq(data, DISC_BURNV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["burnV1Args.compressionProof.owner"] = { type: "string", value: v };
          o += 32;
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["burnV1Args.compressionProof.updateAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["burnV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["burnV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 2) {
            fields["burnV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Collection" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["burnV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["burnV1Args.compressionProof.name"] = { type: "string", value: s };
          o += n;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["burnV1Args.compressionProof.uri"] = { type: "string", value: s };
          o += n;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["burnV1Args.compressionProof.seq"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                const v = readU64Le(data, o);
                if (v == null) return null;
                obj["index"] = v.toString();
                o += 8;
              }
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "None";
                }
                if (tag === 1) {
                  nested["variant"] = "Owner";
                }
                if (tag === 2) {
                  nested["variant"] = "UpdateAuthority";
                }
                if (tag === 3) {
                  nested["variant"] = "Address";
                  { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                }
                obj["authority"] = nested;
              }
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Royalties";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["creators"] = arr;
                    }
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "ProgramAllowList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      if (tag === 2) {
                        nested["variant"] = "ProgramDenyList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      nested["ruleSet"] = nested;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 1) {
                  nested["variant"] = "FreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 2) {
                  nested["variant"] = "BurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 3) {
                  nested["variant"] = "TransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 4) {
                  nested["variant"] = "UpdateDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["additionalDelegates"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 5) {
                  nested["variant"] = "PermanentFreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 6) {
                  nested["variant"] = "Attributes";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["attributeList"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 7) {
                  nested["variant"] = "PermanentTransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 8) {
                  nested["variant"] = "PermanentBurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 9) {
                  nested["variant"] = "Edition";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 10) {
                  nested["variant"] = "MasterEdition";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 11) {
                  nested["variant"] = "AddBlocker";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 12) {
                  nested["variant"] = "ImmutableMetadata";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 13) {
                  nested["variant"] = "VerifiedCreators";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 14) {
                  nested["variant"] = "Autograph";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 15) {
                  nested["variant"] = "BubblegumV2";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 16) {
                  nested["variant"] = "FreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 17) {
                  nested["variant"] = "PermanentFreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 18) {
                  nested["variant"] = "Groups";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["groups"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                obj["plugin"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["burnV1Args.compressionProof.plugins"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "BurnV1", fields };
  }
  if (discEq(data, DISC_BURNCOLLECTIONV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["burnCollectionV1Args.compressionProof.owner"] = { type: "string", value: v };
          o += 32;
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["burnCollectionV1Args.compressionProof.updateAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["burnCollectionV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["burnCollectionV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 2) {
            fields["burnCollectionV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Collection" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["burnCollectionV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["burnCollectionV1Args.compressionProof.name"] = { type: "string", value: s };
          o += n;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["burnCollectionV1Args.compressionProof.uri"] = { type: "string", value: s };
          o += n;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["burnCollectionV1Args.compressionProof.seq"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                const v = readU64Le(data, o);
                if (v == null) return null;
                obj["index"] = v.toString();
                o += 8;
              }
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "None";
                }
                if (tag === 1) {
                  nested["variant"] = "Owner";
                }
                if (tag === 2) {
                  nested["variant"] = "UpdateAuthority";
                }
                if (tag === 3) {
                  nested["variant"] = "Address";
                  { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                }
                obj["authority"] = nested;
              }
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Royalties";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["creators"] = arr;
                    }
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "ProgramAllowList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      if (tag === 2) {
                        nested["variant"] = "ProgramDenyList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      nested["ruleSet"] = nested;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 1) {
                  nested["variant"] = "FreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 2) {
                  nested["variant"] = "BurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 3) {
                  nested["variant"] = "TransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 4) {
                  nested["variant"] = "UpdateDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["additionalDelegates"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 5) {
                  nested["variant"] = "PermanentFreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 6) {
                  nested["variant"] = "Attributes";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["attributeList"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 7) {
                  nested["variant"] = "PermanentTransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 8) {
                  nested["variant"] = "PermanentBurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 9) {
                  nested["variant"] = "Edition";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 10) {
                  nested["variant"] = "MasterEdition";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 11) {
                  nested["variant"] = "AddBlocker";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 12) {
                  nested["variant"] = "ImmutableMetadata";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 13) {
                  nested["variant"] = "VerifiedCreators";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 14) {
                  nested["variant"] = "Autograph";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 15) {
                  nested["variant"] = "BubblegumV2";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 16) {
                  nested["variant"] = "FreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 17) {
                  nested["variant"] = "PermanentFreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 18) {
                  nested["variant"] = "Groups";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["groups"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                obj["plugin"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["burnCollectionV1Args.compressionProof.plugins"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "BurnCollectionV1", fields };
  }
  if (discEq(data, DISC_TRANSFERV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["newOwner"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["transferV1Args.compressionProof.owner"] = { type: "string", value: v };
          o += 32;
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["transferV1Args.compressionProof.updateAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["transferV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["transferV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 2) {
            fields["transferV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Collection" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["transferV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["transferV1Args.compressionProof.name"] = { type: "string", value: s };
          o += n;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["transferV1Args.compressionProof.uri"] = { type: "string", value: s };
          o += n;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["transferV1Args.compressionProof.seq"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                const v = readU64Le(data, o);
                if (v == null) return null;
                obj["index"] = v.toString();
                o += 8;
              }
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "None";
                }
                if (tag === 1) {
                  nested["variant"] = "Owner";
                }
                if (tag === 2) {
                  nested["variant"] = "UpdateAuthority";
                }
                if (tag === 3) {
                  nested["variant"] = "Address";
                  { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                }
                obj["authority"] = nested;
              }
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Royalties";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["creators"] = arr;
                    }
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "ProgramAllowList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      if (tag === 2) {
                        nested["variant"] = "ProgramDenyList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      nested["ruleSet"] = nested;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 1) {
                  nested["variant"] = "FreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 2) {
                  nested["variant"] = "BurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 3) {
                  nested["variant"] = "TransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 4) {
                  nested["variant"] = "UpdateDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["additionalDelegates"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 5) {
                  nested["variant"] = "PermanentFreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 6) {
                  nested["variant"] = "Attributes";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["attributeList"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 7) {
                  nested["variant"] = "PermanentTransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 8) {
                  nested["variant"] = "PermanentBurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 9) {
                  nested["variant"] = "Edition";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 10) {
                  nested["variant"] = "MasterEdition";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 11) {
                  nested["variant"] = "AddBlocker";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 12) {
                  nested["variant"] = "ImmutableMetadata";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 13) {
                  nested["variant"] = "VerifiedCreators";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 14) {
                  nested["variant"] = "Autograph";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 15) {
                  nested["variant"] = "BubblegumV2";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 16) {
                  nested["variant"] = "FreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 17) {
                  nested["variant"] = "PermanentFreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 18) {
                  nested["variant"] = "Groups";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["groups"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                obj["plugin"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["transferV1Args.compressionProof.plugins"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "TransferV1", fields };
  }
  if (discEq(data, DISC_UPDATEV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateV1Args.newName"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateV1Args.newUri"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateV1Args.newUpdateAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateV1Args.newUpdateAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateV1Args.newUpdateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 2) {
            fields["updateV1Args.newUpdateAuthority"] = { type: "string", value: "Collection" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateV1Args.newUpdateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateV1", fields };
  }
  if (discEq(data, DISC_UPDATECOLLECTIONV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["newUpdateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateCollectionV1Args.newName"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateCollectionV1Args.newUri"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateCollectionV1", fields };
  }
  if (discEq(data, DISC_COMPRESSV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CompressV1", fields };
  }
  if (discEq(data, DISC_DECOMPRESSV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["decompressV1Args.compressionProof.owner"] = { type: "string", value: v };
      o += 32;
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["decompressV1Args.compressionProof.updateAuthority"] = { type: "string", value: "None" };
      }
      if (tag === 1) {
        fields["decompressV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Address" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["decompressV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 2) {
        fields["decompressV1Args.compressionProof.updateAuthority"] = { type: "string", value: "Collection" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["decompressV1Args.compressionProof.updateAuthority.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["decompressV1Args.compressionProof.name"] = { type: "string", value: s };
      o += n;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["decompressV1Args.compressionProof.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["decompressV1Args.compressionProof.seq"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      const arr: unknown[] = [];
      for (let _i = 0; _i < n; _i++) {
        {
          const obj: Record<string, unknown> = {};
          {
            const v = readU64Le(data, o);
            if (v == null) return null;
            obj["index"] = v.toString();
            o += 8;
          }
          {
            if (data.length <= o) return null;
            const tag = data[o]!; o += 1;
            const nested: Record<string, unknown> = { tag };
            if (tag === 0) {
              nested["variant"] = "None";
            }
            if (tag === 1) {
              nested["variant"] = "Owner";
            }
            if (tag === 2) {
              nested["variant"] = "UpdateAuthority";
            }
            if (tag === 3) {
              nested["variant"] = "Address";
              { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
            }
            obj["authority"] = nested;
          }
          {
            if (data.length <= o) return null;
            const tag = data[o]!; o += 1;
            const nested: Record<string, unknown> = { tag };
            if (tag === 0) {
              nested["variant"] = "Royalties";
              {
                const nested: Record<string, unknown> = {};
                { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < len; _i++) {
                    {
                      const obj: Record<string, unknown> = {};
                      { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                      if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                      arr.push(obj);
                    }
                  }
                  nested["creators"] = arr;
                }
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "None";
                  }
                  if (tag === 1) {
                    nested["variant"] = "ProgramAllowList";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["field0"] = arr;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "ProgramDenyList";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["field0"] = arr;
                    }
                  }
                  nested["ruleSet"] = nested;
                }
                nested["field0"] = nested;
              }
            }
            if (tag === 1) {
              nested["variant"] = "FreezeDelegate";
              {
                const nested: Record<string, unknown> = {};
                if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                nested["field0"] = nested;
              }
            }
            if (tag === 2) {
              nested["variant"] = "BurnDelegate";
              {
                const nested: Record<string, unknown> = {};
                nested["field0"] = nested;
              }
            }
            if (tag === 3) {
              nested["variant"] = "TransferDelegate";
              {
                const nested: Record<string, unknown> = {};
                nested["field0"] = nested;
              }
            }
            if (tag === 4) {
              nested["variant"] = "UpdateDelegate";
              {
                const nested: Record<string, unknown> = {};
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < len; _i++) {
                    { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                  }
                  nested["additionalDelegates"] = arr;
                }
                nested["field0"] = nested;
              }
            }
            if (tag === 5) {
              nested["variant"] = "PermanentFreezeDelegate";
              {
                const nested: Record<string, unknown> = {};
                if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                nested["field0"] = nested;
              }
            }
            if (tag === 6) {
              nested["variant"] = "Attributes";
              {
                const nested: Record<string, unknown> = {};
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < len; _i++) {
                    {
                      const obj: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                      arr.push(obj);
                    }
                  }
                  nested["attributeList"] = arr;
                }
                nested["field0"] = nested;
              }
            }
            if (tag === 7) {
              nested["variant"] = "PermanentTransferDelegate";
              {
                const nested: Record<string, unknown> = {};
                nested["field0"] = nested;
              }
            }
            if (tag === 8) {
              nested["variant"] = "PermanentBurnDelegate";
              {
                const nested: Record<string, unknown> = {};
                nested["field0"] = nested;
              }
            }
            if (tag === 9) {
              nested["variant"] = "Edition";
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                nested["field0"] = nested;
              }
            }
            if (tag === 10) {
              nested["variant"] = "MasterEdition";
              {
                const nested: Record<string, unknown> = {};
                if (data.length <= o) return null;
                { const opt = data[o]!; o += 1; if (opt === 1) {
                  { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                } }
                if (data.length <= o) return null;
                { const opt = data[o]!; o += 1; if (opt === 1) {
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    if (data.length < o + len) return null;
                    nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                  }
                } }
                if (data.length <= o) return null;
                { const opt = data[o]!; o += 1; if (opt === 1) {
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    if (data.length < o + len) return null;
                    nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                  }
                } }
                nested["field0"] = nested;
              }
            }
            if (tag === 11) {
              nested["variant"] = "AddBlocker";
              {
                const nested: Record<string, unknown> = {};
                nested["field0"] = nested;
              }
            }
            if (tag === 12) {
              nested["variant"] = "ImmutableMetadata";
              {
                const nested: Record<string, unknown> = {};
                nested["field0"] = nested;
              }
            }
            if (tag === 13) {
              nested["variant"] = "VerifiedCreators";
              {
                const nested: Record<string, unknown> = {};
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < len; _i++) {
                    {
                      const obj: Record<string, unknown> = {};
                      { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                      if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                      arr.push(obj);
                    }
                  }
                  nested["signatures"] = arr;
                }
                nested["field0"] = nested;
              }
            }
            if (tag === 14) {
              nested["variant"] = "Autograph";
              {
                const nested: Record<string, unknown> = {};
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < len; _i++) {
                    {
                      const obj: Record<string, unknown> = {};
                      { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                      arr.push(obj);
                    }
                  }
                  nested["signatures"] = arr;
                }
                nested["field0"] = nested;
              }
            }
            if (tag === 15) {
              nested["variant"] = "BubblegumV2";
              {
                const nested: Record<string, unknown> = {};
                nested["field0"] = nested;
              }
            }
            if (tag === 16) {
              nested["variant"] = "FreezeExecute";
              {
                const nested: Record<string, unknown> = {};
                if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                nested["field0"] = nested;
              }
            }
            if (tag === 17) {
              nested["variant"] = "PermanentFreezeExecute";
              {
                const nested: Record<string, unknown> = {};
                if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                nested["field0"] = nested;
              }
            }
            if (tag === 18) {
              nested["variant"] = "Groups";
              {
                const nested: Record<string, unknown> = {};
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < len; _i++) {
                    { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                  }
                  nested["groups"] = arr;
                }
                nested["field0"] = nested;
              }
            }
            obj["plugin"] = nested;
          }
          arr.push(obj);
        }
      }
      fields["decompressV1Args.compressionProof.plugins"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "DecompressV1", fields };
  }
  if (discEq(data, DISC_COLLECT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["recipient1"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["recipient2"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "Collect", fields };
  }
  if (discEq(data, DISC_CREATEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["createV2Args.dataState"] = { type: "string", value: "AccountState" };
      }
      if (tag === 1) {
        fields["createV2Args.dataState"] = { type: "string", value: "LedgerState" };
      }
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["createV2Args.name"] = { type: "string", value: s };
      o += n;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["createV2Args.uri"] = { type: "string", value: s };
      o += n;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Royalties";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["creators"] = arr;
                    }
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "ProgramAllowList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      if (tag === 2) {
                        nested["variant"] = "ProgramDenyList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      nested["ruleSet"] = nested;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 1) {
                  nested["variant"] = "FreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 2) {
                  nested["variant"] = "BurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 3) {
                  nested["variant"] = "TransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 4) {
                  nested["variant"] = "UpdateDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["additionalDelegates"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 5) {
                  nested["variant"] = "PermanentFreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 6) {
                  nested["variant"] = "Attributes";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["attributeList"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 7) {
                  nested["variant"] = "PermanentTransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 8) {
                  nested["variant"] = "PermanentBurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 9) {
                  nested["variant"] = "Edition";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 10) {
                  nested["variant"] = "MasterEdition";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 11) {
                  nested["variant"] = "AddBlocker";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 12) {
                  nested["variant"] = "ImmutableMetadata";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 13) {
                  nested["variant"] = "VerifiedCreators";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 14) {
                  nested["variant"] = "Autograph";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 15) {
                  nested["variant"] = "BubblegumV2";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 16) {
                  nested["variant"] = "FreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 17) {
                  nested["variant"] = "PermanentFreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 18) {
                  nested["variant"] = "Groups";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["groups"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                obj["plugin"] = nested;
              }
              if (data.length <= o) return null;
              { const opt = data[o]!; o += 1; if (opt === 1) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "None";
                  }
                  if (tag === 1) {
                    nested["variant"] = "Owner";
                  }
                  if (tag === 2) {
                    nested["variant"] = "UpdateAuthority";
                  }
                  if (tag === 3) {
                    nested["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                  }
                  obj["authority"] = nested;
                }
              } }
              arr.push(obj);
            }
          }
          fields["createV2Args.plugins"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!; o += 1;
              const obj: Record<string, unknown> = { tag };
              if (tag === 0) {
                obj["variant"] = "LifecycleHook";
                {
                  const nested: Record<string, unknown> = {};
                  { const v = readPubkey(data, o); if (v == null) return null; nested["hookedProgram"] = v; o += 32; }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "PreconfiguredProgram";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 1) {
                            obj["variant"] = "PreconfiguredCollection";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 2) {
                            obj["variant"] = "PreconfiguredOwner";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 3) {
                            obj["variant"] = "PreconfiguredRecipient";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 4) {
                            obj["variant"] = "PreconfiguredAsset";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 5) {
                            obj["variant"] = "CustomPda";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              const arr: unknown[] = [];
                              for (let _i = 0; _i < len; _i++) {
                                {
                                  if (data.length <= o) return null;
                                  const tag = data[o]!; o += 1;
                                  const obj: Record<string, unknown> = { tag };
                                  if (tag === 0) {
                                    obj["variant"] = "Collection";
                                  }
                                  if (tag === 1) {
                                    obj["variant"] = "Owner";
                                  }
                                  if (tag === 2) {
                                    obj["variant"] = "Recipient";
                                  }
                                  if (tag === 3) {
                                    obj["variant"] = "Asset";
                                  }
                                  if (tag === 4) {
                                    obj["variant"] = "Address";
                                    { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                                  }
                                  if (tag === 5) {
                                    obj["variant"] = "Bytes";
                                    {
                                      const len = readU32Le(data, o); if (len == null) return null;
                                      if (len > 4096) return null;
                                      o += 4;
                                      if (data.length < o + len) return null;
                                      obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                                    }
                                  }
                                  arr.push(obj);
                                }
                              }
                              obj["seeds"] = arr;
                            }
                            if (data.length <= o) return null;
                            { const opt = data[o]!; o += 1; if (opt === 1) {
                              { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                            } }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 6) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["extraAccounts"] = arr;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["dataAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 1) {
                obj["variant"] = "Oracle";
                {
                  const nested: Record<string, unknown> = {};
                  { const v = readPubkey(data, o); if (v == null) return null; nested["baseAddress"] = v; o += 32; }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "PreconfiguredProgram";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 1) {
                        nested["variant"] = "PreconfiguredCollection";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 2) {
                        nested["variant"] = "PreconfiguredOwner";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 3) {
                        nested["variant"] = "PreconfiguredRecipient";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 4) {
                        nested["variant"] = "PreconfiguredAsset";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 5) {
                        nested["variant"] = "CustomPda";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            {
                              if (data.length <= o) return null;
                              const tag = data[o]!; o += 1;
                              const obj: Record<string, unknown> = { tag };
                              if (tag === 0) {
                                obj["variant"] = "Collection";
                              }
                              if (tag === 1) {
                                obj["variant"] = "Owner";
                              }
                              if (tag === 2) {
                                obj["variant"] = "Recipient";
                              }
                              if (tag === 3) {
                                obj["variant"] = "Asset";
                              }
                              if (tag === 4) {
                                obj["variant"] = "Address";
                                { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                              }
                              if (tag === 5) {
                                obj["variant"] = "Bytes";
                                {
                                  const len = readU32Le(data, o); if (len == null) return null;
                                  if (len > 4096) return null;
                                  o += 4;
                                  if (data.length < o + len) return null;
                                  obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                                }
                              }
                              arr.push(obj);
                            }
                          }
                          nested["seeds"] = arr;
                        }
                        if (data.length <= o) return null;
                        { const opt = data[o]!; o += 1; if (opt === 1) {
                          { const v = readPubkey(data, o); if (v == null) return null; nested["custom_program_id"] = v; o += 32; }
                        } }
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 6) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      nested["baseAddressConfig"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "NoOffset";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Anchor";
                      }
                      if (tag === 2) {
                        nested["variant"] = "Custom";
                        {
                          const v = readU64Le(data, o);
                          if (v == null) return null;
                          nested["field0"] = v.toString();
                          o += 8;
                        }
                      }
                      nested["resultsOffset"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 2) {
                obj["variant"] = "AppData";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "None";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Owner";
                    }
                    if (tag === 2) {
                      nested["variant"] = "UpdateAuthority";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Address";
                      { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                    }
                    nested["dataAuthority"] = nested;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 3) {
                obj["variant"] = "LinkedLifecycleHook";
                {
                  const nested: Record<string, unknown> = {};
                  { const v = readPubkey(data, o); if (v == null) return null; nested["hookedProgram"] = v; o += 32; }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "PreconfiguredProgram";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 1) {
                            obj["variant"] = "PreconfiguredCollection";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 2) {
                            obj["variant"] = "PreconfiguredOwner";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 3) {
                            obj["variant"] = "PreconfiguredRecipient";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 4) {
                            obj["variant"] = "PreconfiguredAsset";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 5) {
                            obj["variant"] = "CustomPda";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              const arr: unknown[] = [];
                              for (let _i = 0; _i < len; _i++) {
                                {
                                  if (data.length <= o) return null;
                                  const tag = data[o]!; o += 1;
                                  const obj: Record<string, unknown> = { tag };
                                  if (tag === 0) {
                                    obj["variant"] = "Collection";
                                  }
                                  if (tag === 1) {
                                    obj["variant"] = "Owner";
                                  }
                                  if (tag === 2) {
                                    obj["variant"] = "Recipient";
                                  }
                                  if (tag === 3) {
                                    obj["variant"] = "Asset";
                                  }
                                  if (tag === 4) {
                                    obj["variant"] = "Address";
                                    { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                                  }
                                  if (tag === 5) {
                                    obj["variant"] = "Bytes";
                                    {
                                      const len = readU32Le(data, o); if (len == null) return null;
                                      if (len > 4096) return null;
                                      o += 4;
                                      if (data.length < o + len) return null;
                                      obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                                    }
                                  }
                                  arr.push(obj);
                                }
                              }
                              obj["seeds"] = arr;
                            }
                            if (data.length <= o) return null;
                            { const opt = data[o]!; o += 1; if (opt === 1) {
                              { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                            } }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 6) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["extraAccounts"] = arr;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["dataAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 4) {
                obj["variant"] = "LinkedAppData";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "None";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Owner";
                    }
                    if (tag === 2) {
                      nested["variant"] = "UpdateAuthority";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Address";
                      { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                    }
                    nested["dataAuthority"] = nested;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 5) {
                obj["variant"] = "DataSection";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "LinkedLifecycleHook";
                      { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                    }
                    if (tag === 1) {
                      nested["variant"] = "LinkedAppData";
                      {
                        if (data.length <= o) return null;
                        const tag = data[o]!; o += 1;
                        const nested: Record<string, unknown> = { tag };
                        if (tag === 0) {
                          nested["variant"] = "None";
                        }
                        if (tag === 1) {
                          nested["variant"] = "Owner";
                        }
                        if (tag === 2) {
                          nested["variant"] = "UpdateAuthority";
                        }
                        if (tag === 3) {
                          nested["variant"] = "Address";
                          { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                        }
                        nested["field0"] = nested;
                      }
                    }
                    nested["parentKey"] = nested;
                  }
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Binary";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Json";
                    }
                    if (tag === 2) {
                      nested["variant"] = "MsgPack";
                    }
                    nested["schema"] = nested;
                  }
                  obj["field0"] = nested;
                }
              }
              if (tag === 6) {
                obj["variant"] = "AgentIdentity";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    if (data.length < o + len) return null;
                    nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  obj["field0"] = nested;
                }
              }
              arr.push(obj);
            }
          }
          fields["createV2Args.externalPluginAdapters"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "CreateV2", fields };
  }
  if (discEq(data, DISC_CREATECOLLECTIONV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
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
      fields["createCollectionV2Args.name"] = { type: "string", value: s };
      o += n;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["createCollectionV2Args.uri"] = { type: "string", value: s };
      o += n;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Royalties";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU16Le(data, o); if (v == null) return null; nested["basisPoints"] = v; o += 2; }
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["percentage"] = data[o]!; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["creators"] = arr;
                    }
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "ProgramAllowList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      if (tag === 2) {
                        nested["variant"] = "ProgramDenyList";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                          }
                          nested["field0"] = arr;
                        }
                      }
                      nested["ruleSet"] = nested;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 1) {
                  nested["variant"] = "FreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 2) {
                  nested["variant"] = "BurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 3) {
                  nested["variant"] = "TransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 4) {
                  nested["variant"] = "UpdateDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["additionalDelegates"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 5) {
                  nested["variant"] = "PermanentFreezeDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 6) {
                  nested["variant"] = "Attributes";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["key"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["value"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["attributeList"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 7) {
                  nested["variant"] = "PermanentTransferDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 8) {
                  nested["variant"] = "PermanentBurnDelegate";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 9) {
                  nested["variant"] = "Edition";
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["number"] = v; o += 4; }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 10) {
                  nested["variant"] = "MasterEdition";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readU32Le(data, o); if (v == null) return null; nested["maxSupply"] = v; o += 4; }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["name"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        if (data.length < o + len) return null;
                        nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                      }
                    } }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 11) {
                  nested["variant"] = "AddBlocker";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 12) {
                  nested["variant"] = "ImmutableMetadata";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 13) {
                  nested["variant"] = "VerifiedCreators";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 14) {
                  nested["variant"] = "Autograph";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          const obj: Record<string, unknown> = {};
                          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            obj["message"] = readUtf8(data, o, len) ?? ""; o += len;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["signatures"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                if (tag === 15) {
                  nested["variant"] = "BubblegumV2";
                  {
                    const nested: Record<string, unknown> = {};
                    nested["field0"] = nested;
                  }
                }
                if (tag === 16) {
                  nested["variant"] = "FreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 17) {
                  nested["variant"] = "PermanentFreezeExecute";
                  {
                    const nested: Record<string, unknown> = {};
                    if (data.length <= o) return null; nested["frozen"] = data[o]! !== 0; o += 1;
                    nested["field0"] = nested;
                  }
                }
                if (tag === 18) {
                  nested["variant"] = "Groups";
                  {
                    const nested: Record<string, unknown> = {};
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
                      }
                      nested["groups"] = arr;
                    }
                    nested["field0"] = nested;
                  }
                }
                obj["plugin"] = nested;
              }
              if (data.length <= o) return null;
              { const opt = data[o]!; o += 1; if (opt === 1) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "None";
                  }
                  if (tag === 1) {
                    nested["variant"] = "Owner";
                  }
                  if (tag === 2) {
                    nested["variant"] = "UpdateAuthority";
                  }
                  if (tag === 3) {
                    nested["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                  }
                  obj["authority"] = nested;
                }
              } }
              arr.push(obj);
            }
          }
          fields["createCollectionV2Args.plugins"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!; o += 1;
              const obj: Record<string, unknown> = { tag };
              if (tag === 0) {
                obj["variant"] = "LifecycleHook";
                {
                  const nested: Record<string, unknown> = {};
                  { const v = readPubkey(data, o); if (v == null) return null; nested["hookedProgram"] = v; o += 32; }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "PreconfiguredProgram";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 1) {
                            obj["variant"] = "PreconfiguredCollection";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 2) {
                            obj["variant"] = "PreconfiguredOwner";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 3) {
                            obj["variant"] = "PreconfiguredRecipient";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 4) {
                            obj["variant"] = "PreconfiguredAsset";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 5) {
                            obj["variant"] = "CustomPda";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              const arr: unknown[] = [];
                              for (let _i = 0; _i < len; _i++) {
                                {
                                  if (data.length <= o) return null;
                                  const tag = data[o]!; o += 1;
                                  const obj: Record<string, unknown> = { tag };
                                  if (tag === 0) {
                                    obj["variant"] = "Collection";
                                  }
                                  if (tag === 1) {
                                    obj["variant"] = "Owner";
                                  }
                                  if (tag === 2) {
                                    obj["variant"] = "Recipient";
                                  }
                                  if (tag === 3) {
                                    obj["variant"] = "Asset";
                                  }
                                  if (tag === 4) {
                                    obj["variant"] = "Address";
                                    { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                                  }
                                  if (tag === 5) {
                                    obj["variant"] = "Bytes";
                                    {
                                      const len = readU32Le(data, o); if (len == null) return null;
                                      if (len > 4096) return null;
                                      o += 4;
                                      if (data.length < o + len) return null;
                                      obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                                    }
                                  }
                                  arr.push(obj);
                                }
                              }
                              obj["seeds"] = arr;
                            }
                            if (data.length <= o) return null;
                            { const opt = data[o]!; o += 1; if (opt === 1) {
                              { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                            } }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 6) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["extraAccounts"] = arr;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["dataAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 1) {
                obj["variant"] = "Oracle";
                {
                  const nested: Record<string, unknown> = {};
                  { const v = readPubkey(data, o); if (v == null) return null; nested["baseAddress"] = v; o += 32; }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "PreconfiguredProgram";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 1) {
                        nested["variant"] = "PreconfiguredCollection";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 2) {
                        nested["variant"] = "PreconfiguredOwner";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 3) {
                        nested["variant"] = "PreconfiguredRecipient";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 4) {
                        nested["variant"] = "PreconfiguredAsset";
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 5) {
                        nested["variant"] = "CustomPda";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          const arr: unknown[] = [];
                          for (let _i = 0; _i < len; _i++) {
                            {
                              if (data.length <= o) return null;
                              const tag = data[o]!; o += 1;
                              const obj: Record<string, unknown> = { tag };
                              if (tag === 0) {
                                obj["variant"] = "Collection";
                              }
                              if (tag === 1) {
                                obj["variant"] = "Owner";
                              }
                              if (tag === 2) {
                                obj["variant"] = "Recipient";
                              }
                              if (tag === 3) {
                                obj["variant"] = "Asset";
                              }
                              if (tag === 4) {
                                obj["variant"] = "Address";
                                { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                              }
                              if (tag === 5) {
                                obj["variant"] = "Bytes";
                                {
                                  const len = readU32Le(data, o); if (len == null) return null;
                                  if (len > 4096) return null;
                                  o += 4;
                                  if (data.length < o + len) return null;
                                  obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                                }
                              }
                              arr.push(obj);
                            }
                          }
                          nested["seeds"] = arr;
                        }
                        if (data.length <= o) return null;
                        { const opt = data[o]!; o += 1; if (opt === 1) {
                          { const v = readPubkey(data, o); if (v == null) return null; nested["custom_program_id"] = v; o += 32; }
                        } }
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      if (tag === 6) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                        if (data.length <= o) return null; nested["is_signer"] = data[o]! !== 0; o += 1;
                        if (data.length <= o) return null; nested["is_writable"] = data[o]! !== 0; o += 1;
                      }
                      nested["baseAddressConfig"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "NoOffset";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Anchor";
                      }
                      if (tag === 2) {
                        nested["variant"] = "Custom";
                        {
                          const v = readU64Le(data, o);
                          if (v == null) return null;
                          nested["field0"] = v.toString();
                          o += 8;
                        }
                      }
                      nested["resultsOffset"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 2) {
                obj["variant"] = "AppData";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "None";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Owner";
                    }
                    if (tag === 2) {
                      nested["variant"] = "UpdateAuthority";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Address";
                      { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                    }
                    nested["dataAuthority"] = nested;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 3) {
                obj["variant"] = "LinkedLifecycleHook";
                {
                  const nested: Record<string, unknown> = {};
                  { const v = readPubkey(data, o); if (v == null) return null; nested["hookedProgram"] = v; o += 32; }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "PreconfiguredProgram";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 1) {
                            obj["variant"] = "PreconfiguredCollection";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 2) {
                            obj["variant"] = "PreconfiguredOwner";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 3) {
                            obj["variant"] = "PreconfiguredRecipient";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 4) {
                            obj["variant"] = "PreconfiguredAsset";
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 5) {
                            obj["variant"] = "CustomPda";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              const arr: unknown[] = [];
                              for (let _i = 0; _i < len; _i++) {
                                {
                                  if (data.length <= o) return null;
                                  const tag = data[o]!; o += 1;
                                  const obj: Record<string, unknown> = { tag };
                                  if (tag === 0) {
                                    obj["variant"] = "Collection";
                                  }
                                  if (tag === 1) {
                                    obj["variant"] = "Owner";
                                  }
                                  if (tag === 2) {
                                    obj["variant"] = "Recipient";
                                  }
                                  if (tag === 3) {
                                    obj["variant"] = "Asset";
                                  }
                                  if (tag === 4) {
                                    obj["variant"] = "Address";
                                    { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                                  }
                                  if (tag === 5) {
                                    obj["variant"] = "Bytes";
                                    {
                                      const len = readU32Le(data, o); if (len == null) return null;
                                      if (len > 4096) return null;
                                      o += 4;
                                      if (data.length < o + len) return null;
                                      obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                                    }
                                  }
                                  arr.push(obj);
                                }
                              }
                              obj["seeds"] = arr;
                            }
                            if (data.length <= o) return null;
                            { const opt = data[o]!; o += 1; if (opt === 1) {
                              { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                            } }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          if (tag === 6) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                            if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                            if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                          }
                          arr.push(obj);
                        }
                      }
                      nested["extraAccounts"] = arr;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["dataAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 4) {
                obj["variant"] = "LinkedAppData";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "None";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Owner";
                    }
                    if (tag === 2) {
                      nested["variant"] = "UpdateAuthority";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Address";
                      { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                    }
                    nested["dataAuthority"] = nested;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "Binary";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Json";
                      }
                      if (tag === 2) {
                        nested["variant"] = "MsgPack";
                      }
                      nested["schema"] = nested;
                    }
                  } }
                  obj["field0"] = nested;
                }
              }
              if (tag === 5) {
                obj["variant"] = "DataSection";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "LinkedLifecycleHook";
                      { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                    }
                    if (tag === 1) {
                      nested["variant"] = "LinkedAppData";
                      {
                        if (data.length <= o) return null;
                        const tag = data[o]!; o += 1;
                        const nested: Record<string, unknown> = { tag };
                        if (tag === 0) {
                          nested["variant"] = "None";
                        }
                        if (tag === 1) {
                          nested["variant"] = "Owner";
                        }
                        if (tag === 2) {
                          nested["variant"] = "UpdateAuthority";
                        }
                        if (tag === 3) {
                          nested["variant"] = "Address";
                          { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                        }
                        nested["field0"] = nested;
                      }
                    }
                    nested["parentKey"] = nested;
                  }
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Binary";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Json";
                    }
                    if (tag === 2) {
                      nested["variant"] = "MsgPack";
                    }
                    nested["schema"] = nested;
                  }
                  obj["field0"] = nested;
                }
              }
              if (tag === 6) {
                obj["variant"] = "AgentIdentity";
                {
                  const nested: Record<string, unknown> = {};
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    if (data.length < o + len) return null;
                    nested["uri"] = readUtf8(data, o, len) ?? ""; o += len;
                  }
                  if (data.length <= o) return null;
                  { const opt = data[o]!; o += 1; if (opt === 1) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const nested: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        nested["variant"] = "None";
                      }
                      if (tag === 1) {
                        nested["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        nested["variant"] = "UpdateAuthority";
                      }
                      if (tag === 3) {
                        nested["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; nested["address"] = v; o += 32; }
                      }
                      nested["initPluginAuthority"] = nested;
                    }
                  } }
                  {
                    const len = readU32Le(data, o); if (len == null) return null;
                    if (len > 4096) return null;
                    o += 4;
                    const arr: unknown[] = [];
                    for (let _i = 0; _i < len; _i++) {
                      {
                        const obj: Record<string, unknown> = {};
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const nested: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            nested["variant"] = "Create";
                          }
                          if (tag === 1) {
                            nested["variant"] = "Transfer";
                          }
                          if (tag === 2) {
                            nested["variant"] = "Burn";
                          }
                          if (tag === 3) {
                            nested["variant"] = "Update";
                          }
                          if (tag === 4) {
                            nested["variant"] = "Execute";
                          }
                          obj["field0"] = nested;
                        }
                        {
                          const nested: Record<string, unknown> = {};
                          { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                          obj["field1"] = nested;
                        }
                        arr.push(obj);
                      }
                    }
                    nested["lifecycleChecks"] = arr;
                  }
                  obj["field0"] = nested;
                }
              }
              arr.push(obj);
            }
          }
          fields["createCollectionV2Args.externalPluginAdapters"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "CreateCollectionV2", fields };
  }
  if (discEq(data, DISC_ADDEXTERNALPLUGINADAPTERV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["addExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["addExternalPluginAdapterV1Args.initInfo.field0.hookedProgram"] = { type: "string", value: v };
          o += 32;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["addExternalPluginAdapterV1Args.initInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 1) {
        fields["addExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddress"] = { type: "string", value: v };
          o += 32;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredProgram" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredCollection" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredOwner" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredRecipient" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 4) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredAsset" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 5) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "CustomPda" };
                {
                  const len = readU32Le(data, o);
                  if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const n = len;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < n; _i++) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const obj: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        obj["variant"] = "Collection";
                      }
                      if (tag === 1) {
                        obj["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        obj["variant"] = "Recipient";
                      }
                      if (tag === 3) {
                        obj["variant"] = "Asset";
                      }
                      if (tag === 4) {
                        obj["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                      }
                      if (tag === 5) {
                        obj["variant"] = "Bytes";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          if (data.length < o + len) return null;
                          obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                        }
                      }
                      arr.push(obj);
                    }
                  }
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.seeds"] = { type: "json", value: JSON.stringify(arr) };
                }
                if (data.length <= o) return null;
                {
                  const opt = data[o]!;
                  o += 1;
                  if (opt === 1) {
                    {
                      const v = readPubkey(data, o);
                      if (v == null) return null;
                      fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.custom_program_id"] = { type: "string", value: v };
                      o += 32;
                    }
                  }
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 6) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.address"] = { type: "string", value: v };
                  o += 32;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.resultsOffset"] = { type: "string", value: "NoOffset" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.resultsOffset"] = { type: "string", value: "Anchor" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.resultsOffset"] = { type: "string", value: "Custom" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.resultsOffset.field0"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
            }
          }
        }
      }
      if (tag === 2) {
        fields["addExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 3) {
        fields["addExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["addExternalPluginAdapterV1Args.initInfo.field0.hookedProgram"] = { type: "string", value: v };
          o += 32;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["addExternalPluginAdapterV1Args.initInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 4) {
        fields["addExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 5) {
        fields["addExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
          }
          if (tag === 1) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
          }
          if (tag === 2) {
            fields["addExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
          }
        }
      }
      if (tag === 6) {
        fields["addExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "AgentIdentity" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["addExternalPluginAdapterV1Args.initInfo.field0.uri"] = { type: "string", value: s };
          o += n;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "AddExternalPluginAdapterV1", fields };
  }
  if (discEq(data, DISC_ADDCOLLECTIONEXTERNALPLUGINADAPTERV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["addCollectionExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.hookedProgram"] = { type: "string", value: v };
          o += 32;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 1) {
        fields["addCollectionExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddress"] = { type: "string", value: v };
          o += 32;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredProgram" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredCollection" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredOwner" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredRecipient" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 4) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredAsset" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 5) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "CustomPda" };
                {
                  const len = readU32Le(data, o);
                  if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const n = len;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < n; _i++) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const obj: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        obj["variant"] = "Collection";
                      }
                      if (tag === 1) {
                        obj["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        obj["variant"] = "Recipient";
                      }
                      if (tag === 3) {
                        obj["variant"] = "Asset";
                      }
                      if (tag === 4) {
                        obj["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                      }
                      if (tag === 5) {
                        obj["variant"] = "Bytes";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          if (data.length < o + len) return null;
                          obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                        }
                      }
                      arr.push(obj);
                    }
                  }
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.seeds"] = { type: "json", value: JSON.stringify(arr) };
                }
                if (data.length <= o) return null;
                {
                  const opt = data[o]!;
                  o += 1;
                  if (opt === 1) {
                    {
                      const v = readPubkey(data, o);
                      if (v == null) return null;
                      fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.custom_program_id"] = { type: "string", value: v };
                      o += 32;
                    }
                  }
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 6) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.address"] = { type: "string", value: v };
                  o += 32;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.resultsOffset"] = { type: "string", value: "NoOffset" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.resultsOffset"] = { type: "string", value: "Anchor" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.resultsOffset"] = { type: "string", value: "Custom" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.resultsOffset.field0"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
            }
          }
        }
      }
      if (tag === 2) {
        fields["addCollectionExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 3) {
        fields["addCollectionExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.hookedProgram"] = { type: "string", value: v };
          o += 32;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 4) {
        fields["addCollectionExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 5) {
        fields["addCollectionExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Binary" };
          }
          if (tag === 1) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "Json" };
          }
          if (tag === 2) {
            fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema"] = { type: "string", value: "MsgPack" };
          }
        }
      }
      if (tag === 6) {
        fields["addCollectionExternalPluginAdapterV1Args.initInfo"] = { type: "string", value: "AgentIdentity" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.uri"] = { type: "string", value: s };
          o += n;
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          const arr: unknown[] = [];
          for (let _i = 0; _i < n; _i++) {
            {
              const obj: Record<string, unknown> = {};
              {
                if (data.length <= o) return null;
                const tag = data[o]!; o += 1;
                const nested: Record<string, unknown> = { tag };
                if (tag === 0) {
                  nested["variant"] = "Create";
                }
                if (tag === 1) {
                  nested["variant"] = "Transfer";
                }
                if (tag === 2) {
                  nested["variant"] = "Burn";
                }
                if (tag === 3) {
                  nested["variant"] = "Update";
                }
                if (tag === 4) {
                  nested["variant"] = "Execute";
                }
                obj["field0"] = nested;
              }
              {
                const nested: Record<string, unknown> = {};
                { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                obj["field1"] = nested;
              }
              arr.push(obj);
            }
          }
          fields["addCollectionExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "AddCollectionExternalPluginAdapterV1", fields };
  }
  if (discEq(data, DISC_REMOVEEXTERNALPLUGINADAPTERV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["removeExternalPluginAdapterV1Args.key"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 1) {
        fields["removeExternalPluginAdapterV1Args.key"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 2) {
        fields["removeExternalPluginAdapterV1Args.key"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["removeExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 3) {
        fields["removeExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 4) {
        fields["removeExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["removeExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 5) {
        fields["removeExternalPluginAdapterV1Args.key"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["removeExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["removeExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["removeExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["removeExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["removeExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["removeExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["removeExternalPluginAdapterV1Args.key.field0.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
      }
      if (tag === 6) {
        fields["removeExternalPluginAdapterV1Args.key"] = { type: "string", value: "AgentIdentity" };
      }
    }
    if (o !== data.length) return null;
    return { name: "RemoveExternalPluginAdapterV1", fields };
  }
  if (discEq(data, DISC_REMOVECOLLECTIONEXTERNALPLUGINADAPTERV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["removeCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 1) {
        fields["removeCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 2) {
        fields["removeCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["removeCollectionExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 3) {
        fields["removeCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 4) {
        fields["removeCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["removeCollectionExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 5) {
        fields["removeCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["removeCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["removeCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["removeCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["removeCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["removeCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["removeCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["removeCollectionExternalPluginAdapterV1Args.key.field0.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
      }
      if (tag === 6) {
        fields["removeCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "AgentIdentity" };
      }
    }
    if (o !== data.length) return null;
    return { name: "RemoveCollectionExternalPluginAdapterV1", fields };
  }
  if (discEq(data, DISC_UPDATEEXTERNALPLUGINADAPTERV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updateExternalPluginAdapterV1Args.key"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 1) {
        fields["updateExternalPluginAdapterV1Args.key"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 2) {
        fields["updateExternalPluginAdapterV1Args.key"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 3) {
        fields["updateExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 4) {
        fields["updateExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 5) {
        fields["updateExternalPluginAdapterV1Args.key"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["updateExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["updateExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["updateExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["updateExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.key.field0.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
      }
      if (tag === 6) {
        fields["updateExternalPluginAdapterV1Args.key"] = { type: "string", value: "AgentIdentity" };
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updateExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "LifecycleHook" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["updateExternalPluginAdapterV1Args.updateInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 1) {
        fields["updateExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "Oracle" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredProgram" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 1) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredCollection" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 2) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredOwner" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 3) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredRecipient" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 4) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredAsset" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 5) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "CustomPda" };
                {
                  const len = readU32Le(data, o);
                  if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const n = len;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < n; _i++) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const obj: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        obj["variant"] = "Collection";
                      }
                      if (tag === 1) {
                        obj["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        obj["variant"] = "Recipient";
                      }
                      if (tag === 3) {
                        obj["variant"] = "Asset";
                      }
                      if (tag === 4) {
                        obj["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                      }
                      if (tag === 5) {
                        obj["variant"] = "Bytes";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          if (data.length < o + len) return null;
                          obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                        }
                      }
                      arr.push(obj);
                    }
                  }
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.seeds"] = { type: "json", value: JSON.stringify(arr) };
                }
                if (data.length <= o) return null;
                {
                  const opt = data[o]!;
                  o += 1;
                  if (opt === 1) {
                    {
                      const v = readPubkey(data, o);
                      if (v == null) return null;
                      fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.custom_program_id"] = { type: "string", value: v };
                      o += 32;
                    }
                  }
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 6) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.address"] = { type: "string", value: v };
                  o += 32;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset"] = { type: "string", value: "NoOffset" };
              }
              if (tag === 1) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset"] = { type: "string", value: "Anchor" };
              }
              if (tag === 2) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset"] = { type: "string", value: "Custom" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["updateExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset.field0"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
            }
          }
        }
      }
      if (tag === 2) {
        fields["updateExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "AppData" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 3) {
        fields["updateExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "LinkedLifecycleHook" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["updateExternalPluginAdapterV1Args.updateInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 4) {
        fields["updateExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "LinkedAppData" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 5) {
        fields["updateExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "AgentIdentity" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["updateExternalPluginAdapterV1Args.updateInfo.field0.uri"] = { type: "string", value: s };
              o += n;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateExternalPluginAdapterV1", fields };
  }
  if (discEq(data, DISC_UPDATECOLLECTIONEXTERNALPLUGINADAPTERV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updateCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 1) {
        fields["updateCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 2) {
        fields["updateCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateCollectionExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 3) {
        fields["updateCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 4) {
        fields["updateCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateCollectionExternalPluginAdapterV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 5) {
        fields["updateCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["updateCollectionExternalPluginAdapterV1Args.key.field0"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["updateCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["updateCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["updateCollectionExternalPluginAdapterV1Args.key.field0.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.key.field0.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
      }
      if (tag === 6) {
        fields["updateCollectionExternalPluginAdapterV1Args.key"] = { type: "string", value: "AgentIdentity" };
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updateCollectionExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "LifecycleHook" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 1) {
        fields["updateCollectionExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "Oracle" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredProgram" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 1) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredCollection" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 2) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredOwner" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 3) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredRecipient" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 4) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "PreconfiguredAsset" };
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 5) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "CustomPda" };
                {
                  const len = readU32Le(data, o);
                  if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  const n = len;
                  const arr: unknown[] = [];
                  for (let _i = 0; _i < n; _i++) {
                    {
                      if (data.length <= o) return null;
                      const tag = data[o]!; o += 1;
                      const obj: Record<string, unknown> = { tag };
                      if (tag === 0) {
                        obj["variant"] = "Collection";
                      }
                      if (tag === 1) {
                        obj["variant"] = "Owner";
                      }
                      if (tag === 2) {
                        obj["variant"] = "Recipient";
                      }
                      if (tag === 3) {
                        obj["variant"] = "Asset";
                      }
                      if (tag === 4) {
                        obj["variant"] = "Address";
                        { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                      }
                      if (tag === 5) {
                        obj["variant"] = "Bytes";
                        {
                          const len = readU32Le(data, o); if (len == null) return null;
                          if (len > 4096) return null;
                          o += 4;
                          if (data.length < o + len) return null;
                          obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                        }
                      }
                      arr.push(obj);
                    }
                  }
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.seeds"] = { type: "json", value: JSON.stringify(arr) };
                }
                if (data.length <= o) return null;
                {
                  const opt = data[o]!;
                  o += 1;
                  if (opt === 1) {
                    {
                      const v = readPubkey(data, o);
                      if (v == null) return null;
                      fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.custom_program_id"] = { type: "string", value: v };
                      o += 32;
                    }
                  }
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
              if (tag === 6) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.address"] = { type: "string", value: v };
                  o += 32;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer"] = { type: "bool", value: v };
                  o += 1;
                }
                {
                  const v = readBool(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable"] = { type: "bool", value: v };
                  o += 1;
                }
              }
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset"] = { type: "string", value: "NoOffset" };
              }
              if (tag === 1) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset"] = { type: "string", value: "Anchor" };
              }
              if (tag === 2) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset"] = { type: "string", value: "Custom" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset.field0"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
            }
          }
        }
      }
      if (tag === 2) {
        fields["updateCollectionExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "AppData" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 3) {
        fields["updateCollectionExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "LinkedLifecycleHook" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const obj: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    obj["variant"] = "PreconfiguredProgram";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 1) {
                    obj["variant"] = "PreconfiguredCollection";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 2) {
                    obj["variant"] = "PreconfiguredOwner";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 3) {
                    obj["variant"] = "PreconfiguredRecipient";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 4) {
                    obj["variant"] = "PreconfiguredAsset";
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 5) {
                    obj["variant"] = "CustomPda";
                    {
                      const len = readU32Le(data, o); if (len == null) return null;
                      if (len > 4096) return null;
                      o += 4;
                      const arr: unknown[] = [];
                      for (let _i = 0; _i < len; _i++) {
                        {
                          if (data.length <= o) return null;
                          const tag = data[o]!; o += 1;
                          const obj: Record<string, unknown> = { tag };
                          if (tag === 0) {
                            obj["variant"] = "Collection";
                          }
                          if (tag === 1) {
                            obj["variant"] = "Owner";
                          }
                          if (tag === 2) {
                            obj["variant"] = "Recipient";
                          }
                          if (tag === 3) {
                            obj["variant"] = "Asset";
                          }
                          if (tag === 4) {
                            obj["variant"] = "Address";
                            { const v = readPubkey(data, o); if (v == null) return null; obj["field0"] = v; o += 32; }
                          }
                          if (tag === 5) {
                            obj["variant"] = "Bytes";
                            {
                              const len = readU32Le(data, o); if (len == null) return null;
                              if (len > 4096) return null;
                              o += 4;
                              if (data.length < o + len) return null;
                              obj["field0"] = encodeBase58(data.subarray(o, o + len)); o += len;
                            }
                          }
                          arr.push(obj);
                        }
                      }
                      obj["seeds"] = arr;
                    }
                    if (data.length <= o) return null;
                    { const opt = data[o]!; o += 1; if (opt === 1) {
                      { const v = readPubkey(data, o); if (v == null) return null; obj["custom_program_id"] = v; o += 32; }
                    } }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  if (tag === 6) {
                    obj["variant"] = "Address";
                    { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
                    if (data.length <= o) return null; obj["is_signer"] = data[o]! !== 0; o += 1;
                    if (data.length <= o) return null; obj["is_writable"] = data[o]! !== 0; o += 1;
                  }
                  arr.push(obj);
                }
              }
              fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.extraAccounts"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 4) {
        fields["updateCollectionExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "LinkedAppData" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Binary" };
              }
              if (tag === 1) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "Json" };
              }
              if (tag === 2) {
                fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema"] = { type: "string", value: "MsgPack" };
              }
            }
          }
        }
      }
      if (tag === 5) {
        fields["updateCollectionExternalPluginAdapterV1Args.updateInfo"] = { type: "string", value: "AgentIdentity" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              if (data.length < o + n) return null;
              const s = readUtf8(data, o, n);
              if (s == null) return null;
              fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.uri"] = { type: "string", value: s };
              o += n;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const n = len;
              const arr: unknown[] = [];
              for (let _i = 0; _i < n; _i++) {
                {
                  const obj: Record<string, unknown> = {};
                  {
                    if (data.length <= o) return null;
                    const tag = data[o]!; o += 1;
                    const nested: Record<string, unknown> = { tag };
                    if (tag === 0) {
                      nested["variant"] = "Create";
                    }
                    if (tag === 1) {
                      nested["variant"] = "Transfer";
                    }
                    if (tag === 2) {
                      nested["variant"] = "Burn";
                    }
                    if (tag === 3) {
                      nested["variant"] = "Update";
                    }
                    if (tag === 4) {
                      nested["variant"] = "Execute";
                    }
                    obj["field0"] = nested;
                  }
                  {
                    const nested: Record<string, unknown> = {};
                    { const v = readU32Le(data, o); if (v == null) return null; nested["flags"] = v; o += 4; }
                    obj["field1"] = nested;
                  }
                  arr.push(obj);
                }
              }
              fields["updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateCollectionExternalPluginAdapterV1", fields };
  }
  if (discEq(data, DISC_WRITEEXTERNALPLUGINADAPTERDATAV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["buffer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["writeExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 1) {
        fields["writeExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 2) {
        fields["writeExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["writeExternalPluginAdapterDataV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 3) {
        fields["writeExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 4) {
        fields["writeExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["writeExternalPluginAdapterDataV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 5) {
        fields["writeExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["writeExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["writeExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["writeExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["writeExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["writeExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["writeExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["writeExternalPluginAdapterDataV1Args.key.field0.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
      }
      if (tag === 6) {
        fields["writeExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "AgentIdentity" };
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          fields["writeExternalPluginAdapterDataV1Args.data"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + n)) };
          o += n;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "WriteExternalPluginAdapterDataV1", fields };
  }
  if (discEq(data, DISC_WRITECOLLECTIONEXTERNALPLUGINADAPTERDATAV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["buffer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["writeCollectionExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "LifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 1) {
        fields["writeCollectionExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "Oracle" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 2) {
        fields["writeCollectionExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "AppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 3) {
        fields["writeCollectionExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "LinkedLifecycleHook" };
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: v };
          o += 32;
        }
      }
      if (tag === 4) {
        fields["writeCollectionExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "LinkedAppData" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Owner" };
          }
          if (tag === 2) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "UpdateAuthority" };
          }
          if (tag === 3) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.address"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
      if (tag === 5) {
        fields["writeCollectionExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "DataSection" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "LinkedLifecycleHook" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 1) {
            fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0"] = { type: "string", value: "LinkedAppData" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "None" };
              }
              if (tag === 1) {
                fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "Owner" };
              }
              if (tag === 2) {
                fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "UpdateAuthority" };
              }
              if (tag === 3) {
                fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0"] = { type: "string", value: "Address" };
                {
                  const v = readPubkey(data, o);
                  if (v == null) return null;
                  fields["writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0.address"] = { type: "string", value: v };
                  o += 32;
                }
              }
            }
          }
        }
      }
      if (tag === 6) {
        fields["writeCollectionExternalPluginAdapterDataV1Args.key"] = { type: "string", value: "AgentIdentity" };
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          fields["writeCollectionExternalPluginAdapterDataV1Args.data"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + n)) };
          o += n;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "WriteCollectionExternalPluginAdapterDataV1", fields };
  }
  if (discEq(data, DISC_UPDATEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["newCollection"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["logWrapper"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateV2Args.newName"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateV2Args.newUri"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateV2Args.newUpdateAuthority"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateV2Args.newUpdateAuthority"] = { type: "string", value: "Address" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateV2Args.newUpdateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
          if (tag === 2) {
            fields["updateV2Args.newUpdateAuthority"] = { type: "string", value: "Collection" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateV2Args.newUpdateAuthority.field0"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateV2", fields };
  }
  if (discEq(data, DISC_EXECUTEV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["asset"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["assetSigner"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["programId"] = { type: "string", value: a }; }
    let o = 1;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      fields["executeV1Args.instructionData"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + n)) };
      o += n;
    }
    if (o !== data.length) return null;
    return { name: "ExecuteV1", fields };
  }
  if (discEq(data, DISC_UPDATECOLLECTIONINFOV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["bubblegumSigner"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updateCollectionInfoV1Args.updateType"] = { type: "string", value: "Mint" };
      }
      if (tag === 1) {
        fields["updateCollectionInfoV1Args.updateType"] = { type: "string", value: "Add" };
      }
      if (tag === 2) {
        fields["updateCollectionInfoV1Args.updateType"] = { type: "string", value: "Remove" };
      }
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["updateCollectionInfoV1Args.amount"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "UpdateCollectionInfoV1", fields };
  }
  if (discEq(data, DISC_ADDCOLLECTIONSTOGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "AddCollectionsToGroupV1", fields };
  }
  if (discEq(data, DISC_REMOVECOLLECTIONSFROMGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      const arr: unknown[] = [];
      for (let _i = 0; _i < n; _i++) {
        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
      }
      fields["removeCollectionsFromGroupV1Args.collections"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "RemoveCollectionsFromGroupV1", fields };
  }
  if (discEq(data, DISC_ADDASSETSTOGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "AddAssetsToGroupV1", fields };
  }
  if (discEq(data, DISC_REMOVEASSETSFROMGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      const arr: unknown[] = [];
      for (let _i = 0; _i < n; _i++) {
        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
      }
      fields["removeAssetsFromGroupV1Args.assets"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "RemoveAssetsFromGroupV1", fields };
  }
  if (discEq(data, DISC_ADDGROUPSTOGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["parentGroup"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      const arr: unknown[] = [];
      for (let _i = 0; _i < n; _i++) {
        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
      }
      fields["addGroupsToGroupV1Args.groups"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "AddGroupsToGroupV1", fields };
  }
  if (discEq(data, DISC_REMOVEGROUPSFROMGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["parentGroup"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      const arr: unknown[] = [];
      for (let _i = 0; _i < n; _i++) {
        { const v = readPubkey(data, o); if (v == null) return null; arr.push(v); o += 32; }
      }
      fields["removeGroupsFromGroupV1Args.groups"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "RemoveGroupsFromGroupV1", fields };
  }
  if (discEq(data, DISC_CREATEGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
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
      fields["createGroupV1Args.name"] = { type: "string", value: s };
      o += n;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["createGroupV1Args.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      const arr: unknown[] = [];
      for (let _i = 0; _i < n; _i++) {
        {
          const obj: Record<string, unknown> = {};
          {
            if (data.length <= o) return null;
            const tag = data[o]!; o += 1;
            const nested: Record<string, unknown> = { tag };
            if (tag === 0) {
              nested["variant"] = "Collection";
            }
            if (tag === 1) {
              nested["variant"] = "ChildGroup";
            }
            if (tag === 2) {
              nested["variant"] = "ParentGroup";
            }
            if (tag === 3) {
              nested["variant"] = "Asset";
            }
            obj["kind"] = nested;
          }
          { const v = readPubkey(data, o); if (v == null) return null; obj["key"] = v; o += 32; }
          arr.push(obj);
        }
      }
      fields["createGroupV1Args.relationships"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "CreateGroupV1", fields };
  }
  if (discEq(data, DISC_CLOSEGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CloseGroupV1", fields };
  }
  if (discEq(data, DISC_UPDATEGROUPV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["newUpdateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateGroupV1Args.newName"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateGroupV1Args.newUri"] = { type: "string", value: s };
          o += n;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateGroupV1", fields };
  }
  return null;
}

export const FIELD_SCHEMA = [
  {
    "instruction": "CreateV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "createV1Args.dataState",
        "type": "string"
      },
      {
        "name": "createV1Args.name",
        "type": "string"
      },
      {
        "name": "createV1Args.uri",
        "type": "string"
      },
      {
        "name": "createV1Args.plugins",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "CreateCollectionV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "createCollectionV1Args.name",
        "type": "string"
      },
      {
        "name": "createCollectionV1Args.uri",
        "type": "string"
      },
      {
        "name": "createCollectionV1Args.plugins",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "AddPluginV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "addPluginV1Args.plugin",
        "type": "string"
      },
      {
        "name": "addPluginV1Args.plugin.field0.basisPoints",
        "type": "number"
      },
      {
        "name": "addPluginV1Args.plugin.field0.creators",
        "type": "json"
      },
      {
        "name": "addPluginV1Args.plugin.field0.ruleSet",
        "type": "string"
      },
      {
        "name": "addPluginV1Args.plugin.field0.ruleSet.field0",
        "type": "json"
      },
      {
        "name": "addPluginV1Args.plugin.field0.frozen",
        "type": "bool"
      },
      {
        "name": "addPluginV1Args.plugin.field0.additionalDelegates",
        "type": "json"
      },
      {
        "name": "addPluginV1Args.plugin.field0.attributeList",
        "type": "json"
      },
      {
        "name": "addPluginV1Args.plugin.field0.number",
        "type": "number"
      },
      {
        "name": "addPluginV1Args.plugin.field0.maxSupply",
        "type": "number"
      },
      {
        "name": "addPluginV1Args.plugin.field0.name",
        "type": "string"
      },
      {
        "name": "addPluginV1Args.plugin.field0.uri",
        "type": "string"
      },
      {
        "name": "addPluginV1Args.plugin.field0.signatures",
        "type": "json"
      },
      {
        "name": "addPluginV1Args.plugin.field0.groups",
        "type": "json"
      },
      {
        "name": "addPluginV1Args.initAuthority",
        "type": "string"
      },
      {
        "name": "addPluginV1Args.initAuthority.address",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "AddCollectionPluginV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "addCollectionPluginV1Args.plugin",
        "type": "string"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.basisPoints",
        "type": "number"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.creators",
        "type": "json"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.ruleSet",
        "type": "string"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.ruleSet.field0",
        "type": "json"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.frozen",
        "type": "bool"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.additionalDelegates",
        "type": "json"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.attributeList",
        "type": "json"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.number",
        "type": "number"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.maxSupply",
        "type": "number"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.name",
        "type": "string"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.uri",
        "type": "string"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.signatures",
        "type": "json"
      },
      {
        "name": "addCollectionPluginV1Args.plugin.field0.groups",
        "type": "json"
      },
      {
        "name": "addCollectionPluginV1Args.initAuthority",
        "type": "string"
      },
      {
        "name": "addCollectionPluginV1Args.initAuthority.address",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RemovePluginV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "removePluginV1Args.pluginType",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RemoveCollectionPluginV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "removeCollectionPluginV1Args.pluginType",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdatePluginV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "updatePluginV1Args.plugin",
        "type": "string"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.basisPoints",
        "type": "number"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.creators",
        "type": "json"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.ruleSet",
        "type": "string"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.ruleSet.field0",
        "type": "json"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.frozen",
        "type": "bool"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.additionalDelegates",
        "type": "json"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.attributeList",
        "type": "json"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.number",
        "type": "number"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.maxSupply",
        "type": "number"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.name",
        "type": "string"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.uri",
        "type": "string"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.signatures",
        "type": "json"
      },
      {
        "name": "updatePluginV1Args.plugin.field0.groups",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "UpdateCollectionPluginV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin",
        "type": "string"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.basisPoints",
        "type": "number"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.creators",
        "type": "json"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.ruleSet",
        "type": "string"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.ruleSet.field0",
        "type": "json"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.frozen",
        "type": "bool"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.additionalDelegates",
        "type": "json"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.attributeList",
        "type": "json"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.number",
        "type": "number"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.maxSupply",
        "type": "number"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.name",
        "type": "string"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.uri",
        "type": "string"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.signatures",
        "type": "json"
      },
      {
        "name": "updateCollectionPluginV1Args.plugin.field0.groups",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "ApprovePluginAuthorityV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "approvePluginAuthorityV1Args.pluginType",
        "type": "string"
      },
      {
        "name": "approvePluginAuthorityV1Args.newAuthority",
        "type": "string"
      },
      {
        "name": "approvePluginAuthorityV1Args.newAuthority.address",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "ApproveCollectionPluginAuthorityV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "approveCollectionPluginAuthorityV1Args.pluginType",
        "type": "string"
      },
      {
        "name": "approveCollectionPluginAuthorityV1Args.newAuthority",
        "type": "string"
      },
      {
        "name": "approveCollectionPluginAuthorityV1Args.newAuthority.address",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RevokePluginAuthorityV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "revokePluginAuthorityV1Args.pluginType",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RevokeCollectionPluginAuthorityV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "revokeCollectionPluginAuthorityV1Args.pluginType",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "BurnV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "burnV1Args.compressionProof.owner",
        "type": "string"
      },
      {
        "name": "burnV1Args.compressionProof.updateAuthority",
        "type": "string"
      },
      {
        "name": "burnV1Args.compressionProof.updateAuthority.field0",
        "type": "string"
      },
      {
        "name": "burnV1Args.compressionProof.name",
        "type": "string"
      },
      {
        "name": "burnV1Args.compressionProof.uri",
        "type": "string"
      },
      {
        "name": "burnV1Args.compressionProof.seq",
        "type": "bigint"
      },
      {
        "name": "burnV1Args.compressionProof.plugins",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "BurnCollectionV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "burnCollectionV1Args.compressionProof.owner",
        "type": "string"
      },
      {
        "name": "burnCollectionV1Args.compressionProof.updateAuthority",
        "type": "string"
      },
      {
        "name": "burnCollectionV1Args.compressionProof.updateAuthority.field0",
        "type": "string"
      },
      {
        "name": "burnCollectionV1Args.compressionProof.name",
        "type": "string"
      },
      {
        "name": "burnCollectionV1Args.compressionProof.uri",
        "type": "string"
      },
      {
        "name": "burnCollectionV1Args.compressionProof.seq",
        "type": "bigint"
      },
      {
        "name": "burnCollectionV1Args.compressionProof.plugins",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "TransferV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "newOwner",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "transferV1Args.compressionProof.owner",
        "type": "string"
      },
      {
        "name": "transferV1Args.compressionProof.updateAuthority",
        "type": "string"
      },
      {
        "name": "transferV1Args.compressionProof.updateAuthority.field0",
        "type": "string"
      },
      {
        "name": "transferV1Args.compressionProof.name",
        "type": "string"
      },
      {
        "name": "transferV1Args.compressionProof.uri",
        "type": "string"
      },
      {
        "name": "transferV1Args.compressionProof.seq",
        "type": "bigint"
      },
      {
        "name": "transferV1Args.compressionProof.plugins",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "UpdateV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "updateV1Args.newName",
        "type": "string"
      },
      {
        "name": "updateV1Args.newUri",
        "type": "string"
      },
      {
        "name": "updateV1Args.newUpdateAuthority",
        "type": "string"
      },
      {
        "name": "updateV1Args.newUpdateAuthority.field0",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdateCollectionV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "newUpdateAuthority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "updateCollectionV1Args.newName",
        "type": "string"
      },
      {
        "name": "updateCollectionV1Args.newUri",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CompressV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "DecompressV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "decompressV1Args.compressionProof.owner",
        "type": "string"
      },
      {
        "name": "decompressV1Args.compressionProof.updateAuthority",
        "type": "string"
      },
      {
        "name": "decompressV1Args.compressionProof.updateAuthority.field0",
        "type": "string"
      },
      {
        "name": "decompressV1Args.compressionProof.name",
        "type": "string"
      },
      {
        "name": "decompressV1Args.compressionProof.uri",
        "type": "string"
      },
      {
        "name": "decompressV1Args.compressionProof.seq",
        "type": "bigint"
      },
      {
        "name": "decompressV1Args.compressionProof.plugins",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "Collect",
    "fields": [
      {
        "name": "recipient1",
        "type": "string"
      },
      {
        "name": "recipient2",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CreateV2",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "createV2Args.dataState",
        "type": "string"
      },
      {
        "name": "createV2Args.name",
        "type": "string"
      },
      {
        "name": "createV2Args.uri",
        "type": "string"
      },
      {
        "name": "createV2Args.plugins",
        "type": "json"
      },
      {
        "name": "createV2Args.externalPluginAdapters",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "CreateCollectionV2",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "createCollectionV2Args.name",
        "type": "string"
      },
      {
        "name": "createCollectionV2Args.uri",
        "type": "string"
      },
      {
        "name": "createCollectionV2Args.plugins",
        "type": "json"
      },
      {
        "name": "createCollectionV2Args.externalPluginAdapters",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "AddExternalPluginAdapterV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.hookedProgram",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks",
        "type": "json"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.extraAccounts",
        "type": "json"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.schema",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.baseAddress",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer",
        "type": "bool"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable",
        "type": "bool"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.seeds",
        "type": "json"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.custom_program_id",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.address",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.resultsOffset",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.resultsOffset.field0",
        "type": "bigint"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.parentKey",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0.address",
        "type": "string"
      },
      {
        "name": "addExternalPluginAdapterV1Args.initInfo.field0.uri",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "AddCollectionExternalPluginAdapterV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.hookedProgram",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.initPluginAuthority.address",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.lifecycleChecks",
        "type": "json"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.extraAccounts",
        "type": "json"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.dataAuthority.address",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.schema",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddress",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_signer",
        "type": "bool"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.is_writable",
        "type": "bool"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.seeds",
        "type": "json"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.custom_program_id",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.baseAddressConfig.address",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.resultsOffset",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.resultsOffset.field0",
        "type": "bigint"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.parentKey.field0.address",
        "type": "string"
      },
      {
        "name": "addCollectionExternalPluginAdapterV1Args.initInfo.field0.uri",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RemoveExternalPluginAdapterV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "removeExternalPluginAdapterV1Args.key",
        "type": "string"
      },
      {
        "name": "removeExternalPluginAdapterV1Args.key.field0",
        "type": "string"
      },
      {
        "name": "removeExternalPluginAdapterV1Args.key.field0.address",
        "type": "string"
      },
      {
        "name": "removeExternalPluginAdapterV1Args.key.field0.field0",
        "type": "string"
      },
      {
        "name": "removeExternalPluginAdapterV1Args.key.field0.field0.address",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RemoveCollectionExternalPluginAdapterV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "removeCollectionExternalPluginAdapterV1Args.key",
        "type": "string"
      },
      {
        "name": "removeCollectionExternalPluginAdapterV1Args.key.field0",
        "type": "string"
      },
      {
        "name": "removeCollectionExternalPluginAdapterV1Args.key.field0.address",
        "type": "string"
      },
      {
        "name": "removeCollectionExternalPluginAdapterV1Args.key.field0.field0",
        "type": "string"
      },
      {
        "name": "removeCollectionExternalPluginAdapterV1Args.key.field0.field0.address",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdateExternalPluginAdapterV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.key",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.key.field0",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.key.field0.address",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.key.field0.field0",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.key.field0.field0.address",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks",
        "type": "json"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.extraAccounts",
        "type": "json"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.schema",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer",
        "type": "bool"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable",
        "type": "bool"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.seeds",
        "type": "json"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.custom_program_id",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.address",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset",
        "type": "string"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset.field0",
        "type": "bigint"
      },
      {
        "name": "updateExternalPluginAdapterV1Args.updateInfo.field0.uri",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdateCollectionExternalPluginAdapterV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.key",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.key.field0",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.key.field0.address",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.key.field0.field0",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.key.field0.field0.address",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.lifecycleChecks",
        "type": "json"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.extraAccounts",
        "type": "json"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.schema",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_signer",
        "type": "bool"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.is_writable",
        "type": "bool"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.seeds",
        "type": "json"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.custom_program_id",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.baseAddressConfig.address",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset",
        "type": "string"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.resultsOffset.field0",
        "type": "bigint"
      },
      {
        "name": "updateCollectionExternalPluginAdapterV1Args.updateInfo.field0.uri",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "WriteExternalPluginAdapterDataV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "buffer",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "writeExternalPluginAdapterDataV1Args.key",
        "type": "string"
      },
      {
        "name": "writeExternalPluginAdapterDataV1Args.key.field0",
        "type": "string"
      },
      {
        "name": "writeExternalPluginAdapterDataV1Args.key.field0.address",
        "type": "string"
      },
      {
        "name": "writeExternalPluginAdapterDataV1Args.key.field0.field0",
        "type": "string"
      },
      {
        "name": "writeExternalPluginAdapterDataV1Args.key.field0.field0.address",
        "type": "string"
      },
      {
        "name": "writeExternalPluginAdapterDataV1Args.data",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "WriteCollectionExternalPluginAdapterDataV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "buffer",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "writeCollectionExternalPluginAdapterDataV1Args.key",
        "type": "string"
      },
      {
        "name": "writeCollectionExternalPluginAdapterDataV1Args.key.field0",
        "type": "string"
      },
      {
        "name": "writeCollectionExternalPluginAdapterDataV1Args.key.field0.address",
        "type": "string"
      },
      {
        "name": "writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0",
        "type": "string"
      },
      {
        "name": "writeCollectionExternalPluginAdapterDataV1Args.key.field0.field0.address",
        "type": "string"
      },
      {
        "name": "writeCollectionExternalPluginAdapterDataV1Args.data",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "UpdateV2",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "newCollection",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "updateV2Args.newName",
        "type": "string"
      },
      {
        "name": "updateV2Args.newUri",
        "type": "string"
      },
      {
        "name": "updateV2Args.newUpdateAuthority",
        "type": "string"
      },
      {
        "name": "updateV2Args.newUpdateAuthority.field0",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "ExecuteV1",
    "fields": [
      {
        "name": "asset",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "assetSigner",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "programId",
        "type": "string"
      },
      {
        "name": "executeV1Args.instructionData",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "UpdateCollectionInfoV1",
    "fields": [
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "bubblegumSigner",
        "type": "string"
      },
      {
        "name": "updateCollectionInfoV1Args.updateType",
        "type": "string"
      },
      {
        "name": "updateCollectionInfoV1Args.amount",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "AddCollectionsToGroupV1",
    "fields": [
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RemoveCollectionsFromGroupV1",
    "fields": [
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "removeCollectionsFromGroupV1Args.collections",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "AddAssetsToGroupV1",
    "fields": [
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RemoveAssetsFromGroupV1",
    "fields": [
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "removeAssetsFromGroupV1Args.assets",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "AddGroupsToGroupV1",
    "fields": [
      {
        "name": "parentGroup",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "addGroupsToGroupV1Args.groups",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "RemoveGroupsFromGroupV1",
    "fields": [
      {
        "name": "parentGroup",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "removeGroupsFromGroupV1Args.groups",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "CreateGroupV1",
    "fields": [
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "createGroupV1Args.name",
        "type": "string"
      },
      {
        "name": "createGroupV1Args.uri",
        "type": "string"
      },
      {
        "name": "createGroupV1Args.relationships",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "CloseGroupV1",
    "fields": [
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdateGroupV1",
    "fields": [
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "newUpdateAuthority",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "updateGroupV1Args.newName",
        "type": "string"
      },
      {
        "name": "updateGroupV1Args.newUri",
        "type": "string"
      }
    ]
  }
] as const;

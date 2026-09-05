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

export const PROGRAM_ID = "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY" as const;

export type GeneratedIx = {
  name: string;
  fields: Record<string, { type: "bigint" | "number" | "string" | "bool" | "bytes" | "json"; value: bigint | number | string | boolean }>;
};

const DISC_BURN = new Uint8Array([116,110,29,56,107,219,42,93]);
const DISC_BURNV2 = new Uint8Array([224,220,154,179,9,190,169,110]);
const DISC_CANCELREDEEM = new Uint8Array([175,110,240,172,96,214,232,35]);
const DISC_CLOSETREEV2 = new Uint8Array([114,39,232,120,227,81,24,20]);
const DISC_COLLECTV2 = new Uint8Array([107,88,240,56,214,107,176,207]);
const DISC_COMPRESS = new Uint8Array([82,193,176,117,176,21,115,253]);
const DISC_CREATETREE = new Uint8Array([203,215,130,32,127,163,60,146]);
const DISC_CREATETREEV2 = new Uint8Array([17,13,214,215,81,231,99,202]);
const DISC_DECOMPRESSV1 = new Uint8Array([250,27,208,214,80,24,176,73]);
const DISC_DELEGATE = new Uint8Array([90,147,75,178,85,88,4,137]);
const DISC_DELEGATEANDFREEZEV2 = new Uint8Array([180,68,137,86,107,70,2,19]);
const DISC_DELEGATEV2 = new Uint8Array([49,177,248,122,46,82,9,197]);
const DISC_FREEZEV2 = new Uint8Array([185,63,130,20,244,98,191,85]);
const DISC_MINTTOCOLLECTIONV1 = new Uint8Array([108,252,248,84,117,189,144,58]);
const DISC_MINTV1 = new Uint8Array([254,205,116,98,30,28,105,59]);
const DISC_MINTV2 = new Uint8Array([226,206,57,36,62,78,199,56]);
const DISC_REDEEM = new Uint8Array([184,12,86,149,70,196,97,225]);
const DISC_SETANDVERIFYCOLLECTION = new Uint8Array([145,12,124,64,188,234,17,10]);
const DISC_SETCOLLECTIONV2 = new Uint8Array([70,82,82,77,94,12,207,222]);
const DISC_SETDECOMPRESSABLESTATE = new Uint8Array([161,126,11,212,34,85,166,217]);
const DISC_SETDECOMPRESSIBLESTATE = new Uint8Array([105,211,114,32,64,249,90,1]);
const DISC_SETNONTRANSFERABLEV2 = new Uint8Array([97,93,128,72,199,94,67,91]);
const DISC_SETTREEDELEGATE = new Uint8Array([23,59,2,8,193,186,90,77]);
const DISC_THAWANDREVOKEV2 = new Uint8Array([40,81,64,96,208,121,207,195]);
const DISC_THAWV2 = new Uint8Array([159,79,202,210,74,224,109,103]);
const DISC_TRANSFER = new Uint8Array([163,52,200,231,140,3,69,186]);
const DISC_TRANSFERV2 = new Uint8Array([180,155,21,130,73,72,72,197]);
const DISC_UNVERIFYCOLLECTION = new Uint8Array([124,52,40,25,127,236,141,239]);
const DISC_UNVERIFYCREATOR = new Uint8Array([186,253,75,29,186,237,228,104]);
const DISC_UNVERIFYCREATORV2 = new Uint8Array([20,211,246,152,197,214,248,230]);
const DISC_UPDATEASSETDATAV2 = new Uint8Array([149,201,129,79,119,135,214,144]);
const DISC_UPDATEMETADATA = new Uint8Array([86,141,19,14,222,190,66,197]);
const DISC_UPDATEMETADATAV2 = new Uint8Array([226,173,169,155,61,45,184,200]);
const DISC_VERIFYCOLLECTION = new Uint8Array([110,149,176,130,128,219,88,251]);
const DISC_VERIFYCREATOR = new Uint8Array([61,28,199,240,117,191,157,215]);
const DISC_VERIFYCREATORV2 = new Uint8Array([69,117,244,169,228,70,94,140]);

export function tryDecode(
  data: Uint8Array,
  accounts: readonly { address: string }[],
): GeneratedIx | null {
  if (discEq(data, DISC_BURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "burn", fields };
  }
  if (discEq(data, DISC_BURNV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["mplCoreCpiSigner"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["mplCoreProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "burnV2", fields };
  }
  if (discEq(data, DISC_CANCELREDEEM)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["voucher"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (o !== data.length) return null;
    return { name: "cancelRedeem", fields };
  }
  if (discEq(data, DISC_CLOSETREEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["recipient"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["feeRecipient"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (o !== data.length) return null;
    return { name: "closeTreeV2", fields };
  }
  if (discEq(data, DISC_COLLECTV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    let o = 8;
    if (o !== data.length) return null;
    return { name: "collectV2", fields };
  }
  if (discEq(data, DISC_COMPRESS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["tokenMetadataProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (o !== data.length) return null;
    return { name: "compress", fields };
  }
  if (discEq(data, DISC_CREATETREE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["treeCreator"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["maxDepth"] = { type: "number", value: v };
      o += 4;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["maxBufferSize"] = { type: "number", value: v };
      o += 4;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["public"] = { type: "bool", value: v };
          o += 1;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "createTree", fields };
  }
  if (discEq(data, DISC_CREATETREEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["treeCreator"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["maxDepth"] = { type: "number", value: v };
      o += 4;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["maxBufferSize"] = { type: "number", value: v };
      o += 4;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["public"] = { type: "bool", value: v };
          o += 1;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "createTreeV2", fields };
  }
  if (discEq(data, DISC_DECOMPRESSV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["voucher"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["sysvarRent"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["tokenMetadataProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["associatedTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    let o = 8;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["metadata.name"] = { type: "string", value: s };
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
      fields["metadata.symbol"] = { type: "string", value: s };
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
      fields["metadata.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["metadata.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["metadata.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["metadata.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["metadata.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["metadata.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["metadata.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["metadata.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["metadata.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["metadata.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["metadata.collection.key"] = { type: "string", value: v };
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
            fields["metadata.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["metadata.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["metadata.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["metadata.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["metadata.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["metadata.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["metadata.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["metadata.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "decompressV1", fields };
  }
  if (discEq(data, DISC_DELEGATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["previousLeafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["newLeafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "delegate", fields };
  }
  if (discEq(data, DISC_DELEGATEANDFREEZEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["previousLeafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["newLeafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["collectionHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "delegateAndFreezeV2", fields };
  }
  if (discEq(data, DISC_DELEGATEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["previousLeafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["newLeafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["collectionHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "delegateV2", fields };
  }
  if (discEq(data, DISC_FREEZEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "freezeV2", fields };
  }
  if (discEq(data, DISC_MINTTOCOLLECTIONV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["treeDelegate"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["collectionAuthorityRecordPda"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["editionAccount"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["bubblegumSigner"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["tokenMetadataProgram"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["metadataArgs.name"] = { type: "string", value: s };
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
      fields["metadataArgs.symbol"] = { type: "string", value: s };
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
      fields["metadataArgs.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["metadataArgs.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["metadataArgs.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["metadataArgs.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["metadataArgs.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["metadataArgs.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["metadataArgs.collection.key"] = { type: "string", value: v };
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
            fields["metadataArgs.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["metadataArgs.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["metadataArgs.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["metadataArgs.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["metadataArgs.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["metadataArgs.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["metadataArgs.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["metadataArgs.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "mintToCollectionV1", fields };
  }
  if (discEq(data, DISC_MINTV1)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["treeDelegate"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["message.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["message.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection.key"] = { type: "string", value: v };
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
            fields["message.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["message.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["message.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "mintV1", fields };
  }
  if (discEq(data, DISC_MINTV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["treeDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["mplCoreCpiSigner"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["mplCoreProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    {
      const len = readU32Le(data, o);
      if (len == null) return null;
      if (len > 4096) return null;
      o += 4;
      const n = len;
      if (data.length < o + n) return null;
      const s = readUtf8(data, o, n);
      if (s == null) return null;
      fields["metadataArgs.name"] = { type: "string", value: s };
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
      fields["metadataArgs.symbol"] = { type: "string", value: s };
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
      fields["metadataArgs.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["metadataArgs.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["metadataArgs.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["metadataArgs.isMutable"] = { type: "bool", value: v };
      o += 1;
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
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["metadataArgs.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["metadataArgs.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["metadataArgs.collection"] = { type: "string", value: v };
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
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          fields["assetData"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + n)) };
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
            fields["assetDataSchema"] = { type: "string", value: "Binary" };
          }
          if (tag === 1) {
            fields["assetDataSchema"] = { type: "string", value: "Json" };
          }
          if (tag === 2) {
            fields["assetDataSchema"] = { type: "string", value: "MsgPack" };
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "mintV2", fields };
  }
  if (discEq(data, DISC_REDEEM)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["voucher"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "redeem", fields };
  }
  if (discEq(data, DISC_SETANDVERIFYCOLLECTION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["treeDelegate"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["collectionAuthorityRecordPda"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["editionAccount"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["bubblegumSigner"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["tokenMetadataProgram"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["message.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["message.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection.key"] = { type: "string", value: v };
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
            fields["message.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["message.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["message.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["collection"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "setAndVerifyCollection", fields };
  }
  if (discEq(data, DISC_SETCOLLECTIONV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["newCollectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["newCoreCollection"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["mplCoreCpiSigner"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["mplCoreProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "setCollectionV2", fields };
  }
  if (discEq(data, DISC_SETDECOMPRESSABLESTATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["treeCreator"] = { type: "string", value: a }; }
    let o = 8;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["decompressableState"] = { type: "string", value: "Enabled" };
      }
      if (tag === 1) {
        fields["decompressableState"] = { type: "string", value: "Disabled" };
      }
    }
    if (o !== data.length) return null;
    return { name: "setDecompressableState", fields };
  }
  if (discEq(data, DISC_SETDECOMPRESSIBLESTATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["treeCreator"] = { type: "string", value: a }; }
    let o = 8;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["decompressableState"] = { type: "string", value: "Enabled" };
      }
      if (tag === 1) {
        fields["decompressableState"] = { type: "string", value: "Disabled" };
      }
    }
    if (o !== data.length) return null;
    return { name: "setDecompressibleState", fields };
  }
  if (discEq(data, DISC_SETNONTRANSFERABLEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "setNonTransferableV2", fields };
  }
  if (discEq(data, DISC_SETTREEDELEGATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["treeCreator"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["newTreeDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (o !== data.length) return null;
    return { name: "setTreeDelegate", fields };
  }
  if (discEq(data, DISC_THAWANDREVOKEV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["collectionHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "thawAndRevokeV2", fields };
  }
  if (discEq(data, DISC_THAWV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "thawV2", fields };
  }
  if (discEq(data, DISC_TRANSFER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["newLeafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "transfer", fields };
  }
  if (discEq(data, DISC_TRANSFERV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["newLeafOwner"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
    }
    if (o !== data.length) return null;
    return { name: "transferV2", fields };
  }
  if (discEq(data, DISC_UNVERIFYCOLLECTION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["treeDelegate"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["collectionAuthorityRecordPda"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["editionAccount"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["bubblegumSigner"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["tokenMetadataProgram"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["message.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["message.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection.key"] = { type: "string", value: v };
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
            fields["message.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["message.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["message.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "unverifyCollection", fields };
  }
  if (discEq(data, DISC_UNVERIFYCREATOR)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["creator"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["message.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["message.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection.key"] = { type: "string", value: v };
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
            fields["message.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["message.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["message.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "unverifyCreator", fields };
  }
  if (discEq(data, DISC_UNVERIFYCREATORV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["creator"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "unverifyCreatorV2", fields };
  }
  if (discEq(data, DISC_UPDATEASSETDATAV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["previousAssetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
          fields["newAssetData"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + n)) };
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
            fields["newAssetDataSchema"] = { type: "string", value: "Binary" };
          }
          if (tag === 1) {
            fields["newAssetDataSchema"] = { type: "string", value: "Json" };
          }
          if (tag === 2) {
            fields["newAssetDataSchema"] = { type: "string", value: "MsgPack" };
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateAssetDataV2", fields };
  }
  if (discEq(data, DISC_UPDATEMETADATA)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["collectionAuthorityRecordPda"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["tokenMetadataProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["currentMetadata.name"] = { type: "string", value: s };
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
      fields["currentMetadata.symbol"] = { type: "string", value: s };
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
      fields["currentMetadata.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["currentMetadata.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["currentMetadata.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["currentMetadata.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["currentMetadata.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["currentMetadata.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["currentMetadata.collection.key"] = { type: "string", value: v };
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
            fields["currentMetadata.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["currentMetadata.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["currentMetadata.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["currentMetadata.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["currentMetadata.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["currentMetadata.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["currentMetadata.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["currentMetadata.creators"] = { type: "json", value: JSON.stringify(arr) };
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
          fields["updateArgs.name"] = { type: "string", value: s };
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
          fields["updateArgs.symbol"] = { type: "string", value: s };
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
          fields["updateArgs.uri"] = { type: "string", value: s };
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
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
              if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
              arr.push(obj);
            }
          }
          fields["updateArgs.creators"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["updateArgs.sellerFeeBasisPoints"] = { type: "number", value: v };
          o += 2;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateArgs.primarySaleHappened"] = { type: "bool", value: v };
          o += 1;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateArgs.isMutable"] = { type: "bool", value: v };
          o += 1;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateMetadata", fields };
  }
  if (discEq(data, DISC_UPDATEMETADATAV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["coreCollection"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["currentMetadata.name"] = { type: "string", value: s };
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
      fields["currentMetadata.symbol"] = { type: "string", value: s };
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
      fields["currentMetadata.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["currentMetadata.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["currentMetadata.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["currentMetadata.isMutable"] = { type: "bool", value: v };
      o += 1;
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
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["currentMetadata.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["currentMetadata.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["currentMetadata.collection"] = { type: "string", value: v };
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
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["updateArgs.name"] = { type: "string", value: s };
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
          fields["updateArgs.symbol"] = { type: "string", value: s };
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
          fields["updateArgs.uri"] = { type: "string", value: s };
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
              { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
              if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
              if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
              arr.push(obj);
            }
          }
          fields["updateArgs.creators"] = { type: "json", value: JSON.stringify(arr) };
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["updateArgs.sellerFeeBasisPoints"] = { type: "number", value: v };
          o += 2;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateArgs.primarySaleHappened"] = { type: "bool", value: v };
          o += 1;
        }
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateArgs.isMutable"] = { type: "bool", value: v };
          o += 1;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateMetadataV2", fields };
  }
  if (discEq(data, DISC_VERIFYCOLLECTION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["treeDelegate"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["collectionAuthorityRecordPda"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["editionAccount"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["bubblegumSigner"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["tokenMetadataProgram"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["message.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["message.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection.key"] = { type: "string", value: v };
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
            fields["message.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["message.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["message.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "verifyCollection", fields };
  }
  if (discEq(data, DISC_VERIFYCREATOR)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["creator"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["dataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length < o + 32) return null;
    fields["creatorHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["message.editionNonce"] = { type: "number", value: data[o]! };
        o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["message.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection.key"] = { type: "string", value: v };
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
            fields["message.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["message.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["message.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["message.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Original" };
      }
      if (tag === 1) {
        fields["message.tokenProgramVersion"] = { type: "string", value: "Token2022" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "verifyCreator", fields };
  }
  if (discEq(data, DISC_VERIFYCREATORV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["treeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["creator"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["leafOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["leafDelegate"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["merkleTree"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["logWrapper"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["compressionProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length < o + 32) return null;
    fields["root"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
    o += 32;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length < o + 32) return null;
        fields["assetDataHash"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 32)) };
        o += 32;
      }
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        if (data.length <= o) return null;
        fields["flags"] = { type: "number", value: data[o]! };
        o += 1;
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["nonce"] = { type: "bigint", value: v };
      o += 8;
    }
    {
      const v = readU32Le(data, o);
      if (v == null) return null;
      fields["index"] = { type: "number", value: v };
      o += 4;
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
      fields["message.name"] = { type: "string", value: s };
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
      fields["message.symbol"] = { type: "string", value: s };
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
      fields["message.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["message.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.primarySaleHappened"] = { type: "bool", value: v };
      o += 1;
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["message.isMutable"] = { type: "bool", value: v };
      o += 1;
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
            fields["message.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["message.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["message.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["message.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
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
          { const v = readPubkey(data, o); if (v == null) return null; obj["address"] = v; o += 32; }
          if (data.length <= o) return null; obj["verified"] = data[o]! !== 0; o += 1;
          if (data.length <= o) return null; obj["share"] = data[o]!; o += 1;
          arr.push(obj);
        }
      }
      fields["message.creators"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["message.collection"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "verifyCreatorV2", fields };
  }
  return null;
}

export const FIELD_SCHEMA = [
  {
    "instruction": "burn",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "burnV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "mplCoreCpiSigner",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "mplCoreProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "cancelRedeem",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "voucher",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "closeTreeV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "recipient",
        "type": "string"
      },
      {
        "name": "feeRecipient",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "collectV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "compress",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "tokenMetadataProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "createTree",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeCreator",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "maxDepth",
        "type": "number"
      },
      {
        "name": "maxBufferSize",
        "type": "number"
      },
      {
        "name": "public",
        "type": "bool"
      }
    ]
  },
  {
    "instruction": "createTreeV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeCreator",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "maxDepth",
        "type": "number"
      },
      {
        "name": "maxBufferSize",
        "type": "number"
      },
      {
        "name": "public",
        "type": "bool"
      }
    ]
  },
  {
    "instruction": "decompressV1",
    "fields": [
      {
        "name": "voucher",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarRent",
        "type": "string"
      },
      {
        "name": "tokenMetadataProgram",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "associatedTokenProgram",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "metadata.name",
        "type": "string"
      },
      {
        "name": "metadata.symbol",
        "type": "string"
      },
      {
        "name": "metadata.uri",
        "type": "string"
      },
      {
        "name": "metadata.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "metadata.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "metadata.isMutable",
        "type": "bool"
      },
      {
        "name": "metadata.editionNonce",
        "type": "number"
      },
      {
        "name": "metadata.tokenStandard",
        "type": "string"
      },
      {
        "name": "metadata.collection.verified",
        "type": "bool"
      },
      {
        "name": "metadata.collection.key",
        "type": "string"
      },
      {
        "name": "metadata.uses.useMethod",
        "type": "string"
      },
      {
        "name": "metadata.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "metadata.uses.total",
        "type": "bigint"
      },
      {
        "name": "metadata.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "metadata.creators",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "delegate",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "previousLeafDelegate",
        "type": "string"
      },
      {
        "name": "newLeafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "delegateAndFreezeV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "previousLeafDelegate",
        "type": "string"
      },
      {
        "name": "newLeafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "collectionHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "delegateV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "previousLeafDelegate",
        "type": "string"
      },
      {
        "name": "newLeafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "collectionHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "freezeV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "mintToCollectionV1",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeDelegate",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecordPda",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "editionAccount",
        "type": "string"
      },
      {
        "name": "bubblegumSigner",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "tokenMetadataProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "metadataArgs.name",
        "type": "string"
      },
      {
        "name": "metadataArgs.symbol",
        "type": "string"
      },
      {
        "name": "metadataArgs.uri",
        "type": "string"
      },
      {
        "name": "metadataArgs.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "metadataArgs.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "metadataArgs.isMutable",
        "type": "bool"
      },
      {
        "name": "metadataArgs.editionNonce",
        "type": "number"
      },
      {
        "name": "metadataArgs.tokenStandard",
        "type": "string"
      },
      {
        "name": "metadataArgs.collection.verified",
        "type": "bool"
      },
      {
        "name": "metadataArgs.collection.key",
        "type": "string"
      },
      {
        "name": "metadataArgs.uses.useMethod",
        "type": "string"
      },
      {
        "name": "metadataArgs.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "metadataArgs.uses.total",
        "type": "bigint"
      },
      {
        "name": "metadataArgs.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "metadataArgs.creators",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "mintV1",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeDelegate",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.editionNonce",
        "type": "number"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.collection.verified",
        "type": "bool"
      },
      {
        "name": "message.collection.key",
        "type": "string"
      },
      {
        "name": "message.uses.useMethod",
        "type": "string"
      },
      {
        "name": "message.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "message.uses.total",
        "type": "bigint"
      },
      {
        "name": "message.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "mintV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeDelegate",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "mplCoreCpiSigner",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "mplCoreProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "metadataArgs.name",
        "type": "string"
      },
      {
        "name": "metadataArgs.symbol",
        "type": "string"
      },
      {
        "name": "metadataArgs.uri",
        "type": "string"
      },
      {
        "name": "metadataArgs.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "metadataArgs.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "metadataArgs.isMutable",
        "type": "bool"
      },
      {
        "name": "metadataArgs.tokenStandard",
        "type": "string"
      },
      {
        "name": "metadataArgs.creators",
        "type": "json"
      },
      {
        "name": "metadataArgs.collection",
        "type": "string"
      },
      {
        "name": "assetData",
        "type": "bytes"
      },
      {
        "name": "assetDataSchema",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "redeem",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "voucher",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "setAndVerifyCollection",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeDelegate",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecordPda",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "editionAccount",
        "type": "string"
      },
      {
        "name": "bubblegumSigner",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "tokenMetadataProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.editionNonce",
        "type": "number"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.collection.verified",
        "type": "bool"
      },
      {
        "name": "message.collection.key",
        "type": "string"
      },
      {
        "name": "message.uses.useMethod",
        "type": "string"
      },
      {
        "name": "message.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "message.uses.total",
        "type": "bigint"
      },
      {
        "name": "message.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      },
      {
        "name": "collection",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "setCollectionV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "newCollectionAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "newCoreCollection",
        "type": "string"
      },
      {
        "name": "mplCoreCpiSigner",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "mplCoreProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      },
      {
        "name": "message.collection",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "setDecompressableState",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "treeCreator",
        "type": "string"
      },
      {
        "name": "decompressableState",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "setDecompressibleState",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "treeCreator",
        "type": "string"
      },
      {
        "name": "decompressableState",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "setNonTransferableV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "setTreeDelegate",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "treeCreator",
        "type": "string"
      },
      {
        "name": "newTreeDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "thawAndRevokeV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "collectionHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "thawV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "transfer",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "newLeafOwner",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "transferV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "newLeafOwner",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "unverifyCollection",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeDelegate",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecordPda",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "editionAccount",
        "type": "string"
      },
      {
        "name": "bubblegumSigner",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "tokenMetadataProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.editionNonce",
        "type": "number"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.collection.verified",
        "type": "bool"
      },
      {
        "name": "message.collection.key",
        "type": "string"
      },
      {
        "name": "message.uses.useMethod",
        "type": "string"
      },
      {
        "name": "message.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "message.uses.total",
        "type": "bigint"
      },
      {
        "name": "message.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "unverifyCreator",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "creator",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.editionNonce",
        "type": "number"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.collection.verified",
        "type": "bool"
      },
      {
        "name": "message.collection.key",
        "type": "string"
      },
      {
        "name": "message.uses.useMethod",
        "type": "string"
      },
      {
        "name": "message.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "message.uses.total",
        "type": "bigint"
      },
      {
        "name": "message.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "unverifyCreatorV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "creator",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      },
      {
        "name": "message.collection",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateAssetDataV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "previousAssetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "newAssetData",
        "type": "bytes"
      },
      {
        "name": "newAssetDataSchema",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateMetadata",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecordPda",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "tokenMetadataProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "currentMetadata.name",
        "type": "string"
      },
      {
        "name": "currentMetadata.symbol",
        "type": "string"
      },
      {
        "name": "currentMetadata.uri",
        "type": "string"
      },
      {
        "name": "currentMetadata.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "currentMetadata.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "currentMetadata.isMutable",
        "type": "bool"
      },
      {
        "name": "currentMetadata.editionNonce",
        "type": "number"
      },
      {
        "name": "currentMetadata.tokenStandard",
        "type": "string"
      },
      {
        "name": "currentMetadata.collection.verified",
        "type": "bool"
      },
      {
        "name": "currentMetadata.collection.key",
        "type": "string"
      },
      {
        "name": "currentMetadata.uses.useMethod",
        "type": "string"
      },
      {
        "name": "currentMetadata.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "currentMetadata.uses.total",
        "type": "bigint"
      },
      {
        "name": "currentMetadata.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "currentMetadata.creators",
        "type": "json"
      },
      {
        "name": "updateArgs.name",
        "type": "string"
      },
      {
        "name": "updateArgs.symbol",
        "type": "string"
      },
      {
        "name": "updateArgs.uri",
        "type": "string"
      },
      {
        "name": "updateArgs.creators",
        "type": "json"
      },
      {
        "name": "updateArgs.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "updateArgs.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "updateArgs.isMutable",
        "type": "bool"
      }
    ]
  },
  {
    "instruction": "updateMetadataV2",
    "fields": [
      {
        "name": "treeAuthority",
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
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "coreCollection",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "currentMetadata.name",
        "type": "string"
      },
      {
        "name": "currentMetadata.symbol",
        "type": "string"
      },
      {
        "name": "currentMetadata.uri",
        "type": "string"
      },
      {
        "name": "currentMetadata.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "currentMetadata.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "currentMetadata.isMutable",
        "type": "bool"
      },
      {
        "name": "currentMetadata.tokenStandard",
        "type": "string"
      },
      {
        "name": "currentMetadata.creators",
        "type": "json"
      },
      {
        "name": "currentMetadata.collection",
        "type": "string"
      },
      {
        "name": "updateArgs.name",
        "type": "string"
      },
      {
        "name": "updateArgs.symbol",
        "type": "string"
      },
      {
        "name": "updateArgs.uri",
        "type": "string"
      },
      {
        "name": "updateArgs.creators",
        "type": "json"
      },
      {
        "name": "updateArgs.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "updateArgs.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "updateArgs.isMutable",
        "type": "bool"
      }
    ]
  },
  {
    "instruction": "verifyCollection",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "treeDelegate",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecordPda",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "editionAccount",
        "type": "string"
      },
      {
        "name": "bubblegumSigner",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "tokenMetadataProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.editionNonce",
        "type": "number"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.collection.verified",
        "type": "bool"
      },
      {
        "name": "message.collection.key",
        "type": "string"
      },
      {
        "name": "message.uses.useMethod",
        "type": "string"
      },
      {
        "name": "message.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "message.uses.total",
        "type": "bigint"
      },
      {
        "name": "message.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "verifyCreator",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "creator",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "dataHash",
        "type": "json"
      },
      {
        "name": "creatorHash",
        "type": "json"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.editionNonce",
        "type": "number"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.collection.verified",
        "type": "bool"
      },
      {
        "name": "message.collection.key",
        "type": "string"
      },
      {
        "name": "message.uses.useMethod",
        "type": "string"
      },
      {
        "name": "message.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "message.uses.total",
        "type": "bigint"
      },
      {
        "name": "message.tokenProgramVersion",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "verifyCreatorV2",
    "fields": [
      {
        "name": "treeAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "creator",
        "type": "string"
      },
      {
        "name": "leafOwner",
        "type": "string"
      },
      {
        "name": "leafDelegate",
        "type": "string"
      },
      {
        "name": "merkleTree",
        "type": "string"
      },
      {
        "name": "logWrapper",
        "type": "string"
      },
      {
        "name": "compressionProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "root",
        "type": "json"
      },
      {
        "name": "assetDataHash",
        "type": "json"
      },
      {
        "name": "flags",
        "type": "number"
      },
      {
        "name": "nonce",
        "type": "bigint"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "message.name",
        "type": "string"
      },
      {
        "name": "message.symbol",
        "type": "string"
      },
      {
        "name": "message.uri",
        "type": "string"
      },
      {
        "name": "message.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "message.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "message.isMutable",
        "type": "bool"
      },
      {
        "name": "message.tokenStandard",
        "type": "string"
      },
      {
        "name": "message.creators",
        "type": "json"
      },
      {
        "name": "message.collection",
        "type": "string"
      }
    ]
  }
] as const;

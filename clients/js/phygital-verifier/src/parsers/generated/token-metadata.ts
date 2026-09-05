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

export const PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as const;

export type GeneratedIx = {
  name: string;
  fields: Record<string, { type: "bigint" | "number" | "string" | "bool" | "bytes" | "json"; value: bigint | number | string | boolean }>;
};

const DISC_CREATEMETADATAACCOUNT = new Uint8Array([0]);
const DISC_UPDATEMETADATAACCOUNT = new Uint8Array([1]);
const DISC_DEPRECATEDCREATEMASTEREDITION = new Uint8Array([2]);
const DISC_DEPRECATEDMINTNEWEDITIONFROMMASTEREDITIONVIAPRINTINGTOKEN = new Uint8Array([3]);
const DISC_UPDATEPRIMARYSALEHAPPENEDVIATOKEN = new Uint8Array([4]);
const DISC_DEPRECATEDSETRESERVATIONLIST = new Uint8Array([5]);
const DISC_DEPRECATEDCREATERESERVATIONLIST = new Uint8Array([6]);
const DISC_SIGNMETADATA = new Uint8Array([7]);
const DISC_DEPRECATEDMINTPRINTINGTOKENSVIATOKEN = new Uint8Array([8]);
const DISC_DEPRECATEDMINTPRINTINGTOKENS = new Uint8Array([9]);
const DISC_CREATEMASTEREDITION = new Uint8Array([10]);
const DISC_MINTNEWEDITIONFROMMASTEREDITIONVIATOKEN = new Uint8Array([11]);
const DISC_CONVERTMASTEREDITIONV1TOV2 = new Uint8Array([12]);
const DISC_MINTNEWEDITIONFROMMASTEREDITIONVIAVAULTPROXY = new Uint8Array([13]);
const DISC_PUFFMETADATA = new Uint8Array([14]);
const DISC_UPDATEMETADATAACCOUNTV2 = new Uint8Array([15]);
const DISC_CREATEMETADATAACCOUNTV2 = new Uint8Array([16]);
const DISC_CREATEMASTEREDITIONV3 = new Uint8Array([17]);
const DISC_VERIFYCOLLECTION = new Uint8Array([18]);
const DISC_UTILIZE = new Uint8Array([19]);
const DISC_APPROVEUSEAUTHORITY = new Uint8Array([20]);
const DISC_REVOKEUSEAUTHORITY = new Uint8Array([21]);
const DISC_UNVERIFYCOLLECTION = new Uint8Array([22]);
const DISC_APPROVECOLLECTIONAUTHORITY = new Uint8Array([23]);
const DISC_REVOKECOLLECTIONAUTHORITY = new Uint8Array([24]);
const DISC_SETANDVERIFYCOLLECTION = new Uint8Array([25]);
const DISC_FREEZEDELEGATEDACCOUNT = new Uint8Array([26]);
const DISC_THAWDELEGATEDACCOUNT = new Uint8Array([27]);
const DISC_REMOVECREATORVERIFICATION = new Uint8Array([28]);
const DISC_BURNNFT = new Uint8Array([29]);
const DISC_VERIFYSIZEDCOLLECTIONITEM = new Uint8Array([30]);
const DISC_UNVERIFYSIZEDCOLLECTIONITEM = new Uint8Array([31]);
const DISC_SETANDVERIFYSIZEDCOLLECTIONITEM = new Uint8Array([32]);
const DISC_CREATEMETADATAACCOUNTV3 = new Uint8Array([33]);
const DISC_SETCOLLECTIONSIZE = new Uint8Array([34]);
const DISC_SETTOKENSTANDARD = new Uint8Array([35]);
const DISC_BUBBLEGUMSETCOLLECTIONSIZE = new Uint8Array([36]);
const DISC_BURNEDITIONNFT = new Uint8Array([37]);
const DISC_CREATEESCROWACCOUNT = new Uint8Array([38]);
const DISC_CLOSEESCROWACCOUNT = new Uint8Array([39]);
const DISC_TRANSFEROUTOFESCROW = new Uint8Array([40]);
const DISC_BURN = new Uint8Array([41]);
const DISC_CREATE = new Uint8Array([42]);
const DISC_MINT = new Uint8Array([43]);
const DISC_DELEGATE = new Uint8Array([44]);
const DISC_REVOKE = new Uint8Array([45]);
const DISC_LOCK = new Uint8Array([46]);
const DISC_UNLOCK = new Uint8Array([47]);
const DISC_MIGRATE = new Uint8Array([48]);
const DISC_TRANSFER = new Uint8Array([49]);
const DISC_UPDATE = new Uint8Array([50]);
const DISC_USE = new Uint8Array([51]);
const DISC_VERIFY = new Uint8Array([52]);
const DISC_UNVERIFY = new Uint8Array([53]);
const DISC_COLLECT = new Uint8Array([54]);
const DISC_PRINT = new Uint8Array([55]);
const DISC_RESIZE = new Uint8Array([56]);
const DISC_CLOSEACCOUNTS = new Uint8Array([57]);

export function tryDecode(
  data: Uint8Array,
  accounts: readonly { address: string }[],
): GeneratedIx | null {
  if (discEq(data, DISC_CREATEMETADATAACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CreateMetadataAccount", fields };
  }
  if (discEq(data, DISC_UPDATEMETADATAACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "UpdateMetadataAccount", fields };
  }
  if (discEq(data, DISC_DEPRECATEDCREATEMASTEREDITION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["printingMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["oneTimePrintingAuthorizationMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["printingMintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["oneTimePrintingAuthorizationMintAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "DeprecatedCreateMasterEdition", fields };
  }
  if (discEq(data, DISC_DEPRECATEDMINTNEWEDITIONFROMMASTEREDITIONVIAPRINTINGTOKEN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["printingMint"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["masterTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["editionMarker"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["burnAuthority"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["masterUpdateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["masterMetadata"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (a) fields["reservationList"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "DeprecatedMintNewEditionFromMasterEditionViaPrintingToken", fields };
  }
  if (discEq(data, DISC_UPDATEPRIMARYSALEHAPPENEDVIATOKEN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "UpdatePrimarySaleHappenedViaToken", fields };
  }
  if (discEq(data, DISC_DEPRECATEDSETRESERVATIONLIST)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["reservationList"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["resource"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "DeprecatedSetReservationList", fields };
  }
  if (discEq(data, DISC_DEPRECATEDCREATERESERVATIONLIST)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["reservationList"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["resource"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "DeprecatedCreateReservationList", fields };
  }
  if (discEq(data, DISC_SIGNMETADATA)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["creator"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "SignMetadata", fields };
  }
  if (discEq(data, DISC_DEPRECATEDMINTPRINTINGTOKENSVIATOKEN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["oneTimePrintingAuthorizationMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["printingMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["burnAuthority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "DeprecatedMintPrintingTokensViaToken", fields };
  }
  if (discEq(data, DISC_DEPRECATEDMINTPRINTINGTOKENS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["printingMint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "DeprecatedMintPrintingTokens", fields };
  }
  if (discEq(data, DISC_CREATEMASTEREDITION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CreateMasterEdition", fields };
  }
  if (discEq(data, DISC_MINTNEWEDITIONFROMMASTEREDITIONVIATOKEN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["newMetadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["newEdition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["newMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["editionMarkPda"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["newMintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["tokenAccountOwner"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["newMetadataUpdateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["mintNewEditionFromMasterEditionViaTokenArgs.edition"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "MintNewEditionFromMasterEditionViaToken", fields };
  }
  if (discEq(data, DISC_CONVERTMASTEREDITIONV1TOV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["oneTimeAuth"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["printingMint"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "ConvertMasterEditionV1ToV2", fields };
  }
  if (discEq(data, DISC_MINTNEWEDITIONFROMMASTEREDITIONVIAVAULTPROXY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["newMetadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["newEdition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["newMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["editionMarkPda"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["newMintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["vaultAuthority"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["safetyDepositStore"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["safetyDepositBox"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["vault"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["newMetadataUpdateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["tokenVaultProgram"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[16]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["mintNewEditionFromMasterEditionViaTokenArgs.edition"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "MintNewEditionFromMasterEditionViaVaultProxy", fields };
  }
  if (discEq(data, DISC_PUFFMETADATA)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "PuffMetadata", fields };
  }
  if (discEq(data, DISC_UPDATEMETADATAACCOUNTV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
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
          fields["updateMetadataAccountArgsV2.data.name"] = { type: "string", value: s };
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
          fields["updateMetadataAccountArgsV2.data.symbol"] = { type: "string", value: s };
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
          fields["updateMetadataAccountArgsV2.data.uri"] = { type: "string", value: s };
          o += n;
        }
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["updateMetadataAccountArgsV2.data.sellerFeeBasisPoints"] = { type: "number", value: v };
          o += 2;
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
              fields["updateMetadataAccountArgsV2.data.creators"] = { type: "json", value: JSON.stringify(arr) };
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
              fields["updateMetadataAccountArgsV2.data.collection.verified"] = { type: "bool", value: v };
              o += 1;
            }
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateMetadataAccountArgsV2.data.collection.key"] = { type: "string", value: v };
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
                fields["updateMetadataAccountArgsV2.data.uses.useMethod"] = { type: "string", value: "Burn" };
              }
              if (tag === 1) {
                fields["updateMetadataAccountArgsV2.data.uses.useMethod"] = { type: "string", value: "Multiple" };
              }
              if (tag === 2) {
                fields["updateMetadataAccountArgsV2.data.uses.useMethod"] = { type: "string", value: "Single" };
              }
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["updateMetadataAccountArgsV2.data.uses.remaining"] = { type: "bigint", value: v };
              o += 8;
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["updateMetadataAccountArgsV2.data.uses.total"] = { type: "bigint", value: v };
              o += 8;
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
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateMetadataAccountArgsV2.updateAuthority"] = { type: "string", value: v };
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
          const v = readBool(data, o);
          if (v == null) return null;
          fields["updateMetadataAccountArgsV2.primarySaleHappened"] = { type: "bool", value: v };
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
          fields["updateMetadataAccountArgsV2.isMutable"] = { type: "bool", value: v };
          o += 1;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "UpdateMetadataAccountV2", fields };
  }
  if (discEq(data, DISC_CREATEMETADATAACCOUNTV2)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CreateMetadataAccountV2", fields };
  }
  if (discEq(data, DISC_CREATEMASTEREDITIONV3)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["createMasterEditionArgs.maxSupply"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "CreateMasterEditionV3", fields };
  }
  if (discEq(data, DISC_VERIFYCOLLECTION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["collectionMasterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "VerifyCollection", fields };
  }
  if (discEq(data, DISC_UTILIZE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["useAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["ataProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["rent"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (a) fields["useAuthorityRecord"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (a) fields["burner"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["utilizeArgs.numberOfUses"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "Utilize", fields };
  }
  if (discEq(data, DISC_APPROVEUSEAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["useAuthorityRecord"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["user"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["ownerTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["burner"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["approveUseAuthorityArgs.numberOfUses"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "ApproveUseAuthority", fields };
  }
  if (discEq(data, DISC_REVOKEUSEAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["useAuthorityRecord"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["user"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["ownerTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "RevokeUseAuthority", fields };
  }
  if (discEq(data, DISC_UNVERIFYCOLLECTION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["collectionMasterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "UnverifyCollection", fields };
  }
  if (discEq(data, DISC_APPROVECOLLECTIONAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["newCollectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "ApproveCollectionAuthority", fields };
  }
  if (discEq(data, DISC_REVOKECOLLECTIONAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["delegateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["revokeAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "RevokeCollectionAuthority", fields };
  }
  if (discEq(data, DISC_SETANDVERIFYCOLLECTION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["collectionMasterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "SetAndVerifyCollection", fields };
  }
  if (discEq(data, DISC_FREEZEDELEGATEDACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["delegate"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "FreezeDelegatedAccount", fields };
  }
  if (discEq(data, DISC_THAWDELEGATEDACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["delegate"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "ThawDelegatedAccount", fields };
  }
  if (discEq(data, DISC_REMOVECREATORVERIFICATION)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["creator"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "RemoveCreatorVerification", fields };
  }
  if (discEq(data, DISC_BURNNFT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["masterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["collectionMetadata"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "BurnNft", fields };
  }
  if (discEq(data, DISC_VERIFYSIZEDCOLLECTIONITEM)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["collectionMasterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "VerifySizedCollectionItem", fields };
  }
  if (discEq(data, DISC_UNVERIFYSIZEDCOLLECTIONITEM)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["collectionMasterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "UnverifySizedCollectionItem", fields };
  }
  if (discEq(data, DISC_SETANDVERIFYSIZEDCOLLECTIONITEM)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["collection"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["collectionMasterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "SetAndVerifySizedCollectionItem", fields };
  }
  if (discEq(data, DISC_CREATEMETADATAACCOUNTV3)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["rent"] = { type: "string", value: a }; }
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
      fields["createMetadataAccountArgsV3.data.name"] = { type: "string", value: s };
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
      fields["createMetadataAccountArgsV3.data.symbol"] = { type: "string", value: s };
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
      fields["createMetadataAccountArgsV3.data.uri"] = { type: "string", value: s };
      o += n;
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["createMetadataAccountArgsV3.data.sellerFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
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
          fields["createMetadataAccountArgsV3.data.creators"] = { type: "json", value: JSON.stringify(arr) };
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
          fields["createMetadataAccountArgsV3.data.collection.verified"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["createMetadataAccountArgsV3.data.collection.key"] = { type: "string", value: v };
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
            fields["createMetadataAccountArgsV3.data.uses.useMethod"] = { type: "string", value: "Burn" };
          }
          if (tag === 1) {
            fields["createMetadataAccountArgsV3.data.uses.useMethod"] = { type: "string", value: "Multiple" };
          }
          if (tag === 2) {
            fields["createMetadataAccountArgsV3.data.uses.useMethod"] = { type: "string", value: "Single" };
          }
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["createMetadataAccountArgsV3.data.uses.remaining"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["createMetadataAccountArgsV3.data.uses.total"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["createMetadataAccountArgsV3.isMutable"] = { type: "bool", value: v };
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
            fields["createMetadataAccountArgsV3.collectionDetails"] = { type: "string", value: "V1" };
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["createMetadataAccountArgsV3.collectionDetails.size"] = { type: "bigint", value: v };
              o += 8;
            }
          }
          if (tag === 1) {
            fields["createMetadataAccountArgsV3.collectionDetails"] = { type: "string", value: "V2" };
            if (data.length < o + 8) return null;
            fields["createMetadataAccountArgsV3.collectionDetails.padding"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 8)) };
            o += 8;
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "CreateMetadataAccountV3", fields };
  }
  if (discEq(data, DISC_SETCOLLECTIONSIZE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["setCollectionSizeArgs.size"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "SetCollectionSize", fields };
  }
  if (discEq(data, DISC_SETTOKENSTANDARD)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["edition"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "SetTokenStandard", fields };
  }
  if (discEq(data, DISC_BUBBLEGUMSETCOLLECTIONSIZE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["collectionAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["bubblegumSigner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["collectionAuthorityRecord"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["setCollectionSizeArgs.size"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "BubblegumSetCollectionSize", fields };
  }
  if (discEq(data, DISC_BURNEDITIONNFT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["printEditionMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["masterEditionMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["printEditionTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["masterEditionTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["masterEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["printEditionAccount"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["editionMarkerAccount"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["splTokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "BurnEditionNft", fields };
  }
  if (discEq(data, DISC_CREATEESCROWACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["escrow"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CreateEscrowAccount", fields };
  }
  if (discEq(data, DISC_CLOSEESCROWACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["escrow"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["tokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CloseEscrowAccount", fields };
  }
  if (discEq(data, DISC_TRANSFEROUTOFESCROW)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["escrow"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["attributeMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["attributeSrc"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["attributeDst"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["escrowMint"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["escrowAccount"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["ataProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["tokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["transferOutOfEscrowArgs.amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "TransferOutOfEscrow", fields };
  }
  if (discEq(data, DISC_BURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["masterEditionMint"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["masterEditionToken"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (a) fields["editionMarker"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (a) fields["tokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["splTokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["burnArgs"] = { type: "string", value: "V1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["burnArgs.amount"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Burn", fields };
  }
  if (discEq(data, DISC_CREATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["splTokenProgram"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["createArgs"] = { type: "string", value: "V1" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["createArgs.asset_data.name"] = { type: "string", value: s };
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
          fields["createArgs.asset_data.symbol"] = { type: "string", value: s };
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
          fields["createArgs.asset_data.uri"] = { type: "string", value: s };
          o += n;
        }
        {
          const v = readU16Le(data, o);
          if (v == null) return null;
          fields["createArgs.asset_data.sellerFeeBasisPoints"] = { type: "number", value: v };
          o += 2;
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
              fields["createArgs.asset_data.creators"] = { type: "json", value: JSON.stringify(arr) };
            }
          }
        }
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["createArgs.asset_data.primarySaleHappened"] = { type: "bool", value: v };
          o += 1;
        }
        {
          const v = readBool(data, o);
          if (v == null) return null;
          fields["createArgs.asset_data.isMutable"] = { type: "bool", value: v };
          o += 1;
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["createArgs.asset_data.tokenStandard"] = { type: "string", value: "NonFungible" };
          }
          if (tag === 1) {
            fields["createArgs.asset_data.tokenStandard"] = { type: "string", value: "FungibleAsset" };
          }
          if (tag === 2) {
            fields["createArgs.asset_data.tokenStandard"] = { type: "string", value: "Fungible" };
          }
          if (tag === 3) {
            fields["createArgs.asset_data.tokenStandard"] = { type: "string", value: "NonFungibleEdition" };
          }
          if (tag === 4) {
            fields["createArgs.asset_data.tokenStandard"] = { type: "string", value: "ProgrammableNonFungible" };
          }
          if (tag === 5) {
            fields["createArgs.asset_data.tokenStandard"] = { type: "string", value: "ProgrammableNonFungibleEdition" };
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
              fields["createArgs.asset_data.collection.verified"] = { type: "bool", value: v };
              o += 1;
            }
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["createArgs.asset_data.collection.key"] = { type: "string", value: v };
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
                fields["createArgs.asset_data.uses.useMethod"] = { type: "string", value: "Burn" };
              }
              if (tag === 1) {
                fields["createArgs.asset_data.uses.useMethod"] = { type: "string", value: "Multiple" };
              }
              if (tag === 2) {
                fields["createArgs.asset_data.uses.useMethod"] = { type: "string", value: "Single" };
              }
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["createArgs.asset_data.uses.remaining"] = { type: "bigint", value: v };
              o += 8;
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["createArgs.asset_data.uses.total"] = { type: "bigint", value: v };
              o += 8;
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
                fields["createArgs.asset_data.collectionDetails"] = { type: "string", value: "V1" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["createArgs.asset_data.collectionDetails.size"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
              if (tag === 1) {
                fields["createArgs.asset_data.collectionDetails"] = { type: "string", value: "V2" };
                if (data.length < o + 8) return null;
                fields["createArgs.asset_data.collectionDetails.padding"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 8)) };
                o += 8;
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
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["createArgs.asset_data.ruleSet"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            if (data.length <= o) return null;
            fields["createArgs.decimals"] = { type: "number", value: data[o]! };
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
                fields["createArgs.print_supply"] = { type: "string", value: "Zero" };
              }
              if (tag === 1) {
                fields["createArgs.print_supply"] = { type: "string", value: "Limited" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["createArgs.print_supply.field0"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
              if (tag === 2) {
                fields["createArgs.print_supply"] = { type: "string", value: "Unlimited" };
              }
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Create", fields };
  }
  if (discEq(data, DISC_MINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["tokenOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["tokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["splAtaProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["mintArgs"] = { type: "string", value: "V1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["mintArgs.amount"] = { type: "bigint", value: v };
          o += 8;
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["mintArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Mint", fields };
  }
  if (discEq(data, DISC_DELEGATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (a) fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["delegate"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["tokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["token"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (a) fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["delegateArgs"] = { type: "string", value: "CollectionV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 1) {
        fields["delegateArgs"] = { type: "string", value: "SaleV1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["delegateArgs.amount"] = { type: "bigint", value: v };
          o += 8;
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 2) {
        fields["delegateArgs"] = { type: "string", value: "TransferV1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["delegateArgs.amount"] = { type: "bigint", value: v };
          o += 8;
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 3) {
        fields["delegateArgs"] = { type: "string", value: "DataV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 4) {
        fields["delegateArgs"] = { type: "string", value: "UtilityV1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["delegateArgs.amount"] = { type: "bigint", value: v };
          o += 8;
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 5) {
        fields["delegateArgs"] = { type: "string", value: "StakingV1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["delegateArgs.amount"] = { type: "bigint", value: v };
          o += 8;
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 6) {
        fields["delegateArgs"] = { type: "string", value: "StandardV1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["delegateArgs.amount"] = { type: "bigint", value: v };
          o += 8;
        }
      }
      if (tag === 7) {
        fields["delegateArgs"] = { type: "string", value: "LockedTransferV1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["delegateArgs.amount"] = { type: "bigint", value: v };
          o += 8;
        }
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["delegateArgs.locked_address"] = { type: "string", value: v };
          o += 32;
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 8) {
        fields["delegateArgs"] = { type: "string", value: "ProgrammableConfigV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 9) {
        fields["delegateArgs"] = { type: "string", value: "AuthorityItemV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 10) {
        fields["delegateArgs"] = { type: "string", value: "DataItemV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 11) {
        fields["delegateArgs"] = { type: "string", value: "CollectionItemV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 12) {
        fields["delegateArgs"] = { type: "string", value: "ProgrammableConfigItemV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 13) {
        fields["delegateArgs"] = { type: "string", value: "PrintDelegateV1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["delegateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Delegate", fields };
  }
  if (discEq(data, DISC_REVOKE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (a) fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["delegate"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["tokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["token"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (a) fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["revokeArgs"] = { type: "string", value: "CollectionV1" };
      }
      if (tag === 1) {
        fields["revokeArgs"] = { type: "string", value: "SaleV1" };
      }
      if (tag === 2) {
        fields["revokeArgs"] = { type: "string", value: "TransferV1" };
      }
      if (tag === 3) {
        fields["revokeArgs"] = { type: "string", value: "DataV1" };
      }
      if (tag === 4) {
        fields["revokeArgs"] = { type: "string", value: "UtilityV1" };
      }
      if (tag === 5) {
        fields["revokeArgs"] = { type: "string", value: "StakingV1" };
      }
      if (tag === 6) {
        fields["revokeArgs"] = { type: "string", value: "StandardV1" };
      }
      if (tag === 7) {
        fields["revokeArgs"] = { type: "string", value: "LockedTransferV1" };
      }
      if (tag === 8) {
        fields["revokeArgs"] = { type: "string", value: "ProgrammableConfigV1" };
      }
      if (tag === 9) {
        fields["revokeArgs"] = { type: "string", value: "MigrationV1" };
      }
      if (tag === 10) {
        fields["revokeArgs"] = { type: "string", value: "AuthorityItemV1" };
      }
      if (tag === 11) {
        fields["revokeArgs"] = { type: "string", value: "DataItemV1" };
      }
      if (tag === 12) {
        fields["revokeArgs"] = { type: "string", value: "CollectionItemV1" };
      }
      if (tag === 13) {
        fields["revokeArgs"] = { type: "string", value: "ProgrammableConfigItemV1" };
      }
      if (tag === 14) {
        fields["revokeArgs"] = { type: "string", value: "PrintDelegateV1" };
      }
    }
    if (o !== data.length) return null;
    return { name: "Revoke", fields };
  }
  if (discEq(data, DISC_LOCK)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["tokenOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["tokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (a) fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["lockArgs"] = { type: "string", value: "V1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["lockArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Lock", fields };
  }
  if (discEq(data, DISC_UNLOCK)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["tokenOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["tokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (a) fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["unlockArgs"] = { type: "string", value: "V1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["unlockArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Unlock", fields };
  }
  if (discEq(data, DISC_MIGRATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["tokenOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["tokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "Migrate", fields };
  }
  if (discEq(data, DISC_TRANSFER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["tokenOwner"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["destinationOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["ownerTokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["destinationTokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["splAtaProgram"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[16]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["transferArgs"] = { type: "string", value: "V1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["transferArgs.amount"] = { type: "bigint", value: v };
          o += 8;
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["transferArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Transfer", fields };
  }
  if (discEq(data, DISC_UPDATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["token"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["updateArgs"] = { type: "string", value: "V1" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.new_update_authority"] = { type: "string", value: v };
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
              fields["updateArgs.data.name"] = { type: "string", value: s };
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
              fields["updateArgs.data.symbol"] = { type: "string", value: s };
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
              fields["updateArgs.data.uri"] = { type: "string", value: s };
              o += n;
            }
            {
              const v = readU16Le(data, o);
              if (v == null) return null;
              fields["updateArgs.data.sellerFeeBasisPoints"] = { type: "number", value: v };
              o += 2;
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
                  fields["updateArgs.data.creators"] = { type: "json", value: JSON.stringify(arr) };
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
              const v = readBool(data, o);
              if (v == null) return null;
              fields["updateArgs.primary_sale_happened"] = { type: "bool", value: v };
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
              fields["updateArgs.is_mutable"] = { type: "bool", value: v };
              o += 1;
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.collection"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.collection"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.collection"] = { type: "string", value: "Set" };
            {
              const v = readBool(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.verified"] = { type: "bool", value: v };
              o += 1;
            }
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.key"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.collection_details"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.collection_details"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.collection_details"] = { type: "string", value: "Set" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateArgs.collection_details.field0"] = { type: "string", value: "V1" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["updateArgs.collection_details.field0.size"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
              if (tag === 1) {
                fields["updateArgs.collection_details.field0"] = { type: "string", value: "V2" };
                if (data.length < o + 8) return null;
                fields["updateArgs.collection_details.field0.padding"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 8)) };
                o += 8;
              }
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.uses"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.uses"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.uses"] = { type: "string", value: "Set" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateArgs.uses.field0.useMethod"] = { type: "string", value: "Burn" };
              }
              if (tag === 1) {
                fields["updateArgs.uses.field0.useMethod"] = { type: "string", value: "Multiple" };
              }
              if (tag === 2) {
                fields["updateArgs.uses.field0.useMethod"] = { type: "string", value: "Single" };
              }
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["updateArgs.uses.field0.remaining"] = { type: "bigint", value: v };
              o += 8;
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["updateArgs.uses.field0.total"] = { type: "bigint", value: v };
              o += 8;
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.rule_set"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Set" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.rule_set.field0"] = { type: "string", value: v };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 1) {
        fields["updateArgs"] = { type: "string", value: "AsUpdateAuthorityV2" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.new_update_authority"] = { type: "string", value: v };
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
              fields["updateArgs.data.name"] = { type: "string", value: s };
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
              fields["updateArgs.data.symbol"] = { type: "string", value: s };
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
              fields["updateArgs.data.uri"] = { type: "string", value: s };
              o += n;
            }
            {
              const v = readU16Le(data, o);
              if (v == null) return null;
              fields["updateArgs.data.sellerFeeBasisPoints"] = { type: "number", value: v };
              o += 2;
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
                  fields["updateArgs.data.creators"] = { type: "json", value: JSON.stringify(arr) };
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
              const v = readBool(data, o);
              if (v == null) return null;
              fields["updateArgs.primary_sale_happened"] = { type: "bool", value: v };
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
              fields["updateArgs.is_mutable"] = { type: "bool", value: v };
              o += 1;
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.collection"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.collection"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.collection"] = { type: "string", value: "Set" };
            {
              const v = readBool(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.verified"] = { type: "bool", value: v };
              o += 1;
            }
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.key"] = { type: "string", value: v };
              o += 32;
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.collection_details"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.collection_details"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.collection_details"] = { type: "string", value: "Set" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateArgs.collection_details.field0"] = { type: "string", value: "V1" };
                {
                  const v = readU64Le(data, o);
                  if (v == null) return null;
                  fields["updateArgs.collection_details.field0.size"] = { type: "bigint", value: v };
                  o += 8;
                }
              }
              if (tag === 1) {
                fields["updateArgs.collection_details.field0"] = { type: "string", value: "V2" };
                if (data.length < o + 8) return null;
                fields["updateArgs.collection_details.field0.padding"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 8)) };
                o += 8;
              }
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.uses"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.uses"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.uses"] = { type: "string", value: "Set" };
            {
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateArgs.uses.field0.useMethod"] = { type: "string", value: "Burn" };
              }
              if (tag === 1) {
                fields["updateArgs.uses.field0.useMethod"] = { type: "string", value: "Multiple" };
              }
              if (tag === 2) {
                fields["updateArgs.uses.field0.useMethod"] = { type: "string", value: "Single" };
              }
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["updateArgs.uses.field0.remaining"] = { type: "bigint", value: v };
              o += 8;
            }
            {
              const v = readU64Le(data, o);
              if (v == null) return null;
              fields["updateArgs.uses.field0.total"] = { type: "bigint", value: v };
              o += 8;
            }
          }
        }
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.rule_set"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Set" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.rule_set.field0"] = { type: "string", value: v };
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
                fields["updateArgs.token_standard"] = { type: "string", value: "NonFungible" };
              }
              if (tag === 1) {
                fields["updateArgs.token_standard"] = { type: "string", value: "FungibleAsset" };
              }
              if (tag === 2) {
                fields["updateArgs.token_standard"] = { type: "string", value: "Fungible" };
              }
              if (tag === 3) {
                fields["updateArgs.token_standard"] = { type: "string", value: "NonFungibleEdition" };
              }
              if (tag === 4) {
                fields["updateArgs.token_standard"] = { type: "string", value: "ProgrammableNonFungible" };
              }
              if (tag === 5) {
                fields["updateArgs.token_standard"] = { type: "string", value: "ProgrammableNonFungibleEdition" };
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
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 2) {
        fields["updateArgs"] = { type: "string", value: "AsAuthorityItemDelegateV2" };
        if (data.length <= o) return null;
        {
          const opt = data[o]!;
          o += 1;
          if (opt === 1) {
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.new_update_authority"] = { type: "string", value: v };
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
              const v = readBool(data, o);
              if (v == null) return null;
              fields["updateArgs.primary_sale_happened"] = { type: "bool", value: v };
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
              fields["updateArgs.is_mutable"] = { type: "bool", value: v };
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
              if (data.length <= o) return null;
              const tag = data[o]!;
              o += 1;
              if (tag === 0) {
                fields["updateArgs.token_standard"] = { type: "string", value: "NonFungible" };
              }
              if (tag === 1) {
                fields["updateArgs.token_standard"] = { type: "string", value: "FungibleAsset" };
              }
              if (tag === 2) {
                fields["updateArgs.token_standard"] = { type: "string", value: "Fungible" };
              }
              if (tag === 3) {
                fields["updateArgs.token_standard"] = { type: "string", value: "NonFungibleEdition" };
              }
              if (tag === 4) {
                fields["updateArgs.token_standard"] = { type: "string", value: "ProgrammableNonFungible" };
              }
              if (tag === 5) {
                fields["updateArgs.token_standard"] = { type: "string", value: "ProgrammableNonFungibleEdition" };
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
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 3) {
        fields["updateArgs"] = { type: "string", value: "AsCollectionDelegateV2" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.collection"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.collection"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.collection"] = { type: "string", value: "Set" };
            {
              const v = readBool(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.verified"] = { type: "bool", value: v };
              o += 1;
            }
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.key"] = { type: "string", value: v };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 4) {
        fields["updateArgs"] = { type: "string", value: "AsDataDelegateV2" };
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
              fields["updateArgs.data.name"] = { type: "string", value: s };
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
              fields["updateArgs.data.symbol"] = { type: "string", value: s };
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
              fields["updateArgs.data.uri"] = { type: "string", value: s };
              o += n;
            }
            {
              const v = readU16Le(data, o);
              if (v == null) return null;
              fields["updateArgs.data.sellerFeeBasisPoints"] = { type: "number", value: v };
              o += 2;
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
                  fields["updateArgs.data.creators"] = { type: "json", value: JSON.stringify(arr) };
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
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 5) {
        fields["updateArgs"] = { type: "string", value: "AsProgrammableConfigDelegateV2" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.rule_set"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Set" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.rule_set.field0"] = { type: "string", value: v };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 6) {
        fields["updateArgs"] = { type: "string", value: "AsDataItemDelegateV2" };
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
              fields["updateArgs.data.name"] = { type: "string", value: s };
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
              fields["updateArgs.data.symbol"] = { type: "string", value: s };
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
              fields["updateArgs.data.uri"] = { type: "string", value: s };
              o += n;
            }
            {
              const v = readU16Le(data, o);
              if (v == null) return null;
              fields["updateArgs.data.sellerFeeBasisPoints"] = { type: "number", value: v };
              o += 2;
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
                  fields["updateArgs.data.creators"] = { type: "json", value: JSON.stringify(arr) };
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
              const len = readU32Le(data, o);
              if (len == null) return null;
              if (len > 4096) return null;
              o += 4;
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 7) {
        fields["updateArgs"] = { type: "string", value: "AsCollectionItemDelegateV2" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.collection"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.collection"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.collection"] = { type: "string", value: "Set" };
            {
              const v = readBool(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.verified"] = { type: "bool", value: v };
              o += 1;
            }
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.collection.field0.key"] = { type: "string", value: v };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
      if (tag === 8) {
        fields["updateArgs"] = { type: "string", value: "AsProgrammableConfigItemDelegateV2" };
        {
          if (data.length <= o) return null;
          const tag = data[o]!;
          o += 1;
          if (tag === 0) {
            fields["updateArgs.rule_set"] = { type: "string", value: "None" };
          }
          if (tag === 1) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Clear" };
          }
          if (tag === 2) {
            fields["updateArgs.rule_set"] = { type: "string", value: "Set" };
            {
              const v = readPubkey(data, o);
              if (v == null) return null;
              fields["updateArgs.rule_set.field0"] = { type: "string", value: v };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["updateArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Update", fields };
  }
  if (discEq(data, DISC_USE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["token"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (a) fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (a) fields["authorizationRulesProgram"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (a) fields["authorizationRules"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["useArgs"] = { type: "string", value: "V1" };
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
              const obj: Record<string, unknown> = {};
              for (let _i = 0; _i < len; _i++) {
                let mapKey: string = "";
                {
                  const len = readU32Le(data, o); if (len == null) return null;
                  if (len > 4096) return null;
                  o += 4;
                  if (data.length < o + len) return null;
                  mapKey = readUtf8(data, o, len) ?? ""; o += len;
                }
                const mapValHolder: Record<string, unknown> = {};
                {
                  if (data.length <= o) return null;
                  const tag = data[o]!; o += 1;
                  const nested: Record<string, unknown> = { tag };
                  if (tag === 0) {
                    nested["variant"] = "Pubkey";
                    { const v = readPubkey(data, o); if (v == null) return null; nested["field0"] = v; o += 32; }
                  }
                  if (tag === 1) {
                    nested["variant"] = "Seeds";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          {
                            const len = readU32Le(data, o); if (len == null) return null;
                            if (len > 4096) return null;
                            o += 4;
                            if (data.length < o + len) return null;
                            arr.push(encodeBase58(data.subarray(o, o + len))); o += len;
                          }
                        }
                        nested["seeds"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 2) {
                    nested["variant"] = "MerkleProof";
                    {
                      const nested: Record<string, unknown> = {};
                      {
                        const len = readU32Le(data, o); if (len == null) return null;
                        if (len > 4096) return null;
                        o += 4;
                        const arr: unknown[] = [];
                        for (let _i = 0; _i < len; _i++) {
                          if (data.length < o + 32) return null;
                          arr.push(encodeBase58(data.subarray(o, o + 32)));
                          o += 32;
                        }
                        nested["proof"] = arr;
                      }
                      nested["field0"] = nested;
                    }
                  }
                  if (tag === 3) {
                    nested["variant"] = "Number";
                    {
                      const v = readU64Le(data, o);
                      if (v == null) return null;
                      nested["field0"] = v.toString();
                      o += 8;
                    }
                  }
                  mapValHolder["__v"] = nested;
                }
                obj[mapKey] = mapValHolder["__v"];
              }
              fields["useArgs.authorization_data.payload.map"] = { type: "json", value: JSON.stringify(obj) };
            }
          }
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Use", fields };
  }
  if (discEq(data, DISC_VERIFY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["collectionMasterEdition"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["verificationArgs"] = { type: "string", value: "CreatorV1" };
      }
      if (tag === 1) {
        fields["verificationArgs"] = { type: "string", value: "CollectionV1" };
      }
    }
    if (o !== data.length) return null;
    return { name: "Verify", fields };
  }
  if (discEq(data, DISC_UNVERIFY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (a) fields["delegateRecord"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["collectionMint"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["collectionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["verificationArgs"] = { type: "string", value: "CreatorV1" };
      }
      if (tag === 1) {
        fields["verificationArgs"] = { type: "string", value: "CollectionV1" };
      }
    }
    if (o !== data.length) return null;
    return { name: "Unverify", fields };
  }
  if (discEq(data, DISC_COLLECT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["recipient"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "Collect", fields };
  }
  if (discEq(data, DISC_PRINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["editionMetadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["editionMint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["editionTokenAccountOwner"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["editionTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["editionMintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["editionTokenRecord"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["masterEdition"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (!a) return null; fields["editionMarkerPda"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[10]?.address; if (!a) return null; fields["masterTokenAccountOwner"] = { type: "string", value: a }; }
    { const a = accounts[11]?.address; if (!a) return null; fields["masterTokenAccount"] = { type: "string", value: a }; }
    { const a = accounts[12]?.address; if (!a) return null; fields["masterMetadata"] = { type: "string", value: a }; }
    { const a = accounts[13]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[14]?.address; if (!a) return null; fields["splTokenProgram"] = { type: "string", value: a }; }
    { const a = accounts[15]?.address; if (!a) return null; fields["splAtaProgram"] = { type: "string", value: a }; }
    { const a = accounts[16]?.address; if (!a) return null; fields["sysvarInstructions"] = { type: "string", value: a }; }
    { const a = accounts[17]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["printArgs"] = { type: "string", value: "V1" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["printArgs.edition"] = { type: "bigint", value: v };
          o += 8;
        }
      }
      if (tag === 1) {
        fields["printArgs"] = { type: "string", value: "V2" };
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["printArgs.edition"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "Print", fields };
  }
  if (discEq(data, DISC_RESIZE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["token"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "Resize", fields };
  }
  if (discEq(data, DISC_CLOSEACCOUNTS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["edition"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "CloseAccounts", fields };
  }
  return null;
}

export const FIELD_SCHEMA = [
  {
    "instruction": "CreateMetadataAccount",
    "fields": [
      {
        "name": "metadata",
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
        "name": "payer",
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
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdateMetadataAccount",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "DeprecatedCreateMasterEdition",
    "fields": [
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "printingMint",
        "type": "string"
      },
      {
        "name": "oneTimePrintingAuthorizationMint",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "printingMintAuthority",
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
        "name": "payer",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "oneTimePrintingAuthorizationMintAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "DeprecatedMintNewEditionFromMasterEditionViaPrintingToken",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "masterEdition",
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
        "name": "printingMint",
        "type": "string"
      },
      {
        "name": "masterTokenAccount",
        "type": "string"
      },
      {
        "name": "editionMarker",
        "type": "string"
      },
      {
        "name": "burnAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "masterUpdateAuthority",
        "type": "string"
      },
      {
        "name": "masterMetadata",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "reservationList",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdatePrimarySaleHappenedViaToken",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "token",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "DeprecatedSetReservationList",
    "fields": [
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "reservationList",
        "type": "string"
      },
      {
        "name": "resource",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "DeprecatedCreateReservationList",
    "fields": [
      {
        "name": "reservationList",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "resource",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "SignMetadata",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "creator",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "DeprecatedMintPrintingTokensViaToken",
    "fields": [
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "oneTimePrintingAuthorizationMint",
        "type": "string"
      },
      {
        "name": "printingMint",
        "type": "string"
      },
      {
        "name": "burnAuthority",
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
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "DeprecatedMintPrintingTokens",
    "fields": [
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "printingMint",
        "type": "string"
      },
      {
        "name": "updateAuthority",
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
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CreateMasterEdition",
    "fields": [
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "MintNewEditionFromMasterEditionViaToken",
    "fields": [
      {
        "name": "newMetadata",
        "type": "string"
      },
      {
        "name": "newEdition",
        "type": "string"
      },
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "newMint",
        "type": "string"
      },
      {
        "name": "editionMarkPda",
        "type": "string"
      },
      {
        "name": "newMintAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "tokenAccountOwner",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "newMetadataUpdateAuthority",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "mintNewEditionFromMasterEditionViaTokenArgs.edition",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "ConvertMasterEditionV1ToV2",
    "fields": [
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "oneTimeAuth",
        "type": "string"
      },
      {
        "name": "printingMint",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "MintNewEditionFromMasterEditionViaVaultProxy",
    "fields": [
      {
        "name": "newMetadata",
        "type": "string"
      },
      {
        "name": "newEdition",
        "type": "string"
      },
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "newMint",
        "type": "string"
      },
      {
        "name": "editionMarkPda",
        "type": "string"
      },
      {
        "name": "newMintAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "vaultAuthority",
        "type": "string"
      },
      {
        "name": "safetyDepositStore",
        "type": "string"
      },
      {
        "name": "safetyDepositBox",
        "type": "string"
      },
      {
        "name": "vault",
        "type": "string"
      },
      {
        "name": "newMetadataUpdateAuthority",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "tokenVaultProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "mintNewEditionFromMasterEditionViaTokenArgs.edition",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "PuffMetadata",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UpdateMetadataAccountV2",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.name",
        "type": "string"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.symbol",
        "type": "string"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.uri",
        "type": "string"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.creators",
        "type": "json"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.collection.verified",
        "type": "bool"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.collection.key",
        "type": "string"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.uses.useMethod",
        "type": "string"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "updateMetadataAccountArgsV2.data.uses.total",
        "type": "bigint"
      },
      {
        "name": "updateMetadataAccountArgsV2.updateAuthority",
        "type": "string"
      },
      {
        "name": "updateMetadataAccountArgsV2.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "updateMetadataAccountArgsV2.isMutable",
        "type": "bool"
      }
    ]
  },
  {
    "instruction": "CreateMetadataAccountV2",
    "fields": [
      {
        "name": "metadata",
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
        "name": "payer",
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
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CreateMasterEditionV3",
    "fields": [
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "createMasterEditionArgs.maxSupply",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "VerifyCollection",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "collectionMasterEditionAccount",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Utilize",
    "fields": [
      {
        "name": "metadata",
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
        "name": "useAuthority",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "ataProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "useAuthorityRecord",
        "type": "string"
      },
      {
        "name": "burner",
        "type": "string"
      },
      {
        "name": "utilizeArgs.numberOfUses",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "ApproveUseAuthority",
    "fields": [
      {
        "name": "useAuthorityRecord",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "user",
        "type": "string"
      },
      {
        "name": "ownerTokenAccount",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "burner",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      },
      {
        "name": "approveUseAuthorityArgs.numberOfUses",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "RevokeUseAuthority",
    "fields": [
      {
        "name": "useAuthorityRecord",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "user",
        "type": "string"
      },
      {
        "name": "ownerTokenAccount",
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
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UnverifyCollection",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "collectionMasterEditionAccount",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "ApproveCollectionAuthority",
    "fields": [
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      },
      {
        "name": "newCollectionAuthority",
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
        "name": "metadata",
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
        "name": "rent",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RevokeCollectionAuthority",
    "fields": [
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      },
      {
        "name": "delegateAuthority",
        "type": "string"
      },
      {
        "name": "revokeAuthority",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "SetAndVerifyCollection",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "collectionMasterEditionAccount",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "FreezeDelegatedAccount",
    "fields": [
      {
        "name": "delegate",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "ThawDelegatedAccount",
    "fields": [
      {
        "name": "delegate",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "RemoveCreatorVerification",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "creator",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "BurnNft",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "masterEditionAccount",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "collectionMetadata",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "VerifySizedCollectionItem",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "collectionMasterEditionAccount",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "UnverifySizedCollectionItem",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "collectionMasterEditionAccount",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "SetAndVerifySizedCollectionItem",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collection",
        "type": "string"
      },
      {
        "name": "collectionMasterEditionAccount",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CreateMetadataAccountV3",
    "fields": [
      {
        "name": "metadata",
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
        "name": "payer",
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
        "name": "rent",
        "type": "string"
      },
      {
        "name": "createMetadataAccountArgsV3.data.name",
        "type": "string"
      },
      {
        "name": "createMetadataAccountArgsV3.data.symbol",
        "type": "string"
      },
      {
        "name": "createMetadataAccountArgsV3.data.uri",
        "type": "string"
      },
      {
        "name": "createMetadataAccountArgsV3.data.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "createMetadataAccountArgsV3.data.creators",
        "type": "json"
      },
      {
        "name": "createMetadataAccountArgsV3.data.collection.verified",
        "type": "bool"
      },
      {
        "name": "createMetadataAccountArgsV3.data.collection.key",
        "type": "string"
      },
      {
        "name": "createMetadataAccountArgsV3.data.uses.useMethod",
        "type": "string"
      },
      {
        "name": "createMetadataAccountArgsV3.data.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "createMetadataAccountArgsV3.data.uses.total",
        "type": "bigint"
      },
      {
        "name": "createMetadataAccountArgsV3.isMutable",
        "type": "bool"
      },
      {
        "name": "createMetadataAccountArgsV3.collectionDetails",
        "type": "string"
      },
      {
        "name": "createMetadataAccountArgsV3.collectionDetails.size",
        "type": "bigint"
      },
      {
        "name": "createMetadataAccountArgsV3.collectionDetails.padding",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "SetCollectionSize",
    "fields": [
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      },
      {
        "name": "setCollectionSizeArgs.size",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "SetTokenStandard",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "BubblegumSetCollectionSize",
    "fields": [
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "collectionAuthority",
        "type": "string"
      },
      {
        "name": "collectionMint",
        "type": "string"
      },
      {
        "name": "bubblegumSigner",
        "type": "string"
      },
      {
        "name": "collectionAuthorityRecord",
        "type": "string"
      },
      {
        "name": "setCollectionSizeArgs.size",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "BurnEditionNft",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "printEditionMint",
        "type": "string"
      },
      {
        "name": "masterEditionMint",
        "type": "string"
      },
      {
        "name": "printEditionTokenAccount",
        "type": "string"
      },
      {
        "name": "masterEditionTokenAccount",
        "type": "string"
      },
      {
        "name": "masterEditionAccount",
        "type": "string"
      },
      {
        "name": "printEditionAccount",
        "type": "string"
      },
      {
        "name": "editionMarkerAccount",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CreateEscrowAccount",
    "fields": [
      {
        "name": "escrow",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "edition",
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
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CloseEscrowAccount",
    "fields": [
      {
        "name": "escrow",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "tokenAccount",
        "type": "string"
      },
      {
        "name": "edition",
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
        "name": "sysvarInstructions",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "TransferOutOfEscrow",
    "fields": [
      {
        "name": "escrow",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "attributeMint",
        "type": "string"
      },
      {
        "name": "attributeSrc",
        "type": "string"
      },
      {
        "name": "attributeDst",
        "type": "string"
      },
      {
        "name": "escrowMint",
        "type": "string"
      },
      {
        "name": "escrowAccount",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "ataProgram",
        "type": "string"
      },
      {
        "name": "tokenProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "transferOutOfEscrowArgs.amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "Burn",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "masterEditionMint",
        "type": "string"
      },
      {
        "name": "masterEditionToken",
        "type": "string"
      },
      {
        "name": "editionMarker",
        "type": "string"
      },
      {
        "name": "tokenRecord",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "burnArgs",
        "type": "string"
      },
      {
        "name": "burnArgs.amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "Create",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "masterEdition",
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
        "name": "payer",
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
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "createArgs",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.name",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.symbol",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.uri",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "createArgs.asset_data.creators",
        "type": "json"
      },
      {
        "name": "createArgs.asset_data.primarySaleHappened",
        "type": "bool"
      },
      {
        "name": "createArgs.asset_data.isMutable",
        "type": "bool"
      },
      {
        "name": "createArgs.asset_data.tokenStandard",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.collection.verified",
        "type": "bool"
      },
      {
        "name": "createArgs.asset_data.collection.key",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.uses.useMethod",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.uses.remaining",
        "type": "bigint"
      },
      {
        "name": "createArgs.asset_data.uses.total",
        "type": "bigint"
      },
      {
        "name": "createArgs.asset_data.collectionDetails",
        "type": "string"
      },
      {
        "name": "createArgs.asset_data.collectionDetails.size",
        "type": "bigint"
      },
      {
        "name": "createArgs.asset_data.collectionDetails.padding",
        "type": "json"
      },
      {
        "name": "createArgs.asset_data.ruleSet",
        "type": "string"
      },
      {
        "name": "createArgs.decimals",
        "type": "number"
      },
      {
        "name": "createArgs.print_supply",
        "type": "string"
      },
      {
        "name": "createArgs.print_supply.field0",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "Mint",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "tokenOwner",
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
        "name": "tokenRecord",
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
        "name": "delegateRecord",
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
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "splAtaProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "mintArgs",
        "type": "string"
      },
      {
        "name": "mintArgs.amount",
        "type": "bigint"
      },
      {
        "name": "mintArgs.authorization_data.payload.map",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "Delegate",
    "fields": [
      {
        "name": "delegateRecord",
        "type": "string"
      },
      {
        "name": "delegate",
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
        "name": "tokenRecord",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "token",
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
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "delegateArgs",
        "type": "string"
      },
      {
        "name": "delegateArgs.authorization_data.payload.map",
        "type": "json"
      },
      {
        "name": "delegateArgs.amount",
        "type": "bigint"
      },
      {
        "name": "delegateArgs.locked_address",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Revoke",
    "fields": [
      {
        "name": "delegateRecord",
        "type": "string"
      },
      {
        "name": "delegate",
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
        "name": "tokenRecord",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "token",
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
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "revokeArgs",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Lock",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "tokenOwner",
        "type": "string"
      },
      {
        "name": "token",
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
        "name": "edition",
        "type": "string"
      },
      {
        "name": "tokenRecord",
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
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "lockArgs",
        "type": "string"
      },
      {
        "name": "lockArgs.authorization_data.payload.map",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "Unlock",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "tokenOwner",
        "type": "string"
      },
      {
        "name": "token",
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
        "name": "edition",
        "type": "string"
      },
      {
        "name": "tokenRecord",
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
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "unlockArgs",
        "type": "string"
      },
      {
        "name": "unlockArgs.authorization_data.payload.map",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "Migrate",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "tokenOwner",
        "type": "string"
      },
      {
        "name": "mint",
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
        "name": "collectionMetadata",
        "type": "string"
      },
      {
        "name": "delegateRecord",
        "type": "string"
      },
      {
        "name": "tokenRecord",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Transfer",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "tokenOwner",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "destinationOwner",
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
        "name": "edition",
        "type": "string"
      },
      {
        "name": "ownerTokenRecord",
        "type": "string"
      },
      {
        "name": "destinationTokenRecord",
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
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "splAtaProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "transferArgs",
        "type": "string"
      },
      {
        "name": "transferArgs.amount",
        "type": "bigint"
      },
      {
        "name": "transferArgs.authorization_data.payload.map",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "Update",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "delegateRecord",
        "type": "string"
      },
      {
        "name": "token",
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
        "name": "edition",
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
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "updateArgs",
        "type": "string"
      },
      {
        "name": "updateArgs.new_update_authority",
        "type": "string"
      },
      {
        "name": "updateArgs.data.name",
        "type": "string"
      },
      {
        "name": "updateArgs.data.symbol",
        "type": "string"
      },
      {
        "name": "updateArgs.data.uri",
        "type": "string"
      },
      {
        "name": "updateArgs.data.sellerFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "updateArgs.data.creators",
        "type": "json"
      },
      {
        "name": "updateArgs.primary_sale_happened",
        "type": "bool"
      },
      {
        "name": "updateArgs.is_mutable",
        "type": "bool"
      },
      {
        "name": "updateArgs.collection",
        "type": "string"
      },
      {
        "name": "updateArgs.collection.field0.verified",
        "type": "bool"
      },
      {
        "name": "updateArgs.collection.field0.key",
        "type": "string"
      },
      {
        "name": "updateArgs.collection_details",
        "type": "string"
      },
      {
        "name": "updateArgs.collection_details.field0",
        "type": "string"
      },
      {
        "name": "updateArgs.collection_details.field0.size",
        "type": "bigint"
      },
      {
        "name": "updateArgs.collection_details.field0.padding",
        "type": "json"
      },
      {
        "name": "updateArgs.uses",
        "type": "string"
      },
      {
        "name": "updateArgs.uses.field0.useMethod",
        "type": "string"
      },
      {
        "name": "updateArgs.uses.field0.remaining",
        "type": "bigint"
      },
      {
        "name": "updateArgs.uses.field0.total",
        "type": "bigint"
      },
      {
        "name": "updateArgs.rule_set",
        "type": "string"
      },
      {
        "name": "updateArgs.rule_set.field0",
        "type": "string"
      },
      {
        "name": "updateArgs.authorization_data.payload.map",
        "type": "json"
      },
      {
        "name": "updateArgs.token_standard",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Use",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "delegateRecord",
        "type": "string"
      },
      {
        "name": "token",
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
        "name": "edition",
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
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "authorizationRulesProgram",
        "type": "string"
      },
      {
        "name": "authorizationRules",
        "type": "string"
      },
      {
        "name": "useArgs",
        "type": "string"
      },
      {
        "name": "useArgs.authorization_data.payload.map",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "Verify",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "delegateRecord",
        "type": "string"
      },
      {
        "name": "metadata",
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
        "name": "collectionMasterEdition",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "verificationArgs",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Unverify",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "delegateRecord",
        "type": "string"
      },
      {
        "name": "metadata",
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
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "verificationArgs",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Collect",
    "fields": [
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "recipient",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "Print",
    "fields": [
      {
        "name": "editionMetadata",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "editionMint",
        "type": "string"
      },
      {
        "name": "editionTokenAccountOwner",
        "type": "string"
      },
      {
        "name": "editionTokenAccount",
        "type": "string"
      },
      {
        "name": "editionMintAuthority",
        "type": "string"
      },
      {
        "name": "editionTokenRecord",
        "type": "string"
      },
      {
        "name": "masterEdition",
        "type": "string"
      },
      {
        "name": "editionMarkerPda",
        "type": "string"
      },
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "masterTokenAccountOwner",
        "type": "string"
      },
      {
        "name": "masterTokenAccount",
        "type": "string"
      },
      {
        "name": "masterMetadata",
        "type": "string"
      },
      {
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "splTokenProgram",
        "type": "string"
      },
      {
        "name": "splAtaProgram",
        "type": "string"
      },
      {
        "name": "sysvarInstructions",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      },
      {
        "name": "printArgs",
        "type": "string"
      },
      {
        "name": "printArgs.edition",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "Resize",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "edition",
        "type": "string"
      },
      {
        "name": "mint",
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
        "name": "token",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "CloseAccounts",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "edition",
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
        "name": "destination",
        "type": "string"
      }
    ]
  }
] as const;

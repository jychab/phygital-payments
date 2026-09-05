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

export const PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" as const;

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
const DISC_INITIALIZEMINTCLOSEAUTHORITY = new Uint8Array([25]);
const DISC_INITIALIZETRANSFERFEECONFIG = new Uint8Array([26]);
const DISC_TRANSFERCHECKEDWITHFEE = new Uint8Array([26]);
const DISC_WITHDRAWWITHHELDTOKENSFROMMINT = new Uint8Array([26]);
const DISC_WITHDRAWWITHHELDTOKENSFROMACCOUNTS = new Uint8Array([26]);
const DISC_HARVESTWITHHELDTOKENSTOMINT = new Uint8Array([26]);
const DISC_SETTRANSFERFEE = new Uint8Array([26]);
const DISC_INITIALIZECONFIDENTIALTRANSFERMINT = new Uint8Array([27]);
const DISC_UPDATECONFIDENTIALTRANSFERMINT = new Uint8Array([27]);
const DISC_CONFIGURECONFIDENTIALTRANSFERACCOUNT = new Uint8Array([27]);
const DISC_APPROVECONFIDENTIALTRANSFERACCOUNT = new Uint8Array([27]);
const DISC_EMPTYCONFIDENTIALTRANSFERACCOUNT = new Uint8Array([27]);
const DISC_CONFIDENTIALDEPOSIT = new Uint8Array([27]);
const DISC_CONFIDENTIALWITHDRAW = new Uint8Array([27]);
const DISC_CONFIDENTIALTRANSFER = new Uint8Array([27]);
const DISC_APPLYCONFIDENTIALPENDINGBALANCE = new Uint8Array([27]);
const DISC_ENABLECONFIDENTIALCREDITS = new Uint8Array([27]);
const DISC_DISABLECONFIDENTIALCREDITS = new Uint8Array([27]);
const DISC_ENABLENONCONFIDENTIALCREDITS = new Uint8Array([27]);
const DISC_DISABLENONCONFIDENTIALCREDITS = new Uint8Array([27]);
const DISC_CONFIDENTIALTRANSFERWITHFEE = new Uint8Array([27]);
const DISC_CONFIGURECONFIDENTIALTRANSFERACCOUNTWITHREGISTRY = new Uint8Array([27]);
const DISC_INITIALIZEDEFAULTACCOUNTSTATE = new Uint8Array([28]);
const DISC_UPDATEDEFAULTACCOUNTSTATE = new Uint8Array([28]);
const DISC_REALLOCATE = new Uint8Array([29]);
const DISC_ENABLEMEMOTRANSFERS = new Uint8Array([30]);
const DISC_DISABLEMEMOTRANSFERS = new Uint8Array([30]);
const DISC_CREATENATIVEMINT = new Uint8Array([31]);
const DISC_INITIALIZENONTRANSFERABLEMINT = new Uint8Array([32]);
const DISC_INITIALIZEINTERESTBEARINGMINT = new Uint8Array([33]);
const DISC_UPDATERATEINTERESTBEARINGMINT = new Uint8Array([33]);
const DISC_ENABLECPIGUARD = new Uint8Array([34]);
const DISC_DISABLECPIGUARD = new Uint8Array([34]);
const DISC_INITIALIZEPERMANENTDELEGATE = new Uint8Array([35]);
const DISC_INITIALIZETRANSFERHOOK = new Uint8Array([36]);
const DISC_UPDATETRANSFERHOOK = new Uint8Array([36]);
const DISC_INITIALIZECONFIDENTIALTRANSFERFEE = new Uint8Array([37]);
const DISC_WITHDRAWWITHHELDTOKENSFROMMINTFORCONFIDENTIALTRANSFERFEE = new Uint8Array([37]);
const DISC_WITHDRAWWITHHELDTOKENSFROMACCOUNTSFORCONFIDENTIALTRANSFERFEE = new Uint8Array([37]);
const DISC_HARVESTWITHHELDTOKENSTOMINTFORCONFIDENTIALTRANSFERFEE = new Uint8Array([37]);
const DISC_ENABLEHARVESTTOMINT = new Uint8Array([37]);
const DISC_DISABLEHARVESTTOMINT = new Uint8Array([37]);
const DISC_WITHDRAWEXCESSLAMPORTS = new Uint8Array([38]);
const DISC_INITIALIZEMETADATAPOINTER = new Uint8Array([39]);
const DISC_UPDATEMETADATAPOINTER = new Uint8Array([39]);
const DISC_INITIALIZEGROUPPOINTER = new Uint8Array([40]);
const DISC_UPDATEGROUPPOINTER = new Uint8Array([40]);
const DISC_INITIALIZEGROUPMEMBERPOINTER = new Uint8Array([41]);
const DISC_UPDATEGROUPMEMBERPOINTER = new Uint8Array([41]);
const DISC_INITIALIZECONFIDENTIALMINTBURN = new Uint8Array([42]);
const DISC_ROTATESUPPLYELGAMALPUBKEY = new Uint8Array([42]);
const DISC_UPDATECONFIDENTIALMINTBURNDECRYPTABLESUPPLY = new Uint8Array([42]);
const DISC_CONFIDENTIALMINT = new Uint8Array([42]);
const DISC_CONFIDENTIALBURN = new Uint8Array([42]);
const DISC_APPLYCONFIDENTIALPENDINGBURN = new Uint8Array([42]);
const DISC_INITIALIZESCALEDUIAMOUNTMINT = new Uint8Array([43]);
const DISC_UPDATEMULTIPLIERSCALEDUIMINT = new Uint8Array([43]);
const DISC_INITIALIZEPAUSABLECONFIG = new Uint8Array([44]);
const DISC_PAUSE = new Uint8Array([44]);
const DISC_RESUME = new Uint8Array([44]);
const DISC_INITIALIZETOKENMETADATA = new Uint8Array([210,225,30,162,88,184,77,141]);
const DISC_UPDATETOKENMETADATAFIELD = new Uint8Array([221,233,49,45,181,202,220,200]);
const DISC_REMOVETOKENMETADATAKEY = new Uint8Array([234,18,32,56,89,141,37,181]);
const DISC_UPDATETOKENMETADATAUPDATEAUTHORITY = new Uint8Array([215,228,166,228,84,100,86,123]);
const DISC_EMITTOKENMETADATA = new Uint8Array([250,166,180,250,13,12,184,70]);
const DISC_INITIALIZETOKENGROUP = new Uint8Array([121,113,108,39,54,51,0,4]);
const DISC_UPDATETOKENGROUPMAXSIZE = new Uint8Array([108,37,171,143,248,30,18,110]);
const DISC_UPDATETOKENGROUPUPDATEAUTHORITY = new Uint8Array([161,105,88,1,237,221,216,203]);
const DISC_INITIALIZETOKENGROUPMEMBER = new Uint8Array([152,32,222,176,223,237,116,134]);
const DISC_UNWRAPLAMPORTS = new Uint8Array([45]);
const DISC_INITIALIZEPERMISSIONEDBURN = new Uint8Array([46]);
const DISC_PERMISSIONEDBURN = new Uint8Array([46]);
const DISC_PERMISSIONEDBURNCHECKED = new Uint8Array([46]);
const DISC_PERMISSIONEDCONFIDENTIALBURN = new Uint8Array([46]);
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
      if (tag === 4) {
        fields["authorityType"] = { type: "string", value: "transferFeeConfig" };
      }
      if (tag === 5) {
        fields["authorityType"] = { type: "string", value: "withheldWithdraw" };
      }
      if (tag === 6) {
        fields["authorityType"] = { type: "string", value: "closeMint" };
      }
      if (tag === 7) {
        fields["authorityType"] = { type: "string", value: "interestRate" };
      }
      if (tag === 8) {
        fields["authorityType"] = { type: "string", value: "permanentDelegate" };
      }
      if (tag === 9) {
        fields["authorityType"] = { type: "string", value: "confidentialTransferMint" };
      }
      if (tag === 10) {
        fields["authorityType"] = { type: "string", value: "transferHookProgramId" };
      }
      if (tag === 11) {
        fields["authorityType"] = { type: "string", value: "confidentialTransferFeeConfig" };
      }
      if (tag === 12) {
        fields["authorityType"] = { type: "string", value: "metadataPointer" };
      }
      if (tag === 13) {
        fields["authorityType"] = { type: "string", value: "groupPointer" };
      }
      if (tag === 14) {
        fields["authorityType"] = { type: "string", value: "groupMemberPointer" };
      }
      if (tag === 15) {
        fields["authorityType"] = { type: "string", value: "scaledUiAmount" };
      }
      if (tag === 16) {
        fields["authorityType"] = { type: "string", value: "pause" };
      }
      if (tag === 17) {
        fields["authorityType"] = { type: "string", value: "permissionedBurn" };
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
  if (discEq(data, DISC_INITIALIZEMINTCLOSEAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["closeAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeMintCloseAuthority", fields };
  }
  if (discEq(data, DISC_INITIALIZETRANSFERFEECONFIG)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["transferFeeConfigAuthority"] = { type: "string", value: v };
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
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["withdrawWithheldAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["transferFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["maximumFee"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "initializeTransferFeeConfig", fields };
  }
  if (discEq(data, DISC_TRANSFERCHECKEDWITHFEE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["source"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["fee"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "transferCheckedWithFee", fields };
  }
  if (discEq(data, DISC_WITHDRAWWITHHELDTOKENSFROMMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["feeReceiver"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["withdrawWithheldAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "withdrawWithheldTokensFromMint", fields };
  }
  if (discEq(data, DISC_WITHDRAWWITHHELDTOKENSFROMACCOUNTS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["feeReceiver"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["withdrawWithheldAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["numTokenAccounts"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "withdrawWithheldTokensFromAccounts", fields };
  }
  if (discEq(data, DISC_HARVESTWITHHELDTOKENSTOMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "harvestWithheldTokensToMint", fields };
  }
  if (discEq(data, DISC_SETTRANSFERFEE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["transferFeeConfigAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["transferFeeBasisPoints"] = { type: "number", value: v };
      o += 2;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["maximumFee"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "setTransferFee", fields };
  }
  if (discEq(data, DISC_INITIALIZECONFIDENTIALTRANSFERMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["autoApproveNewAccounts"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["auditorElgamalPubkey"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeConfidentialTransferMint", fields };
  }
  if (discEq(data, DISC_UPDATECONFIDENTIALTRANSFERMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["autoApproveNewAccounts"] = { type: "bool", value: v };
      o += 1;
    }
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["auditorElgamalPubkey"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateConfidentialTransferMint", fields };
  }
  if (discEq(data, DISC_CONFIGURECONFIDENTIALTRANSFERACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["instructionsSysvarOrContextState"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["decryptableZeroBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["maximumPendingBalanceCreditCounter"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length <= o) return null;
    fields["proofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "configureConfidentialTransferAccount", fields };
  }
  if (discEq(data, DISC_APPROVECONFIDENTIALTRANSFERACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "approveConfidentialTransferAccount", fields };
  }
  if (discEq(data, DISC_EMPTYCONFIDENTIALTRANSFERACCOUNT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["instructionsSysvarOrContextState"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["proofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "emptyConfidentialTransferAccount", fields };
  }
  if (discEq(data, DISC_CONFIDENTIALDEPOSIT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
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
    return { name: "confidentialDeposit", fields };
  }
  if (discEq(data, DISC_CONFIDENTIALWITHDRAW)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["instructionsSysvar"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["equalityRecord"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["rangeRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length <= o) return null;
    fields["decimals"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (data.length <= o) return null;
    fields["equalityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["rangeProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "confidentialWithdraw", fields };
  }
  if (discEq(data, DISC_CONFIDENTIALTRANSFER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["sourceToken"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["destinationToken"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["instructionsSysvar"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["equalityRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["ciphertextValidityRecord"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["rangeRecord"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newSourceDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (data.length < o + 64) return null;
    fields["transferAmountAuditorCiphertextLo"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length < o + 64) return null;
    fields["transferAmountAuditorCiphertextHi"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length <= o) return null;
    fields["equalityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["ciphertextValidityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["rangeProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "confidentialTransfer", fields };
  }
  if (discEq(data, DISC_APPLYCONFIDENTIALPENDINGBALANCE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["expectedPendingBalanceCreditCounter"] = { type: "bigint", value: v };
      o += 8;
    }
    if (data.length < o + 36) return null;
    fields["newDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (o !== data.length) return null;
    return { name: "applyConfidentialPendingBalance", fields };
  }
  if (discEq(data, DISC_ENABLECONFIDENTIALCREDITS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "enableConfidentialCredits", fields };
  }
  if (discEq(data, DISC_DISABLECONFIDENTIALCREDITS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "disableConfidentialCredits", fields };
  }
  if (discEq(data, DISC_ENABLENONCONFIDENTIALCREDITS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "enableNonConfidentialCredits", fields };
  }
  if (discEq(data, DISC_DISABLENONCONFIDENTIALCREDITS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "disableNonConfidentialCredits", fields };
  }
  if (discEq(data, DISC_CONFIDENTIALTRANSFERWITHFEE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["sourceToken"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["destinationToken"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["instructionsSysvar"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["equalityRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["transferAmountCiphertextValidityRecord"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (a) fields["feeSigmaRecord"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (a) fields["feeCiphertextValidityRecord"] = { type: "string", value: a }; }
    { const a = accounts[8]?.address; if (a) fields["rangeRecord"] = { type: "string", value: a }; }
    { const a = accounts[9]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newSourceDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (data.length < o + 64) return null;
    fields["transferAmountAuditorCiphertextLo"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length < o + 64) return null;
    fields["transferAmountAuditorCiphertextHi"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length <= o) return null;
    fields["equalityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["transferAmountCiphertextValidityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["feeSigmaProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["feeCiphertextValidityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["rangeProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "confidentialTransferWithFee", fields };
  }
  if (discEq(data, DISC_CONFIGURECONFIDENTIALTRANSFERACCOUNTWITHREGISTRY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["elgamalRegistry"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "configureConfidentialTransferAccountWithRegistry", fields };
  }
  if (discEq(data, DISC_INITIALIZEDEFAULTACCOUNTSTATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["defaultAccountStateDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["state"] = { type: "string", value: "uninitialized" };
      }
      if (tag === 1) {
        fields["state"] = { type: "string", value: "initialized" };
      }
      if (tag === 2) {
        fields["state"] = { type: "string", value: "frozen" };
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeDefaultAccountState", fields };
  }
  if (discEq(data, DISC_UPDATEDEFAULTACCOUNTSTATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["freezeAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["defaultAccountStateDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["state"] = { type: "string", value: "uninitialized" };
      }
      if (tag === 1) {
        fields["state"] = { type: "string", value: "initialized" };
      }
      if (tag === 2) {
        fields["state"] = { type: "string", value: "frozen" };
      }
    }
    if (o !== data.length) return null;
    return { name: "updateDefaultAccountState", fields };
  }
  if (discEq(data, DISC_REALLOCATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    {
      const arr: unknown[] = [];
      let _guard = 0;
      while (o < data.length) {
        if (++_guard > 4096) return null;
        {
          if (data.length <= o) return null;
          const tag = data[o]!; o += 1;
          const obj: Record<string, unknown> = { tag };
          if (tag === 0) {
            obj["variant"] = "uninitialized";
          }
          if (tag === 1) {
            obj["variant"] = "transferFeeConfig";
          }
          if (tag === 2) {
            obj["variant"] = "transferFeeAmount";
          }
          if (tag === 3) {
            obj["variant"] = "mintCloseAuthority";
          }
          if (tag === 4) {
            obj["variant"] = "confidentialTransferMint";
          }
          if (tag === 5) {
            obj["variant"] = "confidentialTransferAccount";
          }
          if (tag === 6) {
            obj["variant"] = "defaultAccountState";
          }
          if (tag === 7) {
            obj["variant"] = "immutableOwner";
          }
          if (tag === 8) {
            obj["variant"] = "memoTransfer";
          }
          if (tag === 9) {
            obj["variant"] = "nonTransferable";
          }
          if (tag === 10) {
            obj["variant"] = "interestBearingConfig";
          }
          if (tag === 11) {
            obj["variant"] = "cpiGuard";
          }
          if (tag === 12) {
            obj["variant"] = "permanentDelegate";
          }
          if (tag === 13) {
            obj["variant"] = "nonTransferableAccount";
          }
          if (tag === 14) {
            obj["variant"] = "transferHook";
          }
          if (tag === 15) {
            obj["variant"] = "transferHookAccount";
          }
          if (tag === 16) {
            obj["variant"] = "confidentialTransferFee";
          }
          if (tag === 17) {
            obj["variant"] = "confidentialTransferFeeAmount";
          }
          if (tag === 18) {
            obj["variant"] = "metadataPointer";
          }
          if (tag === 19) {
            obj["variant"] = "tokenMetadata";
          }
          if (tag === 20) {
            obj["variant"] = "groupPointer";
          }
          if (tag === 21) {
            obj["variant"] = "tokenGroup";
          }
          if (tag === 22) {
            obj["variant"] = "groupMemberPointer";
          }
          if (tag === 23) {
            obj["variant"] = "tokenGroupMember";
          }
          if (tag === 24) {
            obj["variant"] = "confidentialMintBurn";
          }
          if (tag === 25) {
            obj["variant"] = "scaledUiAmountConfig";
          }
          if (tag === 26) {
            obj["variant"] = "pausableConfig";
          }
          if (tag === 27) {
            obj["variant"] = "pausableAccount";
          }
          if (tag === 28) {
            obj["variant"] = "permissionedBurn";
          }
          arr.push(obj);
        }
      }
      fields["newExtensionTypes"] = { type: "json", value: JSON.stringify(arr) };
    }
    if (o !== data.length) return null;
    return { name: "reallocate", fields };
  }
  if (discEq(data, DISC_ENABLEMEMOTRANSFERS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["memoTransfersDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "enableMemoTransfers", fields };
  }
  if (discEq(data, DISC_DISABLEMEMOTRANSFERS)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["memoTransfersDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "disableMemoTransfers", fields };
  }
  if (discEq(data, DISC_CREATENATIVEMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["payer"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["nativeMint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["systemProgram"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "createNativeMint", fields };
  }
  if (discEq(data, DISC_INITIALIZENONTRANSFERABLEMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (o !== data.length) return null;
    return { name: "initializeNonTransferableMint", fields };
  }
  if (discEq(data, DISC_INITIALIZEINTERESTBEARINGMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["interestBearingMintDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["rateAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["rate"] = { type: "number", value: v };
      o += 2;
    }
    if (o !== data.length) return null;
    return { name: "initializeInterestBearingMint", fields };
  }
  if (discEq(data, DISC_UPDATERATEINTERESTBEARINGMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["rateAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["interestBearingMintDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU16Le(data, o);
      if (v == null) return null;
      fields["rate"] = { type: "number", value: v };
      o += 2;
    }
    if (o !== data.length) return null;
    return { name: "updateRateInterestBearingMint", fields };
  }
  if (discEq(data, DISC_ENABLECPIGUARD)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["cpiGuardDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "enableCpiGuard", fields };
  }
  if (discEq(data, DISC_DISABLECPIGUARD)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["owner"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["cpiGuardDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "disableCpiGuard", fields };
  }
  if (discEq(data, DISC_INITIALIZEPERMANENTDELEGATE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["delegate"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "initializePermanentDelegate", fields };
  }
  if (discEq(data, DISC_INITIALIZETRANSFERHOOK)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferHookDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
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
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["programId"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeTransferHook", fields };
  }
  if (discEq(data, DISC_UPDATETRANSFERHOOK)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["transferHookDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["programId"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateTransferHook", fields };
  }
  if (discEq(data, DISC_INITIALIZECONFIDENTIALTRANSFERFEE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["withdrawWithheldAuthorityElGamalPubkey"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "initializeConfidentialTransferFee", fields };
  }
  if (discEq(data, DISC_WITHDRAWWITHHELDTOKENSFROMMINTFORCONFIDENTIALTRANSFERFEE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["instructionsSysvarOrContextState"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["proofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (o !== data.length) return null;
    return { name: "withdrawWithheldTokensFromMintForConfidentialTransferFee", fields };
  }
  if (discEq(data, DISC_WITHDRAWWITHHELDTOKENSFROMACCOUNTSFORCONFIDENTIALTRANSFERFEE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["destination"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["instructionsSysvarOrContextState"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["numTokenAccounts"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["proofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (o !== data.length) return null;
    return { name: "withdrawWithheldTokensFromAccountsForConfidentialTransferFee", fields };
  }
  if (discEq(data, DISC_HARVESTWITHHELDTOKENSTOMINTFORCONFIDENTIALTRANSFERFEE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "harvestWithheldTokensToMintForConfidentialTransferFee", fields };
  }
  if (discEq(data, DISC_ENABLEHARVESTTOMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "enableHarvestToMint", fields };
  }
  if (discEq(data, DISC_DISABLEHARVESTTOMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialTransferFeeDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "disableHarvestToMint", fields };
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
  if (discEq(data, DISC_INITIALIZEMETADATAPOINTER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["metadataPointerDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
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
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["metadataAddress"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeMetadataPointer", fields };
  }
  if (discEq(data, DISC_UPDATEMETADATAPOINTER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["metadataPointerAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["metadataPointerDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["metadataAddress"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateMetadataPointer", fields };
  }
  if (discEq(data, DISC_INITIALIZEGROUPPOINTER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["groupPointerDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
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
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["groupAddress"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeGroupPointer", fields };
  }
  if (discEq(data, DISC_UPDATEGROUPPOINTER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["groupPointerAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["groupPointerDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["groupAddress"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateGroupPointer", fields };
  }
  if (discEq(data, DISC_INITIALIZEGROUPMEMBERPOINTER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["groupMemberPointerDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
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
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["memberAddress"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializeGroupMemberPointer", fields };
  }
  if (discEq(data, DISC_UPDATEGROUPMEMBERPOINTER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["groupMemberPointerAuthority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["groupMemberPointerDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["memberAddress"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateGroupMemberPointer", fields };
  }
  if (discEq(data, DISC_INITIALIZECONFIDENTIALMINTBURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialMintBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["supplyElgamalPubkey"] = { type: "string", value: v };
      o += 32;
    }
    if (data.length < o + 36) return null;
    fields["decryptableSupply"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (o !== data.length) return null;
    return { name: "initializeConfidentialMintBurn", fields };
  }
  if (discEq(data, DISC_ROTATESUPPLYELGAMALPUBKEY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["instructionsSysvarOrContextState"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialMintBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["newSupplyElgamalPubkey"] = { type: "string", value: v };
      o += 32;
    }
    if (data.length <= o) return null;
    fields["proofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "rotateSupplyElgamalPubkey", fields };
  }
  if (discEq(data, DISC_UPDATECONFIDENTIALMINTBURNDECRYPTABLESUPPLY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialMintBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newDecryptableSupply"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (o !== data.length) return null;
    return { name: "updateConfidentialMintBurnDecryptableSupply", fields };
  }
  if (discEq(data, DISC_CONFIDENTIALMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["instructionsSysvar"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["equalityRecord"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["ciphertextValidityRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["rangeRecord"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialMintBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newDecryptableSupply"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (data.length < o + 64) return null;
    fields["mintAmountAuditorCiphertextLo"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length < o + 64) return null;
    fields["mintAmountAuditorCiphertextHi"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length <= o) return null;
    fields["equalityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["ciphertextValidityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["rangeProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "confidentialMint", fields };
  }
  if (discEq(data, DISC_CONFIDENTIALBURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["instructionsSysvar"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["equalityRecord"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["ciphertextValidityRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["rangeRecord"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialMintBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (data.length < o + 64) return null;
    fields["burnAmountAuditorCiphertextLo"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length < o + 64) return null;
    fields["burnAmountAuditorCiphertextHi"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length <= o) return null;
    fields["equalityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["ciphertextValidityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["rangeProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "confidentialBurn", fields };
  }
  if (discEq(data, DISC_APPLYCONFIDENTIALPENDINGBURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["confidentialMintBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "applyConfidentialPendingBurn", fields };
  }
  if (discEq(data, DISC_INITIALIZESCALEDUIAMOUNTMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["scaledUiAmountMintDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    {
      const v = readFloatLe(data, o, 8);
      if (v == null) return null;
      fields["multiplier"] = { type: "number", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "initializeScaledUiAmountMint", fields };
  }
  if (discEq(data, DISC_UPDATEMULTIPLIERSCALEDUIMINT)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["scaledUiAmountMintDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readFloatLe(data, o, 8);
      if (v == null) return null;
      fields["multiplier"] = { type: "number", value: v };
      o += 8;
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["effectiveTimestamp"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "updateMultiplierScaledUiMint", fields };
  }
  if (discEq(data, DISC_INITIALIZEPAUSABLECONFIG)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["pausableDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["authority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "initializePausableConfig", fields };
  }
  if (discEq(data, DISC_PAUSE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["pausableDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "pause", fields };
  }
  if (discEq(data, DISC_RESUME)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["pausableDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "resume", fields };
  }
  if (discEq(data, DISC_INITIALIZETOKENMETADATA)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
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
      fields["name"] = { type: "string", value: s };
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
      fields["symbol"] = { type: "string", value: s };
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
      fields["uri"] = { type: "string", value: s };
      o += n;
    }
    if (o !== data.length) return null;
    return { name: "initializeTokenMetadata", fields };
  }
  if (discEq(data, DISC_UPDATETOKENMETADATAFIELD)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    let o = 8;
    {
      if (data.length <= o) return null;
      const tag = data[o]!;
      o += 1;
      if (tag === 0) {
        fields["field"] = { type: "string", value: "name" };
      }
      if (tag === 1) {
        fields["field"] = { type: "string", value: "symbol" };
      }
      if (tag === 2) {
        fields["field"] = { type: "string", value: "uri" };
      }
      if (tag === 3) {
        fields["field"] = { type: "string", value: "key" };
        {
          const len = readU32Le(data, o);
          if (len == null) return null;
          if (len > 4096) return null;
          o += 4;
          const n = len;
          if (data.length < o + n) return null;
          const s = readUtf8(data, o, n);
          if (s == null) return null;
          fields["field.field0"] = { type: "string", value: s };
          o += n;
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
      fields["value"] = { type: "string", value: s };
      o += n;
    }
    if (o !== data.length) return null;
    return { name: "updateTokenMetadataField", fields };
  }
  if (discEq(data, DISC_REMOVETOKENMETADATAKEY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    let o = 8;
    {
      const v = readBool(data, o);
      if (v == null) return null;
      fields["idempotent"] = { type: "bool", value: v };
      o += 1;
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
      fields["key"] = { type: "string", value: s };
      o += n;
    }
    if (o !== data.length) return null;
    return { name: "removeTokenMetadataKey", fields };
  }
  if (discEq(data, DISC_UPDATETOKENMETADATAUPDATEAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["newUpdateAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateTokenMetadataUpdateAuthority", fields };
  }
  if (discEq(data, DISC_EMITTOKENMETADATA)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["metadata"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["start"] = { type: "bigint", value: v };
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
          const v = readU64Le(data, o);
          if (v == null) return null;
          fields["end"] = { type: "bigint", value: v };
          o += 8;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "emitTokenMetadata", fields };
  }
  if (discEq(data, DISC_INITIALIZETOKENGROUP)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["mintAuthority"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["updateAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["maxSize"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "initializeTokenGroup", fields };
  }
  if (discEq(data, DISC_UPDATETOKENGROUPMAXSIZE)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    let o = 8;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["maxSize"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "updateTokenGroupMaxSize", fields };
  }
  if (discEq(data, DISC_UPDATETOKENGROUPUPDATEAUTHORITY)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["updateAuthority"] = { type: "string", value: a }; }
    let o = 8;
    if (data.length <= o) return null;
    {
      const opt = data[o]!;
      o += 1;
      if (opt === 1) {
        {
          const v = readPubkey(data, o);
          if (v == null) return null;
          fields["newUpdateAuthority"] = { type: "string", value: v };
          o += 32;
        }
      }
    }
    if (o !== data.length) return null;
    return { name: "updateTokenGroupUpdateAuthority", fields };
  }
  if (discEq(data, DISC_INITIALIZETOKENGROUPMEMBER)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["member"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["memberMint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["memberMintAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["group"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (!a) return null; fields["groupUpdateAuthority"] = { type: "string", value: a }; }
    let o = 8;
    if (o !== data.length) return null;
    return { name: "initializeTokenGroupMember", fields };
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
  if (discEq(data, DISC_INITIALIZEPERMISSIONEDBURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["permissionedBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readPubkey(data, o);
      if (v == null) return null;
      fields["authority"] = { type: "string", value: v };
      o += 32;
    }
    if (o !== data.length) return null;
    return { name: "initializePermissionedBurn", fields };
  }
  if (discEq(data, DISC_PERMISSIONEDBURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["permissionedBurnAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["permissionedBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    {
      const v = readU64Le(data, o);
      if (v == null) return null;
      fields["amount"] = { type: "bigint", value: v };
      o += 8;
    }
    if (o !== data.length) return null;
    return { name: "permissionedBurn", fields };
  }
  if (discEq(data, DISC_PERMISSIONEDBURNCHECKED)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["account"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (!a) return null; fields["permissionedBurnAuthority"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["permissionedBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
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
    return { name: "permissionedBurnChecked", fields };
  }
  if (discEq(data, DISC_PERMISSIONEDCONFIDENTIALBURN)) {
    const fields: GeneratedIx["fields"] = {};
    { const a = accounts[0]?.address; if (!a) return null; fields["token"] = { type: "string", value: a }; }
    { const a = accounts[1]?.address; if (!a) return null; fields["mint"] = { type: "string", value: a }; }
    { const a = accounts[2]?.address; if (a) fields["instructionsSysvar"] = { type: "string", value: a }; }
    { const a = accounts[3]?.address; if (a) fields["equalityRecord"] = { type: "string", value: a }; }
    { const a = accounts[4]?.address; if (a) fields["ciphertextValidityRecord"] = { type: "string", value: a }; }
    { const a = accounts[5]?.address; if (a) fields["rangeRecord"] = { type: "string", value: a }; }
    { const a = accounts[6]?.address; if (!a) return null; fields["permissionedBurnAuthority"] = { type: "string", value: a }; }
    { const a = accounts[7]?.address; if (!a) return null; fields["authority"] = { type: "string", value: a }; }
    let o = 1;
    if (data.length <= o) return null;
    fields["permissionedBurnDiscriminator"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length < o + 36) return null;
    fields["newDecryptableAvailableBalance"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 36)) };
    o += 36;
    if (data.length < o + 64) return null;
    fields["burnAmountAuditorCiphertextLo"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length < o + 64) return null;
    fields["burnAmountAuditorCiphertextHi"] = { type: "bytes", value: encodeBase58(data.subarray(o, o + 64)) };
    o += 64;
    if (data.length <= o) return null;
    fields["equalityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["ciphertextValidityProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (data.length <= o) return null;
    fields["rangeProofInstructionOffset"] = { type: "number", value: data[o]! };
    o += 1;
    if (o !== data.length) return null;
    return { name: "permissionedConfidentialBurn", fields };
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
    "instruction": "initializeMintCloseAuthority",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "closeAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeTransferFeeConfig",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "transferFeeDiscriminator",
        "type": "number"
      },
      {
        "name": "transferFeeConfigAuthority",
        "type": "string"
      },
      {
        "name": "withdrawWithheldAuthority",
        "type": "string"
      },
      {
        "name": "transferFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "maximumFee",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "transferCheckedWithFee",
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
        "name": "transferFeeDiscriminator",
        "type": "number"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "decimals",
        "type": "number"
      },
      {
        "name": "fee",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "withdrawWithheldTokensFromMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "feeReceiver",
        "type": "string"
      },
      {
        "name": "withdrawWithheldAuthority",
        "type": "string"
      },
      {
        "name": "transferFeeDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "withdrawWithheldTokensFromAccounts",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "feeReceiver",
        "type": "string"
      },
      {
        "name": "withdrawWithheldAuthority",
        "type": "string"
      },
      {
        "name": "transferFeeDiscriminator",
        "type": "number"
      },
      {
        "name": "numTokenAccounts",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "harvestWithheldTokensToMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "transferFeeDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "setTransferFee",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "transferFeeConfigAuthority",
        "type": "string"
      },
      {
        "name": "transferFeeDiscriminator",
        "type": "number"
      },
      {
        "name": "transferFeeBasisPoints",
        "type": "number"
      },
      {
        "name": "maximumFee",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "initializeConfidentialTransferMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "autoApproveNewAccounts",
        "type": "bool"
      },
      {
        "name": "auditorElgamalPubkey",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateConfidentialTransferMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "autoApproveNewAccounts",
        "type": "bool"
      },
      {
        "name": "auditorElgamalPubkey",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "configureConfidentialTransferAccount",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "instructionsSysvarOrContextState",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "decryptableZeroBalance",
        "type": "bytes"
      },
      {
        "name": "maximumPendingBalanceCreditCounter",
        "type": "bigint"
      },
      {
        "name": "proofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "approveConfidentialTransferAccount",
    "fields": [
      {
        "name": "token",
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
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "emptyConfidentialTransferAccount",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "instructionsSysvarOrContextState",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "proofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "confidentialDeposit",
    "fields": [
      {
        "name": "token",
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
        "name": "confidentialTransferDiscriminator",
        "type": "number"
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
    "instruction": "confidentialWithdraw",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "instructionsSysvar",
        "type": "string"
      },
      {
        "name": "equalityRecord",
        "type": "string"
      },
      {
        "name": "rangeRecord",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "amount",
        "type": "bigint"
      },
      {
        "name": "decimals",
        "type": "number"
      },
      {
        "name": "newDecryptableAvailableBalance",
        "type": "bytes"
      },
      {
        "name": "equalityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "rangeProofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "confidentialTransfer",
    "fields": [
      {
        "name": "sourceToken",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "destinationToken",
        "type": "string"
      },
      {
        "name": "instructionsSysvar",
        "type": "string"
      },
      {
        "name": "equalityRecord",
        "type": "string"
      },
      {
        "name": "ciphertextValidityRecord",
        "type": "string"
      },
      {
        "name": "rangeRecord",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "newSourceDecryptableAvailableBalance",
        "type": "bytes"
      },
      {
        "name": "transferAmountAuditorCiphertextLo",
        "type": "bytes"
      },
      {
        "name": "transferAmountAuditorCiphertextHi",
        "type": "bytes"
      },
      {
        "name": "equalityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "ciphertextValidityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "rangeProofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "applyConfidentialPendingBalance",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "expectedPendingBalanceCreditCounter",
        "type": "bigint"
      },
      {
        "name": "newDecryptableAvailableBalance",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "enableConfidentialCredits",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "disableConfidentialCredits",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "enableNonConfidentialCredits",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "disableNonConfidentialCredits",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "confidentialTransferWithFee",
    "fields": [
      {
        "name": "sourceToken",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "destinationToken",
        "type": "string"
      },
      {
        "name": "instructionsSysvar",
        "type": "string"
      },
      {
        "name": "equalityRecord",
        "type": "string"
      },
      {
        "name": "transferAmountCiphertextValidityRecord",
        "type": "string"
      },
      {
        "name": "feeSigmaRecord",
        "type": "string"
      },
      {
        "name": "feeCiphertextValidityRecord",
        "type": "string"
      },
      {
        "name": "rangeRecord",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      },
      {
        "name": "newSourceDecryptableAvailableBalance",
        "type": "bytes"
      },
      {
        "name": "transferAmountAuditorCiphertextLo",
        "type": "bytes"
      },
      {
        "name": "transferAmountAuditorCiphertextHi",
        "type": "bytes"
      },
      {
        "name": "equalityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "transferAmountCiphertextValidityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "feeSigmaProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "feeCiphertextValidityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "rangeProofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "configureConfidentialTransferAccountWithRegistry",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "elgamalRegistry",
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
        "name": "confidentialTransferDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "initializeDefaultAccountState",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "defaultAccountStateDiscriminator",
        "type": "number"
      },
      {
        "name": "state",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateDefaultAccountState",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "freezeAuthority",
        "type": "string"
      },
      {
        "name": "defaultAccountStateDiscriminator",
        "type": "number"
      },
      {
        "name": "state",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "reallocate",
    "fields": [
      {
        "name": "token",
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
        "name": "owner",
        "type": "string"
      },
      {
        "name": "newExtensionTypes",
        "type": "json"
      }
    ]
  },
  {
    "instruction": "enableMemoTransfers",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "memoTransfersDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "disableMemoTransfers",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "memoTransfersDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "createNativeMint",
    "fields": [
      {
        "name": "payer",
        "type": "string"
      },
      {
        "name": "nativeMint",
        "type": "string"
      },
      {
        "name": "systemProgram",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeNonTransferableMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeInterestBearingMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "interestBearingMintDiscriminator",
        "type": "number"
      },
      {
        "name": "rateAuthority",
        "type": "string"
      },
      {
        "name": "rate",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "updateRateInterestBearingMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "rateAuthority",
        "type": "string"
      },
      {
        "name": "interestBearingMintDiscriminator",
        "type": "number"
      },
      {
        "name": "rate",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "enableCpiGuard",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "cpiGuardDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "disableCpiGuard",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "owner",
        "type": "string"
      },
      {
        "name": "cpiGuardDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "initializePermanentDelegate",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "delegate",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeTransferHook",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "transferHookDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "programId",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateTransferHook",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "transferHookDiscriminator",
        "type": "number"
      },
      {
        "name": "programId",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeConfidentialTransferFee",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "confidentialTransferFeeDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "withdrawWithheldAuthorityElGamalPubkey",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "withdrawWithheldTokensFromMintForConfidentialTransferFee",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "instructionsSysvarOrContextState",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferFeeDiscriminator",
        "type": "number"
      },
      {
        "name": "proofInstructionOffset",
        "type": "number"
      },
      {
        "name": "newDecryptableAvailableBalance",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "withdrawWithheldTokensFromAccountsForConfidentialTransferFee",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "instructionsSysvarOrContextState",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferFeeDiscriminator",
        "type": "number"
      },
      {
        "name": "numTokenAccounts",
        "type": "number"
      },
      {
        "name": "proofInstructionOffset",
        "type": "number"
      },
      {
        "name": "newDecryptableAvailableBalance",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "harvestWithheldTokensToMintForConfidentialTransferFee",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "confidentialTransferFeeDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "enableHarvestToMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferFeeDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "disableHarvestToMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialTransferFeeDiscriminator",
        "type": "number"
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
    "instruction": "initializeMetadataPointer",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "metadataPointerDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "metadataAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateMetadataPointer",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "metadataPointerAuthority",
        "type": "string"
      },
      {
        "name": "metadataPointerDiscriminator",
        "type": "number"
      },
      {
        "name": "metadataAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeGroupPointer",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "groupPointerDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "groupAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateGroupPointer",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "groupPointerAuthority",
        "type": "string"
      },
      {
        "name": "groupPointerDiscriminator",
        "type": "number"
      },
      {
        "name": "groupAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeGroupMemberPointer",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "groupMemberPointerDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "memberAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateGroupMemberPointer",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "groupMemberPointerAuthority",
        "type": "string"
      },
      {
        "name": "groupMemberPointerDiscriminator",
        "type": "number"
      },
      {
        "name": "memberAddress",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeConfidentialMintBurn",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "confidentialMintBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "supplyElgamalPubkey",
        "type": "string"
      },
      {
        "name": "decryptableSupply",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "rotateSupplyElgamalPubkey",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "instructionsSysvarOrContextState",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialMintBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "newSupplyElgamalPubkey",
        "type": "string"
      },
      {
        "name": "proofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "updateConfidentialMintBurnDecryptableSupply",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialMintBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "newDecryptableSupply",
        "type": "bytes"
      }
    ]
  },
  {
    "instruction": "confidentialMint",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "instructionsSysvar",
        "type": "string"
      },
      {
        "name": "equalityRecord",
        "type": "string"
      },
      {
        "name": "ciphertextValidityRecord",
        "type": "string"
      },
      {
        "name": "rangeRecord",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialMintBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "newDecryptableSupply",
        "type": "bytes"
      },
      {
        "name": "mintAmountAuditorCiphertextLo",
        "type": "bytes"
      },
      {
        "name": "mintAmountAuditorCiphertextHi",
        "type": "bytes"
      },
      {
        "name": "equalityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "ciphertextValidityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "rangeProofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "confidentialBurn",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "instructionsSysvar",
        "type": "string"
      },
      {
        "name": "equalityRecord",
        "type": "string"
      },
      {
        "name": "ciphertextValidityRecord",
        "type": "string"
      },
      {
        "name": "rangeRecord",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialMintBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "newDecryptableAvailableBalance",
        "type": "bytes"
      },
      {
        "name": "burnAmountAuditorCiphertextLo",
        "type": "bytes"
      },
      {
        "name": "burnAmountAuditorCiphertextHi",
        "type": "bytes"
      },
      {
        "name": "equalityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "ciphertextValidityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "rangeProofInstructionOffset",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "applyConfidentialPendingBurn",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "confidentialMintBurnDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "initializeScaledUiAmountMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "scaledUiAmountMintDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "multiplier",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "updateMultiplierScaledUiMint",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "scaledUiAmountMintDiscriminator",
        "type": "number"
      },
      {
        "name": "multiplier",
        "type": "number"
      },
      {
        "name": "effectiveTimestamp",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "initializePausableConfig",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "pausableDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "pause",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "pausableDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "resume",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "pausableDiscriminator",
        "type": "number"
      }
    ]
  },
  {
    "instruction": "initializeTokenMetadata",
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
        "name": "mintAuthority",
        "type": "string"
      },
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "symbol",
        "type": "string"
      },
      {
        "name": "uri",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateTokenMetadataField",
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
        "name": "field",
        "type": "string"
      },
      {
        "name": "field.field0",
        "type": "string"
      },
      {
        "name": "value",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "removeTokenMetadataKey",
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
        "name": "idempotent",
        "type": "bool"
      },
      {
        "name": "key",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "updateTokenMetadataUpdateAuthority",
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
        "name": "newUpdateAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "emitTokenMetadata",
    "fields": [
      {
        "name": "metadata",
        "type": "string"
      },
      {
        "name": "start",
        "type": "bigint"
      },
      {
        "name": "end",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "initializeTokenGroup",
    "fields": [
      {
        "name": "group",
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
        "name": "updateAuthority",
        "type": "string"
      },
      {
        "name": "maxSize",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "updateTokenGroupMaxSize",
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
        "name": "maxSize",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "updateTokenGroupUpdateAuthority",
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
        "name": "newUpdateAuthority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "initializeTokenGroupMember",
    "fields": [
      {
        "name": "member",
        "type": "string"
      },
      {
        "name": "memberMint",
        "type": "string"
      },
      {
        "name": "memberMintAuthority",
        "type": "string"
      },
      {
        "name": "group",
        "type": "string"
      },
      {
        "name": "groupUpdateAuthority",
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
    "instruction": "initializePermissionedBurn",
    "fields": [
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "permissionedBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "authority",
        "type": "string"
      }
    ]
  },
  {
    "instruction": "permissionedBurn",
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
        "name": "permissionedBurnAuthority",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "permissionedBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "amount",
        "type": "bigint"
      }
    ]
  },
  {
    "instruction": "permissionedBurnChecked",
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
        "name": "permissionedBurnAuthority",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "permissionedBurnDiscriminator",
        "type": "number"
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
    "instruction": "permissionedConfidentialBurn",
    "fields": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "mint",
        "type": "string"
      },
      {
        "name": "instructionsSysvar",
        "type": "string"
      },
      {
        "name": "equalityRecord",
        "type": "string"
      },
      {
        "name": "ciphertextValidityRecord",
        "type": "string"
      },
      {
        "name": "rangeRecord",
        "type": "string"
      },
      {
        "name": "permissionedBurnAuthority",
        "type": "string"
      },
      {
        "name": "authority",
        "type": "string"
      },
      {
        "name": "permissionedBurnDiscriminator",
        "type": "number"
      },
      {
        "name": "newDecryptableAvailableBalance",
        "type": "bytes"
      },
      {
        "name": "burnAmountAuditorCiphertextLo",
        "type": "bytes"
      },
      {
        "name": "burnAmountAuditorCiphertextHi",
        "type": "bytes"
      },
      {
        "name": "equalityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "ciphertextValidityProofInstructionOffset",
        "type": "number"
      },
      {
        "name": "rangeProofInstructionOffset",
        "type": "number"
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

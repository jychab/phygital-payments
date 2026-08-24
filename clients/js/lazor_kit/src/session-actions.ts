/**
 * LazorKit session action builders + serialization.
 * Layout matches program/src/state/action.rs and @lazorkit/sdk-legacy.
 *
 * Each action: [type: u8][data_len: u16 LE][expires_at: u64 LE][data...]
 * Max 16 actions / 2048 bytes per session.
 */
import {
  getAddressDecoder,
  getAddressEncoder,
  type Address,
  type ReadonlyUint8Array,
} from "@solana/kit";

import { readU16Le, readU64Le } from "./bytes";

export const MAX_SESSION_ACTIONS = 16;
export const MAX_SESSION_ACTIONS_BYTES = 2048;

export enum SessionActionType {
  SolLimit = 1,
  SolRecurringLimit = 2,
  SolMaxPerTx = 3,
  TokenLimit = 4,
  TokenRecurringLimit = 5,
  TokenMaxPerTx = 6,
  ProgramWhitelist = 10,
  ProgramBlacklist = 11,
}

export type SolLimitAction = {
  type: SessionActionType.SolLimit;
  remaining: bigint;
  expiresAt?: bigint;
};

export type SolRecurringLimitAction = {
  type: SessionActionType.SolRecurringLimit;
  limit: bigint;
  window: bigint;
  spent?: bigint;
  lastReset?: bigint;
  expiresAt?: bigint;
};

export type SolMaxPerTxAction = {
  type: SessionActionType.SolMaxPerTx;
  max: bigint;
  expiresAt?: bigint;
};

export type TokenLimitAction = {
  type: SessionActionType.TokenLimit;
  mint: Address;
  remaining: bigint;
  expiresAt?: bigint;
};

export type TokenRecurringLimitAction = {
  type: SessionActionType.TokenRecurringLimit;
  mint: Address;
  limit: bigint;
  window: bigint;
  spent?: bigint;
  lastReset?: bigint;
  expiresAt?: bigint;
};

export type TokenMaxPerTxAction = {
  type: SessionActionType.TokenMaxPerTx;
  mint: Address;
  max: bigint;
  expiresAt?: bigint;
};

export type ProgramWhitelistAction = {
  type: SessionActionType.ProgramWhitelist;
  programId: Address;
  expiresAt?: bigint;
};

export type ProgramBlacklistAction = {
  type: SessionActionType.ProgramBlacklist;
  programId: Address;
  expiresAt?: bigint;
};

export type SessionAction =
  | SolLimitAction
  | SolRecurringLimitAction
  | SolMaxPerTxAction
  | TokenLimitAction
  | TokenRecurringLimitAction
  | TokenMaxPerTxAction
  | ProgramWhitelistAction
  | ProgramBlacklistAction;

export const Actions = {
  solLimit: (remaining: bigint, expiresAt?: bigint): SolLimitAction => ({
    type: SessionActionType.SolLimit,
    remaining,
    expiresAt,
  }),
  solRecurringLimit: (params: {
    limit: bigint;
    window: bigint;
    expiresAt?: bigint;
  }): SolRecurringLimitAction => ({
    type: SessionActionType.SolRecurringLimit,
    ...params,
  }),
  solMaxPerTx: (max: bigint, expiresAt?: bigint): SolMaxPerTxAction => ({
    type: SessionActionType.SolMaxPerTx,
    max,
    expiresAt,
  }),
  tokenLimit: (params: {
    mint: Address;
    remaining: bigint;
    expiresAt?: bigint;
  }): TokenLimitAction => ({
    type: SessionActionType.TokenLimit,
    ...params,
  }),
  tokenRecurringLimit: (params: {
    mint: Address;
    limit: bigint;
    window: bigint;
    expiresAt?: bigint;
  }): TokenRecurringLimitAction => ({
    type: SessionActionType.TokenRecurringLimit,
    ...params,
  }),
  tokenMaxPerTx: (params: {
    mint: Address;
    max: bigint;
    expiresAt?: bigint;
  }): TokenMaxPerTxAction => ({
    type: SessionActionType.TokenMaxPerTx,
    ...params,
  }),
  programWhitelist: (
    programId: Address,
    expiresAt?: bigint,
  ): ProgramWhitelistAction => ({
    type: SessionActionType.ProgramWhitelist,
    programId,
    expiresAt,
  }),
  programBlacklist: (
    programId: Address,
    expiresAt?: bigint,
  ): ProgramBlacklistAction => ({
    type: SessionActionType.ProgramBlacklist,
    programId,
    expiresAt,
  }),
};

const ACTION_HEADER_SIZE = 11;
const addressEncoder = getAddressEncoder();

function writeU64Le(buf: Uint8Array, offset: number, value: bigint): void {
  new DataView(buf.buffer, buf.byteOffset, buf.byteLength).setBigUint64(
    offset,
    value,
    true,
  );
}

function writeU16Le(buf: Uint8Array, offset: number, value: number): void {
  buf[offset] = value & 0xff;
  buf[offset + 1] = (value >> 8) & 0xff;
}

function encodeAddress(address: Address): Uint8Array {
  return new Uint8Array(addressEncoder.encode(address));
}

function serializeActionData(action: SessionAction): Uint8Array {
  switch (action.type) {
    case SessionActionType.SolLimit: {
      const buf = new Uint8Array(8);
      writeU64Le(buf, 0, action.remaining);
      return buf;
    }
    case SessionActionType.SolRecurringLimit: {
      const buf = new Uint8Array(32);
      writeU64Le(buf, 0, action.limit);
      writeU64Le(buf, 8, action.spent ?? 0n);
      writeU64Le(buf, 16, action.window);
      writeU64Le(buf, 24, action.lastReset ?? 0n);
      return buf;
    }
    case SessionActionType.SolMaxPerTx: {
      const buf = new Uint8Array(8);
      writeU64Le(buf, 0, action.max);
      return buf;
    }
    case SessionActionType.TokenLimit: {
      const buf = new Uint8Array(40);
      buf.set(encodeAddress(action.mint), 0);
      writeU64Le(buf, 32, action.remaining);
      return buf;
    }
    case SessionActionType.TokenRecurringLimit: {
      const buf = new Uint8Array(64);
      buf.set(encodeAddress(action.mint), 0);
      writeU64Le(buf, 32, action.limit);
      writeU64Le(buf, 40, action.spent ?? 0n);
      writeU64Le(buf, 48, action.window);
      writeU64Le(buf, 56, action.lastReset ?? 0n);
      return buf;
    }
    case SessionActionType.TokenMaxPerTx: {
      const buf = new Uint8Array(40);
      buf.set(encodeAddress(action.mint), 0);
      writeU64Le(buf, 32, action.max);
      return buf;
    }
    case SessionActionType.ProgramWhitelist:
    case SessionActionType.ProgramBlacklist:
      return encodeAddress(action.programId);
  }
}

/** Serialize SessionAction[] into the flat buffer CreateSession expects. */
export function serializeActions(
  actions: readonly SessionAction[],
): Uint8Array {
  if (actions.length === 0) return new Uint8Array();
  if (actions.length > MAX_SESSION_ACTIONS) {
    throw new Error(`At most ${MAX_SESSION_ACTIONS} session actions`);
  }

  const parts: Uint8Array[] = [];
  for (const action of actions) {
    const data = serializeActionData(action);
    const header = new Uint8Array(ACTION_HEADER_SIZE);
    header[0] = action.type;
    writeU16Le(header, 1, data.length);
    writeU64Le(header, 3, action.expiresAt ?? 0n);
    parts.push(header, data);
  }

  const totalLen = parts.reduce((sum, p) => sum + p.length, 0);
  if (totalLen > MAX_SESSION_ACTIONS_BYTES) {
    throw new Error(
      `Session actions exceed ${MAX_SESSION_ACTIONS_BYTES} bytes`,
    );
  }

  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

const addressDecoder = getAddressDecoder();

function decodeAddress(data: Uint8Array, offset = 0): Address {
  return addressDecoder.decode(data.subarray(offset, offset + 32));
}

function deserializeActionData(
  type: SessionActionType,
  data: Uint8Array,
  expiresAt?: bigint,
): SessionAction {
  switch (type) {
    case SessionActionType.SolLimit:
      return { type, remaining: readU64Le(data, 0), expiresAt };
    case SessionActionType.SolRecurringLimit:
      return {
        type,
        limit: readU64Le(data, 0),
        spent: readU64Le(data, 8),
        window: readU64Le(data, 16),
        lastReset: readU64Le(data, 24),
        expiresAt,
      };
    case SessionActionType.SolMaxPerTx:
      return { type, max: readU64Le(data, 0), expiresAt };
    case SessionActionType.TokenLimit:
      return {
        type,
        mint: decodeAddress(data),
        remaining: readU64Le(data, 32),
        expiresAt,
      };
    case SessionActionType.TokenRecurringLimit:
      return {
        type,
        mint: decodeAddress(data),
        limit: readU64Le(data, 32),
        spent: readU64Le(data, 40),
        window: readU64Le(data, 48),
        lastReset: readU64Le(data, 56),
        expiresAt,
      };
    case SessionActionType.TokenMaxPerTx:
      return {
        type,
        mint: decodeAddress(data),
        max: readU64Le(data, 32),
        expiresAt,
      };
    case SessionActionType.ProgramWhitelist:
    case SessionActionType.ProgramBlacklist:
      return { type, programId: decodeAddress(data), expiresAt };
    default:
      throw new Error(`Unknown session action type ${type}`);
  }
}

/** Parse the on-chain actions buffer from a session account. */
export function deserializeActions(bytes: Uint8Array): SessionAction[] {
  const actions: SessionAction[] = [];
  let offset = 0;
  while (offset < bytes.length) {
    if (offset + ACTION_HEADER_SIZE > bytes.length) {
      throw new Error("Truncated session action header");
    }
    const type = bytes[offset]! as SessionActionType;
    const dataLen = readU16Le(bytes, offset + 1);
    const expiresRaw = readU64Le(bytes, offset + 3);
    offset += ACTION_HEADER_SIZE;
    if (offset + dataLen > bytes.length) {
      throw new Error("Truncated session action data");
    }
    const data = bytes.subarray(offset, offset + dataLen);
    offset += dataLen;
    const expiresAt = expiresRaw === 0n ? undefined : expiresRaw;
    actions.push(deserializeActionData(type, data, expiresAt));
    if (actions.length > MAX_SESSION_ACTIONS) {
      throw new Error(`At most ${MAX_SESSION_ACTIONS} session actions`);
    }
  }
  return actions;
}

export function actionsByteLength(actions: ReadonlyUint8Array): number {
  return actions.length;
}

/**
 * Thin offset readers over `@solana/codecs` for STANDARD + IDL-generated parsers.
 */
import {
  fixDecoderSize,
  getBase58Decoder,
  getBooleanDecoder,
  getF32Decoder,
  getF64Decoder,
  getU16Decoder,
  getU32Decoder,
  getU64Decoder,
  getU128Decoder,
  getU8Decoder,
  getUtf8Decoder,
} from "@solana/codecs";

const u8 = getU8Decoder();
const u16 = getU16Decoder();
const u32 = getU32Decoder();
const u64 = getU64Decoder();
const u128 = getU128Decoder();
const f32 = getF32Decoder();
const f64 = getF64Decoder();
const bool = getBooleanDecoder();
const base58 = getBase58Decoder();
const pubkey = fixDecoderSize(getBase58Decoder(), 32);
const utf8 = getUtf8Decoder();

export function discEq(data: Uint8Array, expected: Uint8Array): boolean {
  return bytesEqualAt(data, 0, expected);
}

/** Solana RPC Memcmp-style: `data[offset..offset+expected.length] === expected`. */
export function bytesEqualAt(
  data: Uint8Array,
  offset: number,
  expected: Uint8Array,
): boolean {
  if (expected.length === 0) return false;
  if (data.length < offset + expected.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (data[offset + i] !== expected[i]) return false;
  }
  return true;
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function readU8(data: Uint8Array, offset: number): number | null {
  if (data.length < offset + 1) return null;
  try {
    return u8.decode(data, offset);
  } catch {
    return null;
  }
}

export function readU16Le(data: Uint8Array, offset: number): number | null {
  if (data.length < offset + 2) return null;
  try {
    return u16.decode(data, offset);
  } catch {
    return null;
  }
}

export function readU32Le(data: Uint8Array, offset: number): number | null {
  if (data.length < offset + 4) return null;
  try {
    return u32.decode(data, offset);
  } catch {
    return null;
  }
}

export function readU64Le(data: Uint8Array, offset: number): bigint | null {
  if (data.length < offset + 8) return null;
  try {
    return u64.decode(data, offset);
  } catch {
    return null;
  }
}

export function readU128Le(data: Uint8Array, offset: number): bigint | null {
  if (data.length < offset + 16) return null;
  try {
    return u128.decode(data, offset);
  } catch {
    return null;
  }
}

export function readFloatLe(
  data: Uint8Array,
  offset: number,
  size: 4 | 8,
): number | null {
  if (data.length < offset + size) return null;
  try {
    return size === 4
      ? f32.decode(data, offset)
      : f64.decode(data, offset);
  } catch {
    return null;
  }
}

export function readBool(data: Uint8Array, offset: number): boolean | null {
  if (data.length < offset + 1) return null;
  try {
    return bool.decode(data, offset);
  } catch {
    return null;
  }
}

/** Raw bytes → base58 string (hashes, nested byte fields). */
export function encodeBase58(bytes: Uint8Array): string {
  return base58.decode(bytes);
}

/** 32-byte pubkey → base58 address string. */
export function readPubkey(data: Uint8Array, offset: number): string | null {
  if (data.length < offset + 32) return null;
  try {
    return pubkey.decode(data, offset);
  } catch {
    return null;
  }
}

export function readUtf8(
  data: Uint8Array,
  offset: number,
  length: number,
): string | null {
  if (data.length < offset + length) return null;
  try {
    return fixDecoderSize(utf8, length).decode(data, offset);
  } catch {
    return null;
  }
}

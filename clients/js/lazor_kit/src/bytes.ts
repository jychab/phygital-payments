export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", copy));
}

export async function sha256Concat(
  parts: readonly Uint8Array[],
): Promise<Uint8Array> {
  let len = 0;
  for (const part of parts) len += part.length;
  const joined = new Uint8Array(len);
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return sha256(joined);
}

export function concatBytes(parts: readonly Uint8Array[]): Uint8Array {
  let len = 0;
  for (const part of parts) len += part.length;
  const out = new Uint8Array(len);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function encodeU16Le(value: number): Uint8Array {
  const out = new Uint8Array(2);
  new DataView(out.buffer).setUint16(0, value, true);
  return out;
}

export function readU32Le(data: Uint8Array, offset: number): number {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(
    offset,
    true,
  );
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** P-256 curve order. */
const P256_N = BigInt(
  "0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551",
);
const P256_HALF_N = P256_N / 2n;

function readDerInt(der: Uint8Array, offset: number): {
  value: Uint8Array;
  next: number;
} {
  if (der[offset] !== 0x02) {
    throw new Error("Invalid ECDSA signature");
  }
  const len = der[offset + 1]!;
  let start = offset + 2;
  let n = len;
  while (n > 32 && der[start] === 0) {
    start += 1;
    n -= 1;
  }
  if (n > 32) throw new Error("Invalid ECDSA signature");
  const value = new Uint8Array(32);
  value.set(der.subarray(start, start + n), 32 - n);
  return { value, next: offset + 2 + len };
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  return n;
}

function bigIntTo32(value: bigint): Uint8Array {
  const out = new Uint8Array(32);
  let n = value;
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

/** WebAuthn DER ECDSA → 64-byte r||s, low-S. */
export function derEcdsaToRawLowS(der: Uint8Array): Uint8Array {
  if (der[0] !== 0x30) throw new Error("Invalid ECDSA signature");
  const seqLen = der[1]!;
  const { value: r, next } = readDerInt(der, 2);
  const { value: sBytes } = readDerInt(der, next);
  if (2 + seqLen > der.length) throw new Error("Invalid ECDSA signature");

  let s = bytesToBigInt(sBytes);
  if (s > P256_HALF_N) s = P256_N - s;
  return concatBytes([r, bigIntTo32(s)]);
}

/** Uncompressed SPKI / 0x04||x||y → 33-byte compressed secp256r1 key. */
export function compressP256PublicKey(
  spkiOrUncompressed: Uint8Array,
): Uint8Array {
  let uncompressed = spkiOrUncompressed;
  if (
    uncompressed.length === 91 &&
    uncompressed[0] === 0x30 &&
    uncompressed[26] === 0x04
  ) {
    uncompressed = uncompressed.subarray(26);
  }
  if (uncompressed.length === 65 && uncompressed[0] === 0x04) {
    const x = uncompressed.subarray(1, 33);
    const y = uncompressed.subarray(33, 65);
    const prefix = (y[31]! & 1) === 0 ? 0x02 : 0x03;
    return concatBytes([Uint8Array.of(prefix), x]);
  }
  if (
    uncompressed.length === 33 &&
    (uncompressed[0] === 0x02 || uncompressed[0] === 0x03)
  ) {
    return uncompressed;
  }
  throw new Error("Unsupported P-256 public key encoding");
}

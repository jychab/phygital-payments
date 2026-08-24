/** Constant-time equality for bytes or same-length strings (char codes). */

export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(a, b);
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const left = new Uint8Array(a.length);
  const right = new Uint8Array(b.length);
  for (let i = 0; i < a.length; i++) {
    left[i] = a.charCodeAt(i);
    right[i] = b.charCodeAt(i);
  }
  return timingSafeEqualBytes(left, right);
}

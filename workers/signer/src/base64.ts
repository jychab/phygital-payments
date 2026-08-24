import { getBase64Decoder, getBase64Encoder } from "@solana/kit";

/** Decode standard base64 → bytes (`@solana/kit` encoder polarity). */
export function base64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(getBase64Encoder().encode(base64));
}

/** Encode bytes → standard base64 (`@solana/kit` decoder polarity). */
export function bytesToBase64(bytes: Uint8Array): string {
  return getBase64Decoder().decode(bytes);
}

/** Standard base64 → URL-safe (`-`/`_`, no padding). */
export function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** URL-safe base64 (`-`/`_`, optional padding) → bytes. */
export function base64UrlToBytes(base64url: string): Uint8Array {
  const padded = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  return base64ToBytes(padded + "=".repeat(padLen));
}

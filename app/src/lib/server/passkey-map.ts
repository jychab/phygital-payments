import "server-only";

import { bytesToBase64Url, base64UrlToBytes } from "@/lib/crypto/base64";
import { getAppKv } from "./app-kv";

function passkeyKey(credentialId: Uint8Array): string {
  return `passkey:${bytesToBase64Url(credentialId)}`;
}

/** Persist credentialId → compressed P-256 so Face ID can restore the vault. */
export async function putPasskeyMapping(args: {
  credentialId: Uint8Array;
  compressedPubkey: Uint8Array;
}): Promise<void> {
  await getAppKv().put(
    passkeyKey(args.credentialId),
    bytesToBase64Url(args.compressedPubkey),
  );
}

export async function getPasskeyMapping(
  credentialId: Uint8Array,
): Promise<Uint8Array | null> {
  const raw = await getAppKv().get(passkeyKey(credentialId));
  if (!raw) return null;
  const bytes = base64UrlToBytes(raw);
  return bytes.length === 33 ? bytes : null;
}

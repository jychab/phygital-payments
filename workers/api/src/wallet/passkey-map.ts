import { bytesToBase64Url, base64UrlToBytes } from "@/shared/base64";
import { getAppDb } from "@/platform/app-db";

/** Persist credentialId → compressed P-256 so Face ID can restore the vault. */
export async function putPasskeyMapping(args: {
  credentialId: Uint8Array;
  compressedPubkey: Uint8Array;
}): Promise<void> {
  await getAppDb()
    .prepare(
      `INSERT INTO passkey_map (credential_id, compressed_pubkey)
       VALUES (?, ?)
       ON CONFLICT(credential_id) DO UPDATE SET
         compressed_pubkey = excluded.compressed_pubkey`,
    )
    .bind(
      bytesToBase64Url(args.credentialId),
      bytesToBase64Url(args.compressedPubkey),
    )
    .run();
}

export async function getPasskeyMapping(
  credentialId: Uint8Array,
): Promise<Uint8Array | null> {
  const row = await getAppDb()
    .prepare(`SELECT compressed_pubkey FROM passkey_map WHERE credential_id = ?`)
    .bind(bytesToBase64Url(credentialId))
    .first<{ compressed_pubkey: string }>();
  if (!row) return null;
  const bytes = base64UrlToBytes(row.compressed_pubkey);
  return bytes.length === 33 ? bytes : null;
}

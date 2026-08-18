/** Device pay API key format: `ppk_<wallet>_<secret>` (secret = 48 hex chars). */

const PREFIX = "ppk_";
export const SECRET_HEX_LEN = 48;

/** Build a pay API key for `wallet` with the given secret hex. */
export function formatPayApiKey(wallet: string, secretHex: string): string {
  return `${PREFIX}${wallet}_${secretHex}`;
}

/** Extract wallet from `ppk_<wallet>_<secret>`. Returns null when malformed. */
export function parseWalletFromPayApiKey(apiKey: string): string | null {
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith(PREFIX)) return null;

  const body = trimmed.slice(PREFIX.length);
  const sep = body.indexOf("_");
  if (sep <= 0) return null;

  const wallet = body.slice(0, sep);
  const secret = body.slice(sep + 1);

  if (wallet.length < 32 || wallet.length > 44) return null;
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(wallet)) return null;
  if (!/^[a-f0-9]{48}$/.test(secret)) return null;

  return wallet;
}

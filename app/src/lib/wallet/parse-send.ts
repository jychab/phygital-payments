import { tryParseAddress } from "@/lib/solana/address";
import { parseSolAmount } from "./sol";

export type ParsedSend = {
  destination: string;
  lamports: bigint;
};

const SEND_RE =
  /^\s*(?:send|pay)\s+(\d+(?:\.\d+)?)\s*(?:sol)?\s+(?:to\s+)?([1-9A-HJ-NP-Za-km-z]{32,44})\s*$/i;

/** In-app NL → structured SOL transfer. Local only; Face ID binds the real ix. */
export function parseSendIntent(raw: string): ParsedSend | null {
  const match = SEND_RE.exec(raw.trim());
  if (!match) return null;
  const lamports = parseSolAmount(match[1] ?? "");
  const destination = tryParseAddress(match[2]);
  if (lamports == null || lamports <= 0n || !destination) return null;
  return { destination: String(destination), lamports };
}

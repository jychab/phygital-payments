import { getBase64Encoder } from "@solana/kit";

type RpcAccountData = string | [string, string];

export function rpcAccountDataBytes(
  data: RpcAccountData | undefined,
): Uint8Array | null {
  if (!data) return null;
  const raw = Array.isArray(data) ? data[0] : data;
  return new Uint8Array(getBase64Encoder().encode(raw));
}

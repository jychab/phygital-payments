import { getSolanaRpc } from "@/lib/solana/rpc";
import {
  fetchMaybePhygitalTokenByPasskey,
  fetchPhygitalTokenByIdentifier,
  type PhygitalToken,
} from "@/lib/phygital/token";

export async function getPhygitalTokenByIdentifier(
  identifier: string,
): Promise<PhygitalToken> {
  return fetchPhygitalTokenByIdentifier(getSolanaRpc(), identifier);
}

export async function getMaybePhygitalTokenByPasskey(
  secp256r1PublicKey: string,
): Promise<PhygitalToken | null> {
  return fetchMaybePhygitalTokenByPasskey(getSolanaRpc(), secp256r1PublicKey);
}

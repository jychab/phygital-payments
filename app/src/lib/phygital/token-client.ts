import { queryFetch, readJson } from "@/lib/queries/http";
import type { PhygitalToken } from "@/lib/phygital/token";
import {
  fromPhygitalTokenWire,
  type PhygitalTokenWire,
} from "@/lib/phygital/token-wire";

export async function fetchPhygitalTokenByIdentifierClient(
  identifier: string,
): Promise<PhygitalToken> {
  const res = await queryFetch(
    `/api/tokens/phygital?identifier=${encodeURIComponent(identifier)}`,
  );
  const body = await readJson<{ token: PhygitalTokenWire }>(
    res,
    "Couldn’t load this accessory",
  );
  return fromPhygitalTokenWire(body.token);
}

export async function fetchMaybePhygitalTokenByPasskeyClient(
  secp256r1PublicKey: string,
): Promise<PhygitalToken | null> {
  const res = await queryFetch(
    `/api/tokens/phygital?passkey=${encodeURIComponent(secp256r1PublicKey)}`,
  );
  const body = await readJson<{ token: PhygitalTokenWire | null }>(
    res,
    "Couldn’t load this accessory",
  );
  return body.token ? fromPhygitalTokenWire(body.token) : null;
}

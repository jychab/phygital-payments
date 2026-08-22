import { address } from "@solana/kit";

import { queryFetch, readJson } from "@/lib/queries/http";
import type { PhygitalToken } from "@/lib/phygital/token";

type PhygitalTokenWire = {
  tokenType: PhygitalToken["tokenType"];
  identifier: string;
  secp256r1PublicKey: string;
  address: string;
  isLocked: boolean;
  currentOwner: string;
  lastSignCount: number;
  mint: string;
};

function fromWire(wire: PhygitalTokenWire): PhygitalToken {
  return {
    tokenType: wire.tokenType,
    identifier: wire.identifier,
    secp256r1PublicKey: wire.secp256r1PublicKey,
    address: address(wire.address),
    isLocked: wire.isLocked,
    currentOwner: address(wire.currentOwner),
    lastSignCount: wire.lastSignCount,
    mint: address(wire.mint),
  };
}

export async function fetchPhygitalTokenByIdentifierClient(
  identifier: string,
): Promise<PhygitalToken> {
  const res = await queryFetch(
    `/api/tokens/phygital?identifier=${encodeURIComponent(identifier)}`,
  );
  const body = await readJson<{ token: PhygitalTokenWire }>(
    res,
    "Couldn’t load phygital",
  );
  return fromWire(body.token);
}

export async function fetchMaybePhygitalTokenByPasskeyClient(
  secp256r1PublicKey: string,
): Promise<PhygitalToken | null> {
  const res = await queryFetch(
    `/api/tokens/phygital?passkey=${encodeURIComponent(secp256r1PublicKey)}`,
  );
  const body = await readJson<{ token: PhygitalTokenWire | null }>(
    res,
    "Couldn’t load phygital",
  );
  return body.token ? fromWire(body.token) : null;
}

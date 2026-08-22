import "server-only";

import { getAppKv } from "./app-kv";
import { getSolanaRpc } from "@/lib/solana/rpc";
import {
  fetchMaybePhygitalTokenByPasskey,
  fetchPhygitalTokenByIdentifier,
  type PhygitalToken,
} from "@/lib/phygital/token";

const IDENTIFIER_CACHE_TTL_SEC = 60;
const PASSKEY_CACHE_TTL_SEC = 30;

function identifierCacheKey(identifier: string): string {
  return `phygital:identifier:${identifier}`;
}

function passkeyCacheKey(secp256r1PublicKey: string): string {
  return `phygital:passkey:${secp256r1PublicKey}`;
}

export type PhygitalTokenWire = {
  tokenType: PhygitalToken["tokenType"];
  identifier: string;
  secp256r1PublicKey: string;
  address: string;
  isLocked: boolean;
  currentOwner: string;
  lastSignCount: number;
  mint: string;
};

function wireToken(token: PhygitalToken): PhygitalTokenWire {
  return {
    tokenType: token.tokenType,
    identifier: token.identifier,
    secp256r1PublicKey: token.secp256r1PublicKey,
    address: String(token.address),
    isLocked: token.isLocked,
    currentOwner: String(token.currentOwner),
    lastSignCount: token.lastSignCount,
    mint: String(token.mint),
  };
}

export { wireToken };

function fromWireToken(wire: PhygitalTokenWire): PhygitalToken {
  return {
    tokenType: wire.tokenType,
    identifier: wire.identifier,
    secp256r1PublicKey: wire.secp256r1PublicKey,
    address: wire.address as PhygitalToken["address"],
    isLocked: wire.isLocked,
    currentOwner: wire.currentOwner as PhygitalToken["currentOwner"],
    lastSignCount: wire.lastSignCount,
    mint: wire.mint as PhygitalToken["mint"],
  };
}

export async function fetchPhygitalTokenByIdentifierCached(
  identifier: string,
): Promise<PhygitalToken> {
  const cacheKey = identifierCacheKey(identifier);
  const cached = await getAppKv().get(cacheKey, "json");
  if (cached && typeof cached === "object") {
    return fromWireToken(cached as PhygitalTokenWire);
  }

  const token = await fetchPhygitalTokenByIdentifier(getSolanaRpc(), identifier);
  await getAppKv().put(cacheKey, JSON.stringify(wireToken(token)), {
    expirationTtl: IDENTIFIER_CACHE_TTL_SEC,
  });
  return token;
}

export async function fetchMaybePhygitalTokenByPasskeyCached(
  secp256r1PublicKey: string,
): Promise<PhygitalToken | null> {
  const cacheKey = passkeyCacheKey(secp256r1PublicKey);
  const cached = await getAppKv().get(cacheKey);
  if (cached === "null") return null;
  if (cached) {
    return fromWireToken(JSON.parse(cached) as PhygitalTokenWire);
  }

  const token = await fetchMaybePhygitalTokenByPasskey(
    getSolanaRpc(),
    secp256r1PublicKey,
  );
  await getAppKv().put(
    cacheKey,
    token ? JSON.stringify(wireToken(token)) : "null",
    { expirationTtl: PASSKEY_CACHE_TTL_SEC },
  );
  return token;
}

export async function bustPhygitalTokenCache(token: {
  identifier: string;
  secp256r1PublicKey: string;
}): Promise<void> {
  await Promise.all([
    getAppKv().delete(identifierCacheKey(token.identifier)),
    getAppKv().delete(passkeyCacheKey(token.secp256r1PublicKey)),
  ]);
}

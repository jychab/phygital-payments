import { address } from "@solana/kit";

import type { PhygitalToken } from "@/lib/phygital/token";

/** JSON wire shape for phygital tokens over HTTP. */
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

export function toPhygitalTokenWire(token: PhygitalToken): PhygitalTokenWire {
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

export function fromPhygitalTokenWire(wire: PhygitalTokenWire): PhygitalToken {
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

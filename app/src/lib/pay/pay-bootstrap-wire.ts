/** JSON wire for `GET /api/pay/bootstrap` (Maps / bigint are not JSON). */

import { address } from "@solana/kit";

import type { PhygitalToken } from "@/lib/phygital/token";
import type {
  MintDelegateStatus,
  OwnerPayDelegates,
  OwnerPayMintMatch,
} from "@/lib/tokens/mint-delegate";
import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";

export type PayBootstrap = {
  holdings: PaymentTokenHolding[];
  delegates: OwnerPayDelegates;
};

export type MintDelegateStatusWire = {
  programAuthority: string;
  ata: string;
  isProgramAuthorityDelegate: boolean;
  ataExists: boolean;
  delegatedAmountRaw: string;
  delegatedAmountUi: string;
  balanceRaw: string;
  balanceUi: string;
};

export type OwnerPayMintMatchWire = {
  token: string | null;
  status: MintDelegateStatusWire | null;
};

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

export type PayBootstrapWire = {
  holdings: PaymentTokenHolding[];
  tokens: PhygitalTokenWire[];
  tokenEnabled: boolean;
  byMint: [string, OwnerPayMintMatchWire][];
  statusByTokenMint: [string, string, MintDelegateStatusWire][];
};

export function serializePayBootstrap(data: PayBootstrap): PayBootstrapWire {
  return {
    holdings: data.holdings,
    tokens: data.delegates.tokens.map(serializeToken),
    tokenEnabled: data.delegates.tokenEnabled,
    byMint: [...data.delegates.byMint.entries()].map(([mint, match]) => [
      mint,
      serializeMatch(match),
    ]),
    statusByTokenMint: [...data.delegates.statusByTokenMint.entries()].map(
      ([key, status]) => {
        const [token, mint] = key.split("|");
        return [token!, mint!, serializeStatus(status)] as const;
      },
    ),
  };
}

export function parsePayBootstrap(wire: PayBootstrapWire): PayBootstrap {
  const byMint = new Map<string, OwnerPayMintMatch>();
  for (const [mint, match] of wire.byMint ?? []) {
    byMint.set(mint, parseMatch(match));
  }
  const statusByTokenMint = new Map<string, MintDelegateStatus>();
  for (const [token, mint, status] of wire.statusByTokenMint ?? []) {
    if (!token || !mint) continue;
    statusByTokenMint.set(`${token}|${mint}`, parseStatus(status));
  }
  return {
    holdings: wire.holdings ?? [],
    delegates: {
      tokens: (wire.tokens ?? []).map(parseToken),
      tokenEnabled: wire.tokenEnabled === true,
      byMint,
      statusByTokenMint,
    },
  };
}

function serializeToken(token: PhygitalToken): PhygitalTokenWire {
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

function parseToken(wire: PhygitalTokenWire): PhygitalToken {
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

function serializeMatch(match: OwnerPayMintMatch): OwnerPayMintMatchWire {
  return {
    token: match.token ? String(match.token) : null,
    status: match.status ? serializeStatus(match.status) : null,
  };
}

function parseMatch(wire: OwnerPayMintMatchWire): OwnerPayMintMatch {
  return {
    token: wire.token ? address(wire.token) : null,
    status: wire.status ? parseStatus(wire.status) : null,
  };
}

function serializeStatus(status: MintDelegateStatus): MintDelegateStatusWire {
  return {
    programAuthority: String(status.programAuthority),
    ata: String(status.ata),
    isProgramAuthorityDelegate: status.isProgramAuthorityDelegate,
    ataExists: status.ataExists,
    delegatedAmountRaw: status.delegatedAmountRaw.toString(),
    delegatedAmountUi: status.delegatedAmountUi,
    balanceRaw: status.balanceRaw.toString(),
    balanceUi: status.balanceUi,
  };
}

function parseStatus(wire: MintDelegateStatusWire): MintDelegateStatus {
  const balanceRaw = BigInt(wire.balanceRaw);
  return {
    programAuthority: address(wire.programAuthority),
    ata: address(wire.ata),
    ataExists:
      wire.ataExists !== undefined
        ? wire.ataExists
        : wire.isProgramAuthorityDelegate || balanceRaw > BigInt(0),
    isProgramAuthorityDelegate: wire.isProgramAuthorityDelegate,
    delegatedAmountRaw: BigInt(wire.delegatedAmountRaw),
    delegatedAmountUi: wire.delegatedAmountUi,
    balanceRaw,
    balanceUi: wire.balanceUi,
  };
}

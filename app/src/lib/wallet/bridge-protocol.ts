/**
 * postMessage protocol between the phygital-payments iframe (child) and the
 * Revibase vault (parent). The parent holds the wallet; the child asks it for
 * the connected address and for transaction signatures. Wire bytes travel
 * as base64 (robust across origins). Keep this contract in sync with the
 * parent's copy in revibase-app-page (src/lib/vault/payments-bridge-protocol.ts).
 */

import { base64ToBytes, bytesToBase64 } from "@/lib/payments/submitter-types";

export const BRIDGE_PROTOCOL_VERSION = 1;

export const BRIDGE_MESSAGE = {
  /** child → parent: mounted, request a handshake. */
  ready: "revibase-pay:ready",
  /** parent → child: connected wallet (address/chain). */
  wallet: "revibase-pay:wallet",
  /** child → parent: sign these wire bytes. */
  signRequest: "revibase-pay:sign-request",
  /** parent → child: signed wire bytes (or an error). */
  signResponse: "revibase-pay:sign-response",
} as const;

export type ReadyMessage = {
  type: typeof BRIDGE_MESSAGE.ready;
  v: number;
};

export type WalletMessage = {
  type: typeof BRIDGE_MESSAGE.wallet;
  v: number;
  address: string | null;
  /** e.g. "solana:mainnet" — the parent's active chain. */
  chain: string | null;
};

export type SignRequestMessage = {
  type: typeof BRIDGE_MESSAGE.signRequest;
  v: number;
  id: string;
  /** base64 unsigned transaction wire bytes. */
  transaction: string;
};

export type SignResponseMessage = {
  type: typeof BRIDGE_MESSAGE.signResponse;
  v: number;
  id: string;
  /** base64 signed transaction wire bytes, present on success. */
  signedTransaction?: string;
  /** error string, present on failure. */
  error?: string;
};

/** Messages the child sends to the parent. */
export type ChildToParentMessage = ReadyMessage | SignRequestMessage;
/** Messages the parent sends to the child. */
export type ParentToChildMessage =
  | WalletMessage
  | SignResponseMessage;

export function isParentToChildMessage(
  data: unknown,
): data is ParentToChildMessage {
  if (typeof data !== "object" || data === null) return false;
  const type = (data as { type?: unknown }).type;
  return (
    type === BRIDGE_MESSAGE.wallet ||
    type === BRIDGE_MESSAGE.signResponse
  );
}

export function isChildToParentMessage(
  data: unknown,
): data is ChildToParentMessage {
  if (typeof data !== "object" || data === null) return false;
  const type = (data as { type?: unknown }).type;
  return type === BRIDGE_MESSAGE.ready || type === BRIDGE_MESSAGE.signRequest;
}

export { base64ToBytes, bytesToBase64 };

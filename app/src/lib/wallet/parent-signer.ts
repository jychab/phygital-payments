"use client";

import { type TransactionPartialSigner } from "@solana/kit";

import { makeKitSignerFromWires } from "./kit-signer";
import { type ParentBridge } from "./parent-bridge";

/** Build a kit signer that forwards transactions to the iframe parent window. */
export function makeParentSigner(
  address: string,
  bridge: ParentBridge,
): TransactionPartialSigner {
  return makeKitSignerFromWires(address, (wires) => bridge.signWires(wires));
}

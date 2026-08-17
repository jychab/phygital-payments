import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
  type TransferSession,
} from "phygital-token-sdk";
import { type Address, type TransactionSigner } from "@solana/kit";

import type { ClaimAuthWire } from "../../../shared/pending-claim-wire";
import { SLOT_HASHES_CAPACITY } from "../../../shared/slot-hashes";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { sendTransaction } from "@/lib/solana/tx";

/** Pre-NFC checks from cached asset view — run before showing NFC hold UI. */
export function assertCaptureReady(
  asset: Pick<PhygitalAsset, "isLocked">,
): void {
  if (asset.isLocked) {
    throw new Error(
      "This NFC device is locked. Unlock it before moving it to this phone.",
    );
  }
}

/** Pre-submit checks at wallet finish — recipient must differ from current owner. */
export function assertClaimReady(
  asset: Pick<PhygitalAsset, "isLocked" | "currentOwner">,
  recipient: Address,
): void {
  assertCaptureReady(asset);
  if (asset.currentOwner === recipient) {
    throw new Error("This NFC device is already on that wallet.");
  }
}

/** Safari step: NFC tap only — no wallet connect or submit. */
export async function captureClaimTap(args: {
  asset: Address;
  onPasskeyComplete?: () => void;
}): Promise<{
  session: TransferSession;
  auth: ClaimAuthWire;
}> {
  const session = await beginTransfer({
    rpc: getSolanaRpc(),
    asset: args.asset,
  });
  const auth = await authenticatePasskeyForTransfer(session);
  args.onPasskeyComplete?.();
  return { session, auth };
}

/** Wallet step: SDK transfer_ownership + recipient-signed submit. */
export async function finishClaim(args: {
  asset: Address;
  slotNumber: string;
  auth: ClaimAuthWire;
  recipient: TransactionSigner;
}): Promise<{ signature: string }> {
  const slotNumber = BigInt(args.slotNumber);

  // completeTransfer only reads asset + slotNumber from the session.
  const session: TransferSession = {
    rpc: getSolanaRpc(),
    asset: args.asset,
    slotNumber,
    slotHash: new Uint8Array(32),
    challenge: new Uint8Array(32),
  };

  const instructions = await completeTransfer(session, args.auth, args.recipient);

  const { signature } = await sendTransaction({
    instructions,
    feePayer: args.recipient,
  });
  return { signature };
}

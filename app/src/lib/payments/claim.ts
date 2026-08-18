import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
  type TransferSession,
} from "phygital-token-sdk";
import { address, getBase58Encoder, type Address, type TransactionSigner } from "@solana/kit";
import type { PendingClaimRecord } from "../../../shared/pending-claim-wire";
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
  auth: PendingClaimRecord["auth"];
}> {
  const session = await beginTransfer({
    rpc: getSolanaRpc(),
    asset: args.asset,
  });
  const auth = await authenticatePasskeyForTransfer(session);
  args.onPasskeyComplete?.();
  return { session, auth };
}


function hydrateTransferSession(
  json: PendingClaimRecord["session"],
): TransferSession {
  return {
    rpc: getSolanaRpc(),
    asset: address(json.asset),
    slotNumber: BigInt(json.slotNumber),
    slotHash: new Uint8Array(getBase58Encoder().encode(json.slotHash)),
    challenge: new Uint8Array(getBase58Encoder().encode(json.challenge)),
  };
}

/** Wallet step: SDK completeTransfer (transfer_ownership) + recipient-signed submit. */
export async function finishClaim(
  args: Omit<PendingClaimRecord, "createdAtMs"> & {
    recipient: TransactionSigner;
  },
): Promise<{ signature: string }> {
  const session = hydrateTransferSession(args.session);

  const instructions = await completeTransfer(session, args.auth, args.recipient);

  const { signature, confirmed } = await sendTransaction({
    instructions,
    feePayer: args.recipient,
  });
  await confirmed;
  return { signature };
}

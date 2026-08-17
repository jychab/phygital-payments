import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  buildSecp256r1VerifyInstructionFromWebAuthnResponse,
  parseSecp256r1Pubkey,
  type TransferSession,
} from "phygital-token-sdk";
import { address as toAddress, type Address, type TransactionSigner } from "@solana/kit";

import type { ClaimAuthWire } from "../../../shared/pending-claim-wire";
import { SLOT_HASHES_CAPACITY } from "../../../shared/slot-hashes";
import { getExecuteTransferInstruction } from "@/lib/phygital/execute-transfer-ix";
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

async function assertSlotStillValid(slotNumber: bigint): Promise<void> {
  const currentSlot = await getSolanaRpc().getSlot().send();
  if (currentSlot - slotNumber >= BigInt(SLOT_HASHES_CAPACITY)) {
    throw new Error(
      "Tap proof expired (slot hash no longer valid). Tap again in Safari.",
    );
  }
}

/** Wallet step: build execute_transfer + recipient-signed submit. */
export async function finishClaim(args: {
  asset: Address;
  slotNumber: string;
  auth: ClaimAuthWire;
  recipient: TransactionSigner;
}): Promise<{ signature: string }> {
  const slotNumber = BigInt(args.slotNumber);
  await assertSlotStillValid(slotNumber);

  const { secp256r1Verify, signedMessageIndex, clientDataJson } =
    await buildSecp256r1VerifyInstructionFromWebAuthnResponse({
      response: args.auth,
      secp256r1PublicKey: parseSecp256r1Pubkey(args.auth.id),
    });

  const executeTransfer = getExecuteTransferInstruction({
    recipient: toAddress(args.recipient.address),
    asset: args.asset,
    slotNumber,
    secp256r1VerifyArgs: {
      verifyArgsRelativeIndex: -1,
      signedMessageIndex,
      clientDataJson,
    },
  });

  const { signature } = await sendTransaction({
    instructions: [secp256r1Verify, executeTransfer],
    feePayer: args.recipient,
  });
  return { signature };
}

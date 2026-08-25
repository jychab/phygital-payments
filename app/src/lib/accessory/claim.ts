import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
  type TransferSession,
} from "phygital-token-sdk";
import { address, getBase58Encoder, type Address, type TransactionSigner } from "@solana/kit";
import type { PendingClaimRecord } from "../../../shared/pending-claim-wire";
import type { PhygitalToken } from "@/lib/phygital/token";
import { claimHref } from "@/lib/phygital/surface";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { sendTransaction } from "@/lib/solana/tx";

/** `/accessory?token=` — pending claim (same-tab or wallet in-app browser). */
export function accessoryClaimHref(token: string): string {
  return claimHref(token);
}

/** Pre-NFC checks from cached token view — run before showing NFC hold UI. */
export function assertCaptureReady(
  token: Pick<PhygitalToken, "isLocked">,
): void {
  if (token.isLocked) {
    throw new Error(
      "This NFC accessory is locked. Unlock it before claiming it to a wallet.",
    );
  }
}

/** Pre-submit checks at wallet finish — recipient must differ from current owner. */
export function assertClaimReady(
  token: Pick<PhygitalToken, "isLocked" | "currentOwner">,
  recipient: Address,
): void {
  assertCaptureReady(token);
  if (token.currentOwner === recipient) {
    throw new Error("This NFC accessory is already on that wallet.");
  }
}

/** Safari step: NFC tap only — no wallet connect or submit. */
export async function captureClaimTap(args: {
  token: Address;
  onPasskeyComplete?: () => void;
}): Promise<{
  session: TransferSession;
  auth: PendingClaimRecord["auth"];
}> {
  const session = await beginTransfer({
    rpc: getSolanaRpc(),
    token: args.token,
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
    token: address(json.token),
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

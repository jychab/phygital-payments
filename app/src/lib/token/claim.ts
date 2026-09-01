import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
  type TransferSession,
} from "phygital-token-sdk";
import type { Address, TransactionSigner } from "@solana/kit";
import type { PhygitalToken } from "@/lib/phygital/token";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { sendTransaction } from "@/lib/solana/tx";

type TransferAuth = Awaited<ReturnType<typeof authenticatePasskeyForTransfer>>;

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

/** NFC tap only — no wallet connect or submit. */
export async function captureClaimTap(args: {
  token: Address;
  onPasskeyComplete?: () => void;
}): Promise<{
  session: TransferSession;
  auth: TransferAuth;
}> {
  const session = await beginTransfer({
    rpc: getSolanaRpc(),
    phygitalToken: args.token,
  });
  const auth = await authenticatePasskeyForTransfer(session);
  args.onPasskeyComplete?.();
  return { session, auth };
}

/** Wallet step: SDK completeTransfer (transfer_ownership) + recipient-signed submit. */
export async function finishClaim(args: {
  session: TransferSession;
  auth: TransferAuth;
  recipient: TransactionSigner;
}): Promise<{ signature: string }> {
  const instructions = await completeTransfer(
    args.session,
    args.auth,
    args.recipient,
  );

  const { signature, confirmed } = await sendTransaction({
    instructions,
    feePayer: args.recipient,
  });
  await confirmed;
  return { signature };
}

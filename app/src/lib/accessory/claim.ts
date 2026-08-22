import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
  getTransferOwnershipInstruction,
  parseTransferOwnershipInstruction,
  type TransferSession,
} from "phygital-token-sdk";
import {
  address,
  createNoopSigner,
  getBase58Encoder,
  type Address,
} from "@solana/kit";
import type { PendingClaimRecord } from "../../../shared/pending-claim-wire";
import type { PhygitalToken } from "@/lib/phygital/token";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";

/** NFC secp256r1 is two top-level ixs before transfer_ownership (via Execute). */
export const CLAIM_VERIFY_RELATIVE_INDEX = -2;

/** `/accessory?token=` — pending claim (same-tab or wallet in-app browser). */
export function accessoryClaimHref(token: string): string {
  return `/accessory?token=${encodeURIComponent(token)}`;
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

export function transferOwnershipForVault(args: {
  token: Address;
  slotNumber: bigint;
  secp256r1VerifyArgs: {
    verifyArgsRelativeIndex: number | bigint;
    signedMessageIndex: number;
    clientDataJson: Uint8Array;
  };
  vaultPda: Address;
}) {
  return getTransferOwnershipInstruction({
    recipient: createNoopSigner(args.vaultPda),
    token: args.token,
    slotNumber: args.slotNumber,
    secp256r1VerifyArgs: args.secp256r1VerifyArgs,
  });
}

/** Vault step: NFC verify (prefix) + Execute CPI transfer_ownership. */
export async function finishClaim(
  args: Omit<PendingClaimRecord, "createdAtMs"> & {
    smartWallet: SmartWalletSession;
  },
): Promise<{ signature: string }> {
  const session = hydrateTransferSession(args.session);
  const vault = args.smartWallet.vaultPda;
  const instructions = await completeTransfer(
    session,
    args.auth,
    createNoopSigner(vault),
  );
  const nfcVerify = instructions[0];
  const transferIx = instructions[1];
  if (!nfcVerify || !transferIx) {
    throw new Error("Claim transaction was incomplete");
  }
  const parsed = parseTransferOwnershipInstruction(
    transferIx as Parameters<typeof parseTransferOwnershipInstruction>[0],
  );
  const inner = transferOwnershipForVault({
    token: session.token,
    slotNumber: parsed.data.slotNumber,
    vaultPda: vault,
    secp256r1VerifyArgs: {
      verifyArgsRelativeIndex: CLAIM_VERIFY_RELATIVE_INDEX,
      signedMessageIndex: parsed.data.secp256r1VerifyArgs.signedMessageIndex,
      clientDataJson: Uint8Array.from(
        parsed.data.secp256r1VerifyArgs.clientDataJson,
      ),
    },
  });

  return executeAsVault({
    session: args.smartWallet,
    extraPrefix: [nfcVerify],
    inner: [inner],
  });
}

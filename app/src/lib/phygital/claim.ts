import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
  getTransferOwnershipInstruction,
  parseTransferOwnershipInstruction,
  type TransferSession,
} from "phygital-token-sdk";
import type { Address } from "@solana/kit";
import type { PhygitalToken } from "@/lib/phygital/token";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { createAddressSigner } from "@/lib/solana/address-signer";
import { isParsableInstruction } from "@/lib/solana/parsable-instruction";
import { hapticTap } from "@/lib/phygital/haptic";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";

/** NFC secp256r1 is two top-level ixs before transfer_ownership (via Execute). */
export const CLAIM_VERIFY_RELATIVE_INDEX = -2;

type TransferAuth = Awaited<
  ReturnType<typeof authenticatePasskeyForTransfer>
>;

/** Vault PDA signs transfer_ownership via LazorKit Execute CPI, not locally. */
function vaultSigner(vaultPda: Address) {
  return createAddressSigner(
    vaultPda,
    "Vault signs via LazorKit Execute CPI",
  );
}

/** Pre-NFC checks from cached token view — run before showing NFC hold UI. */
export function assertCaptureReady(
  token: Pick<PhygitalToken, "isLocked">,
): void {
  if (token.isLocked) {
    throw new Error(
      "This accessory is locked. Unlock it before adding it to a wallet.",
    );
  }
}

/** Pre-submit checks — recipient must differ from current owner. */
export function assertClaimReady(
  token: Pick<PhygitalToken, "isLocked" | "currentOwner">,
  recipient: Address,
): void {
  assertCaptureReady(token);
  if (token.currentOwner === recipient) {
    throw new Error("This accessory is already on that wallet.");
  }
}

/** NFC tap: begin transfer + authenticate the phygital token. */
export async function captureClaimTap(args: {
  token: Address;
}): Promise<{
  session: TransferSession;
  auth: TransferAuth;
}> {
  const session = await beginTransfer({
    rpc: getSolanaRpc(),
    token: args.token,
  });
  const auth = await authenticatePasskeyForTransfer(session);
  hapticTap();
  return { session, auth };
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
    recipient: vaultSigner(args.vaultPda),
    token: args.token,
    slotNumber: args.slotNumber,
    secp256r1VerifyArgs: args.secp256r1VerifyArgs,
  });
}

/** NFC verify (prefix) + Execute CPI transfer_ownership to the vault. */
export async function finishClaim(args: {
  session: TransferSession;
  auth: TransferAuth;
  smartWallet: SmartWalletSession;
}): Promise<{ signature: string }> {
  const vault = args.smartWallet.vaultPda;
  const instructions = await completeTransfer(
    args.session,
    args.auth,
    vaultSigner(vault),
  );
  const nfcVerify = instructions[0];
  const transferIx = instructions[1];
  if (!nfcVerify || !transferIx || !isParsableInstruction(transferIx)) {
    throw new Error("Claim transaction was incomplete");
  }
  const parsed = parseTransferOwnershipInstruction(transferIx);
  const inner = transferOwnershipForVault({
    token: args.session.token,
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

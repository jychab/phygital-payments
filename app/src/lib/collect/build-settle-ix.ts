import {
  address,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import { getSecp256r1VerifyInstruction } from "phygital-token-sdk";
import { getTransferInstruction } from "phygital-payments-sdk";

import { base64ToBytes } from "@/lib/crypto/base64";
import type { SubmitTransferRequest } from "@/lib/collect/settle-types";
import { getSponsoredFeePayerAddress } from "@/lib/solana/simulate-sponsored";

/** Address-only signer meta for building verifier account metas (no signing). */
function feePayerMeta(feePayer: Address): TransactionSigner {
  return { address: feePayer } as TransactionSigner;
}

/**
 * Same secp + transfer core the TransferSubmitterDO submits for one job.
 * Used for client-side simulation before enqueue.
 */
export function buildSettleInstructions(
  payload: SubmitTransferRequest,
  feePayer: Address = getSponsoredFeePayerAddress(),
): Instruction[] {
  const { secpEntry, transfer } = payload;
  const verifier = feePayerMeta(feePayer);
  const secpIx = getSecp256r1VerifyInstruction([
    {
      publicKey: base64ToBytes(secpEntry.publicKey),
      signature: base64ToBytes(secpEntry.signature),
      message: base64ToBytes(secpEntry.message),
    },
  ]);
  const transferIx = getTransferInstruction({
    verifier,
    config: address(transfer.config),
    ownerVerifier: address(transfer.ownerVerifier),
    token: address(transfer.token),
    mint: address(transfer.mint),
    recipient: address(transfer.recipient),
    programAuthority: address(transfer.programAuthority),
    senderTokenAccount: address(transfer.senderTokenAccount),
    recipientTokenAccount: address(transfer.recipientTokenAccount),
    tokenProgram: address(transfer.tokenProgram),
    amount: BigInt(transfer.amount),
    verifyArgsRelativeIndex: -1,
    signedMessageIndex: 0,
    clientDataJson: base64ToBytes(transfer.clientDataJson),
    slotNumber: BigInt(transfer.slotNumber),
  });
  return [secpIx, transferIx];
}

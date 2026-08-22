import "server-only";

import {
  createKeyPairSignerFromBytes,
  getBase64EncodedWireTransaction,
  partiallySignTransactionWithSigners,
  type Transaction,
  type TransactionPartialSigner,
} from "@solana/kit";

import { base64ToBytes } from "@/lib/crypto/base64";
import { getFeePayerSigner } from "../../../worker/solana";

/** Attach the agent session (and our fee payer, if we are account 0). Do not submit. */
export async function signAgentTransaction(args: {
  env: CloudflareEnv;
  sessionSecret: string;
  sessionPublicKey: string;
  feePayer: string;
  transaction: Transaction;
}): Promise<string> {
  const sessionSigner = await createKeyPairSignerFromBytes(
    base64ToBytes(args.sessionSecret),
  );
  if (String(sessionSigner.address) !== args.sessionPublicKey) {
    throw new Error("Session key mismatch");
  }

  const signers: TransactionPartialSigner[] = [sessionSigner];
  const sponsor = args.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim();
  if (sponsor && args.feePayer === sponsor) {
    signers.push((await getFeePayerSigner(args.env)) as TransactionPartialSigner);
  }

  const signed = await partiallySignTransactionWithSigners(
    signers,
    args.transaction,
  );
  return getBase64EncodedWireTransaction(signed);
}

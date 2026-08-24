import {
  createKeyPairSignerFromBytes,
  getBase64EncodedWireTransaction,
  getTransactionDecoder,
  partiallySignTransactionWithSigners,
  type Transaction,
  type TransactionPartialSigner,
} from "@solana/kit";

import { base64ToBytes } from "./base64";

const transactionDecoder = getTransactionDecoder();

export function decodeWireTransaction(transactionBase64: string): Transaction {
  return transactionDecoder.decode(base64ToBytes(transactionBase64));
}

async function signerFromSecret(
  secretBase64: string,
  expectedPublicKey: string,
  mismatchMessage: string,
): Promise<TransactionPartialSigner> {
  const signer = await createKeyPairSignerFromBytes(base64ToBytes(secretBase64));
  if (String(signer.address) !== expectedPublicKey) {
    throw new Error(mismatchMessage);
  }
  return signer as TransactionPartialSigner;
}

/** Attach the agent session (and fee payer when account 0). Do not submit. */
export async function signSessionTransaction(args: {
  sessionSecretBase64: string;
  sessionPublicKey: string;
  feePayerPublicKey: string;
  feePayerSecretBase64: string;
  feePayer: string;
  transaction: Transaction;
}): Promise<string> {
  const sessionSigner = await signerFromSecret(
    args.sessionSecretBase64,
    args.sessionPublicKey,
    "Session key mismatch",
  );

  const signers: TransactionPartialSigner[] = [sessionSigner];
  const sponsor = args.feePayerPublicKey.trim();
  if (sponsor && args.feePayer === sponsor) {
    signers.push(
      await signerFromSecret(
        args.feePayerSecretBase64,
        sponsor,
        "Fee payer key mismatch",
      ),
    );
  }

  const signed = await partiallySignTransactionWithSigners(
    signers,
    args.transaction,
  );
  return getBase64EncodedWireTransaction(signed);
}

export async function signFeePayerTransaction(args: {
  feePayerSecretBase64: string;
  feePayerPublicKey: string;
  transaction: Transaction;
}): Promise<string> {
  const signer = await signerFromSecret(
    args.feePayerSecretBase64,
    args.feePayerPublicKey.trim(),
    "Fee payer key mismatch",
  );
  const signed = await partiallySignTransactionWithSigners(
    [signer],
    args.transaction,
  );
  return getBase64EncodedWireTransaction(signed);
}

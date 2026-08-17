import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  getPublicKeyFromAddress,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  verifySignature,
  type Instruction,
  type SignatureBytes,
  type Transaction,
  type TransactionSigner,
} from "@solana/kit";

import { getSolanaRpc, getSolanaRpcSubscriptions } from "./rpc";

let _sendAndConfirm:
  | ReturnType<typeof sendAndConfirmTransactionFactory>
  | null = null;

function sendAndConfirm() {
  _sendAndConfirm ??= sendAndConfirmTransactionFactory({
    rpc: getSolanaRpc(),
    rpcSubscriptions: getSolanaRpcSubscriptions(),
  });
  return _sendAndConfirm;
}

function isNonZeroSignature(sig: SignatureBytes | null | undefined): sig is SignatureBytes {
  return Boolean(sig?.some((b) => b !== 0));
}

/** RPC #7050012 does not name the pubkey — verify each ed25519 slot locally. */
async function assertEd25519Signatures(tx: Transaction): Promise<void> {
  const report: { address: string; present: boolean; valid: boolean }[] = [];

  for (const [addr, sig] of Object.entries(tx.signatures)) {
    const present = isNonZeroSignature(sig);
    let valid = false;
    if (present) {
      const key = await getPublicKeyFromAddress(address(addr));
      valid = await verifySignature(key, sig, tx.messageBytes);
    }
    report.push({ address: addr, present, valid });
  }

  const failed = report.filter((row) => !row.valid);
  if (failed.length === 0) return;

  console.error("[tx] ed25519 signature check failed", report);
  throw new Error(
    `Transaction did not pass signature verification for: ${failed
      .map((row) => row.address)
      .join(", ")}`,
  );
}

export async function sendTransaction(params: {
  instructions: Instruction[];
  feePayer: TransactionSigner;
}): Promise<{ signature: string }> {
  const { instructions, feePayer } = params;

  const { value: latestBlockhash } = await getSolanaRpc()
    .getLatestBlockhash()
    .send();

  const unsigned = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(feePayer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m) => appendTransactionMessageInstructions(instructions, m),
  );
  const signedTransaction = await signTransactionMessageWithSigners(unsigned);
  assertIsTransactionWithBlockhashLifetime(signedTransaction);
  await assertEd25519Signatures(signedTransaction);
  await sendAndConfirm()(signedTransaction, { commitment: "confirmed" });

  return { signature: getSignatureFromTransaction(signedTransaction) };
}

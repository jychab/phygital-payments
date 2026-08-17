import {
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Instruction,
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
  await sendAndConfirm()(signedTransaction, { commitment: "confirmed" });

  return { signature: getSignatureFromTransaction(signedTransaction) };
}

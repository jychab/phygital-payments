"use client";

import { useMemo } from "react";
import {
  address,
  getBase58Decoder,
  getCompiledTransactionMessageDecoder,
  getPublicKeyFromAddress,
  getTransactionDecoder,
  getTransactionEncoder,
  SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
  SolanaError,
  verifySignature,
  type SignatureBytes,
  type Transaction,
  type TransactionModifyingSigner,
  type TransactionWithinSizeLimit,
  type TransactionWithLifetime,
} from "@solana/kit";
import {
  useSignTransaction,
  useWallets,
  type ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";

import { getChainId } from "@/lib/solana/cluster";

const base58 = getBase58Decoder();
const compiledMessageDecoder = getCompiledTransactionMessageDecoder();

function isNonZero(sig: SignatureBytes | null | undefined): sig is SignatureBytes {
  return Boolean(sig?.some((b) => b !== 0));
}

function b58(bytes: Uint8Array): string {
  return base58.decode(bytes);
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function summarizeCompiledMessage(messageBytes: Uint8Array) {
  try {
    const compiled = compiledMessageDecoder.decode(messageBytes);
    const instructions =
      "instructions" in compiled
        ? compiled.instructions.map((ix) => ({
            programAddressIndex: ix.programAddressIndex,
            accountIndices: ix.accountIndices ? [...ix.accountIndices] : [],
            dataB58: ix.data ? b58(new Uint8Array(ix.data)) : "",
          }))
        : undefined;
    return {
      version: compiled.version,
      numSignerAccounts: compiled.header.numSignerAccounts,
      staticAccounts: [...compiled.staticAccounts],
      instructions,
    };
  } catch (err) {
    return { decodeError: err instanceof Error ? err.message : String(err) };
  }
}

type SignedTx = Transaction & TransactionWithinSizeLimit & TransactionWithLifetime;

/** Keep kit confirm metadata; never rewrite signed message bytes or signatures. */
function asSignedTx(
  original: Transaction | (Transaction & TransactionWithLifetime),
  signed: Transaction,
): SignedTx {
  const lifetimeConstraint =
    "lifetimeConstraint" in original ? original.lifetimeConstraint : undefined;
  return Object.freeze({
    ...signed,
    ...(lifetimeConstraint ? { lifetimeConstraint } : {}),
  }) as SignedTx;
}

type SignTx = ReturnType<typeof useSignTransaction>["signTransaction"];

/**
 * A @solana/kit TransactionModifyingSigner backed by Privy's Solana
 * signTransaction. Returns the wallet-signed transaction as-is so a wallet
 * that mutates the message (compute budget, etc.) is not re-bound to the
 * original compiled bytes.
 */
export function makePrivyKitSigner(
  wallet: ConnectedStandardSolanaWallet,
  signTransaction: SignTx,
): TransactionModifyingSigner {
  const signerAddress = address(wallet.address);
  const chain = getChainId();
  return {
    address: signerAddress,
    async modifyAndSignTransactions(transactions) {
      const results: SignedTx[] = [];
      for (const tx of transactions) {
        const encoded = new Uint8Array(getTransactionEncoder().encode(tx));
        const { signedTransaction } = await signTransaction({
          transaction: encoded,
          wallet,
          chain,
        });
        const decoded = getTransactionDecoder().decode(signedTransaction);
        const signature = decoded.signatures[signerAddress];
        if (!isNonZero(signature)) {
          throw new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
            addresses: [signerAddress],
          });
        }

        const expectedMessage = new Uint8Array(tx.messageBytes);
        const returnedMessage = new Uint8Array(decoded.messageBytes);
        const key = await getPublicKeyFromAddress(signerAddress);
        const [validOnExpected, validOnReturned] = await Promise.all([
          verifySignature(key, signature, expectedMessage),
          verifySignature(key, signature, returnedMessage),
        ]);

        console.warn("[privy-sign] expected vs returned message", {
          signerAddress,
          chain,
          expectedMessageB58: b58(expectedMessage),
          expectedMessageLen: expectedMessage.length,
          expectedCompiled: summarizeCompiledMessage(expectedMessage),
          returnedMessageB58: b58(returnedMessage),
          returnedMessageLen: returnedMessage.length,
          returnedCompiled: summarizeCompiledMessage(returnedMessage),
          messagesEqual: bytesEqual(expectedMessage, returnedMessage),
          encodedWireLen: encoded.length,
          encodedWireB58: b58(encoded),
          signedReturnLen: signedTransaction.byteLength,
          signedReturnB58: b58(new Uint8Array(signedTransaction)),
          signatureB58: b58(signature),
          validOnExpectedMessage: validOnExpected,
          validOnReturnedMessage: validOnReturned,
        });

        results.push(asSignedTx(tx, decoded));
      }
      return results;
    },
  };
}

export function useWalletKitSigner(): TransactionModifyingSigner | null {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const wallet = wallets[0] ?? null;

  return useMemo(
    () => (wallet ? makePrivyKitSigner(wallet, signTransaction) : null),
    [wallet, signTransaction],
  );
}

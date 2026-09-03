import type {
  Address,
  Rpc,
  SolanaRpcApi,
  Transaction,
  TransactionModifyingSigner,
  TransactionWithLifetime,
} from "@solana/kit";
import { authenticatePasskeyForSecp256r1Verify } from "phygital-token-sdk";

import { findWalletPda } from "../generated/pdas/wallet.js";
import { previewWalletIntent } from "./preview.js";
import { resolveVerifier } from "./resolve-verifier.js";
import { modifyAndWrapWalletTransaction } from "./wrap-transaction.js";

export async function getPhygitalWalletSigner(
  rpc: Rpc<SolanaRpcApi>,
  phygitalTokenPda: Address,
  config?: {
    fetch?: typeof fetch;
  },
): Promise<TransactionModifyingSigner> {
  const [[walletPda], { verifier, endpoint, configPda, tokenVerifierPda }] =
    await Promise.all([
      findWalletPda({ phygitalToken: phygitalTokenPda }),
      resolveVerifier(rpc, phygitalTokenPda, config),
    ]);

  const executeAccounts = {
    config: configPda,
    tokenVerifier: tokenVerifierPda,
    wallet: walletPda,
    phygitalToken: phygitalTokenPda,
  };

  return {
    address: walletPda,
    modifyAndSignTransactions: async (transactions, signConfig) => {
      signConfig?.abortSignal?.throwIfAborted();

      if (transactions.length !== 1) {
        throw new Error(
          "getPhygitalWalletSigner accepts exactly one transaction per sign",
        );
      }

      const [transaction] = transactions;
      if (!transaction) {
        throw new Error(
          "getPhygitalWalletSigner accepts exactly one transaction per sign",
        );
      }
      if (!("lifetimeConstraint" in transaction)) {
        throw new Error(
          "getPhygitalWalletSigner requires transactions with a lifetime constraint",
        );
      }

      const wrapped = await modifyAndWrapWalletTransaction({
        rpc,
        transaction: transaction as Transaction & TransactionWithLifetime,
        walletPda,
        verifier,
        executeAccounts,
        abortSignal: signConfig?.abortSignal,
        preview: (bodyInstructions) =>
          previewWalletIntent({
            phygitalToken: phygitalTokenPda,
            instructions: bodyInstructions,
            endpoint,
            fetch: config?.fetch,
            abortSignal: signConfig?.abortSignal,
          }),
        authenticate: (messageHash) =>
          authenticatePasskeyForSecp256r1Verify({ rpc, messageHash }),
        coSign: async (tx) => {
          const [verifierSignatures] = await verifier.signTransactions(
            [tx],
            signConfig,
          );
          if (!verifierSignatures) {
            throw new Error("Verifier returned no signature");
          }
          return verifierSignatures;
        },
      });

      return [wrapped];
    },
  };
}

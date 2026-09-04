import type {
  Address,
  GetAccountInfoApi,
  GetMultipleAccountsApi,
  Instruction,
  Rpc,
  TransactionSigner,
} from "@solana/kit";

import { fetchMaybeRecoveryWallet } from "../generated/accounts/recoveryWallet.js";
import { getClearRecoveryWalletInstruction } from "../generated/instructions/clearRecoveryWallet.js";
import { getSetRecoveryWalletInstruction } from "../generated/instructions/setRecoveryWallet.js";
import { findConfigPda } from "../generated/pdas/config.js";
import { findRecoveryWalletAccountPda } from "../generated/pdas/recoveryWalletAccount.js";
import { findTokenVerifierPda } from "../generated/pdas/tokenVerifier.js";
import type { Secp256r1VerifyArgsArgs } from "../generated/types/secp256r1VerifyArgs.js";
import { resolveVerifier } from "./resolve-verifier.js";

type PasskeyAuth = {
  secp256r1VerifyInstruction: Instruction;
  phygitalTokenPda: Address;
  secp256r1VerifyArgs: Secp256r1VerifyArgsArgs;
  slotNumber: bigint;
};

/** Passkey verify + set_recovery_wallet (init or update recovery ed25519 key). */
export async function getSetRecoveryWalletInstructions(input: {
  rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
  payer: TransactionSigner;
  /** Ed25519 pubkey authorized to call recovery_wallet_execute. */
  recoveryWallet: Address;
  passkeyAuth: PasskeyAuth;
  fetch?: typeof fetch;
}): Promise<Instruction[]> {
  const phygitalToken = input.passkeyAuth.phygitalTokenPda;
  const { verifier, configPda, tokenVerifierPda } = await resolveVerifier(
    input.rpc,
    phygitalToken,
    { fetch: input.fetch },
  );
  const [recoveryWalletAccount] = await findRecoveryWalletAccountPda({
    phygitalToken,
  });

  return [
    input.passkeyAuth.secp256r1VerifyInstruction,
    getSetRecoveryWalletInstruction({
      payer: input.payer,
      verifier,
      config: configPda,
      phygitalToken,
      tokenVerifier: tokenVerifierPda,
      recoveryWalletAccount,
      recoveryWallet: input.recoveryWallet,
      secp256r1VerifyArgs: input.passkeyAuth.secp256r1VerifyArgs,
      slotNumber: input.passkeyAuth.slotNumber,
    }),
  ];
}

/** Passkey verify + clear_recovery_wallet (close PDA, refund rent). */
export async function getClearRecoveryWalletInstructions(input: {
  rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
  passkeyAuth: PasskeyAuth;
  fetch?: typeof fetch;
}): Promise<Instruction[]> {
  const phygitalToken = input.passkeyAuth.phygitalTokenPda;

  const [[configPda], [tokenVerifierPda], [recoveryWalletAccount]] =
    await Promise.all([
      findConfigPda(),
      findTokenVerifierPda({ phygitalToken }),
      findRecoveryWalletAccountPda({ phygitalToken }),
    ]);

  const account = await fetchMaybeRecoveryWallet(
    input.rpc,
    recoveryWalletAccount,
  );
  if (!account.exists) {
    throw new Error("Recovery wallet not found");
  }

  const { verifier } = await resolveVerifier(input.rpc, phygitalToken, {
    fetch: input.fetch,
  });

  return [
    input.passkeyAuth.secp256r1VerifyInstruction,
    getClearRecoveryWalletInstruction({
      verifier,
      config: configPda,
      phygitalToken,
      tokenVerifier: tokenVerifierPda,
      rentReceiver: account.data.payer,
      recoveryWalletAccount,
      secp256r1VerifyArgs: input.passkeyAuth.secp256r1VerifyArgs,
      slotNumber: input.passkeyAuth.slotNumber,
    }),
  ];
}

import type {
  Address,
  GetAccountInfoApi,
  GetMultipleAccountsApi,
  Instruction,
  Rpc,
  TransactionSigner,
} from "@solana/kit";

import { MAX_ENDPOINT_LEN } from "../constants.js";
import { fetchMaybeTokenVerifier } from "../generated/accounts/tokenVerifier.js";
import {
  assertHttpsEndpoint,
  createVerifierEndpointSigner,
  resolveVerifier,
} from "./resolve-verifier.js";
import { normalizeVerifierApiBase, verifierSignUrl } from "./verifier-endpoint.js";
import { getClearTokenVerifierInstruction } from "../generated/instructions/clearTokenVerifier.js";
import { getSetTokenVerifierInstruction } from "../generated/instructions/setTokenVerifier.js";
import { findConfigPda } from "../generated/pdas/config.js";
import { findTokenVerifierPda } from "../generated/pdas/tokenVerifier.js";
import type { Secp256r1VerifyArgsArgs } from "../generated/types/secp256r1VerifyArgs.js";

type PasskeyAuth = {
  secp256r1VerifyInstruction: Instruction;
  phygitalTokenPda: Address;
  secp256r1VerifyArgs: Secp256r1VerifyArgsArgs;
  slotNumber: bigint;
};

/** Passkey verify + set_token_verifier (init or update token verifier override). */
export async function getSetTokenVerifierInstructions(input: {
  rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
  payer: TransactionSigner;
  /** Verifier pubkey stored in the token verifier PDA. */
  overrideVerifier: Address;
  endpoint: string;
  passkeyAuth: PasskeyAuth;
  fetch?: typeof fetch;
}): Promise<Instruction[]> {
  const endpoint = normalizeVerifierApiBase(
    assertHttpsEndpoint(input.endpoint, {
      maxLen: MAX_ENDPOINT_LEN,
    }),
  );

  const phygitalToken = input.passkeyAuth.phygitalTokenPda;
  const { verifier, configPda, tokenVerifierPda } = await resolveVerifier(
    input.rpc,
    phygitalToken,
    { fetch: input.fetch },
  );

  return [
    input.passkeyAuth.secp256r1VerifyInstruction,
    getSetTokenVerifierInstruction({
      payer: input.payer,
      verifier,
      config: configPda,
      phygitalToken,
      tokenVerifier: tokenVerifierPda,
      newVerifier: input.overrideVerifier,
      endpoint,
      secp256r1VerifyArgs: input.passkeyAuth.secp256r1VerifyArgs,
      slotNumber: input.passkeyAuth.slotNumber,
    }),
  ];
}

/** Passkey verify + clear_token_verifier (close override PDA, refund rent). */
export async function getClearTokenVerifierInstructions(input: {
  rpc: Rpc<GetAccountInfoApi & GetMultipleAccountsApi>;
  passkeyAuth: PasskeyAuth;
  fetch?: typeof fetch;
}): Promise<Instruction[]> {
  const phygitalToken = input.passkeyAuth.phygitalTokenPda;

  const [[configPda], [tokenVerifierPda]] = await Promise.all([
    findConfigPda(),
    findTokenVerifierPda({ phygitalToken }),
  ]);

  const tokenVerifierAccount = await fetchMaybeTokenVerifier(
    input.rpc,
    tokenVerifierPda,
  );
  if (!tokenVerifierAccount.exists) {
    throw new Error("Token verifier override not found");
  }

  const endpoint = assertHttpsEndpoint(tokenVerifierAccount.data.endpoint);
  const verifier = createVerifierEndpointSigner(
    tokenVerifierAccount.data.verifier,
    {
      endpoint: verifierSignUrl(endpoint),
      fetch: input.fetch,
    },
  );

  return [
    input.passkeyAuth.secp256r1VerifyInstruction,
    getClearTokenVerifierInstruction({
      verifier,
      config: configPda,
      phygitalToken,
      rentReceiver: tokenVerifierAccount.data.payer,
      tokenVerifier: tokenVerifierPda,
      secp256r1VerifyArgs: input.passkeyAuth.secp256r1VerifyArgs,
      slotNumber: input.passkeyAuth.slotNumber,
    }),
  ];
}

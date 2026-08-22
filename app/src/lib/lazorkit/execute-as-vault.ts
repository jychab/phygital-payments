import type { Instruction } from "@solana/kit";
import {
  assembleExecuteInstructions,
  buildExecuteChallenge,
  decodeAuthorityAccount,
  prepareExecute,
} from "lazor-kit";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { lazorkitProgramAddress } from "./constants";
import type { SmartWalletSession } from "./credential-store";
import { getPasskeyAssertion } from "./passkey";
import { sponsoredFeePayerSigner, sponsorInstructions } from "./sponsor";

export type ExecuteAsVaultArgs = {
  session: SmartWalletSession;
  inner: Instruction[];
  extraPrefix?: Instruction[];
};

async function fetchAuthorityCounter(
  authorityPda: SmartWalletSession["authorityPda"],
): Promise<number> {
  const { value } = await getSolanaRpc()
    .getAccountInfo(authorityPda, { encoding: "base64" })
    .send();
  if (!value) {
    throw new Error("Smart wallet is missing. Create a passkey again.");
  }
  const raw = Array.isArray(value.data) ? value.data[0] : value.data;
  const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  return decodeAuthorityAccount(bytes).counter;
}

async function fetchSlot(): Promise<bigint> {
  return BigInt(await getSolanaRpc().getSlot().send());
}

/**
 * Face ID → LazorKit Execute wrapping `inner`, with optional top-level
 * prefix instructions (NFC secp verify, System transfers). The LazorKit
 * secp256r1 instruction always immediately precedes Execute.
 */
export async function executeAsVault(
  args: ExecuteAsVaultArgs,
): Promise<{ signature: string }> {
  const payer = sponsoredFeePayerSigner();
  const [counter, slot] = await Promise.all([
    fetchAuthorityCounter(args.session.authorityPda),
    fetchSlot(),
  ]);
  const prepared = await prepareExecute({
    payer: payer.address,
    walletPda: args.session.walletPda,
    authorityPda: args.session.authorityPda,
    vaultPda: args.session.vaultPda,
    inner: args.inner,
    programAddress: lazorkitProgramAddress(),
  });
  const nextCounter = (counter + 1) >>> 0;
  const { challenge, authPrefix } = await buildExecuteChallenge({
    prepared,
    payer: payer.address,
    slot,
    nextCounter,
  });
  const assertion = await getPasskeyAssertion({
    challenge,
    credentialId: args.session.credentialId,
    rpId: args.session.rpId,
  });
  const { secpIx, executeIx } = await assembleExecuteInstructions({
    prepared,
    payer,
    authPrefix,
    compressedPubkey: args.session.compressedPubkey,
    signatureDer: assertion.signatureDer,
    authenticatorData: assertion.authenticatorData,
    clientDataJSON: assertion.clientDataJSON,
  });
  return sponsorInstructions([
    ...(args.extraPrefix ?? []),
    secpIx,
    executeIx,
  ]);
}

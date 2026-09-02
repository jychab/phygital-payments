import {
  address,
  getBase64Encoder,
  getU64Decoder,
  type Address,
} from "@solana/kit";
import {
  PhygitalTokenType,
  authenticatePasskeyForSecp256r1Verify,
  buildSecp256r1VerifyInstruction,
  fetchPhygitalToken,
} from "phygital-token-sdk";
import {
  buildTransferChallenge,
  fetchMaybeOwnerVerifier,
  findConfigPda,
  findOwnerVerifierPda,
} from "phygital-payments-sdk";

import { bytesToBase64 } from "@/lib/crypto/base64";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { secp256r1EntriesFromInstruction } from "../../../shared/secp256r1-verify";
import {
  simulateSponsoredInstructions,
} from "@/lib/solana/simulate-sponsored";
import { buildSettleInstructions } from "./build-settle-ix";
import {
  fetchMintDelegateStatus,
  type TokenProgram,
} from "@/lib/tokens/mint-delegate";
import { fetchRecipientAtaStatus } from "@/lib/tokens/ata";
import type { SubmitTransferRequest } from "./settle-types";
import { submitAndWaitSettle } from "./settle-client";
import { submitTransferViaOwnerVerifier } from "./verifier-submit";
import {resolveMintProgram} from "@/lib/tokens/mint-delegate"

export type BuiltReceiveTransfer = {
  payload: SubmitTransferRequest;
  /**
   * OwnerVerifier routing resolved during build (avoids a second RPC at submit).
   * `revi` = default fee-payer DO. `external` = verifier ≠ Revi fee-payer.
   */
  ownerVerifierRoute: OwnerVerifierRoute;
};

/** Result of resolving the optional OwnerVerifier PDA for submit routing. */
export type OwnerVerifierRoute =
  | { kind: "revi" }
  | { kind: "external"; endpoint: string; verifier: Address };

/** Pre-resolved mint program + recipient ATA (e.g. from the receive panel). */
export type ReceiveTransferContext = {
  tokenProgram: TokenProgram;
  recipientAta: Address;
};

/** Standard SlotHashes sysvar (holds ~512 recent slots, ~3.5 min). */
const SLOT_HASHES_SYSVAR = address(
  "SysvarS1otHashes111111111111111111111111111",
);

/**
 * Fetch the latest slot hash for the transfer challenge (on demand at receive).
 */
async function fetchSlotHash(): Promise<{
  slotHash: Uint8Array;
  slotNumber: bigint;
}> {
  const rpc = getSolanaRpc();
  const { value } = await rpc
    .getAccountInfo(SLOT_HASHES_SYSVAR, {
      encoding: "base64",
      commitment: "confirmed",
      dataSlice: { offset: 8, length: 40 },
    })
    .send();
  const data = value?.data;
  if (!data) {
    throw new Error("Unable to fetch slot hashes sysvar");
  }
  const base64 = Array.isArray(data) ? data[0] : data;
  const bytes = new Uint8Array(getBase64Encoder().encode(base64));
  const slotNumber = getU64Decoder().decode(bytes.subarray(0, 8));
  const slotHash = bytes.subarray(8, 40);
  return { slotHash, slotNumber };
}

/** True when sponsored fee-payer submit can be enabled in the UI. */
export function isSponsoredSubmitAvailable(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim());
}

/**
 * NFC passkey + build Pattern B transfer payload for a given recipient.
 * The recipient is always an explicit address from `?recipient=`.
 * Receive itself does not sign with a session wallet.
 */
async function buildReceiveTransfer(args: {
  recipient: Address;
  rawAmount: bigint;
  mint: Address;
  context?: ReceiveTransferContext;
  /** Fires the instant WebAuthn/NFC returns — before post-tap RPCs. */
  onPasskeyComplete?: () => void;
}): Promise<BuiltReceiveTransfer> {
  const { recipient, rawAmount, mint } = args;
  const rpc = getSolanaRpc();
  const program =
    args.context?.tokenProgram ?? (await resolveMintProgram(mint)).program;

  // Always re-check ATA existence — UI context can be stale.
  const ataStatus = await fetchRecipientAtaStatus({
    mint,
    owner: recipient,
    program,
  });
  if (!ataStatus.exists) {
    throw new Error(
      "Recipient token account is missing. Create it before receiving payment.",
    );
  }
  const recipientAta = ataStatus.ata;

  const { slotHash, slotNumber } = await fetchSlotHash();
  const messageHash = buildTransferChallenge(mint, recipient, rawAmount, slotHash);
  const response = await authenticatePasskeyForSecp256r1Verify({
    rpc,
    messageHash,
  });
  // Card UX: leave "Hold NFC accessory" the moment the tap returns; RPC/submit = Confirming.
  args.onPasskeyComplete?.();

  const { secp256r1VerifyInstruction, phygitalTokenPda, secp256r1VerifyArgs } =
    await buildSecp256r1VerifyInstruction(response);
  const [secpEntry] = secp256r1EntriesFromInstruction(secp256r1VerifyInstruction);
  if (!secpEntry) {
    throw new Error("Passkey tap did not produce a secp256r1 signature");
  }
  const { clientDataJson } = secp256r1VerifyArgs;
  const tokenPda = phygitalTokenPda;

  const { data: token } = await fetchPhygitalToken(rpc, tokenPda);
  if (token.tokenType !== PhygitalTokenType.Controlled || !token.isLocked) {
    throw new Error(
      "No locked NFC accessory found for this tap. Add it to a wallet first, then try again.",
    );
  }
  if (token.owner === recipient) {
    throw new Error(
      "This NFC accessory belongs to the receiving wallet — you can’t collect a payment from yourself.",
    );
  }

  const reviFeePayer = process.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim();
  if (!reviFeePayer) {
    throw new Error("Sponsored submit is not configured");
  }

  // PDA derivation is local; allowance + OV share one RPC wave.
  const [funding, configPda, ov] = await Promise.all([
    fetchMintDelegateStatus(token.owner, mint, tokenPda),
    findConfigPda(),
    findOwnerVerifierPda({ owner: token.owner }).then(async ([pda]) => {
      const account = await fetchMaybeOwnerVerifier(rpc, pda);
      return { pda, account };
    }),
  ]);

  if (!funding.isProgramAuthorityDelegate) {
    throw new Error("They haven't enabled this token for Pay.");
  }
  if (funding.balanceRaw < rawAmount) {
    throw new Error("They don't have enough balance for this payment.");
  }
  if (funding.delegatedAmountRaw < rawAmount) {
    throw new Error("This is more than their spending limit.");
  }

  let ownerVerifierRoute: OwnerVerifierRoute = { kind: "revi" };
  if (ov.account.exists && ov.account.data.verifier !== reviFeePayer) {
    const endpoint = ov.account.data.endpoint?.trim();
    if (!endpoint) {
      throw new Error("Owner verifier endpoint is missing");
    }
    ownerVerifierRoute = {
      kind: "external",
      endpoint,
      verifier: ov.account.data.verifier,
    };
  }

  const payload: SubmitTransferRequest = {
    createdAtMs: Date.now(),
    secpEntry: {
      publicKey: bytesToBase64(new Uint8Array(secpEntry.publicKey)),
      signature: bytesToBase64(new Uint8Array(secpEntry.signature)),
      message: bytesToBase64(new Uint8Array(secpEntry.message)),
    },
    transfer: {
      token: tokenPda,
      owner: token.owner,
      mint,
      recipient,
      programAuthority: funding.programAuthority,
      senderTokenAccount: funding.ata,
      recipientTokenAccount: recipientAta,
      tokenProgram: program,
      ownerVerifier: ov.pda,
      config: configPda[0],
      amount: rawAmount.toString(),
      slotNumber: slotNumber.toString(),
      clientDataJson: bytesToBase64(new Uint8Array(clientDataJson)),
    },
  };

  return {
    payload,
    ownerVerifierRoute,
  };
}

/**
 * Route to Revi DO or the owner's external verifier endpoint.
 * Pass `ownerVerifierRoute` from buildReceiveTransfer to skip a second OV RPC.
 */
async function submitSponsoredTransfer(
  payload: SubmitTransferRequest,
  ownerVerifierRoute?: OwnerVerifierRoute,
): Promise<{ signature: string }> {
  const route =
    ownerVerifierRoute ??
    (await resolveOwnerVerifierRoute(address(payload.transfer.ownerVerifier)));

  if (route.kind === "external") {
    return submitTransferViaOwnerVerifier({
      endpoint: route.endpoint,
      payload,
    });
  }

  const { signature } = await submitAndWaitSettle(payload);
  return { signature };
}

async function resolveOwnerVerifierRoute(
  ownerVerifierPda: Address,
): Promise<OwnerVerifierRoute> {
  const reviFeePayer = process.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim();
  if (!reviFeePayer) {
    throw new Error("Sponsored submit is not configured");
  }
  const maybeOv = await fetchMaybeOwnerVerifier(getSolanaRpc(), ownerVerifierPda);
  if (maybeOv.exists && maybeOv.data.verifier !== reviFeePayer) {
    const endpoint = maybeOv.data.endpoint?.trim();
    if (!endpoint) {
      throw new Error("Owner verifier endpoint is missing");
    }
    return {
      kind: "external",
      endpoint,
      verifier: maybeOv.data.verifier,
    };
  }
  return { kind: "revi" };
}

/**
 * Complete receive after passkey tap. The backend fee-payer submits the
 * transfer (sponsored). The recipient is always `?recipient=` from the
 * payment link; receive does not require the wallet to sign.
 */
export async function receiveTransfer(args: {
  recipient: Address;
  rawAmount: bigint;
  mint: Address;
  context?: ReceiveTransferContext;
  /** Fires once WebAuthn/NFC completes, before post-tap RPCs + submit. */
  onPasskeyComplete?: () => void;
}): Promise<{ signature: string }> {
  if (!isSponsoredSubmitAvailable()) {
    throw new Error("Sponsored submit is not configured");
  }

  const { payload, ownerVerifierRoute } = await buildReceiveTransfer(args);

  // Simulate the same core ixs the fee-payer DO will submit (Revi path).
  // External verifiers run their own submit path — still validate accounts above.
  if (ownerVerifierRoute.kind === "revi") {
    await simulateSponsoredInstructions(
      buildSettleInstructions(payload),
    );
  }

  const { signature } = await submitSponsoredTransfer(
    payload,
    ownerVerifierRoute,
  );
  return { signature };
}

import {
  address,
  getBase64Encoder,
  getU64Decoder,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import { getCreateAssociatedTokenIdempotentInstruction } from "@solana-program/token";
import {
  AssetType,
  authenticatePasskeyForVerifyAsset,
  beginVerifyAsset,
  buildVerifyAssetArgs,
  buildVerifyInputFromWebAuthn,
  fetchAsset,
  parseSecp256r1Pubkey,
} from "phygital-token-sdk";
import {
  buildTransferChallenge,
  fetchMaybeOwnerVerifier,
  findConfigPda,
  findOwnerVerifierPda,
} from "phygital-payments-sdk";

import { bytesToBase64 } from "@/lib/crypto/base64";
import { getSolanaRpc } from "@/lib/solana/rpc";
import {
  simulateSponsoredInstructions,
} from "@/lib/solana/simulate-sponsored";
import { buildSettleInstructions } from "./build-settle-ix";
import {
  fetchMintDelegateStatus,
  findAta,
  resolveMintProgram,
  type TokenProgram,
} from "@/lib/tokens/mint-delegate";
import type { SubmitTransferRequest } from "./settle-types";
import { submitAndWaitSettle } from "./settle-client";
import { submitTransferViaOwnerVerifier } from "./verifier-submit";

/** `/collect` NFC receive: ATA check, verify-asset, sponsored settle. */
export type RecipientAtaStatus = {
  mint: Address;
  owner: Address;
  ata: Address;
  program: TokenProgram;
  exists: boolean;
};

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

/** Resolve recipient ATA and whether it already exists on-chain. */
export async function fetchRecipientAtaStatus(args: {
  mint: Address;
  owner: Address;
  program?: TokenProgram;
}): Promise<RecipientAtaStatus> {
  const { mint, owner } = args;
  const program = args.program ?? (await resolveMintProgram(mint)).program;
  const ata = await findAta(mint, owner, program);
  const rpc = getSolanaRpc();
  const { value } = await rpc
    .getAccountInfo(ata, { encoding: "base64" })
    .send();
  return {
    mint,
    owner,
    ata,
    program,
    exists: value !== null,
  };
}

/**
 * Create the recipient's token account. The connected wallet pays rent;
 * `owner` must be the token account owner (defaults to signer).
 */
export async function buildCreateRecipientAtaInstructions(args: {
  signer: TransactionSigner;
  mint: Address;
  owner?: Address;
}): Promise<{ instructions: Instruction[]; ata: Address }> {
  const mint = args.mint;
  const owner = args.owner ?? args.signer.address;
  const status = await fetchRecipientAtaStatus({ mint, owner });
  if (status.exists) {
    return { instructions: [], ata: status.ata };
  }

  return {
    instructions: [
      getCreateAssociatedTokenIdempotentInstruction({
        payer: args.signer,
        ata: status.ata,
        owner,
        mint,
        tokenProgram: status.program,
      }),
    ],
    ata: status.ata,
  };
}

/**
 * NFC passkey + build Pattern B transfer payload for a given recipient.
 * The recipient is an explicit address (connected wallet or a payment link),
 * not a connected wallet — receive needs no wallet session.
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
  const session = await beginVerifyAsset({ messageHash });

  const response = await authenticatePasskeyForVerifyAsset(session);
  // Card UX: leave "Hold NFC device" the moment the tap returns; RPC/submit = Confirming.
  args.onPasskeyComplete?.();

  const { assetPda, clientDataJson } = await buildVerifyAssetArgs(response);

  const { data: asset } = await fetchAsset(rpc, assetPda);
  if (asset.assetType !== AssetType.Lockable || !asset.isLocked) {
    throw new Error(
      "No locked NFC device found for this tap. Lock the asset before collecting payment.",
    );
  }
  if (asset.owner === recipient) {
    throw new Error(
      "This NFC device belongs to the receiving wallet — you can’t collect a payment from yourself.",
    );
  }

  const secpEntry = buildVerifyInputFromWebAuthn({
    secp256r1PublicKey: parseSecp256r1Pubkey(response.id),
    response,
  });

  const reviFeePayer = process.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim();
  if (!reviFeePayer) {
    throw new Error("Sponsored submit is not configured");
  }

  // PDA derivation is local; allowance + OV share one RPC wave.
  const [funding, configPda, ov] = await Promise.all([
    fetchMintDelegateStatus(asset.owner, mint),
    findConfigPda(),
    findOwnerVerifierPda({ owner: asset.owner }).then(async ([pda]) => {
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
      asset: assetPda,
      owner: asset.owner,
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
 * transfer (sponsored), so no connected wallet is required — the recipient is
 * an explicit address.
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

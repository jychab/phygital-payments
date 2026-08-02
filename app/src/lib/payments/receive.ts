import {
  address,
  getBase64Encoder,
  getU64Decoder,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import { getCreateAssociatedTokenIdempotentInstruction as createTokenAtaIx } from "@solana-program/token";
import {
  getCreateAssociatedTokenIdempotentInstruction as createToken2022AtaIx,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";
import {
  beginVerifyAsset,
  authenticatePasskeyForVerifyAsset,
  buildVerifyAssetArgs,
  buildVerifyAssetChallenge,
  buildVerifyInputFromWebAuthn,
  parseSecp256r1Pubkey,
  type VerifyAssetSession,
} from "phygital-token-sdk";
import {
  buildTransferMessage,
  findProgramAuthorityPda,
  getTransferInstruction,
  PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
} from "phygital-payments-sdk";

import { getSolanaRpc } from "@/lib/solana/rpc";
import {
  findAta,
  getUsdcMint,
  resolveMintProgram,
  type TokenProgram,
} from "./fund";
import { bytesToBase64, type SubmitTransferRequest } from "./submitter-types";
import { pollTransferJob, postSponsoredTransfer } from "./submitter-client";

export type RecipientAtaStatus = {
  mint: Address;
  owner: Address;
  ata: Address;
  program: TokenProgram;
  exists: boolean;
};

export type BuiltReceiveTransfer = {
  instructions: Instruction[];
  payload: SubmitTransferRequest;
};

/** Pre-resolved mint program + recipient ATA (e.g. from the receive panel). */
export type ReceiveTransferContext = {
  tokenProgram: TokenProgram;
  recipientAta: Address;
};

/** A recent slot hash, fetched ahead of the tap to skip an RPC before WebAuthn. */
export type SlotHashPrefetch = {
  slotHash: Uint8Array;
  slotNumber: bigint;
  fetchedAt: number;
};

/** Standard SlotHashes sysvar (holds ~512 recent slots, ~3.5 min). */
const SLOT_HASHES_SYSVAR = address(
  "SysvarS1otHashes111111111111111111111111111",
);

/**
 * How long a prefetched slot hash stays usable. The on-chain verify tolerates
 * any slot still in SlotHashes (~3.5 min) and the DO rejects jobs older than
 * MAX_JOB_AGE_MS (45s), so a comfortably-fresh cap keeps prefetch safe.
 */
export const SLOT_HASH_PREFETCH_TTL_MS = 20_000;

/**
 * Fetch the latest slot hash directly (mirrors the SDK's internal
 * `getLatestSlotHash`) so the receive panel can warm it *before* the tap. This
 * lifts a ~100–300ms RPC round trip off the path between the button press and
 * the NFC prompt, so WebAuthn fires immediately.
 */
export async function prefetchSlotHash(): Promise<SlotHashPrefetch> {
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
  return { slotHash, slotNumber, fetchedAt: Date.now() };
}

/** Reuse a prefetched slot hash only while it's fresh enough to land. */
function usablePrefetch(
  prefetch: SlotHashPrefetch | undefined,
): SlotHashPrefetch | null {
  if (!prefetch) return null;
  return Date.now() - prefetch.fetchedAt < SLOT_HASH_PREFETCH_TTL_MS
    ? prefetch
    : null;
}

/** True when sponsored fee-payer submit can be enabled in the UI. */
export function isSponsoredSubmitAvailable(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim());
}

/** Resolve recipient ATA and whether it already exists on-chain. */
export async function fetchRecipientAtaStatus(args: {
  mint?: Address;
  owner: Address;
  program?: TokenProgram;
}): Promise<RecipientAtaStatus> {
  const mint = args.mint ?? getUsdcMint();
  const program = args.program ?? (await resolveMintProgram(mint)).program;
  const ata = await findAta(mint, args.owner, program);
  const rpc = getSolanaRpc();
  const { value } = await rpc
    .getAccountInfo(ata, { encoding: "base64" })
    .send();
  return {
    mint,
    owner: args.owner,
    ata,
    program,
    exists: value !== null,
  };
}

/**
 * Create the recipient's USDC ATA. The connected wallet pays rent;
 * `owner` must be the token account owner (defaults to signer).
 */
export async function buildCreateRecipientAtaInstructions(args: {
  signer: TransactionSigner;
  mint?: Address;
  owner?: Address;
}): Promise<{ instructions: Instruction[]; ata: Address }> {
  const mint = args.mint ?? getUsdcMint();
  const owner = args.owner ?? args.signer.address;
  const status = await fetchRecipientAtaStatus({ mint, owner });
  if (status.exists) {
    return { instructions: [], ata: status.ata };
  }

  const is2022 = status.program === TOKEN_2022_PROGRAM_ADDRESS;
  const createAtaIx = is2022 ? createToken2022AtaIx : createTokenAtaIx;

  return {
    instructions: [
      createAtaIx({
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
 * The recipient is an explicit address (the vault wallet or a payment link),
 * not a connected wallet — receive needs no wallet session.
 */
export async function buildReceiveTransfer(args: {
  recipient: Address;
  rawAmount: bigint;
  mint?: Address;
  context?: ReceiveTransferContext;
  /** Slot hash warmed before the tap; used when still fresh, else refetched. */
  slotHash?: SlotHashPrefetch;
}): Promise<BuiltReceiveTransfer> {
  const { recipient, rawAmount } = args;
  const rpc = getSolanaRpc();
  const mint = args.mint ?? getUsdcMint();
  const program =
    args.context?.tokenProgram ?? (await resolveMintProgram(mint)).program;

  let recipientAta: Address;
  if (args.context?.recipientAta) {
    recipientAta = args.context.recipientAta;
  } else {
    const status = await fetchRecipientAtaStatus({
      mint,
      owner: recipient,
      program,
    });
    if (!status.exists) {
      throw new Error(
        "Recipient USDC account is missing. Create it before receiving payment.",
      );
    }
    recipientAta = status.ata;
  }

  const message = buildTransferMessage(mint, recipient, rawAmount);
  // Fast path: with a fresh prefetched slot hash we build the WebAuthn challenge
  // locally (no RPC) so the NFC prompt appears the instant the button is
  // pressed. Falls back to the SDK's fetch-then-challenge when it's stale.
  const fresh = usablePrefetch(args.slotHash);
  const session: VerifyAssetSession = fresh
    ? {
        rpc,
        slotHash: fresh.slotHash,
        slotNumber: fresh.slotNumber,
        challenge: await buildVerifyAssetChallenge({
          message,
          slotHash: fresh.slotHash,
        }),
        message,
      }
    : await beginVerifyAsset({ rpc, message });
  const response = await authenticatePasskeyForVerifyAsset(session);
  const {
    asset,
    assetPda,
    secp256r1Verify,
    signedMessageIndex,
    clientDataJson,
  } = await buildVerifyAssetArgs(session, response);

  if (asset.owner === recipient) {
    throw new Error(
      "This pass belongs to the receiving wallet — you can’t collect a payment from yourself.",
    );
  }

  const secpEntry = buildVerifyInputFromWebAuthn({
    secp256r1PublicKey: parseSecp256r1Pubkey(response.id),
    response,
  });

  const [programAuthority, senderTokenAccount] = await Promise.all([
    findProgramAuthorityPda(asset.owner, PHYGITAL_PAYMENTS_PROGRAM_ADDRESS),
    findAta(mint, asset.owner, program),
  ]);

  const transferIx = getTransferInstruction({
    asset: assetPda,
    mint,
    recipient,
    programAuthority,
    senderTokenAccount,
    recipientTokenAccount: recipientAta,
    tokenProgram: program,
    amount: rawAmount,
    verifyArgsRelativeIndex: -1,
    signedMessageIndex,
    slotNumber: session.slotNumber,
    clientDataJson,
  });

  const payload: SubmitTransferRequest = {
    createdAtMs: Date.now(),
    secpEntry: {
      publicKey: bytesToBase64(new Uint8Array(secpEntry.publicKey)),
      signature: bytesToBase64(new Uint8Array(secpEntry.signature)),
      message: bytesToBase64(new Uint8Array(secpEntry.message)),
    },
    transfer: {
      asset: assetPda,
      mint,
      recipient,
      programAuthority,
      senderTokenAccount,
      recipientTokenAccount: recipientAta,
      tokenProgram: program,
      amount: rawAmount.toString(),
      slotNumber: session.slotNumber.toString(),
      clientDataJson: bytesToBase64(new Uint8Array(clientDataJson)),
    },
  };

  return {
    instructions: [secp256r1Verify, transferIx],
    payload,
  };
}

/**
 * Enqueue on the fee-payer DO; long-poll until confirmed/failed. The DO runs
 * an authoritative simulation of the batched transaction before submitting, so
 * no client-side preflight is needed (the sender is only known post-tap anyway).
 */
export async function submitSponsoredTransfer(
  payload: SubmitTransferRequest,
): Promise<{ signature: string }> {
  const { jobId } = await postSponsoredTransfer(payload);
  const job = await pollTransferJob(jobId);
  if (job.status === "failed") {
    throw new Error(job.error ?? "Sponsored transfer failed");
  }
  if (!job.signature) {
    throw new Error("Sponsored transfer confirmed without signature");
  }
  return { signature: job.signature };
}

/**
 * Complete receive after passkey tap. The backend fee-payer submits the
 * transfer (sponsored), so no connected wallet is required — the recipient is
 * an explicit address.
 */
export async function receiveTransfer(args: {
  recipient: Address;
  rawAmount: bigint;
  mint?: Address;
  context?: ReceiveTransferContext;
  slotHash?: SlotHashPrefetch;
}): Promise<{ signature: string }> {
  if (!isSponsoredSubmitAvailable()) {
    throw new Error("Sponsored submit is not configured");
  }
  const { payload } = await buildReceiveTransfer(args);
  const { signature } = await submitSponsoredTransfer(payload);
  return { signature };
}

export type { Address };

import {
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
  buildVerifyInputFromWebAuthn,
  parseSecp256r1Pubkey,
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
  const session = await beginVerifyAsset({ rpc, message });
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
}): Promise<{ signature: string }> {
  if (!isSponsoredSubmitAvailable()) {
    throw new Error("Sponsored submit is not configured");
  }
  const { payload } = await buildReceiveTransfer(args);
  const { signature } = await submitSponsoredTransfer(payload);
  return { signature };
}

export type { Address };

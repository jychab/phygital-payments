import {
  address,
  type Address,
  type TransactionSigner,
} from "@solana/kit";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getPhygitalWalletSigner } from "phygital-wallet-sdk";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { sendTransaction } from "@/lib/solana/tx";
import { getUsdcMint, USDC_DECIMALS } from "@/lib/tokens/usdc-mint";
import { uiAmountToRaw } from "@/lib/tokens/amount";

/**
 * Receive nearby beat 2 — Hold to receive.
 * Uses payer phygital token from beat 1; one NFC via getPhygitalWalletSigner.
 */
export async function receiveUsdcFromPayerToken(args: {
  payerPhygitalTokenPda: Address | string;
  expectedPayerWallet: Address | string;
  recipientWallet: Address | string;
  amountUi: string;
}): Promise<{ signature: string; confirmed: Promise<void> }> {
  const rpc = getSolanaRpc();
  const payerToken = address(String(args.payerPhygitalTokenPda));
  const expectedPayer = address(String(args.expectedPayerWallet));
  const recipient = address(String(args.recipientWallet));
  const mint = getUsdcMint();
  const raw = uiAmountToRaw(args.amountUi, USDC_DECIMALS);

  const walletSigner = await getPhygitalWalletSigner(rpc, payerToken);
  if (String(walletSigner.address) !== String(expectedPayer)) {
    throw new Error("That isn’t the linked accessory");
  }

  const [sourceAta] = await findAssociatedTokenPda({
    mint,
    owner: expectedPayer,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  const [destAta] = await findAssociatedTokenPda({
    mint,
    owner: recipient,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const instructions = [
    getCreateAssociatedTokenIdempotentInstruction({
      payer: walletSigner as TransactionSigner,
      ata: destAta,
      owner: recipient,
      mint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
    getTransferCheckedInstruction({
      source: sourceAta,
      mint,
      destination: destAta,
      authority: walletSigner,
      amount: raw,
      decimals: USDC_DECIMALS,
    }),
  ];

  return sendTransaction({
    instructions,
    feePayer: walletSigner,
  });
}

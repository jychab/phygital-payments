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
import { walletPdaForToken } from "@/lib/wallet/pda";

/**
 * Send USDC from this phygital token's wallet PDA to `recipient`
 * (Hold to send via getPhygitalWalletSigner).
 */
export async function sendUsdcFromWallet(args: {
  phygitalTokenPda: Address | string;
  recipient: Address | string;
  amountUi: string;
}): Promise<{ signature: string; confirmed: Promise<void> }> {
  const rpc = getSolanaRpc();
  const tokenPda = address(String(args.phygitalTokenPda));
  const recipient = address(String(args.recipient));
  const mint = getUsdcMint();
  const raw = uiAmountToRaw(args.amountUi, USDC_DECIMALS);

  const walletSigner = await getPhygitalWalletSigner(rpc, tokenPda);
  const walletPda = await walletPdaForToken(tokenPda);

  const [sourceAta] = await findAssociatedTokenPda({
    mint,
    owner: walletPda,
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

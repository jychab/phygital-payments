import {
  address,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import {
  findAssociatedTokenPda as findAssociatedToken2022Pda,
  getCreateAssociatedTokenIdempotentInstruction as getCreateAta2022,
  getTransferCheckedInstruction as getTransferChecked2022,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";
import { getPhygitalWalletSigner } from "phygital-wallet-sdk";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { sendTransaction } from "@/lib/solana/tx";
import { uiAmountToRaw } from "@/lib/tokens/amount";
import { isToken2022Program } from "@/lib/tokens/payment-token";
import { walletPdaForToken } from "@/lib/wallet/pda";
import type { SendAssetRef } from "@/lib/wallet/send-asset-ref";
import { buildCnftTransferInstructions } from "@/lib/wallet/transfers/cnft-transfer";
import { buildCoreTransferInstructions } from "@/lib/wallet/transfers/core-transfer";
import { buildPnftTransferInstructions } from "@/lib/wallet/transfers/pnft-transfer";

type SendAssetFields = Pick<
  SendAssetRef,
  "kind" | "mint" | "decimals" | "tokenProgram"
>;

export async function sendAssetFromWallet(args: {
  phygitalTokenPda: Address | string;
  recipient: Address | string;
  amountUi: string;
  asset: SendAssetFields;
}): Promise<{ signature: string; confirmed: Promise<void> }> {
  const rpc = getSolanaRpc();
  const tokenPda = address(String(args.phygitalTokenPda));
  const recipient = address(String(args.recipient));
  const walletSigner = await getPhygitalWalletSigner(rpc, tokenPda);
  const walletPda = walletSigner.address;

  const instructions = await buildSendInstructions({
    kind: args.asset.kind,
    mint: args.asset.mint,
    decimals: args.asset.decimals,
    tokenProgram: args.asset.tokenProgram,
    amountUi: args.amountUi,
    walletSigner,
    walletPda,
    recipient,
  });

  return sendTransaction({
    instructions,
    feePayer: walletSigner,
  });
}

/** Pull an asset from a linked payer accessory into this wallet. */
export async function receiveAssetFromNearbyPayer(args: {
  payerPhygitalTokenPda: Address | string;
  expectedPayerWallet: Address | string;
  recipientWallet: Address | string;
  amountUi: string;
  asset: SendAssetFields;
}): Promise<{ signature: string; confirmed: Promise<void> }> {
  const payerToken = address(String(args.payerPhygitalTokenPda));
  const walletPda = await walletPdaForToken(payerToken);
  if (String(walletPda) !== String(args.expectedPayerWallet)) {
    throw new Error("That isn’t the linked accessory");
  }

  return sendAssetFromWallet({
    phygitalTokenPda: payerToken,
    recipient: args.recipientWallet,
    amountUi: args.amountUi,
    asset: args.asset,
  });
}

async function buildSendInstructions(args: {
  kind: SendAssetRef["kind"];
  mint: string;
  decimals: number;
  tokenProgram: string | null;
  amountUi: string;
  walletSigner: TransactionSigner;
  walletPda: Address;
  recipient: Address;
}): Promise<Instruction[]> {
  switch (args.kind) {
    case "native":
      return [
        getTransferSolInstruction({
          source: args.walletSigner,
          destination: args.recipient,
          amount: uiAmountToRaw(args.amountUi, 9),
        }),
      ];
    case "fungible":
    case "nft":
      return buildSplTransfer({
        ...args,
        amountUi: args.kind === "nft" ? "1" : args.amountUi,
        decimals: args.kind === "nft" ? 0 : args.decimals,
      });
    case "pnft":
      return buildPnftTransferInstructions({
        mint: address(args.mint),
        owner: args.walletPda,
        authority: args.walletSigner,
        recipient: args.recipient,
        tokenProgram: address(
          args.tokenProgram ?? String(TOKEN_PROGRAM_ADDRESS),
        ),
      });
    case "cnft":
      return buildCnftTransferInstructions({
        assetId: args.mint,
        owner: args.walletPda,
        leafOwnerSigner: args.walletSigner,
        newLeafOwner: args.recipient,
      });
    case "core":
      return buildCoreTransferInstructions({
        asset: address(args.mint),
        authority: args.walletSigner,
        newOwner: args.recipient,
      });
    default: {
      const _exhaustive: never = args.kind;
      throw new Error(`Unsupported asset kind: ${_exhaustive}`);
    }
  }
}

async function buildSplTransfer(args: {
  mint: string;
  decimals: number;
  tokenProgram: string | null;
  amountUi: string;
  walletSigner: TransactionSigner;
  walletPda: Address;
  recipient: Address;
}): Promise<Instruction[]> {
  const mint = address(args.mint);
  const raw = uiAmountToRaw(args.amountUi, args.decimals);
  const use2022 = isToken2022Program(args.tokenProgram);

  if (use2022) {
    const [sourceAta] = await findAssociatedToken2022Pda({
      mint,
      owner: args.walletPda,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    });
    const [destAta] = await findAssociatedToken2022Pda({
      mint,
      owner: args.recipient,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    });
    return [
      getCreateAta2022({
        payer: args.walletSigner,
        ata: destAta,
        owner: args.recipient,
        mint,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      }),
      getTransferChecked2022({
        source: sourceAta,
        mint,
        destination: destAta,
        authority: args.walletSigner,
        amount: raw,
        decimals: args.decimals,
      }),
    ];
  }

  const tokenProgram = TOKEN_PROGRAM_ADDRESS;
  const [sourceAta] = await findAssociatedTokenPda({
    mint,
    owner: args.walletPda,
    tokenProgram,
  });
  const [destAta] = await findAssociatedTokenPda({
    mint,
    owner: args.recipient,
    tokenProgram,
  });
  return [
    getCreateAssociatedTokenIdempotentInstruction({
      payer: args.walletSigner,
      ata: destAta,
      owner: args.recipient,
      mint,
      tokenProgram,
    }),
    getTransferCheckedInstruction({
      source: sourceAta,
      mint,
      destination: destAta,
      authority: args.walletSigner,
      amount: raw,
      decimals: args.decimals,
    }),
  ];
}

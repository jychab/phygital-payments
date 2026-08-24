import {
  AccountRole,
  address,
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
  type Instruction,
} from "@solana/kit";

import { SYSTEM_PROGRAM_ADDRESS } from "@/lib/lazorkit/constants";
import { parseUiAmount } from "@/lib/wallet/parse-amount";
import type { WalletHolding } from "@/lib/wallet/portfolio";
import { transferSolInstruction } from "@/lib/wallet/transfer-sol";

/** SPL Token program. */
export const TOKEN_PROGRAM_ADDRESS = address(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

/** Associated Token Account program. */
export const ASSOCIATED_TOKEN_PROGRAM_ADDRESS = address(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

const addressEncoder = getAddressEncoder();

export async function findAssociatedTokenAddress(args: {
  owner: Address;
  mint: Address;
  tokenProgram?: Address;
}): Promise<Address> {
  const tokenProgram = args.tokenProgram ?? TOKEN_PROGRAM_ADDRESS;
  const [ata] = await getProgramDerivedAddress({
    programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
    seeds: [
      addressEncoder.encode(args.owner),
      addressEncoder.encode(tokenProgram),
      addressEncoder.encode(args.mint),
    ],
  });
  return ata;
}

/** ATA Program `CreateIdempotent` (ix 1). */
export function createAssociatedTokenIdempotentInstruction(args: {
  payer: Address;
  owner: Address;
  mint: Address;
  ata: Address;
  tokenProgram?: Address;
}): Instruction {
  const tokenProgram = args.tokenProgram ?? TOKEN_PROGRAM_ADDRESS;
  return {
    programAddress: ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
    accounts: [
      { address: args.payer, role: AccountRole.WRITABLE_SIGNER },
      { address: args.ata, role: AccountRole.WRITABLE },
      { address: args.owner, role: AccountRole.READONLY },
      { address: args.mint, role: AccountRole.READONLY },
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
      { address: tokenProgram, role: AccountRole.READONLY },
    ],
    data: new Uint8Array([1]),
  };
}

/** SPL Token `TransferChecked` (ix 12). */
export function transferCheckedInstruction(args: {
  source: Address;
  mint: Address;
  destination: Address;
  owner: Address;
  amount: bigint;
  decimals: number;
  tokenProgram?: Address;
}): Instruction {
  const tokenProgram = args.tokenProgram ?? TOKEN_PROGRAM_ADDRESS;
  const data = new Uint8Array(10);
  data[0] = 12;
  const view = new DataView(data.buffer);
  view.setBigUint64(1, args.amount, true);
  data[9] = args.decimals;
  return {
    programAddress: tokenProgram,
    accounts: [
      { address: args.source, role: AccountRole.WRITABLE },
      { address: args.mint, role: AccountRole.READONLY },
      { address: args.destination, role: AccountRole.WRITABLE },
      { address: args.owner, role: AccountRole.READONLY_SIGNER },
    ],
    data,
  };
}

/**
 * Build Execute inner instructions to send a portfolio holding from the vault.
 * Collectibles always send amount 1.
 */
export async function buildSendAssetInners(args: {
  vaultPda: Address;
  holding: WalletHolding;
  destination: Address;
  /** UI amount string; ignored for collectibles (always 1). */
  uiAmount: string;
}): Promise<{ inners: Instruction[]; rawAmount: bigint }> {
  if (args.holding.kind === "native") {
    const lamports = parseUiAmount(args.uiAmount, 9);
    if (lamports == null || lamports <= 0n) {
      throw new Error("Enter a valid amount.");
    }
    return {
      rawAmount: lamports,
      inners: [
        transferSolInstruction({
          from: args.vaultPda,
          to: args.destination,
          lamports,
        }),
      ],
    };
  }

  const mint = address(args.holding.id);
  const rawAmount =
    args.holding.kind === "collectible"
      ? 1n
      : parseUiAmount(args.uiAmount, args.holding.decimals);
  if (rawAmount == null || rawAmount <= 0n) {
    throw new Error("Enter a valid amount.");
  }

  const sourceAta = await findAssociatedTokenAddress({
    owner: args.vaultPda,
    mint,
  });
  const destinationAta = await findAssociatedTokenAddress({
    owner: args.destination,
    mint,
  });

  return {
    rawAmount,
    inners: [
      createAssociatedTokenIdempotentInstruction({
        payer: args.vaultPda,
        owner: args.destination,
        mint,
        ata: destinationAta,
      }),
      transferCheckedInstruction({
        source: sourceAta,
        mint,
        destination: destinationAta,
        owner: args.vaultPda,
        amount: rawAmount,
        decimals: args.holding.decimals,
      }),
    ],
  };
}

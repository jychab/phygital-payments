import {
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import { getCreateAssociatedTokenIdempotentInstruction } from "@solana-program/token";

import { getSolanaRpc } from "@/lib/solana/rpc";
import {
  findAta,
  resolveMintProgram,
  type TokenProgram,
} from "@/lib/tokens/mint-delegate";

export type RecipientAtaStatus = {
  mint: Address;
  owner: Address;
  ata: Address;
  program: TokenProgram;
  exists: boolean;
};

/** Resolve an owner ATA and whether it already exists on-chain. */
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
 * Create the owner's token account. The connected wallet pays rent;
 * `owner` must be the token account owner (defaults to signer).
 */
export async function buildCreateAtaInstructions(args: {
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

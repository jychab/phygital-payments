import {
  lamports,
  unwrapOption,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import {
  findAssociatedTokenPda,
  getApproveCheckedInstruction,
  getRevokeInstruction,
  fetchMaybeMint,
  fetchMaybeToken,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import {
  findProgramAuthorityPda,
  PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
} from "phygital-payments-sdk";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { getUsdcMint, USDC_DECIMALS } from "@/lib/payments/usdc";

/** Classic SPL Token only — Token-2022 not wired in the app yet. */
export type TokenProgram = typeof TOKEN_PROGRAM_ADDRESS;

const RENT_EXEMPT_MIN = BigInt(890_880);

export type UsdcDelegateStatus = {
  programAuthority: Address;
  ata: Address | null;
  /** True when the ATA exists and its delegate is program_authority. */
  isProgramAuthorityDelegate: boolean;
  delegatedAmountRaw: bigint;
  delegatedAmountUi: string;
  balanceRaw: bigint;
  balanceUi: string;
};

export function formatTokenAmount(raw: bigint, decimals: number): string {
  if (raw === BigInt(0)) return "0";
  const negative = raw < BigInt(0);
  const abs = negative ? -raw : raw;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = (abs % base)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  const formatted = frac.length > 0 ? `${whole}.${frac}` : whole.toString();
  return negative ? `-${formatted}` : formatted;
}

export async function resolveMintProgram(
  mint: Address,
): Promise<{ program: TokenProgram; decimals: number }> {
  if (mint === getUsdcMint()) {
    return {
      program: TOKEN_PROGRAM_ADDRESS,
      decimals: USDC_DECIMALS,
    };
  }

  const account = await fetchMaybeMint(getSolanaRpc(), mint);
  if (!account.exists) {
    throw new Error("Mint account not found");
  }
  if (account.programAddress !== TOKEN_PROGRAM_ADDRESS) {
    throw new Error("Only classic SPL Token mints are supported");
  }
  return {
    program: TOKEN_PROGRAM_ADDRESS,
    decimals: account.data.decimals,
  };
}

export function uiAmountToRaw(uiAmount: string, decimals: number): bigint {
  const trimmed = uiAmount.trim();
  if (!trimmed || Number(trimmed) <= 0) {
    throw new Error("Enter a valid amount");
  }
  const [whole = "0", frac = ""] = trimmed.split(".");
  if (frac.length > decimals) {
    throw new Error(`Amount supports at most ${decimals} decimals`);
  }
  const padded = frac.padEnd(decimals, "0");
  return BigInt(whole + padded);
}

export async function findAta(
  mint: Address,
  owner: Address,
  program: TokenProgram = TOKEN_PROGRAM_ADDRESS,
): Promise<Address> {
  const [ata] = await findAssociatedTokenPda({
    mint,
    owner,
    tokenProgram: program,
  });
  return ata;
}

/** Read ATA balance + program_authority delegated amount for `owner` + mint. */
export async function fetchMintDelegateStatus(
  owner: Address,
  mint: Address = getUsdcMint(),
): Promise<UsdcDelegateStatus> {
  const [programAuthority, resolved] = await Promise.all([
    findProgramAuthorityPda(owner, PHYGITAL_PAYMENTS_PROGRAM_ADDRESS),
    resolveMintProgram(mint),
  ]);

  const { decimals, program } = resolved;
  const ata = await findAta(mint, owner, program);
  const account = await fetchMaybeToken(getSolanaRpc(), ata);

  if (!account.exists) {
    return {
      programAuthority,
      ata,
      isProgramAuthorityDelegate: false,
      delegatedAmountRaw: BigInt(0),
      delegatedAmountUi: "0",
      balanceRaw: BigInt(0),
      balanceUi: "0",
    };
  }

  const delegate = unwrapOption(account.data.delegate);
  const isProgramAuthorityDelegate = delegate === programAuthority;
  const delegatedAmountRaw = isProgramAuthorityDelegate
    ? BigInt(account.data.delegatedAmount)
    : BigInt(0);
  const balanceRaw = BigInt(account.data.amount);

  return {
    programAuthority,
    ata,
    isProgramAuthorityDelegate,
    delegatedAmountRaw,
    delegatedAmountUi: formatTokenAmount(delegatedAmountRaw, decimals),
    balanceRaw,
    balanceUi: formatTokenAmount(balanceRaw, decimals),
  };
}

/** Approve program_authority as SPL delegate for `rawAmount` on the signer's USDC ATA. */
export async function buildDelegateInstructions(args: {
  signer: TransactionSigner;
  rawAmount: bigint;
}): Promise<{ instructions: Instruction[]; programAuthority: Address }> {
  const { signer, rawAmount } = args;
  const mint = getUsdcMint();
  const [resolved, programAuthority] = await Promise.all([
    resolveMintProgram(mint),
    findProgramAuthorityPda(signer.address, PHYGITAL_PAYMENTS_PROGRAM_ADDRESS),
  ]);
  const { program, decimals } = resolved;

  const sourceAta = await findAta(mint, signer.address, program);
  const instructions: Instruction[] = [];

  const rpc = getSolanaRpc();
  const authorityInfo = await rpc
    .getAccountInfo(programAuthority, { encoding: "base64" })
    .send();
  if (!authorityInfo.value) {
    instructions.push(
      getTransferSolInstruction({
        source: signer,
        destination: programAuthority,
        amount: lamports(RENT_EXEMPT_MIN),
      }),
    );
  }

  instructions.push(
    getApproveCheckedInstruction(
      {
        source: sourceAta,
        mint,
        delegate: programAuthority,
        owner: signer,
        amount: rawAmount,
        decimals,
      },
      { programAddress: program },
    ),
  );

  return { instructions, programAuthority };
}

/** Revoke any SPL delegate on the signer's USDC ATA. */
export async function buildRevokeDelegateInstructions(args: {
  signer: TransactionSigner;
}): Promise<{ instructions: Instruction[]; programAuthority: Address }> {
  const { signer } = args;
  const mint = getUsdcMint();
  const [{ program }, programAuthority] = await Promise.all([
    resolveMintProgram(mint),
    findProgramAuthorityPda(signer.address, PHYGITAL_PAYMENTS_PROGRAM_ADDRESS),
  ]);

  const sourceAta = await findAta(mint, signer.address, program);

  return {
    instructions: [
      getRevokeInstruction(
        {
          source: sourceAta,
          owner: signer,
        },
        { programAddress: program },
      ),
    ],
    programAuthority,
  };
}

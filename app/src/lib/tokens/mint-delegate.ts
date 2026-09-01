import {
  address,
  lamports,
  unwrapOption,
  type Address,
  type Instruction,
  type MaybeAccount,
  type TransactionSigner,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import {
  findAssociatedTokenPda,
  getApproveCheckedInstruction,
  getRevokeInstruction,
  fetchAllMaybeMint,
  fetchAllMaybeToken,
  fetchMaybeMint,
  TOKEN_PROGRAM_ADDRESS,
  type Token,
} from "@solana-program/token";
import {
  findProgramAuthorityPda,
  PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
} from "phygital-payments-sdk";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { getUsdcMint, USDC_DECIMALS } from "@/lib/tokens/usdc-mint";
import { isDefaultMint } from "@/lib/tokens/payment-token";
import { type PhygitalToken } from "@/lib/phygital/token";

/**
 * SPL Token ATA + program-authority delegate (spending limit).
 * `program_authority` is a PDA of the phygital **token** (SDK 0.5+), not the
 * owner wallet. Classic SPL Token only — Token-2022 is not wired in the app yet.
 */
export type TokenProgram = typeof TOKEN_PROGRAM_ADDRESS;

const RENT_EXEMPT_MIN = BigInt(890_880);

export type MintDelegateStatus = {
  programAuthority: Address;
  /** Derived ATA address (may not exist on-chain yet). */
  ata: Address;
  /** True when the owner's SPL token account exists for this mint. */
  ataExists: boolean;
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
  if (isDefaultMint(mint)) {
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

function uniqueAddresses(mints: Address[]): Address[] {
  return [...new Map(mints.map((m) => [String(m), m])).values()];
}

async function loadMintDecimals(
  rpc: ReturnType<typeof getSolanaRpc>,
  mints: readonly Address[],
): Promise<Map<string, number>> {
  const usdc = getUsdcMint();
  const nonUsdc = mints.filter((m) => m !== usdc);
  const mintAccounts =
    nonUsdc.length > 0 ? await fetchAllMaybeMint(rpc, nonUsdc) : [];
  const decimalsByMint = new Map<string, number>([
    [String(usdc), USDC_DECIMALS],
  ]);
  for (let i = 0; i < nonUsdc.length; i++) {
    const mint = nonUsdc[i]!;
    const account = mintAccounts[i];
    if (!account?.exists) {
      throw new Error(`Mint account not found: ${mint}`);
    }
    if (account.programAddress !== TOKEN_PROGRAM_ADDRESS) {
      throw new Error("Only classic SPL Token mints are supported");
    }
    decimalsByMint.set(String(mint), account.data.decimals);
  }
  return decimalsByMint;
}

type OwnerMintAtaBatch = {
  mints: Address[];
  atas: Address[];
  decimalsByMint: Map<string, number>;
  tokenAccounts: MaybeAccount<Token>[];
};

/** Batch-load owner ATAs + token accounts for many mints (one RPC wave). */
async function loadOwnerMintAtaBatch(
  owner: Address,
  mints: Address[],
): Promise<OwnerMintAtaBatch> {
  const unique = uniqueAddresses(mints);
  if (unique.length === 0) {
    return {
      mints: [],
      atas: [],
      decimalsByMint: new Map(),
      tokenAccounts: [],
    };
  }

  const rpc = getSolanaRpc();
  const [decimalsByMint, atas] = await Promise.all([
    loadMintDecimals(rpc, unique),
    Promise.all(
      unique.map((mint) => findAta(mint, owner, TOKEN_PROGRAM_ADDRESS)),
    ),
  ]);
  const tokenAccounts = await fetchAllMaybeToken(rpc, atas);
  return { mints: unique, atas, decimalsByMint, tokenAccounts };
}

function mintStatusFromAccount(args: {
  programAuthority: Address;
  ata: Address;
  decimals: number;
  account: MaybeAccount<Token>;
}): MintDelegateStatus {
  const { programAuthority, ata, decimals, account } = args;
  if (!account.exists) {
    return {
      programAuthority,
      ata,
      ataExists: false,
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
    ataExists: true,
    isProgramAuthorityDelegate,
    delegatedAmountRaw,
    delegatedAmountUi: formatTokenAmount(delegatedAmountRaw, decimals),
    balanceRaw,
    balanceUi: formatTokenAmount(balanceRaw, decimals),
  };
}

/** Read ATA balance + program_authority delegated amount for `owner` + mint. */
export async function fetchMintDelegateStatus(
  owner: Address,
  mint: Address,
  token: Address,
): Promise<MintDelegateStatus> {
  const map = await fetchMintDelegateStatuses(owner, [mint], token);
  const status = map.get(String(mint));
  if (!status) {
    throw new Error("Missing delegate status for mint");
  }
  return status;
}

/**
 * Batch delegate status for many mints of one phygital token.
 * One program_authority PDA resolve + batched mint/ATA account reads.
 */
export async function fetchMintDelegateStatuses(
  owner: Address,
  mints: Address[],
  token: Address,
): Promise<Map<string, MintDelegateStatus>> {
  const batch = await loadOwnerMintAtaBatch(owner, mints);
  if (batch.mints.length === 0) return new Map();

  const programAuthority = await findProgramAuthorityPda(
    token,
    PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
  );

  const entries = batch.mints.map((mint, i) => {
    const status = mintStatusFromAccount({
      programAuthority,
      ata: batch.atas[i]!,
      decimals: batch.decimalsByMint.get(String(mint))!,
      account: batch.tokenAccounts[i]!,
    });
    return [String(mint), status] as const;
  });

  return new Map(entries);
}

export function isDelegateEnabled(status: MintDelegateStatus | undefined): boolean {
  return (
    !!status?.isProgramAuthorityDelegate && status.delegatedAmountRaw > BigInt(0)
  );
}

/** Amount this accessory can pay right now: min(wallet balance, remaining allowance). */
export function computeSpendableRaw(
  status: MintDelegateStatus | null | undefined,
): bigint {
  if (!status?.isProgramAuthorityDelegate) return BigInt(0);
  return status.balanceRaw < status.delegatedAmountRaw
    ? status.balanceRaw
    : status.delegatedAmountRaw;
}

export function computeSpendableUi(
  status: MintDelegateStatus | null | undefined,
  decimals: number,
): string {
  return formatTokenAmount(computeSpendableRaw(status), decimals);
}

/** Wallet balance is lower than remaining allowance. */
export function isBalanceLimited(
  status: MintDelegateStatus | null | undefined,
): boolean {
  return (
    !!status?.isProgramAuthorityDelegate &&
    status.balanceRaw < status.delegatedAmountRaw
  );
}

/** True when the owner must create a token account before approving a delegate. */
export function needsAtaBeforeDelegate(
  status: MintDelegateStatus | null | undefined,
  statusReady: boolean,
): boolean {
  if (!statusReady || !status || isDelegateEnabled(status)) return false;
  return !status.ataExists;
}

export function isOwnerPayMintEnabled(
  match: OwnerPayMintMatch | undefined,
): boolean {
  return !!match?.token && isDelegateEnabled(match.status ?? undefined);
}

/** Per-mint match of the owner's ATA delegate to an owned token's program_authority. */
export type OwnerPayMintMatch = {
  /** Token whose program_authority is the current ATA delegate, if any. */
  token: Address | null;
  /** Token-scoped status when `token` is set; otherwise no program-authority delegate. */
  status: MintDelegateStatus | null;
};

export type OwnerPayDelegates = {
  tokens: PhygitalToken[];
  /** True when any SPL ATA delegate matches an owned token PDA with a positive allowance. */
  tokenEnabled: boolean;
  byMint: Map<string, OwnerPayMintMatch>;
  /** Accessory × mint delegate reads for cache seeding (key: `token|mint`). */
  statusByTokenMint: Map<string, MintDelegateStatus>;
};

export function delegateStatusKey(
  token: Address | string,
  mint: Address | string,
): string {
  return `${String(token)}|${String(mint)}`;
}

export function patchDelegateAllowance(
  status: MintDelegateStatus,
  rawAmount: bigint,
  decimals: number,
): MintDelegateStatus {
  return {
    ...status,
    ataExists: true,
    isProgramAuthorityDelegate: true,
    delegatedAmountRaw: rawAmount,
    delegatedAmountUi: formatTokenAmount(rawAmount, decimals),
  };
}

export function patchRevokedDelegate(
  status: MintDelegateStatus,
): MintDelegateStatus {
  return {
    ...status,
    isProgramAuthorityDelegate: false,
    delegatedAmountRaw: BigInt(0),
    delegatedAmountUi: "0",
  };
}

const EMPTY_MINT_MATCH: OwnerPayMintMatch = { token: null, status: null };

/**
 * Wallet-scoped Pay read: owned tokens × SPL ATA delegates.
 * Pay UI loads this via `GET /api/pay/bootstrap`. A mint is enabled iff
 * its ATA delegate is some owned token's PDA.
 */
export async function fetchOwnerPayDelegates(
  owner: Address,
  mints: Address[],
  tokens: readonly PhygitalToken[],
): Promise<OwnerPayDelegates> {
  const owned = [...tokens];
  const batch = await loadOwnerMintAtaBatch(owner, mints);
  if (batch.mints.length === 0 || owned.length === 0) {
    return {
      tokens: owned,
      tokenEnabled: false,
      byMint: new Map(),
      statusByTokenMint: new Map(),
    };
  }

  const pdaEntries = await Promise.all(
    owned.map(async (item) => {
      const pda = await findProgramAuthorityPda(
        item.address,
        PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
      );
      return [String(pda), item.address] as const;
    }),
  );
  const pdaToToken = new Map(pdaEntries);
  const tokenToPda = new Map(
    pdaEntries.map(([pda, tokenAddr]) => [String(tokenAddr), address(pda)]),
  );

  const byMint = new Map<string, OwnerPayMintMatch>();
  const statusByTokenMint = new Map<string, MintDelegateStatus>();
  let tokenEnabled = false;
  for (let i = 0; i < batch.mints.length; i++) {
    const mint = batch.mints[i]!;
    const account = batch.tokenAccounts[i]!;
    const ata = batch.atas[i]!;
    const decimals = batch.decimalsByMint.get(String(mint))!;

    for (const ownedToken of owned) {
      const programAuthority = tokenToPda.get(String(ownedToken.address))!;
      statusByTokenMint.set(
        delegateStatusKey(ownedToken.address, mint),
        mintStatusFromAccount({ programAuthority, ata, decimals, account }),
      );
    }

    const match = mintMatchFromAccount({
      ata,
      decimals,
      account,
      pdaToToken,
    });
    if (isOwnerPayMintEnabled(match)) tokenEnabled = true;
    byMint.set(String(mint), match);
  }

  return { tokens: owned, tokenEnabled, byMint, statusByTokenMint };
}

function mintMatchFromAccount(args: {
  ata: Address;
  decimals: number;
  account: MaybeAccount<Token>;
  pdaToToken: Map<string, Address>;
}): OwnerPayMintMatch {
  const { ata, decimals, account, pdaToToken } = args;
  if (!account.exists) return EMPTY_MINT_MATCH;

  const delegate = unwrapOption(account.data.delegate);
  const token = delegate ? (pdaToToken.get(String(delegate)) ?? null) : null;
  if (!token || !delegate) return EMPTY_MINT_MATCH;

  return {
    token,
    status: mintStatusFromAccount({
      programAuthority: delegate,
      ata,
      decimals,
      account,
    }),
  };
}

/** Approve program_authority as SPL delegate for `rawAmount` on the signer's mint ATA. */
export async function buildDelegateInstructions(args: {
  signer: TransactionSigner;
  rawAmount: bigint;
  mint: Address;
  token: Address;
}): Promise<{ instructions: Instruction[] }> {
  const { signer, rawAmount, mint, token } = args;
  const [resolved, programAuthority] = await Promise.all([
    resolveMintProgram(mint),
    findProgramAuthorityPda(token, PHYGITAL_PAYMENTS_PROGRAM_ADDRESS),
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

  return { instructions };
}

/** Revoke any SPL delegate on the signer's mint ATA. */
export async function buildRevokeDelegateInstructions(args: {
  signer: TransactionSigner;
  mint: Address;
}): Promise<{ instructions: Instruction[] }> {
  const { signer, mint } = args;
  const { program } = await resolveMintProgram(mint);
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
  };
}

import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  decompileTransactionMessage,
  decompileTransactionMessageFetchingLookupTables,
  getBase64Encoder,
  getCompiledTransactionMessageDecoder,
  getTransactionDecoder,
  getTransactionMessageComputeUnitLimit,
  getTransactionMessagePriorityFeeLamports,
  isSignerRole,
  isWritableRole,
  pipe,
  setTransactionMessageComputeUnitLimit,
  setTransactionMessagePriorityFeeLamports,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type Blockhash,
  type Instruction,
  type Transaction,
  type TransactionMessage,
  type TransactionMessageWithFeePayer,
  type TransactionMessageWithLifetime,
  type TransactionVersion,
} from "@solana/kit";
import {
  assembleSessionExecute,
  EXECUTE_DISCRIMINATOR,
  getExecuteInstructionDataDecoder,
  parseCompactInstructions,
} from "lazor-kit";

import { lazorkitProgramAddress } from "@/lib/lazorkit/constants";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { bytesMatchPrefix } from "@/lib/solana/discriminator";
import {
  COMPUTE_BUDGET_PROGRAM_ADDRESS,
  defaultComputeBudgetIxs,
} from "../../../shared/compute-budget";
import {
  MAX_COMPUTE_UNITS,
  PRIORITY_FEE_MICRO_LAMPORTS,
} from "../../../worker/types";

export class SignTransactionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignTransactionError";
  }
}

export type AgentGrantAccounts = {
  walletPda: string;
  vaultPda: string;
  sessionPda: string;
  sessionPublicKey: string;
};

export type AssertedSignTransaction = {
  transaction: Transaction;
  feePayer: Address;
};

type PreparedMessage = TransactionMessage &
  TransactionMessageWithFeePayer &
  TransactionMessageWithLifetime;

type V1PreparedMessage = PreparedMessage & { version: 1 };

type BlockhashLifetime = {
  blockhash: Blockhash;
  lastValidBlockHeight: bigint;
};

function ixDataBytes(data: ArrayLike<number> | undefined): Uint8Array {
  return data ? Uint8Array.from(data) : new Uint8Array();
}

function createEmptyMessage(version: TransactionVersion): PreparedMessage {
  return createTransactionMessage({
    version: version as 0 | "legacy",
  }) as unknown as PreparedMessage;
}

function isExecute(ix: Instruction, lazorkit: string): boolean {
  return (
    String(ix.programAddress) === lazorkit &&
    bytesMatchPrefix(ixDataBytes(ix.data), EXECUTE_DISCRIMINATOR)
  );
}

function isComputeBudget(ix: Instruction): boolean {
  return String(ix.programAddress) === COMPUTE_BUDGET_PROGRAM_ADDRESS;
}

function defaultComputeBudget(): Instruction[] {
  return defaultComputeBudgetIxs(
    MAX_COMPUTE_UNITS,
    PRIORITY_FEE_MICRO_LAMPORTS,
  );
}

function lifetimeFromMessage(message: PreparedMessage): BlockhashLifetime {
  const constraint = message.lifetimeConstraint;
  if (!("blockhash" in constraint)) {
    throw new SignTransactionError("This transaction isn’t supported.");
  }
  return {
    blockhash: constraint.blockhash,
    lastValidBlockHeight: constraint.lastValidBlockHeight,
  };
}

async function decompileIncomingMessage(
  compiled: ReturnType<ReturnType<typeof getCompiledTransactionMessageDecoder>["decode"]>,
): Promise<PreparedMessage> {
  const config = { lastValidBlockHeight: 0n };
  try {
    if (
      compiled.version === 0 &&
      compiled.addressTableLookups &&
      compiled.addressTableLookups.length > 0
    ) {
      return await decompileTransactionMessageFetchingLookupTables(
        compiled,
        getSolanaRpc(),
        config,
      );
    }
    return decompileTransactionMessage(compiled, config);
  } catch {
    throw new SignTransactionError("This transaction isn’t supported.");
  }
}

function resolveFeePayer(
  originalFeePayer: Address,
  grant: AgentGrantAccounts,
  sponsoredFeePayer: Address,
): Address {
  if (String(originalFeePayer) === grant.vaultPda) {
    return sponsoredFeePayer;
  }
  return originalFeePayer;
}

function withFeePayer(message: PreparedMessage, feePayer: Address): PreparedMessage {
  if (String(message.feePayer.address) === String(feePayer)) {
    return message;
  }
  return setTransactionMessageFeePayer(feePayer, message) as PreparedMessage;
}

function defaultV1PriorityFeeLamports(computeUnits: number): bigint {
  return BigInt(
    Math.ceil((Number(PRIORITY_FEE_MICRO_LAMPORTS) * computeUnits) / 1_000_000),
  );
}

function rebuildMessageShell(source: PreparedMessage): PreparedMessage {
  const feePayer = source.feePayer.address;
  let message = pipe(
    createEmptyMessage(source.version),
    (m) => setTransactionMessageFeePayer(feePayer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetimeFromMessage(source), m),
  ) as PreparedMessage;
  if (source.version === 1) {
    const v1Source = source as V1PreparedMessage;
    let v1Message = message as V1PreparedMessage;
    const limit = getTransactionMessageComputeUnitLimit(v1Source);
    const priorityFee = getTransactionMessagePriorityFeeLamports(v1Source);
    if (limit != null) {
      v1Message = setTransactionMessageComputeUnitLimit(limit, v1Message);
    }
    if (priorityFee != null) {
      v1Message = setTransactionMessagePriorityFeeLamports(priorityFee, v1Message);
    }
    message = v1Message;
  }
  return message;
}

function demoteSignerRole(role: AccountRole): AccountRole {
  if (role === AccountRole.WRITABLE_SIGNER) return AccountRole.WRITABLE;
  if (role === AccountRole.READONLY_SIGNER) return AccountRole.READONLY;
  return role;
}

function promoteSignerRole(role: AccountRole): AccountRole {
  return isWritableRole(role)
    ? AccountRole.WRITABLE_SIGNER
    : AccountRole.READONLY_SIGNER;
}

function innerFromSessionExecute(executeIx: Instruction): Instruction[] {
  const parsed = getExecuteInstructionDataDecoder().decode(
    ixDataBytes(executeIx.data),
  );
  const { instructions: compact } = parseCompactInstructions(
    Uint8Array.from(parsed.instructions),
  );
  const packedAccounts = (executeIx.accounts ?? []).map((meta) => ({
    address: meta.address,
    role: meta.role,
  }));
  return compact.map((ix) => {
    const program = packedAccounts[ix.programIdIndex];
    if (!program) {
      throw new SignTransactionError("This transaction isn’t supported.");
    }
    return {
      programAddress: program.address,
      accounts: ix.accounts.map((index) => {
        const account = packedAccounts[index];
        if (!account) {
          throw new SignTransactionError("This transaction isn’t supported.");
        }
        return { address: account.address, role: account.role };
      }),
      data: ix.data,
    };
  });
}

/** Demote vault from signers and require the agent session key instead. */
function substituteVaultSignerInInstructions(
  instructions: readonly Instruction[],
  grant: AgentGrantAccounts,
): Instruction[] {
  const lazorkit = String(lazorkitProgramAddress());
  const vaultAddr = grant.vaultPda;
  const sessionAddr = grant.sessionPublicKey;

  return instructions.map((ix) => {
    const accounts = [...(ix.accounts ?? [])];
    if (
      String(ix.programAddress) !== lazorkit ||
      !bytesMatchPrefix(ixDataBytes(ix.data), EXECUTE_DISCRIMINATOR)
    ) {
      return {
        ...ix,
        accounts: accounts.map((meta) =>
          String(meta.address) === vaultAddr && isSignerRole(meta.role)
            ? { ...meta, role: demoteSignerRole(meta.role) }
            : meta,
        ),
      };
    }

    let hasSessionSigner = false;
    const remapped = accounts.map((meta) => {
      if (String(meta.address) === sessionAddr && isSignerRole(meta.role)) {
        hasSessionSigner = true;
        return meta;
      }
      if (String(meta.address) === vaultAddr && isSignerRole(meta.role)) {
        return { ...meta, role: demoteSignerRole(meta.role) };
      }
      return meta;
    });

    if (!hasSessionSigner) {
      const sessionIndex = remapped.findIndex(
        (meta) => String(meta.address) === sessionAddr,
      );
      if (sessionIndex >= 0) {
        remapped[sessionIndex] = {
          ...remapped[sessionIndex]!,
          role: promoteSignerRole(remapped[sessionIndex]!.role),
        };
      } else {
        remapped.push({
          address: address(sessionAddr),
          role: AccountRole.READONLY_SIGNER,
        });
      }
    }

    return { ...ix, accounts: remapped };
  });
}

function messageHasSessionSigner(
  message: PreparedMessage,
  grant: AgentGrantAccounts,
): boolean {
  const lazorkit = String(lazorkitProgramAddress());
  for (const ix of message.instructions) {
    if (!isExecute(ix, lazorkit)) continue;
    if (
      (ix.accounts ?? []).some(
        (meta) =>
          String(meta.address) === grant.sessionPublicKey &&
          isSignerRole(meta.role),
      )
    ) {
      return true;
    }
  }
  return false;
}

function wrapInner(
  inner: readonly Instruction[],
  grant: AgentGrantAccounts,
  feePayer: Address,
): Instruction {
  if (inner.length === 0) {
    throw new SignTransactionError("This transaction isn’t supported.");
  }
  try {
    return assembleSessionExecute({
      payer: feePayer,
      walletPda: address(grant.walletPda),
      sessionPda: address(grant.sessionPda),
      vaultPda: address(grant.vaultPda),
      sessionPublicKey: address(grant.sessionPublicKey),
      inner,
      programAddress: lazorkitProgramAddress(),
    });
  } catch {
    throw new SignTransactionError("This transaction isn’t supported.");
  }
}

/**
 * Wrap inner instructions in session Execute when needed, fix session-key
 * signers, and rebuild the message shell with compute budget.
 */
function normalizeAgentSignMessage(
  message: PreparedMessage,
  grant: AgentGrantAccounts,
): PreparedMessage {
  const lazorkit = String(lazorkitProgramAddress());
  const budget = message.instructions.filter(isComputeBudget);
  const rest = message.instructions.filter((ix) => !isComputeBudget(ix));
  const feePayer = message.feePayer.address;
  const executeCount = rest.filter((ix) => isExecute(ix, lazorkit)).length;

  if (executeCount > 1 || (executeCount === 1 && rest.length > 1)) {
    throw new SignTransactionError("This transaction isn’t supported.");
  }

  let core: Instruction[];
  if (executeCount === 0) {
    core = [wrapInner(rest, grant, feePayer)];
  } else if (messageHasSessionSigner(message, grant)) {
    core = [...rest];
  } else {
    try {
      const inner = innerFromSessionExecute(rest[0]!);
      core = [wrapInner(inner, grant, feePayer)];
    } catch {
      core = substituteVaultSignerInInstructions(rest, grant);
    }
  }

  return assembleMessageWithBudget(message, budget, core);
}

function assembleMessageWithBudget(
  source: PreparedMessage,
  budget: readonly Instruction[],
  core: readonly Instruction[],
): PreparedMessage {
  const shell = rebuildMessageShell(source);
  if (shell.version === 1) {
    const v1Message = source as V1PreparedMessage;
    const v1Shell = shell as V1PreparedMessage;
    const computeLimit =
      getTransactionMessageComputeUnitLimit(v1Message) ??
      parseComputeUnitLimit(budget) ??
      MAX_COMPUTE_UNITS;
    const priorityFeeLamports =
      getTransactionMessagePriorityFeeLamports(v1Message) ??
      defaultV1PriorityFeeLamports(computeLimit);
    let withBudget = setTransactionMessageComputeUnitLimit(computeLimit, v1Shell);
    withBudget = setTransactionMessagePriorityFeeLamports(
      priorityFeeLamports,
      withBudget,
    );
    return appendTransactionMessageInstructions(
      [...core],
      withBudget,
    ) as PreparedMessage;
  }

  const prefix = budget.length > 0 ? budget : defaultComputeBudget();
  return appendTransactionMessageInstructions(
    [...prefix, ...core],
    shell,
  ) as PreparedMessage;
}

function parseComputeUnitLimit(budget: readonly Instruction[]): number | null {
  for (const ix of budget) {
    const data = ix.data;
    if (!data || data[0] !== 0x02 || data.length < 5) continue;
    return new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(
      1,
      true,
    );
  }
  return null;
}

function assertExecuteOnMessage(
  message: PreparedMessage,
  grant: AgentGrantAccounts,
): Address {
  const lazorkit = String(lazorkitProgramAddress());
  const rest = message.instructions.filter((ix) => !isComputeBudget(ix));
  const executeIxs = rest.filter((ix) => isExecute(ix, lazorkit));

  if (executeIxs.length !== 1 || rest.length !== 1) {
    throw new SignTransactionError("This transaction isn’t supported.");
  }

  const accounts = executeIxs[0]!.accounts ?? [];
  if (accounts.length < 5) {
    throw new SignTransactionError("This transaction isn’t supported.");
  }

  const wallet = String(accounts[1]!.address);
  const authority = String(accounts[2]!.address);
  const vault = String(accounts[3]!.address);
  if (
    wallet !== grant.walletPda ||
    vault !== grant.vaultPda ||
    authority !== grant.sessionPda
  ) {
    throw new SignTransactionError("This transaction isn’t for that wallet.");
  }

  const hasSessionSigner = accounts.some(
    (meta) =>
      String(meta.address) === grant.sessionPublicKey && isSignerRole(meta.role),
  );
  if (!hasSessionSigner) {
    throw new SignTransactionError("This transaction isn’t for that wallet.");
  }

  return message.feePayer.address;
}

function compilePreparedMessage(message: PreparedMessage): Transaction {
  try {
    return compileTransaction(message);
  } catch {
    throw new SignTransactionError("This transaction isn’t supported.");
  }
}

/**
 * Decode a base64 wire transaction. Accepts legacy, v0 (with lookup tables),
 * and v1 messages. If it is not already a LazorKit Execute (plus optional
 * compute budget), wrap inner instructions in session Execute. Recompiles using
 * the same message version as the input. When the vault is the fee payer, it is
 * replaced with the sponsored fee payer; otherwise the original fee payer is kept.
 */
export async function decodeAndAssertSignTransaction(
  wireBase64: string,
  grant: AgentGrantAccounts,
  sponsoredFeePayer: Address,
): Promise<AssertedSignTransaction> {
  let transaction: Transaction;
  try {
    const bytes = getBase64Encoder().encode(wireBase64);
    transaction = getTransactionDecoder().decode(bytes);
  } catch {
    throw new SignTransactionError("This transaction isn’t supported.");
  }

  let compiled;
  try {
    compiled = getCompiledTransactionMessageDecoder().decode(
      transaction.messageBytes,
    );
  } catch {
    throw new SignTransactionError("This transaction isn’t supported.");
  }

  const message = await decompileIncomingMessage(compiled);
  const feePayer = resolveFeePayer(
    message.feePayer.address,
    grant,
    sponsoredFeePayer,
  );
  const normalized = withFeePayer(message, feePayer);
  const prepared = normalizeAgentSignMessage(normalized, grant);

  const transactionOut = compilePreparedMessage(prepared);
  assertExecuteOnMessage(prepared, grant);
  return { transaction: transactionOut, feePayer };
}

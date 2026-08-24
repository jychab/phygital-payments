/**
 * NFC tap-to-pay transaction assert/wrap for `/api/modifyAndSign`.
 *
 * Flow: decode wire tx → wrap LazorKit Execute if needed → assert session
 * signer / vault accounts → recompile with compute budget and fee payer.
 */
import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  decompileTransactionMessage,
  decompileTransactionMessageFetchingLookupTables,
  getCompiledTransactionMessageDecoder,
  getTransactionDecoder,
  getTransactionMessageComputeUnitLimit,
  getTransactionMessageComputeUnitPrice,
  getTransactionMessagePriorityFeeLamports,
  isSignerRole,
  isWritableRole,
  pipe,
  setTransactionMessageComputeUnitLimit,
  setTransactionMessageComputeUnitPrice,
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
import { COMPUTE_BUDGET_PROGRAM_ADDRESS } from "@solana-program/compute-budget";
import {
  assembleSessionExecute,
  decodeExecutePayload,
  EXECUTE_DISCRIMINATOR,
  parseCompactInstructions,
} from "lazor-kit";

import { lazorkitProgramAddress } from "@/lazorkit/constants";
import { getSolanaRpc } from "@/solana/rpc";
import { base64ToBytes } from "@/shared/base64";
import {
  MAX_COMPUTE_UNITS,
  PRIORITY_FEE_MICRO_LAMPORTS,
} from "@/shared/compute-budget";

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

function unsupported(): never {
  throw new SignTransactionError("This transaction isn’t supported.");
}

function wrongWallet(): never {
  throw new SignTransactionError("This transaction isn’t for that wallet.");
}

function ixData(data: ArrayLike<number> | undefined): Uint8Array {
  return data ? Uint8Array.from(data) : new Uint8Array();
}

function lazorkit(): string {
  return String(lazorkitProgramAddress());
}

function isComputeBudget(ix: Instruction): boolean {
  return String(ix.programAddress) === COMPUTE_BUDGET_PROGRAM_ADDRESS;
}

function isExecute(ix: Instruction, program = lazorkit()): boolean {
  const data = ixData(ix.data);
  return (
    String(ix.programAddress) === program &&
    data.length > 0 &&
    data[0] === EXECUTE_DISCRIMINATOR
  );
}

function demoteSigner(role: AccountRole): AccountRole {
  if (role === AccountRole.WRITABLE_SIGNER) return AccountRole.WRITABLE;
  if (role === AccountRole.READONLY_SIGNER) return AccountRole.READONLY;
  return role;
}

function promoteSigner(role: AccountRole): AccountRole {
  return isWritableRole(role)
    ? AccountRole.WRITABLE_SIGNER
    : AccountRole.READONLY_SIGNER;
}

function lifetimeOf(message: PreparedMessage): BlockhashLifetime {
  const constraint = message.lifetimeConstraint;
  if (!("blockhash" in constraint)) unsupported();
  return {
    blockhash: constraint.blockhash,
    lastValidBlockHeight: constraint.lastValidBlockHeight,
  };
}

async function decompileWireMessage(
  compiled: ReturnType<
    ReturnType<typeof getCompiledTransactionMessageDecoder>["decode"]
  >,
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
    unsupported();
  }
}

function resolveFeePayer(
  original: Address,
  grant: AgentGrantAccounts,
  sponsored: Address,
): Address {
  return String(original) === grant.vaultPda ? sponsored : original;
}

function withFeePayer(message: PreparedMessage, feePayer: Address): PreparedMessage {
  if (String(message.feePayer.address) === String(feePayer)) return message;
  return setTransactionMessageFeePayer(feePayer, message) as PreparedMessage;
}

function emptyShell(
  version: TransactionVersion,
  feePayer: Address,
  lifetime: BlockhashLifetime,
): PreparedMessage {
  return pipe(
    createTransactionMessage({
      version: version as 0 | "legacy",
    }) as unknown as PreparedMessage,
    (m) => setTransactionMessageFeePayer(feePayer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
  ) as PreparedMessage;
}

/** Unpack compact inners from a session Execute instruction. */
function innersFromExecute(executeIx: Instruction): Instruction[] {
  const payload = new Uint8Array(decodeExecutePayload(ixData(executeIx.data)));
  const { instructions: compact } = parseCompactInstructions(payload);
  const packed = (executeIx.accounts ?? []).map((meta) => ({
    address: meta.address,
    role: meta.role,
  }));
  return compact.map((ix) => {
    const program = packed[ix.programIdIndex];
    if (!program) unsupported();
    return {
      programAddress: program.address,
      accounts: ix.accounts.map((index) => {
        const account = packed[index];
        if (!account) unsupported();
        return { address: account.address, role: account.role };
      }),
      data: ix.data,
    };
  });
}

function wrapInExecute(
  inner: readonly Instruction[],
  grant: AgentGrantAccounts,
  feePayer: Address,
): Instruction {
  if (inner.length === 0) unsupported();
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
    unsupported();
  }
}

/** Demote vault signers; ensure the agent session key signs Execute. */
function ensureSessionSigner(
  instructions: readonly Instruction[],
  grant: AgentGrantAccounts,
): Instruction[] {
  const program = lazorkit();
  const vault = grant.vaultPda;
  const session = grant.sessionPublicKey;

  return instructions.map((ix) => {
    const accounts = [...(ix.accounts ?? [])];
    if (!isExecute(ix, program)) {
      return {
        ...ix,
        accounts: accounts.map((meta) =>
          String(meta.address) === vault && isSignerRole(meta.role)
            ? { ...meta, role: demoteSigner(meta.role) }
            : meta,
        ),
      };
    }

    let hasSessionSigner = false;
    const remapped = accounts.map((meta) => {
      const addr = String(meta.address);
      if (addr === session && isSignerRole(meta.role)) {
        hasSessionSigner = true;
        return meta;
      }
      if (addr === vault && isSignerRole(meta.role)) {
        return { ...meta, role: demoteSigner(meta.role) };
      }
      return meta;
    });

    if (!hasSessionSigner) {
      const idx = remapped.findIndex((meta) => String(meta.address) === session);
      if (idx >= 0) {
        remapped[idx] = {
          ...remapped[idx]!,
          role: promoteSigner(remapped[idx]!.role),
        };
      } else {
        remapped.push({
          address: address(session),
          role: AccountRole.READONLY_SIGNER,
        });
      }
    }

    return { ...ix, accounts: remapped };
  });
}

function executeHasSessionSigner(
  message: PreparedMessage,
  grant: AgentGrantAccounts,
): boolean {
  const program = lazorkit();
  for (const ix of message.instructions) {
    if (!isExecute(ix, program)) continue;
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

/**
 * Produce a single session Execute (+ strip compute budget). Wrap bare inners,
 * or re-wrap / substitute when an Execute is missing the session signer.
 */
function normalizeCore(
  message: PreparedMessage,
  grant: AgentGrantAccounts,
): Instruction[] {
  const program = lazorkit();
  const rest = message.instructions.filter((ix) => !isComputeBudget(ix));
  const feePayer = message.feePayer.address;
  const executes = rest.filter((ix) => isExecute(ix, program));

  if (executes.length > 1 || (executes.length === 1 && rest.length > 1)) {
    unsupported();
  }

  if (executes.length === 0) {
    return [wrapInExecute(rest, grant, feePayer)];
  }
  if (executeHasSessionSigner(message, grant)) {
    return [...rest];
  }
  try {
    return [wrapInExecute(innersFromExecute(rest[0]!), grant, feePayer)];
  } catch {
    return ensureSessionSigner(rest, grant);
  }
}

function defaultV1PriorityFeeLamports(computeUnits: number): bigint {
  return BigInt(
    Math.ceil((Number(PRIORITY_FEE_MICRO_LAMPORTS) * computeUnits) / 1_000_000),
  );
}

function withComputeBudget(
  source: PreparedMessage,
  core: readonly Instruction[],
): PreparedMessage {
  const shell = emptyShell(
    source.version,
    source.feePayer.address,
    lifetimeOf(source),
  );

  if (shell.version === 1) {
    const v1 = source as V1PreparedMessage;
    const limit =
      getTransactionMessageComputeUnitLimit(v1) ?? MAX_COMPUTE_UNITS;
    const priorityFee =
      getTransactionMessagePriorityFeeLamports(v1) ??
      defaultV1PriorityFeeLamports(limit);
    let message = setTransactionMessageComputeUnitLimit(
      limit,
      shell as V1PreparedMessage,
    );
    message = setTransactionMessagePriorityFeeLamports(priorityFee, message);
    return appendTransactionMessageInstructions(
      [...core],
      message,
    ) as PreparedMessage;
  }

  // v0 / legacy: kit CU price helpers are typed for those versions only.
  const v0Source = source as Exclude<PreparedMessage, V1PreparedMessage>;
  const limit =
    getTransactionMessageComputeUnitLimit(v0Source) ?? MAX_COMPUTE_UNITS;
  const price =
    getTransactionMessageComputeUnitPrice(v0Source) ??
    PRIORITY_FEE_MICRO_LAMPORTS;

  let message = appendTransactionMessageInstructions(
    [...core],
    shell,
  ) as typeof v0Source;
  message = setTransactionMessageComputeUnitPrice(price, message);
  return setTransactionMessageComputeUnitLimit(
    limit,
    message,
  ) as PreparedMessage;
}

function assertGrantExecute(
  message: PreparedMessage,
  grant: AgentGrantAccounts,
): void {
  const program = lazorkit();
  const rest = message.instructions.filter((ix) => !isComputeBudget(ix));
  const executes = rest.filter((ix) => isExecute(ix, program));
  if (executes.length !== 1 || rest.length !== 1) unsupported();

  const accounts = executes[0]!.accounts ?? [];
  if (accounts.length < 5) unsupported();

  if (
    String(accounts[1]!.address) !== grant.walletPda ||
    String(accounts[2]!.address) !== grant.sessionPda ||
    String(accounts[3]!.address) !== grant.vaultPda
  ) {
    wrongWallet();
  }

  const hasSessionSigner = accounts.some(
    (meta) =>
      String(meta.address) === grant.sessionPublicKey && isSignerRole(meta.role),
  );
  if (!hasSessionSigner) wrongWallet();
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
  let compiled;
  try {
    const transaction = getTransactionDecoder().decode(base64ToBytes(wireBase64));
    compiled = getCompiledTransactionMessageDecoder().decode(
      transaction.messageBytes,
    );
  } catch {
    unsupported();
  }

  const message = await decompileWireMessage(compiled);
  const feePayer = resolveFeePayer(
    message.feePayer.address,
    grant,
    sponsoredFeePayer,
  );
  const withPayer = withFeePayer(message, feePayer);
  const prepared = withComputeBudget(withPayer, normalizeCore(withPayer, grant));
  assertGrantExecute(prepared, grant);

  try {
    return { transaction: compileTransaction(prepared), feePayer };
  } catch {
    unsupported();
  }
}

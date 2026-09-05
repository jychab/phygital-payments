/**
 * Helpers to author JSON-safe policies with typed instruction/field names
 * from a `ProgramParser.fieldSchema` when possible.
 */
import type {
  ConditionOp,
  InstructionAllow,
  InstructionDeny,
  PolicyCondition,
  PolicyDocument,
  PolicyExpr,
  ProgramParser,
  ProgramPolicy,
  TransactionConstraints,
} from "./types.js";

type SchemaInstruction<P extends ProgramParser> =
  P["fieldSchema"][number]["instruction"];

type SchemaEntryFor<
  P extends ProgramParser,
  Ix extends string,
> = Extract<P["fieldSchema"][number], { instruction: Ix }>;

type FieldNameFor<
  P extends ProgramParser,
  Ix extends SchemaInstruction<P>,
> = SchemaEntryFor<P, Ix>["fields"][number]["name"];

type FieldTypeFor<
  P extends ProgramParser,
  Ix extends SchemaInstruction<P>,
  F extends FieldNameFor<P, Ix>,
> = Extract<SchemaEntryFor<P, Ix>["fields"][number], { name: F }>["type"];

type TypedCondition<
  P extends ProgramParser,
  Ix extends SchemaInstruction<P>,
> = {
  [F in FieldNameFor<P, Ix>]: {
    field: F;
    type: FieldTypeFor<P, Ix, F>;
    op: ConditionOp;
    value: string | string[];
  };
}[FieldNameFor<P, Ix>];

type TypedExpr<P extends ProgramParser, Ix extends SchemaInstruction<P>> =
  | TypedCondition<P, Ix>
  | { and: TypedExpr<P, Ix>[] }
  | { or: TypedExpr<P, Ix>[] }
  | { not: TypedExpr<P, Ix> };

type TypedAllow<P extends ProgramParser> = {
  [Ix in SchemaInstruction<P>]: {
    instruction: Ix;
    when?: TypedExpr<P, Ix> | PolicyExpr;
  };
}[SchemaInstruction<P>];

type TypedDeny<P extends ProgramParser> = TypedAllow<P>;

export type DefineProgramOptions<P extends ProgramParser = ProgramParser> = {
  /** Allow every instruction for this program (parser optional if no denies). */
  allowAll?: boolean;
  /** Allow-list entries (used when `allowAll` is not set). */
  allows?: readonly TypedAllow<P>[] | readonly InstructionAllow[];
  /**
   * Deny-list — checked after allowAll, before allows.
   * Requires a parser when non-empty.
   */
  denies?: readonly TypedDeny<P>[] | readonly InstructionDeny[];
};

function buildBlock(
  programId: string,
  opts: {
    allowAll?: boolean;
    allows?: readonly InstructionAllow[];
    denies?: readonly InstructionDeny[];
  },
): ProgramPolicy {
  const block: ProgramPolicy = { programId };
  if (opts.allowAll) block.allowAll = true;
  if (opts.allows) block.allows = [...opts.allows];
  if (opts.denies) block.denies = [...opts.denies];
  return block;
}

/**
 * Build a JSON-safe program block.
 *
 * - `defineProgram(parser, { allows / denies / allowAll })` — typed from schema
 * - `defineProgram(programId, { allowAll: true })` — no parser needed at verify
 */
export function defineProgram(
  programId: string,
  opts: {
    allowAll?: boolean;
    allows?: readonly InstructionAllow[];
    denies?: readonly InstructionDeny[];
  },
): ProgramPolicy;
export function defineProgram<P extends ProgramParser>(
  parser: P,
  opts: DefineProgramOptions<P>,
): ProgramPolicy;
export function defineProgram(
  parserOrId: ProgramParser | string,
  opts: DefineProgramOptions | {
    allowAll?: boolean;
    allows?: readonly InstructionAllow[];
    denies?: readonly InstructionDeny[];
  },
): ProgramPolicy {
  const programId =
    typeof parserOrId === "string" ? parserOrId : parserOrId.programId;
  return buildBlock(programId, {
    allowAll: opts.allowAll,
    allows: opts.allows as InstructionAllow[] | undefined,
    denies: opts.denies as InstructionDeny[] | undefined,
  });
}

/**
 * Wrap program blocks into a policy document.
 * Duplicate `programId` entries are rejected at verify (`invalid_policy`).
 * Pass `transaction` for per-tx aggregates
 * (e.g. `standardTransaction()`).
 */
export function definePolicy(
  programs: readonly ProgramPolicy[],
  transaction?: TransactionConstraints,
): PolicyDocument {
  const doc: PolicyDocument = { version: "2.0", programs: [...programs] };
  if (transaction) doc.transaction = transaction;
  return doc;
}

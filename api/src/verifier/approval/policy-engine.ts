import { address } from "@solana/kit";
import {
  findAssociatedTokenPda,
  getTransferCheckedInstructionDataDecoder,
  identifyTokenInstruction,
  TokenInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import {
  getTransferSolInstructionDataDecoder,
  identifySystemInstruction,
  SystemInstruction,
  SYSTEM_PROGRAM_ADDRESS,
} from "@solana-program/system";

import {
  ATA_PROGRAM,
  COMPUTE_BUDGET_PROGRAM,
  PHYGITAL_TOKEN_PROGRAM,
  PHYGITAL_WALLET_PROGRAM,
  SYSTEM_PROGRAM,
  TOKEN_2022_PROGRAM,
  TOKEN_PROGRAM,
  type IntentInstruction,
} from "@/verifier/constants";
import {
  COLLECTIBLE_SEND_PROGRAMS,
  DEFAULT_ALLOWED_PROGRAMS,
  DEFAULT_MAX_TRANSFER_SOL_LAMPORTS,
  type PolicyCondition,
  type PolicyRule,
  type PolicySummary,
  type PolicyVerdict,
  type SolanaPolicyDocument,
} from "@/verifier/approval/types";
import { NON_USDC_TRANSFER_RULE } from "@/verifier/approval/policy-defaults";
import { getUsdcMint, USDC_DECIMALS } from "@/tokens/usdc-mint";

const transferCheckedDecoder = getTransferCheckedInstructionDataDecoder();
const transferSolDecoder = getTransferSolInstructionDataDecoder();
const TOKEN_2022_ADDRESS = address(TOKEN_2022_PROGRAM);

const HARD_DENIED_PROGRAMS = new Set<string>([
  PHYGITAL_WALLET_PROGRAM,
  PHYGITAL_TOKEN_PROGRAM,
]);

type ParsedIx = {
  programAddress: string;
  instructionName?: string;
  fields: Record<string, string>;
};

function parseInstruction(ix: IntentInstruction): ParsedIx {
  const programAddress = ix.programAddress;
  const fields: Record<string, string> = {};
  let instructionName: string | undefined;

  if (
    programAddress === TOKEN_PROGRAM ||
    programAddress === TOKEN_2022_PROGRAM ||
    programAddress === String(TOKEN_PROGRAM_ADDRESS)
  ) {
    try {
      const kind = identifyTokenInstruction({ data: ix.data });
      instructionName = TokenInstruction[kind] ?? `TokenIx_${kind}`;
      if (kind === TokenInstruction.TransferChecked) {
        const data = transferCheckedDecoder.decode(ix.data);
        fields["TransferChecked.amount"] = data.amount.toString();
        fields["TransferChecked.mint"] = ix.accounts[1]?.address ?? "";
        fields["TransferChecked.source"] = ix.accounts[0]?.address ?? "";
        fields["TransferChecked.destination"] = ix.accounts[2]?.address ?? "";
        fields["TransferChecked.authority"] = ix.accounts[3]?.address ?? "";
      }
    } catch {
      instructionName = "TokenUnknown";
    }
  } else if (
    programAddress === SYSTEM_PROGRAM ||
    programAddress === String(SYSTEM_PROGRAM_ADDRESS)
  ) {
    try {
      const kind = identifySystemInstruction({ data: ix.data });
      instructionName = SystemInstruction[kind] ?? `SystemIx_${kind}`;
      if (kind === SystemInstruction.TransferSol) {
        const data = transferSolDecoder.decode(ix.data);
        fields["Transfer.lamports"] = data.amount.toString();
        fields["Transfer.from"] = ix.accounts[0]?.address ?? "";
        fields["Transfer.to"] = ix.accounts[1]?.address ?? "";
        instructionName = "Transfer";
      }
    } catch {
      instructionName = "SystemUnknown";
    }
  } else if (programAddress === ATA_PROGRAM) {
    instructionName = "CreateIdempotent";
    fields["CreateIdempotent.owner"] = ix.accounts[2]?.address ?? "";
    fields["CreateIdempotent.ata"] = ix.accounts[1]?.address ?? "";
    fields["CreateIdempotent.mint"] = ix.accounts[3]?.address ?? "";
  } else if (programAddress === COMPUTE_BUDGET_PROGRAM) {
    instructionName = "ComputeBudget";
  }

  return { programAddress, instructionName, fields };
}

function fieldValue(
  ix: ParsedIx,
  field: string,
  nowSec: number,
): string | undefined {
  if (field === "programId") return ix.programAddress;
  if (field === "instructionName") return ix.instructionName;
  if (field === "current_unix_timestamp") return String(nowSec);
  return ix.fields[field];
}

function compare(op: string, left: string, right: string): boolean {
  const ln = Number(left);
  const rn = Number(right);
  const numeric =
    Number.isFinite(ln) &&
    Number.isFinite(rn) &&
    left !== "" &&
    right !== "" &&
    /^-?\d+(\.\d+)?$/.test(left) &&
    /^-?\d+(\.\d+)?$/.test(right);
  switch (op) {
    case "eq":
      return left === right;
    case "neq":
      return left !== right;
    case "lt":
      return numeric && ln < rn;
    case "lte":
      return numeric && ln <= rn;
    case "gt":
      return numeric && ln > rn;
    case "gte":
      return numeric && ln >= rn;
    default:
      return false;
  }
}

function conditionMatches(
  condition: PolicyCondition,
  ix: ParsedIx,
  nowSec: number,
): boolean {
  const left = fieldValue(ix, condition.field, nowSec);
  if (left == null) return false;

  if (condition.operator === "in") {
    const vals = Array.isArray(condition.value)
      ? condition.value
      : [condition.value];
    return vals.includes(left);
  }

  const right = Array.isArray(condition.value)
    ? condition.value[0]
    : condition.value;
  if (right == null) return false;
  return compare(condition.operator, left, right);
}

function ruleMatches(
  rule: PolicyRule,
  ix: ParsedIx,
  nowSec: number,
): boolean {
  if (rule.method !== "signTransaction") return false;
  if (rule.conditions.length === 0) return false;
  return rule.conditions.every((c) => conditionMatches(c, ix, nowSec));
}

function softCodeForField(field: string): { code: string; soft: boolean } {
  if (field === "TransferChecked.amount" || field === "Transfer.lamports") {
    return { code: "spend_limit", soft: true };
  }
  if (
    field === "TransferChecked.destination" ||
    field === "Transfer.to" ||
    field === "CreateIdempotent.owner"
  ) {
    return { code: "recipient_not_allowed", soft: true };
  }
  if (field === "current_unix_timestamp") {
    return { code: "outside_time_window", soft: true };
  }
  if (field === "programId") {
    return { code: "program_not_allowed", soft: false };
  }
  if (field === "instructionName") {
    return { code: "instruction_not_allowed", soft: false };
  }
  return { code: "unexpected_instruction", soft: false };
}

function humanError(
  code: string,
  condition: PolicyCondition,
  ix: ParsedIx,
): string {
  if (code === "spend_limit") {
    const scale = 10 ** USDC_DECIMALS;
    const limitRaw = Array.isArray(condition.value)
      ? condition.value[0]
      : condition.value;
    const limitUi =
      limitRaw != null ? (Number(limitRaw) / scale).toFixed(0) : "?";
    return `This send is over your $${limitUi} limit.`;
  }
  if (code === "recipient_not_allowed") {
    return "This address isn’t on your allowed list.";
  }
  if (code === "recipient_denied") {
    return "Transfers to this address are blocked.";
  }
  if (code === "outside_time_window") {
    return "Sending isn’t allowed right now.";
  }
  if (code === "program_not_allowed") {
    return "This payment isn’t allowed by your settings.";
  }
  if (code === "instruction_not_allowed") {
    return "This action isn’t allowed by your settings.";
  }
  void ix;
  return "This payment isn’t allowed by your settings.";
}

function detailsFor(
  code: string,
  condition: PolicyCondition,
  ix: ParsedIx,
): Record<string, unknown> {
  const scale = 10 ** USDC_DECIMALS;
  if (code === "spend_limit") {
    const limitRaw = Array.isArray(condition.value)
      ? condition.value[0]
      : condition.value;
    const requested = ix.fields["TransferChecked.amount"];
    return {
      limitUi:
        limitRaw != null ? (Number(limitRaw) / scale).toFixed(2) : undefined,
      requestedUi:
        requested != null ? (Number(requested) / scale).toFixed(2) : undefined,
      mint: ix.fields["TransferChecked.mint"] ?? null,
    };
  }
  if (code === "recipient_not_allowed" || code === "recipient_denied") {
    return {
      destination:
        ix.fields["CreateIdempotent.owner"] ??
        ix.fields["TransferChecked.destination"] ??
        ix.fields["Transfer.to"],
    };
  }
  if (code === "program_not_allowed") {
    return { programId: ix.programAddress };
  }
  return {};
}

/** Soft UX when an ALLOW rule almost matches (amount / recipient / time). */
function softNearMiss(
  rule: PolicyRule,
  ix: ParsedIx,
  nowSec: number,
): PolicyVerdict | null {
  const results = rule.conditions.map((c) => ({
    c,
    ok: conditionMatches(c, ix, nowSec),
  }));
  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);
  if (failed.length === 0 || passed.length === 0) return null;

  // Require identity conditions (program / instruction / mint) to have passed
  // so we only soft-deny the constraint the user can Approve once.
  const identityOk = passed.some(
    (p) =>
      p.c.field === "programId" ||
      p.c.field === "instructionName" ||
      p.c.field === "TransferChecked.mint",
  );
  if (!identityOk) return null;

  for (const { c } of failed) {
    const { code, soft } = softCodeForField(c.field);
    if (!soft) continue;
    return {
      ok: false,
      code,
      soft: true,
      error: humanError(code, c, ix),
      details: detailsFor(code, c, ix),
    };
  }
  return null;
}

/**
 * Expand wallet addresses to include their USDC ATAs (token + token-2022)
 * so TransferChecked.destination can be matched against an allow/deny list of owners.
 */
async function expandRecipientAddresses(
  wallets: readonly string[],
): Promise<Set<string>> {
  const set = new Set<string>(wallets);
  const mint = getUsdcMint();
  await Promise.all(
    wallets.map(async (ownerStr) => {
      try {
        const owner = address(ownerStr);
        const [[ata], [ata2022]] = await Promise.all([
          findAssociatedTokenPda({
            mint,
            owner,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
          }),
          findAssociatedTokenPda({
            mint,
            owner,
            tokenProgram: TOKEN_2022_ADDRESS,
          }),
        ]);
        set.add(String(ata));
        set.add(String(ata2022));
      } catch {
        /* skip invalid addresses */
      }
    }),
  );
  return set;
}

function recipientOf(ix: ParsedIx): string | undefined {
  return (
    ix.fields["CreateIdempotent.owner"] ||
    ix.fields["TransferChecked.destination"] ||
    ix.fields["Transfer.to"] ||
    undefined
  );
}

function gateRecipient(
  ix: ParsedIx,
  allowExpanded: Set<string> | null,
  denyExpanded: Set<string>,
): PolicyVerdict | null {
  const recipient = recipientOf(ix);
  if (!recipient) return null;

  if (denyExpanded.has(recipient)) {
    return {
      ok: false,
      code: "recipient_denied",
      soft: false,
      error: "Transfers to this address are blocked.",
      details: { destination: recipient },
    };
  }

  if (allowExpanded && !allowExpanded.has(recipient)) {
    return {
      ok: false,
      code: "recipient_not_allowed",
      soft: true,
      error: "This address isn’t on your allowed list.",
      details: { destination: recipient },
    };
  }

  return null;
}

/**
 * Privy-shaped evaluation: DENY wins; else any matching ALLOW; else deny.
 * Soft near-misses surface Approve-once codes when amount/recipient/time fail
 * on an otherwise matching transfer rule.
 * Recipient allow/deny lists also gate TransferChecked (via owner→ATA expansion)
 * and System Transfer.to.
 */
export async function evaluatePolicy(
  policy: SolanaPolicyDocument,
  instructions: readonly IntentInstruction[],
  nowMs = Date.now(),
): Promise<PolicyVerdict> {
  if (instructions.length === 0) {
    return {
      ok: false,
      code: "unexpected_instruction",
      soft: false,
      error: "Transaction has no instructions.",
    };
  }

  const nowSec = Math.floor(nowMs / 1000);
  const denyRules = policy.rules.filter((r) => r.action === "DENY");
  const allowRules = policy.rules.filter((r) => r.action === "ALLOW");

  const allowList = findRecipientAllowlist(policy);
  const denyList = findRecipientDenylist(policy);
  const [allowExpanded, denyExpanded] = await Promise.all([
    allowList ? expandRecipientAddresses(allowList) : Promise.resolve(null),
    denyList.length > 0
      ? expandRecipientAddresses(denyList)
      : Promise.resolve(new Set<string>()),
  ]);

  for (const ixRaw of instructions) {
    const ix = parseInstruction(ixRaw);

    if (HARD_DENIED_PROGRAMS.has(ix.programAddress)) {
      return {
        ok: false,
        code: "program_not_allowed",
        soft: false,
        error: "This payment isn’t allowed by your settings.",
        details: { programId: ix.programAddress },
      };
    }

    for (const rule of denyRules) {
      if (!ruleMatches(rule, ix, nowSec)) continue;
      const first = rule.conditions[0]!;
      const isRecipient =
        first.field === "TransferChecked.destination" ||
        first.field === "Transfer.to" ||
        first.field === "CreateIdempotent.owner";
      const code = isRecipient
        ? "recipient_denied"
        : softCodeForField(first.field).code;
      return {
        ok: false,
        code,
        soft: false,
        error: humanError(code, first, ix),
        details: detailsFor(code, first, ix),
      };
    }

    if (allowRules.some((r) => ruleMatches(r, ix, nowSec))) {
      const gated = gateRecipient(ix, allowExpanded, denyExpanded);
      if (gated) return gated;
      continue;
    }

    for (const rule of allowRules) {
      const near = softNearMiss(rule, ix, nowSec);
      if (near) return near;
    }

    // Recipient-only soft deny when transfer ix failed allowlist ATA rule.
    const gated = gateRecipient(ix, allowExpanded, denyExpanded);
    if (gated) return gated;

    const knownProgram = [...DEFAULT_ALLOWED_PROGRAMS].includes(
      ix.programAddress as (typeof DEFAULT_ALLOWED_PROGRAMS)[number],
    );
    return {
      ok: false,
      code: knownProgram ? "instruction_not_allowed" : "program_not_allowed",
      soft: false,
      error: knownProgram
        ? "This action isn’t allowed by your settings."
        : "This payment isn’t allowed by your settings.",
      details: {
        programId: ix.programAddress,
        instructionName: ix.instructionName,
      },
    };
  }

  return { ok: true };
}

function collectProgramAllowlist(policy: SolanaPolicyDocument): Set<string> {
  const set = new Set<string>();
  for (const rule of policy.rules) {
    if (rule.action !== "ALLOW") continue;
    for (const c of rule.conditions) {
      if (
        c.field === "programId" &&
        (c.operator === "in" || c.operator === "eq")
      ) {
        const vals = Array.isArray(c.value) ? c.value : [c.value];
        for (const v of vals) set.add(v);
      }
    }
  }
  if (set.size === 0) {
    for (const p of DEFAULT_ALLOWED_PROGRAMS) set.add(p);
  }
  return set;
}

function findUsdcCapRaw(policy: SolanaPolicyDocument): bigint | null {
  for (const rule of policy.rules) {
    if (rule.action !== "ALLOW") continue;
    let mintOk = false;
    let amount: bigint | null = null;
    for (const c of rule.conditions) {
      if (
        c.field === "TransferChecked.mint" &&
        c.operator === "eq" &&
        c.value === String(getUsdcMint())
      ) {
        mintOk = true;
      }
      if (
        c.field === "TransferChecked.amount" &&
        (c.operator === "lte" || c.operator === "lt")
      ) {
        amount = BigInt(Array.isArray(c.value) ? c.value[0]! : c.value);
      }
    }
    if (mintOk && amount != null) return amount;
  }
  return null;
}

function findRecipientAllowlist(policy: SolanaPolicyDocument): string[] | null {
  for (const rule of policy.rules) {
    if (rule.action !== "ALLOW") continue;
    for (const c of rule.conditions) {
      if (
        (c.field === "TransferChecked.destination" ||
          c.field === "Transfer.to" ||
          c.field === "CreateIdempotent.owner") &&
        c.operator === "in"
      ) {
        return Array.isArray(c.value) ? c.value : [c.value];
      }
    }
  }
  return null;
}

function findRecipientDenylist(policy: SolanaPolicyDocument): string[] {
  const out: string[] = [];
  for (const rule of policy.rules) {
    if (rule.action !== "DENY") continue;
    for (const c of rule.conditions) {
      if (
        (c.field === "TransferChecked.destination" ||
          c.field === "Transfer.to" ||
          c.field === "CreateIdempotent.owner") &&
        c.operator === "in"
      ) {
        out.push(...(Array.isArray(c.value) ? c.value : [c.value]));
      }
    }
  }
  return out;
}

function findSolCapLamports(policy: SolanaPolicyDocument): bigint | null {
  for (const rule of policy.rules) {
    if (rule.action !== "ALLOW") continue;
    let isTransfer = false;
    let lamports: bigint | null = null;
    for (const c of rule.conditions) {
      if (
        c.field === "instructionName" &&
        (c.operator === "eq" || c.operator === "in")
      ) {
        const vals = Array.isArray(c.value) ? c.value : [c.value];
        if (vals.includes("Transfer")) isTransfer = true;
      }
      if (
        c.field === "Transfer.lamports" &&
        (c.operator === "lte" || c.operator === "lt")
      ) {
        lamports = BigInt(Array.isArray(c.value) ? c.value[0]! : c.value);
      }
    }
    if (isTransfer && lamports != null) return lamports;
  }
  return null;
}

export function deriveSummary(policy: SolanaPolicyDocument): PolicySummary {
  const usdcCap = findUsdcCapRaw(policy);
  const solCap = findSolCapLamports(policy);
  const recipientAllow = findRecipientAllowlist(policy);
  const recipientDeny = findRecipientDenylist(policy);
  const programs = [...collectProgramAllowlist(policy)];

  return {
    maxTransferUsdc:
      usdcCap != null
        ? (Number(usdcCap) / 10 ** USDC_DECIMALS).toFixed(2)
        : null,
    maxTransferSol:
      solCap != null ? (Number(solCap) / 1e9).toFixed(4) : null,
    recipientMode: recipientAllow ? "allowlist" : "anyone",
    recipientAllowlist: recipientAllow ?? [],
    recipientDenylist: recipientDeny,
    allowedPrograms: programs,
  };
}

const TRANSFER_RULE = "USDC TransferChecked under cap";
const ATA_RULE = "Allow ATA idempotent create";
const ATA_ALLOWLIST_RULE = "Allow ATA create to allowlisted owner";
const LEGACY_CAP = "USDC per-transfer cap";
const LEGACY_ALLOW = "Recipient allowlist";
const LEGACY_ALLOW_DEST = "Recipient allowlist (token destination)";
const LEGACY_DENY = "Recipient denylist";
const LEGACY_PROGRAMS = "Allowlisted programs";

function isCollectibleProgramRule(name: string): boolean {
  return name.startsWith("Allow collectible program ");
}

export function compileSummaryToPolicy(
  summary: Partial<PolicySummary>,
  base: SolanaPolicyDocument,
): SolanaPolicyDocument {
  const derived = deriveSummary(base);
  const usdc = String(getUsdcMint());
  const [token, token2022, ata, system, computeBudget] = DEFAULT_ALLOWED_PROGRAMS;

  let rules = base.rules.filter(
    (r) =>
      r.name !== TRANSFER_RULE &&
      r.name !== NON_USDC_TRANSFER_RULE &&
      r.name !== ATA_RULE &&
      r.name !== ATA_ALLOWLIST_RULE &&
      r.name !== LEGACY_CAP &&
      r.name !== LEGACY_ALLOW &&
      r.name !== LEGACY_ALLOW_DEST &&
      r.name !== LEGACY_DENY &&
      r.name !== LEGACY_PROGRAMS &&
      r.name !== "Allow ComputeBudget" &&
      r.name !== "Allow System Transfer" &&
      r.name !== "Allow System Transfer under cap" &&
      r.name !== "Allow System account setup" &&
      r.name !== "Allow Token CloseAccount" &&
      r.name !== "Allow Token Transfer (NFT amount)" &&
      !isCollectibleProgramRule(r.name),
  );

  const programs = summary.allowedPrograms ?? derived.allowedPrograms;
  const useDefaults =
    programs.length === 0 ||
    (programs.length === DEFAULT_ALLOWED_PROGRAMS.length &&
      DEFAULT_ALLOWED_PROGRAMS.every((p) => programs.includes(p)));

  // Rebuild payment primitive ALLOWs from summary (or defaults).
  if (useDefaults || programs.includes(computeBudget!)) {
    rules.push({
      name: "Allow ComputeBudget",
      method: "signTransaction",
      action: "ALLOW",
      conditions: [
        {
          field: "programId",
          operator: "eq",
          value: computeBudget!,
        },
      ],
    });
  }
  if (useDefaults || programs.includes(system!)) {
    const maxSolUi =
      summary.maxTransferSol !== undefined
        ? summary.maxTransferSol
        : derived.maxTransferSol;
    const solLamports =
      maxSolUi != null && maxSolUi !== ""
        ? BigInt(Math.round(Number(maxSolUi) * 1e9))
        : DEFAULT_MAX_TRANSFER_SOL_LAMPORTS;
    rules.push(
      {
        name: "Allow System Transfer under cap",
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "eq",
            value: system!,
          },
          {
            field: "instructionName",
            operator: "eq",
            value: "Transfer",
          },
          {
            field: "Transfer.lamports",
            operator: "lte",
            value: solLamports.toString(),
          },
        ],
      },
      {
        name: "Allow System account setup",
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "eq",
            value: system!,
          },
          {
            field: "instructionName",
            operator: "in",
            value: ["CreateAccount", "Allocate", "Assign"],
          },
        ],
      },
    );
  }

  const tokenPrograms = [token!, token2022!].filter(
    (p) => useDefaults || programs.includes(p),
  );
  const maxUi =
    summary.maxTransferUsdc !== undefined
      ? summary.maxTransferUsdc
      : derived.maxTransferUsdc;
  const rawCap =
    maxUi != null && maxUi !== ""
      ? BigInt(Math.round(Number(maxUi) * 10 ** USDC_DECIMALS))
      : null;

  if (tokenPrograms.length > 0 && rawCap != null) {
    rules.push({
      name: TRANSFER_RULE,
      method: "signTransaction",
      action: "ALLOW",
      conditions: [
        {
          field: "programId",
          operator: "in",
          value: tokenPrograms,
        },
        {
          field: "instructionName",
          operator: "eq",
          value: "TransferChecked",
        },
        {
          field: "TransferChecked.mint",
          operator: "eq",
          value: usdc,
        },
        {
          field: "TransferChecked.amount",
          operator: "lte",
          value: rawCap.toString(),
        },
      ],
    });
    rules.push({
      name: NON_USDC_TRANSFER_RULE,
      method: "signTransaction",
      action: "ALLOW",
      conditions: [
        {
          field: "programId",
          operator: "in",
          value: tokenPrograms,
        },
        {
          field: "instructionName",
          operator: "eq",
          value: "TransferChecked",
        },
        {
          field: "TransferChecked.mint",
          operator: "neq",
          value: usdc,
        },
      ],
    });
    rules.push({
      name: "Allow Token CloseAccount",
      method: "signTransaction",
      action: "ALLOW",
      conditions: [
        {
          field: "programId",
          operator: "in",
          value: tokenPrograms,
        },
        {
          field: "instructionName",
          operator: "eq",
          value: "CloseAccount",
        },
      ],
    });
    rules.push({
      name: "Allow Token Transfer (NFT amount)",
      method: "signTransaction",
      action: "ALLOW",
      conditions: [
        {
          field: "programId",
          operator: "in",
          value: tokenPrograms,
        },
        {
          field: "instructionName",
          operator: "eq",
          value: "Transfer",
        },
      ],
    });
  }

  const mode = summary.recipientMode ?? derived.recipientMode;
  const allowlist = summary.recipientAllowlist ?? derived.recipientAllowlist;
  const includeAta = useDefaults || programs.includes(ata!);

  if (includeAta) {
    if (mode === "allowlist") {
      rules.push({
        name: ATA_ALLOWLIST_RULE,
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "eq",
            value: ata!,
          },
          {
            field: "instructionName",
            operator: "eq",
            value: "CreateIdempotent",
          },
          {
            field: "CreateIdempotent.owner",
            operator: "in",
            value: allowlist,
          },
        ],
      });
    } else {
      rules.push({
        name: ATA_RULE,
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "eq",
            value: ata!,
          },
          {
            field: "instructionName",
            operator: "eq",
            value: "CreateIdempotent",
          },
        ],
      });
    }
  }

  // Custom extra programs (beyond payments defaults) — programId-only ALLOW.
  // Collectible stacks (TM / Bubblegum / Core) are part of DEFAULT_ALLOWED_PROGRAMS.
  if (useDefaults) {
    for (const programId of COLLECTIBLE_SEND_PROGRAMS) {
      rules.push({
        name: `Allow collectible program ${programId.slice(0, 8)}`,
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "eq",
            value: programId,
          },
        ],
      });
    }
  } else {
    const extras = programs.filter(
      (p) => !(DEFAULT_ALLOWED_PROGRAMS as readonly string[]).includes(p),
    );
    for (const programId of extras) {
      rules.push({
        name: `Allow program ${programId.slice(0, 8)}`,
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "eq",
            value: programId,
          },
        ],
      });
    }
    for (const programId of COLLECTIBLE_SEND_PROGRAMS) {
      if (!programs.includes(programId)) continue;
      rules.push({
        name: `Allow collectible program ${programId.slice(0, 8)}`,
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "eq",
            value: programId,
          },
        ],
      });
    }
  }

  const denylist =
    summary.recipientDenylist !== undefined
      ? summary.recipientDenylist
      : derived.recipientDenylist;
  if (denylist.length > 0) {
    rules.push({
      name: LEGACY_DENY,
      method: "signTransaction",
      action: "DENY",
      conditions: [
        {
          field: "CreateIdempotent.owner",
          operator: "in",
          value: denylist,
        },
      ],
    });
  }

  return { ...base, rules };
}

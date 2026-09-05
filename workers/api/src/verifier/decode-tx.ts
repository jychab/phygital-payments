import {
  getBase64Encoder,
  AccountRole,
  type Address,
  type Instruction,
} from "@solana/kit";

const base64Encoder = getBase64Encoder();

/** Kit `AccountRole` is 0–3; preview JSON may send number or numeric string. */
function coerceAccountRole(role: string | number | undefined): AccountRole {
  const n = typeof role === "number" ? role : Number(role);
  if (Number.isInteger(n) && n >= 0 && n <= 3) return n as AccountRole;
  return AccountRole.READONLY;
}

/** Build an SDK Instruction from /preview JSON (base64 data). */
export function instructionFromJson(raw: {
  programAddress: string;
  accounts?: { address: string; role?: string | number }[];
  data?: string;
}): Instruction {
  const dataB64 = raw.data ?? "";
  const data =
    dataB64.length > 0
      ? new Uint8Array(base64Encoder.encode(dataB64))
      : new Uint8Array();
  return {
    programAddress: raw.programAddress as Address,
    accounts: (raw.accounts ?? []).map((a) => ({
      address: a.address as Address,
      role: coerceAccountRole(a.role),
    })),
    data,
  } satisfies Instruction;
}

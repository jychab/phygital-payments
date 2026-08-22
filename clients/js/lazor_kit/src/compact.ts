import {
  AccountRole,
  isSignerRole,
  isWritableRole,
  type Address,
  type Instruction,
} from "@solana/kit";

import { concatBytes, encodeU16Le, sha256Concat } from "./bytes";
import {
  EXECUTE_FIXED_ACCOUNT_COUNT,
  SYSVAR_INSTRUCTIONS_ADDRESS,
} from "./constants";
import { addressBytes } from "./pdas";

export type CompactInstruction = {
  programIdIndex: number;
  accounts: number[];
  data: Uint8Array;
};

export type PackedExecute = {
  compactBytes: Uint8Array;
  /** Full Execute account list (payer … sysvar … remaining). */
  accounts: { address: Address; role: AccountRole }[];
};

export function serializeCompactInstructions(
  instructions: readonly CompactInstruction[],
): Uint8Array {
  if (instructions.length > 16) {
    throw new Error("Too many inner instructions");
  }
  const parts: Uint8Array[] = [Uint8Array.of(instructions.length)];
  for (const ix of instructions) {
    if (ix.accounts.length > 255) {
      throw new Error("Too many accounts in inner instruction");
    }
    parts.push(Uint8Array.of(ix.programIdIndex, ix.accounts.length));
    parts.push(Uint8Array.from(ix.accounts));
    parts.push(encodeU16Le(ix.data.length));
    parts.push(ix.data);
  }
  return concatBytes(parts);
}

export function parseCompactInstructions(bytes: Uint8Array): {
  instructions: CompactInstruction[];
  consumed: number;
} {
  if (bytes.length === 0) {
    throw new Error("Empty compact instructions");
  }
  const count = bytes[0]!;
  const instructions: CompactInstruction[] = [];
  let offset = 1;
  for (let i = 0; i < count; i++) {
    if (offset + 4 > bytes.length) {
      throw new Error("Truncated compact instruction");
    }
    const programIdIndex = bytes[offset]!;
    const numAccounts = bytes[offset + 1]!;
    offset += 2;
    if (offset + numAccounts + 2 > bytes.length) {
      throw new Error("Truncated compact instruction accounts");
    }
    const accounts = [...bytes.subarray(offset, offset + numAccounts)];
    offset += numAccounts;
    const dataLen = bytes[offset]! | (bytes[offset + 1]! << 8);
    offset += 2;
    if (offset + dataLen > bytes.length) {
      throw new Error("Truncated compact instruction data");
    }
    const data = bytes.slice(offset, offset + dataLen);
    offset += dataLen;
    instructions.push({ programIdIndex, accounts, data });
  }
  return { instructions, consumed: offset };
}

function roleFromFlags(writable: boolean, signer: boolean): AccountRole {
  if (writable && signer) return AccountRole.WRITABLE_SIGNER;
  if (signer) return AccountRole.READONLY_SIGNER;
  if (writable) return AccountRole.WRITABLE;
  return AccountRole.READONLY;
}

function mergeRole(current: AccountRole, next: AccountRole): AccountRole {
  const writable = isWritableRole(current) || isWritableRole(next);
  const signer = isSignerRole(current) || isSignerRole(next);
  return roleFromFlags(writable, signer);
}

/**
 * Pack inner instructions into CompactInstructions + the Execute account
 * list. Vault is never a transaction signer (CPI marks it during Execute).
 */
export function packExecute(args: {
  payer: Address;
  walletPda: Address;
  authorityPda: Address;
  vaultPda: Address;
  inner: readonly Instruction[];
}): PackedExecute {
  if (args.inner.length === 0) {
    throw new Error("Execute requires at least one inner instruction");
  }
  if (args.inner.length > 16) {
    throw new Error("Too many inner instructions");
  }

  const accounts: { address: Address; role: AccountRole }[] = [
    { address: args.payer, role: AccountRole.WRITABLE_SIGNER },
    { address: args.walletPda, role: AccountRole.READONLY },
    { address: args.authorityPda, role: AccountRole.WRITABLE },
    { address: args.vaultPda, role: AccountRole.WRITABLE },
    { address: SYSVAR_INSTRUCTIONS_ADDRESS, role: AccountRole.READONLY },
  ];

  const indexOf = (address: Address): number => {
    const found = accounts.findIndex((item) => item.address === address);
    return found;
  };

  const pushAccount = (address: Address, role: AccountRole): number => {
    const existing = indexOf(address);
    if (existing >= 0) {
      if (existing >= EXECUTE_FIXED_ACCOUNT_COUNT) {
        accounts[existing] = {
          address,
          role: mergeRole(accounts[existing]!.role, role),
        };
      } else if (existing === 3 && isWritableRole(role)) {
        accounts[3] = { address: args.vaultPda, role: AccountRole.WRITABLE };
      }
      return existing;
    }
    const remainingRole = isSignerRole(role)
      ? isWritableRole(role)
        ? AccountRole.WRITABLE
        : AccountRole.READONLY
      : role;
    accounts.push({ address, role: remainingRole });
    return accounts.length - 1;
  };

  const compact: CompactInstruction[] = [];
  for (const ix of args.inner) {
    const programRole = AccountRole.READONLY;
    const programIdIndex = pushAccount(ix.programAddress, programRole);
    const accountIndexes: number[] = [];
    for (const meta of ix.accounts ?? []) {
      const writable = isWritableRole(meta.role);
      const signer = isSignerRole(meta.role);
      accountIndexes.push(
        pushAccount(meta.address, roleFromFlags(writable, signer)),
      );
    }
    compact.push({
      programIdIndex,
      accounts: accountIndexes,
      data: Uint8Array.from(ix.data ?? []),
    });
  }

  return {
    compactBytes: serializeCompactInstructions(compact),
    accounts,
  };
}

/** SHA256 of every referenced program + account pubkey, compact order. */
export async function hashPackedAccounts(
  packed: PackedExecute,
): Promise<Uint8Array> {
  const { instructions } = parseCompactInstructions(packed.compactBytes);
  const parts: Uint8Array[] = [];
  for (const ix of instructions) {
    const program = packed.accounts[ix.programIdIndex];
    if (!program) throw new Error("Invalid compact program index");
    parts.push(addressBytes(program.address));
    for (const idx of ix.accounts) {
      const account = packed.accounts[idx];
      if (!account) throw new Error("Invalid compact account index");
      parts.push(addressBytes(account.address));
    }
  }
  return sha256Concat(parts);
}

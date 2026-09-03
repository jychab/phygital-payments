import { AccountRole, address, isSignerRole } from "@solana/kit";
import { findWalletPda } from "phygital-wallet-sdk";

import type { IntentInstruction } from "@/verifier/constants";

function toAccountRole(role: string | number | undefined): AccountRole | null {
  if (role == null || role === "") return null;
  if (typeof role === "number" && role >= 0 && role <= 3) {
    return role as AccountRole;
  }
  const n = Number(role);
  if (Number.isInteger(n) && n >= 0 && n <= 3) return n as AccountRole;
  const s = String(role).toLowerCase().replace(/_/g, "");
  if (s === "writablesigner" || s === "3") return AccountRole.WRITABLE_SIGNER;
  if (s === "readonlysigner" || s === "2") return AccountRole.READONLY_SIGNER;
  if (s === "writable" || s === "1") return AccountRole.WRITABLE;
  if (s === "readonly" || s === "0") return AccountRole.READONLY;
  return null;
}

/**
 * Ensure `phygitalToken` maps to a wallet PDA that appears as a signer
 * on at least one preview instruction.
 */
export async function assertPreviewWalletSigner(
  phygitalToken: string,
  instructions: readonly IntentInstruction[],
): Promise<void> {
  let walletPda: string;
  try {
    const [pda] = await findWalletPda({
      phygitalToken: address(phygitalToken),
    });
    walletPda = String(pda);
  } catch {
    throw Object.assign(new Error("Invalid phygitalToken"), {
      code: "invalid_transaction",
    });
  }

  const isSigner = instructions.some((ix) =>
    ix.accounts.some((a) => {
      if (a.address !== walletPda) return false;
      const role = toAccountRole(a.role);
      return role != null && isSignerRole(role);
    }),
  );

  if (!isSigner) {
    throw Object.assign(
      new Error(
        "Preview instructions must include the wallet PDA as a signer",
      ),
      {
        code: "invalid_transaction",
        details: { phygitalToken, walletPda },
      },
    );
  }
}

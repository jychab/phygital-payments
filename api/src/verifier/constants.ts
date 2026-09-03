/**
 * Program IDs and intent shapes used by the verifier HTTP layer.
 * Wallet program addresses come from `phygital-wallet-sdk` (Codama).
 */
export {
  COMPUTE_BUDGET_PROGRAM_ADDRESS as COMPUTE_BUDGET_PROGRAM,
  PHYGITAL_TOKEN_PROGRAM_ADDRESS as PHYGITAL_TOKEN_PROGRAM,
  PHYGITAL_WALLET_PROGRAM_ADDRESS as PHYGITAL_WALLET_PROGRAM,
} from "phygital-wallet-sdk";

export const SYSTEM_PROGRAM = "11111111111111111111111111111111" as const;
export const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as const;
export const TOKEN_2022_PROGRAM =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" as const;
export const ATA_PROGRAM = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" as const;
/** Native secp256r1 precompile. */
export const SECP256R1_PROGRAM =
  "Secp256r1SigVerify1111111111111111111111111" as const;

/** Body instruction extracted from preview JSON or execute compact ixs. */
export type IntentInstruction = {
  programAddress: string;
  accounts: { address: string; role?: string | number }[];
  data: Uint8Array;
};

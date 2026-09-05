/**
 * Program IDs used by the Revibase co-signer (preview / sign / fees).
 * Payment program ids come from `phygital-verifier-sdk` STANDARD parsers.
 */
import {
  ataParser,
  systemParser,
  token2022Parser,
  tokenParser,
} from "phygital-verifier-sdk";

export { COMPUTE_BUDGET_PROGRAM_ADDRESS as COMPUTE_BUDGET_PROGRAM } from "phygital-verifier-sdk";

export const SYSTEM_PROGRAM = systemParser.programId;
export const TOKEN_PROGRAM = tokenParser.programId;
export const TOKEN_2022_PROGRAM = token2022Parser.programId;
export const ATA_PROGRAM = ataParser.programId;

/** Native secp256r1 precompile. */
export const SECP256R1_PROGRAM =
  "Secp256r1SigVerify1111111111111111111111111" as const;

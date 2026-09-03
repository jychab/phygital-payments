import {
  ATA_PROGRAM,
  COMPUTE_BUDGET_PROGRAM,
  SYSTEM_PROGRAM,
  TOKEN_2022_PROGRAM,
  TOKEN_PROGRAM,
} from "@/verifier/constants";

/** Metaplex / compression programs needed for NFT / pNFT / cNFT / Core sends. */
export const COLLECTIBLE_SEND_PROGRAMS = [
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
  "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
  "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
  "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
] as const;

export const DEFAULT_ALLOWED_PROGRAMS = [
  TOKEN_PROGRAM,
  TOKEN_2022_PROGRAM,
  ATA_PROGRAM,
  SYSTEM_PROGRAM,
  COMPUTE_BUDGET_PROGRAM,
  ...COLLECTIBLE_SEND_PROGRAMS,
] as const;

/** Default max USDC per TransferChecked (50 USDC, 6 decimals). */
export const DEFAULT_MAX_TRANSFER_USDC_RAW = 50_000_000n;

/** Default max SOL per System Transfer (0.1 SOL). */
export const DEFAULT_MAX_TRANSFER_SOL_LAMPORTS = 100_000_000n;

export type PolicyCondition = {
  field: string;
  operator: string;
  value: string | string[];
};

export type PolicyRule = {
  name: string;
  method: string;
  action: "ALLOW" | "DENY";
  conditions: PolicyCondition[];
};

export type SolanaPolicyDocument = {
  version: "1.0";
  name: string;
  chain_type: "solana";
  rules: PolicyRule[];
};

export type PolicySummary = {
  maxTransferUsdc: string | null;
  maxTransferSol: string | null;
  recipientMode: "anyone" | "allowlist";
  recipientDenylist: string[];
  recipientAllowlist: string[];
  allowedPrograms: string[];
};

export type PolicyVerdict =
  | { ok: true }
  | {
      ok: false;
      code: string;
      error: string;
      soft: boolean;
      details?: Record<string, unknown>;
    };

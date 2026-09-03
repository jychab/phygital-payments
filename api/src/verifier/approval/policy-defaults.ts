import {
  DEFAULT_ALLOWED_PROGRAMS,
  DEFAULT_MAX_TRANSFER_SOL_LAMPORTS,
  DEFAULT_MAX_TRANSFER_USDC_RAW,
  type SolanaPolicyDocument,
} from "@/verifier/approval/types";
import { getUsdcMint } from "@/tokens/usdc-mint";

/**
 * Default standing policy. Each ALLOW rule is self-contained (Privy OR
 * semantics): matching only `programId` must not bypass amount / recipient
 * constraints — those live on the same TransferChecked / Transfer rule.
 */
export function buildDefaultPolicy(): SolanaPolicyDocument {
  const usdc = String(getUsdcMint());
  const [token, token2022, ata, system, computeBudget] = DEFAULT_ALLOWED_PROGRAMS;

  return {
    version: "1.0",
    name: "Default wallet",
    chain_type: "solana",
    rules: [
      {
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
      },
      {
        name: "Allow ATA idempotent create",
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
      },
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
            value: DEFAULT_MAX_TRANSFER_SOL_LAMPORTS.toString(),
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
      {
        name: "USDC TransferChecked under cap",
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "in",
            value: [token!, token2022!],
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
            value: DEFAULT_MAX_TRANSFER_USDC_RAW.toString(),
          },
        ],
      },
      {
        name: "Allow Token CloseAccount",
        method: "signTransaction",
        action: "ALLOW",
        conditions: [
          {
            field: "programId",
            operator: "in",
            value: [token!, token2022!],
          },
          {
            field: "instructionName",
            operator: "eq",
            value: "CloseAccount",
          },
        ],
      },
    ],
  };
}

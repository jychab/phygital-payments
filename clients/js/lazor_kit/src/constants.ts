import { address } from "@solana/kit";

export const SYSTEM_PROGRAM_ADDRESS = address(
  "11111111111111111111111111111111",
);
export const SYSVAR_RENT_ADDRESS = address(
  "SysvarRent111111111111111111111111111111111",
);
export const SYSVAR_INSTRUCTIONS_ADDRESS = address(
  "Sysvar1nstructions1111111111111111111111111",
);
export const SECP256R1_PROGRAM_ADDRESS = address(
  "Secp256r1SigVerify1111111111111111111111111",
);

export const AUTH_TYPE_SECP256R1 = 1;

export const WALLET_DISCRIMINATOR = 1;
export const AUTHORITY_DISCRIMINATOR = 2;

export const AUTHORITY_HEADER_SIZE = 48;
export const AUTHORITY_SECP_SIZE = 145;

/** Execute accounts: payer, wallet, authority, vault, instructions sysvar. */
export const EXECUTE_FIXED_ACCOUNT_COUNT = 5;
export const EXECUTE_SYSVAR_IX_INDEX = 4;

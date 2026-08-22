import { address, type Address } from "@solana/kit";

import { isMainnet } from "@/lib/solana/cluster";

/** program-v2 foundation (no protocol fees). */
export const LAZORKIT_PROGRAM_DEVNET = address(
  "FLb7fyAtkfA4TSa2uYcAT8QKHd2pkoMHgmqfnXFXo7ao",
);
export const LAZORKIT_PROGRAM_MAINNET = address(
  "LazorjRFNavitUaBu5m3WaNPjU1maipvSW2rZfAFAKi",
);

export function lazorkitProgramAddress(): Address {
  return isMainnet() ? LAZORKIT_PROGRAM_MAINNET : LAZORKIT_PROGRAM_DEVNET;
}

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
export const ASSOCIATED_TOKEN_PROGRAM_ADDRESS = address(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

export const DISC_CREATE_WALLET = 0;
export const DISC_EXECUTE = 4;

export const AUTH_TYPE_SECP256R1 = 1;

export const WALLET_DISCRIMINATOR = 1;
export const AUTHORITY_DISCRIMINATOR = 2;

export const AUTHORITY_HEADER_SIZE = 48;
export const AUTHORITY_SECP_SIZE = 145;

export const USER_SEED_DOMAIN = "phygital-lazorkit-v1";

/** Execute accounts: payer, wallet, authority, vault, instructions sysvar. */
export const EXECUTE_FIXED_ACCOUNT_COUNT = 5;
export const EXECUTE_SYSVAR_IX_INDEX = 4;

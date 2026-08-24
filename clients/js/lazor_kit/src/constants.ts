import { address } from "@solana/kit";

/** Mainnet LazorKit program (program-v2). */
export const LAZORKIT_PROGRAM_MAINNET_ADDRESS = address(
  "LazorjRFNavitUaBu5m3WaNPjU1maipvSW2rZfAFAKi",
);

/** Devnet LazorKit program (program-v2 Shank IDL). */
export const LAZORKIT_PROGRAM_DEVNET_ADDRESS = address(
  "FLb7fyAtkfA4TSa2uYcAT8QKHd2pkoMHgmqfnXFXo7ao",
);

/** Default program id for generated instruction helpers (mainnet). */
export const LAZORKIT_PROGRAM_PROGRAM_ADDRESS =
  LAZORKIT_PROGRAM_MAINNET_ADDRESS;

/** @deprecated Use LAZORKIT_PROGRAM_DEVNET_ADDRESS. */
export const LAZORKIT_FOUNDATION_DEVNET_PROGRAM_ADDRESS =
  LAZORKIT_PROGRAM_DEVNET_ADDRESS;

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
export const SESSION_DISCRIMINATOR = 3;

export const AUTHORITY_HEADER_SIZE = 48;
export const AUTHORITY_SECP_SIZE = 145;
/** disc + bump + version + pad(5) + wallet + session_key + expires_at */
export const SESSION_HEADER_SIZE = 80;

/** Execute accounts: payer, wallet, authority, vault, instructions sysvar. */
export const EXECUTE_FIXED_ACCOUNT_COUNT = 5;
export const EXECUTE_SYSVAR_IX_INDEX = 4;

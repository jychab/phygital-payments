import { address, type Address } from "@solana/kit";
import { LAZORKIT_PROGRAM_PROGRAM_ADDRESS } from "lazor-kit";

import { isMainnet } from "@/lib/solana/cluster";

/** program-v2 foundation (no protocol fees). */
export const LAZORKIT_PROGRAM_DEVNET = address(
  "FLb7fyAtkfA4TSa2uYcAT8QKHd2pkoMHgmqfnXFXo7ao",
);
export const LAZORKIT_PROGRAM_MAINNET = LAZORKIT_PROGRAM_PROGRAM_ADDRESS;

export function lazorkitProgramAddress(): Address {
  return isMainnet() ? LAZORKIT_PROGRAM_MAINNET : LAZORKIT_PROGRAM_DEVNET;
}

/** Domain separator for deterministic userSeed from the passkey pubkey. */
export const USER_SEED_DOMAIN = "phygital-lazorkit-v1";

export {
  SECP256R1_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "lazor-kit";

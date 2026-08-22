import type { Address } from "@solana/kit";
import {
  LAZORKIT_PROGRAM_DEVNET_ADDRESS,
  LAZORKIT_PROGRAM_MAINNET_ADDRESS,
} from "lazor-kit";

import { isMainnet } from "@/lib/solana/cluster";

export const LAZORKIT_PROGRAM_DEVNET = LAZORKIT_PROGRAM_DEVNET_ADDRESS;
export const LAZORKIT_PROGRAM_MAINNET = LAZORKIT_PROGRAM_MAINNET_ADDRESS;

export function lazorkitProgramAddress(): Address {
  return isMainnet() ? LAZORKIT_PROGRAM_MAINNET : LAZORKIT_PROGRAM_DEVNET;
}

/** Domain separator for deterministic userSeed from the passkey pubkey. */
export const USER_SEED_DOMAIN = "phygital-lazorkit-v1";

export {
  SECP256R1_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "lazor-kit";

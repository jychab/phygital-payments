import {
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
} from "@solana/kit";
import { getCreateSessionInstruction, getRevokeSessionInstruction } from "lazor-kit";

import { createAddressSigner } from "@/lib/solana/address-signer";
import { lazorkitProgramAddress } from "./constants";

export async function findSessionPda(args: {
  walletPda: Address;
  sessionKey: Uint8Array;
  programAddress?: Address;
}): Promise<Address> {
  const programAddress = args.programAddress ?? lazorkitProgramAddress();
  const [sessionPda] = await getProgramDerivedAddress({
    programAddress,
    seeds: [
      new TextEncoder().encode("session"),
      new Uint8Array(getAddressEncoder().encode(args.walletPda)),
      args.sessionKey,
    ],
  });
  return sessionPda;
}

export function buildCreateSessionInner(args: {
  vaultPda: Address;
  walletPda: Address;
  authorityPda: Address;
  sessionPda: Address;
  sessionKey: Uint8Array;
  expiresAtSlot: bigint;
}) {
  return getCreateSessionInstruction(
    {
      payer: createAddressSigner(args.vaultPda),
      wallet: args.walletPda,
      adminAuthority: args.authorityPda,
      session: args.sessionPda,
      sessionKey: args.sessionKey,
      expiresAt: args.expiresAtSlot,
    },
    { programAddress: lazorkitProgramAddress() },
  );
}

export function buildRevokeSessionInner(args: {
  vaultPda: Address;
  walletPda: Address;
  authorityPda: Address;
  sessionPda: Address;
}) {
  return getRevokeSessionInstruction(
    {
      payer: createAddressSigner(args.vaultPda),
      wallet: args.walletPda,
      adminAuthority: args.authorityPda,
      session: args.sessionPda,
      refundDestination: args.vaultPda,
    },
    { programAddress: lazorkitProgramAddress() },
  );
}

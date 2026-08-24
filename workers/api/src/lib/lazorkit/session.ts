import {
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
} from "@solana/kit";

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

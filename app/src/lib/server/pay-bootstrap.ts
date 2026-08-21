import "server-only";

import { address } from "@solana/kit";

import {
  serializePayBootstrap,
  type PayBootstrapWire,
} from "@/lib/pay/pay-bootstrap-wire";
import { fetchPhygitalTokensByOwner } from "@/lib/phygital/token";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { fetchVerifiedHoldings } from "@/lib/server/token-holdings";
import { fetchOwnerPayDelegates } from "@/lib/tokens/mint-delegate";
import { mintsFromHoldings } from "@/lib/tokens/payment-token";

/** Holdings ∩ owned accessories ∩ SPL ATA delegates — one Pay open. */
export async function loadPayBootstrap(owner: string): Promise<PayBootstrapWire> {
  const ownerAddress = address(owner);
  const [holdings, tokens] = await Promise.all([
    fetchVerifiedHoldings(owner),
    fetchPhygitalTokensByOwner(getSolanaRpc(), ownerAddress),
  ]);
  const mints = mintsFromHoldings(holdings).map((mint) => address(mint));
  const delegates = await fetchOwnerPayDelegates(ownerAddress, mints, tokens);
  return serializePayBootstrap({ holdings, delegates });
}

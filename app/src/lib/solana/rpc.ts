import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  type Rpc,
  type RpcSubscriptions,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
} from "@solana/kit";

import { getSolanaRpcUrl, rpcSubscriptionsUrl } from "./cluster";

let _rpc: Rpc<SolanaRpcApi> | null = null;
let _rpcUrl: string | null = null;

export function getSolanaRpc() {
  const url = getSolanaRpcUrl();
  if (!_rpc || _rpcUrl !== url) {
    _rpc = createSolanaRpc(url);
    _rpcUrl = url;
  }
  return _rpc;
}

let _rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi> | null =
  null;
let _subUrl: string | null = null;

export function getSolanaRpcSubscriptions() {
  const url = rpcSubscriptionsUrl();
  if (!_rpcSubscriptions || _subUrl !== url) {
    _rpcSubscriptions = createSolanaRpcSubscriptions(url);
    _subUrl = url;
  }
  return _rpcSubscriptions;
}

/** Drop cached Kit clients after the user switches RPC. */
export function resetSolanaRpcClients() {
  _rpc = null;
  _rpcUrl = null;
  _rpcSubscriptions = null;
  _subUrl = null;
}

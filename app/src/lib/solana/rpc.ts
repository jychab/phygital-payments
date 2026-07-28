import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  type Rpc,
  type RpcSubscriptions,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
} from "@solana/kit";

import { rpcSubscriptionsUrl, RPC_URL } from "./cluster";

let _rpc: Rpc<SolanaRpcApi> | null = null;
export function getSolanaRpc() {
  if (!_rpc) {
    _rpc = createSolanaRpc(RPC_URL);
  }
  return _rpc;
}

let _rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi> | null =
  null;
export function getSolanaRpcSubscriptions() {
  if (!_rpcSubscriptions) {
    _rpcSubscriptions = createSolanaRpcSubscriptions(rpcSubscriptionsUrl());
  }
  return _rpcSubscriptions;
}

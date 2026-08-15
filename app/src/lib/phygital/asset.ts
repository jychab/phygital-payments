import { address, type Address, type Rpc, type SolanaRpcApi } from "@solana/kit";
import {
  fetchAllAssetsFromOwner,
  fetchAsset,
  findAssetPda,
  parseSecp256r1Pubkey,
  type Asset,
  type AssetType,
} from "phygital-token-sdk";

import { bytesToBase64Url } from "@/lib/crypto/base64";

/** System program / default pubkey — asset.owner before first claim. */
export const DEFAULT_ASSET_OWNER = address(
  "11111111111111111111111111111111",
);

/** Lean view of an on-chain phygital Asset (ownership-only). */
export type PhygitalAsset = {
  assetType: AssetType;
  secp256r1PublicKey: string;
  asset: Address;
  isLocked: boolean;
  currentOwner: Address;
  lastSignCount: number;
};

export function phygitalAssetFromAccount(
  assetAddress: Address,
  asset: Asset,
): PhygitalAsset {
  return {
    assetType: asset.assetType,
    secp256r1PublicKey: bytesToBase64Url(new Uint8Array(asset.publicKey[0])),
    asset: assetAddress,
    isLocked: asset.isLocked,
    currentOwner: asset.owner,
    lastSignCount: asset.lastSignCount,
  };
}

export async function fetchPhygitalAsset(
  rpc: Rpc<SolanaRpcApi>,
  secp256r1PublicKey: string,
): Promise<PhygitalAsset> {
  const assetAddress = await findAssetPda(
    parseSecp256r1Pubkey(secp256r1PublicKey),
  );
  const instance = await fetchAsset(rpc, assetAddress);
  return phygitalAssetFromAccount(assetAddress, instance.data);
}

/** All phygital assets whose on-chain `owner` matches `owner`. */
export async function fetchPhygitalAssetsByOwner(
  rpc: Rpc<SolanaRpcApi>,
  owner: Address,
): Promise<PhygitalAsset[]> {
  const assets = await fetchAllAssetsFromOwner(owner, rpc);
  return Promise.all(
    assets.map(async (asset) => {
      const assetAddress = await findAssetPda(asset.publicKey);
      return phygitalAssetFromAccount(assetAddress, asset);
    }),
  );
}

/** True when no wallet has claimed the asset yet. */
export function isUnclaimedAsset(
  asset: Pick<PhygitalAsset, "currentOwner">,
): boolean {
  return asset.currentOwner === DEFAULT_ASSET_OWNER;
}

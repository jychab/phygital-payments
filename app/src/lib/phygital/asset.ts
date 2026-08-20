import { address, type Address, type Rpc, type SolanaRpcApi } from "@solana/kit";
import {
  fetchAllAssetsFromOwner,
  fetchAsset,
  fetchAssetByIdentifier,
  findAssetPda,
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
  identifier: string;
  secp256r1PublicKey: string;
  /** On-chain asset PDA. */
  address: Address;
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
    identifier: bytesToBase64Url(new Uint8Array(asset.identifier[0])),
    secp256r1PublicKey: bytesToBase64Url(new Uint8Array(asset.publicKey[0])),
    address: assetAddress,
    isLocked: asset.isLocked,
    currentOwner: asset.owner,
    lastSignCount: asset.lastSignCount,
  };
}

/** Load asset by on-chain PDA (finish page already has `pending.asset`). */
export async function fetchPhygitalAsset(
  rpc: Rpc<SolanaRpcApi>,
  assetAddress: Address,
): Promise<PhygitalAsset> {
  const { data } = await fetchAsset(rpc, assetAddress);
  return phygitalAssetFromAccount(assetAddress, data);
}

/**
 * Load asset by chip `identifier` (NFC URL `pk`), not by passkey.
 * PDA is still derived from on-chain `publicKey` after the GPA lookup.
 */
export async function fetchPhygitalAssetByIdentifier(
  rpc: Rpc<SolanaRpcApi>,
  identifier: string,
): Promise<PhygitalAsset> {
  const asset = await fetchAssetByIdentifier(rpc, identifier);
  if (!asset) {
    throw new Error("Asset not found for identifier");
  }
  const assetAddress = await findAssetPda(asset.publicKey);
  return phygitalAssetFromAccount(assetAddress, asset);
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

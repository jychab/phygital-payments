/**
 * DAS types from helius-sdk. RPC still goes to the configured Solana URL
 * (including custom RPC) — we do not construct a Helius client.
 */
import { Interface } from "helius-sdk/types/enums";

export type {
  Asset as DasAsset,
  Content as DasContent,
  DisplayOptions as DasDisplayOptions,
  GetAssetResponseList as DasAssetList,
} from "helius-sdk/types/das";
export type { GetAssetProofResponse as DasAssetProof } from "helius-sdk/types/types";
export { Interface as DasInterface };

export function isDasFungible(iface: string | undefined): boolean {
  return (
    iface === Interface.FUNGIBLE_TOKEN || iface === Interface.FUNGIBLE_ASSET
  );
}

export function isDasCollectibleInterface(iface: string | undefined): boolean {
  if (!iface || isDasFungible(iface)) return false;
  return (
    iface === Interface.V1_NFT ||
    iface === Interface.V2_NFT ||
    iface === Interface.LEGACY_NFT ||
    iface === Interface.PROGRAMMABLE_NFT ||
    iface === Interface.MPL_CORE_ASSET
  );
}

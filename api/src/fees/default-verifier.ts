import {
  address,
  createSolanaRpc,
  fetchEncodedAccounts,
} from "@solana/kit";
import {
  decodeConfig,
  decodeTokenVerifier,
  findConfigPda,
  findTokenVerifierPda,
} from "phygital-wallet-sdk";

import { getRpcUrl } from "@/shared/solana/cluster";

let cachedDefaultVerifiers: { at: number; set: Set<string> } | null = null;
const CONFIG_CACHE_MS = 60_000;

async function loadDefaultVerifierSet(): Promise<Set<string>> {
  const now = Date.now();
  if (
    cachedDefaultVerifiers &&
    now - cachedDefaultVerifiers.at < CONFIG_CACHE_MS
  ) {
    return cachedDefaultVerifiers.set;
  }

  const rpc = createSolanaRpc(getRpcUrl());
  const [configPda] = await findConfigPda();
  const [encoded] = await fetchEncodedAccounts(rpc, [configPda]);
  const config = decodeConfig(encoded);
  const set = new Set<string>();
  if (config.exists) {
    const count = config.data.verifierCount;
    for (let i = 0; i < count; i++) {
      const v = config.data.verifiers[i];
      if (v) set.add(String(v));
    }
  }
  cachedDefaultVerifiers = { at: now, set };
  return set;
}

/** True when this token is sponsored by a Config default verifier (paymaster). */
export async function usesDefaultVerifierPaymaster(
  phygitalToken: string,
): Promise<boolean> {
  const rpc = createSolanaRpc(getRpcUrl());
  const token = address(phygitalToken);
  const [tokenVerifierPda] = await findTokenVerifierPda({
    phygitalToken: token,
  });
  const [tvEncoded] = await fetchEncodedAccounts(rpc, [tokenVerifierPda]);
  const tokenVerifier = decodeTokenVerifier(tvEncoded);

  if (!tokenVerifier.exists) {
    return true;
  }

  const defaults = await loadDefaultVerifierSet();
  return defaults.has(String(tokenVerifier.data.verifier));
}

export async function isDefaultConfigVerifier(
  verifier: string,
): Promise<boolean> {
  const defaults = await loadDefaultVerifierSet();
  return defaults.has(verifier);
}

/** Test helper — clear Config verifier cache. */
export function clearDefaultVerifierCache(): void {
  cachedDefaultVerifiers = null;
}

import "server-only";

import type { CollectibleAttribute, CollectibleRarity } from "@/lib/tokens/collectible";
import {
  mapAttributesFromDasContent,
  type DasCollectibleAsset,
} from "@/lib/tokens/collectible";
import {
  enrichAttributes,
  scoreMintFromCounts,
  traitKey,
} from "@/lib/tokens/rarity/trait-normalized";
import { tierFromRank } from "@/lib/tokens/rarity/rarity-tier";
import { postDasRpc } from "@/lib/server/das-rpc";
import {
  assignCollectionRanks,
  countUnscoredMints,
  ensureCollectionRarityMeta,
  ensureRaritySchema,
  getCollectionRarityMeta,
  getMintRarityRow,
  getRarityDb,
  loadAllAttrCountFrequencies,
  loadAllTraitCounts,
  loadMaxAttrCountFrequency,
  loadMaxTraitCounts,
  loadUnscoredMintBatch,
  scheduleRarityBackgroundWork,
  updateCollectionRarityMeta,
  updateMintScores,
  upsertScannedMintPage,
  type CollectionRarityMeta,
  type ScannedMintInput,
} from "@/lib/server/rarity-db";

const DAS_PAGE_LIMIT = 1000;
const SYNC_SCAN_PAGES = 3;
const SCORE_BATCH_SIZE = 500;
const SYNC_SCORE_BATCHES = 2;

type DasGroupResponse = {
  items?: DasCollectibleAsset[];
};

const inflightBuilds = new Map<string, Promise<void>>();

async function fetchAssetsByGroupPage(
  collectionMint: string,
  page: number,
): Promise<DasCollectibleAsset[]> {
  const result = await postDasRpc<DasGroupResponse>({
    method: "getAssetsByGroup",
    id: `rarity-group-${page}`,
    params: {
      groupKey: "collection",
      groupValue: collectionMint,
      page,
      limit: DAS_PAGE_LIMIT,
    },
  });
  const items = result?.items ?? [];
  return Array.isArray(items) ? items : [];
}

function assetToScannedMint(asset: DasCollectibleAsset): ScannedMintInput | null {
  const mint = asset.id?.trim();
  if (!mint) return null;
  const attributes = mapAttributesFromDasContent(asset.content);
  return {
    mint,
    attrCount: attributes.length,
    traitsJson: JSON.stringify(
      attributes.map((a) => [a.traitType, a.value] as const),
    ),
    attributes,
  };
}

function parseTraitsJson(raw: string): CollectibleAttribute[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (!Array.isArray(entry) || entry.length < 2) return null;
        const traitType = String(entry[0]).trim();
        const value = String(entry[1]).trim();
        if (!traitType || !value) return null;
        return { traitType, value };
      })
      .filter((a): a is CollectibleAttribute => a != null);
  } catch {
    return [];
  }
}

async function scanNextPages(
  db: ReturnType<typeof getRarityDb>,
  collectionMint: string,
  meta: CollectionRarityMeta,
  maxPages: number,
): Promise<CollectionRarityMeta> {
  let current = meta;
  let pagesDone = 0;
  let nextPage = current.scanPage + 1;

  while (pagesDone < maxPages) {
    const items = await fetchAssetsByGroupPage(collectionMint, nextPage);
    const mints = items
      .map(assetToScannedMint)
      .filter((m): m is ScannedMintInput => m != null);

    await upsertScannedMintPage(db, collectionMint, nextPage, mints);
    pagesDone += 1;
    nextPage += 1;

    current = (await getCollectionRarityMeta(db, collectionMint)) ?? current;

    if (items.length === 0 || items.length < DAS_PAGE_LIMIT) {
      await updateCollectionRarityMeta(db, collectionMint, {
        status: "scoring",
        scanComplete: true,
        errorMessage: null,
      });
      current = (await getCollectionRarityMeta(db, collectionMint)) ?? current;
      break;
    }
  }

  return current;
}

async function scoreNextBatches(
  db: ReturnType<typeof getRarityDb>,
  collectionMint: string,
  maxBatches: number,
): Promise<void> {
  const maxByType = await loadMaxTraitCounts(db, collectionMint);
  const maxAttrCountFrequency = await loadMaxAttrCountFrequency(db, collectionMint);
  const traitCounts = await loadAllTraitCounts(db, collectionMint);
  const attrCountFreqs = await loadAllAttrCountFrequencies(db, collectionMint);

  for (let batch = 0; batch < maxBatches; batch += 1) {
    const rows = await loadUnscoredMintBatch(db, collectionMint, SCORE_BATCH_SIZE);
    if (rows.length === 0) return;

    const scores = rows.map((row) => {
      const attributes = parseTraitsJson(row.traitsJson);
      const score = scoreMintFromCounts({
        attributes,
        attrCount: row.attrCount,
        getTraitCount: (traitType, traitValue) =>
          traitCounts.get(traitKey(traitType, traitValue)) ?? 0,
        maxCountByTraitType: maxByType,
        attrCountFrequency: attrCountFreqs.get(row.attrCount) ?? 0,
        maxAttrCountFrequency,
      });
      return { mint: row.mint, score };
    });

    await updateMintScores(db, collectionMint, scores);
  }
}

async function tryFinalizeRank(
  db: ReturnType<typeof getRarityDb>,
  collectionMint: string,
): Promise<void> {
  const unscored = await countUnscoredMints(db, collectionMint);
  if (unscored > 0) return;

  await assignCollectionRanks(db, collectionMint);
  await updateCollectionRarityMeta(db, collectionMint, {
    status: "ready",
    builtAt: Math.floor(Date.now() / 1000),
    errorMessage: null,
  });
}

export async function advanceCollectionRarityIndex(
  collectionMint: string,
  opts?: { scanPages?: number; scoreBatches?: number },
): Promise<CollectionRarityMeta> {
  const db = getRarityDb();
  await ensureRaritySchema(db);

  let meta = await ensureCollectionRarityMeta(db, collectionMint);
  if (meta.status === "ready") return meta;

  if (meta.status === "failed") {
    await updateCollectionRarityMeta(db, collectionMint, {
      status: meta.scanComplete ? "scoring" : "scanning",
      errorMessage: null,
    });
    meta = (await getCollectionRarityMeta(db, collectionMint)) ?? meta;
  }

  const scanPages = opts?.scanPages ?? SYNC_SCAN_PAGES;
  const scoreBatches = opts?.scoreBatches ?? SYNC_SCORE_BATCHES;

  try {
    if (meta.status === "scanning") {
      meta = await scanNextPages(db, collectionMint, meta, scanPages);
    }

    meta = (await getCollectionRarityMeta(db, collectionMint)) ?? meta;
    if (meta.status === "scoring") {
      await scoreNextBatches(db, collectionMint, scoreBatches);
      await tryFinalizeRank(db, collectionMint);
      meta = (await getCollectionRarityMeta(db, collectionMint)) ?? meta;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Index build failed";
    await updateCollectionRarityMeta(db, collectionMint, {
      status: "failed",
      errorMessage: message,
    });
    meta = (await getCollectionRarityMeta(db, collectionMint)) ?? meta;
  }

  return meta;
}

async function continueIndexUntilReady(collectionMint: string): Promise<void> {
  for (let i = 0; i < 500; i += 1) {
    const meta = await advanceCollectionRarityIndex(collectionMint, {
      scanPages: 5,
      scoreBatches: 4,
    });
    if (meta.status === "ready" || meta.status === "failed") return;
  }
}

export function kickOffCollectionRarityBuild(collectionMint: string): void {
  if (inflightBuilds.has(collectionMint)) return;

  const work = (async () => {
    try {
      await continueIndexUntilReady(collectionMint);
    } finally {
      inflightBuilds.delete(collectionMint);
    }
  })();

  inflightBuilds.set(collectionMint, work);
  scheduleRarityBackgroundWork(work);
}

export async function ensureCollectionIndexStarted(
  collectionMint: string,
): Promise<CollectionRarityMeta> {
  const db = getRarityDb();
  await ensureRaritySchema(db);
  const meta = await ensureCollectionRarityMeta(db, collectionMint);
  if (meta.status === "ready") return meta;

  const updated = await advanceCollectionRarityIndex(collectionMint);
  if (updated.status !== "ready") {
    kickOffCollectionRarityBuild(collectionMint);
  }
  return updated;
}

export async function fetchCollectibleRarity(args: {
  mint: string;
  collectionMint: string;
  attributes: CollectibleAttribute[];
}): Promise<CollectibleRarity | null> {
  const db = getRarityDb();
  await ensureRaritySchema(db);

  const meta = await getCollectionRarityMeta(db, args.collectionMint);
  if (!meta || meta.status !== "ready") return null;

  const mintRow = await getMintRarityRow(db, args.collectionMint, args.mint);
  if (!mintRow?.rank || mintRow.score == null) return null;

  return buildCollectibleRarity({
    db,
    collectionMint: args.collectionMint,
    attributes: args.attributes,
    meta,
    mintRow,
  });
}

async function buildCollectibleRarity(args: {
  db: ReturnType<typeof getRarityDb>;
  collectionMint: string;
  attributes: CollectibleAttribute[];
  meta: CollectionRarityMeta;
  mintRow: NonNullable<Awaited<ReturnType<typeof getMintRarityRow>>>;
}): Promise<CollectibleRarity> {
  const { meta, mintRow } = args;
  const total = meta.totalSupply;
  const allTraitCounts = await loadAllTraitCounts(args.db, args.collectionMint);

  const attributes = enrichAttributes({
    attributes: args.attributes,
    totalSupply: total,
    getTraitCount: (traitType, traitValue) =>
      allTraitCounts.get(traitKey(traitType, traitValue)) ?? 0,
  });

  return {
    algorithm: "trait_normalized",
    rank: mintRow.rank!,
    total,
    rankSharedWith: mintRow.rankSharedWith,
    score: mintRow.score!,
    tier: tierFromRank(mintRow.rank!, total),
    attributes,
  };
}

export async function getCollectibleRarityForMint(args: {
  mint: string;
  collectionMint: string | null;
  attributes: CollectibleAttribute[];
}): Promise<CollectibleRarity | null> {
  if (!args.collectionMint) return null;

  await ensureCollectionIndexStarted(args.collectionMint);

  return fetchCollectibleRarity({
    mint: args.mint,
    collectionMint: args.collectionMint,
    attributes: args.attributes,
  });
}

import { scheduleBackgroundWork } from "@/shared/request-context";
import type { CollectibleAttribute, CollectibleRarity } from "@/tokens/collectible";
import { mapAttributesFromDasContent } from "@/tokens/collectible";
import {
  enrichAttributes,
  scoreMintHowRare,
  traitKey,
} from "@/tokens/rarity/howrare";
import { tierFromRank } from "@/tokens/rarity/rarity-tier";
import { dasGetAssetsByGroup, postDasRpcBatch } from "@/tokens/das-rpc";
import type { DasAsset, DasAssetList } from "@/tokens/das-schema";
import {
  assignCollectionRanks,
  countUnscoredMints,
  ensureCollectionRarityMeta,
  ensureRaritySchema,
  getMintRarityRow,
  getRarityDb,
  loadAllTraitCounts,
  loadTraitCountsForAttributes,
  loadUnscoredMintBatch,
  patchCollectionRarityMeta,
  updateCollectionRarityMeta,
  updateMintScores,
  upsertScannedMintPage,
  type CollectionRarityMeta,
  type ScannedMintInput,
} from "@/tokens/rarity-db";

const DAS_PAGE_LIMIT = 1000;
const SYNC_SCAN_PAGES = 3;
const SCORE_BATCH_SIZE = 500;
const SYNC_SCORE_BATCHES = 2;
const BG_SCAN_PAGES = 5;
const BG_SCORE_BATCHES = 4;
const MAX_INDEX_LOOPS = 500;

const inflightBuilds = new Map<string, Promise<void>>();

/** Fetch several collection pages in one HTTP round-trip. */
async function fetchAssetsByGroupPages(
  collectionMint: string,
  startPage: number,
  pageCount: number,
): Promise<DasAsset[][]> {
  if (pageCount <= 1) {
    return [
      await dasGetAssetsByGroup({
        groupKey: "collection",
        groupValue: collectionMint,
        page: startPage,
        limit: DAS_PAGE_LIMIT,
      }),
    ];
  }

  const calls = Array.from({ length: pageCount }, (_, i) => ({
    method: "getAssetsByGroup",
    id: `rarity-group-${startPage + i}`,
    params: {
      groupKey: "collection",
      groupValue: collectionMint,
      page: startPage + i,
      limit: DAS_PAGE_LIMIT,
    },
  }));

  const results = await postDasRpcBatch<DasAssetList[]>(calls);
  return results.map((result) =>
    Array.isArray(result?.items) ? result.items : [],
  );
}

function assetToScannedMint(asset: DasAsset): ScannedMintInput | null {
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
  let nextPage = current.scanPage + 1;
  const pages = await fetchAssetsByGroupPages(
    collectionMint,
    nextPage,
    maxPages,
  );

  for (const items of pages) {
    const mints = items
      .map(assetToScannedMint)
      .filter((m): m is ScannedMintInput => m != null);

    const progress = await upsertScannedMintPage(
      db,
      collectionMint,
      nextPage,
      mints,
      current,
    );
    current = patchCollectionRarityMeta(current, progress);
    nextPage += 1;

    if (items.length === 0 || items.length < DAS_PAGE_LIMIT) {
      await updateCollectionRarityMeta(db, collectionMint, {
        status: "scoring",
        scanComplete: true,
        errorMessage: null,
      });
      current = patchCollectionRarityMeta(current, {
        status: "scoring",
        scanComplete: true,
        errorMessage: null,
      });
      break;
    }
  }

  return current;
}

async function scoreNextBatches(
  db: ReturnType<typeof getRarityDb>,
  collectionMint: string,
  meta: CollectionRarityMeta,
  maxBatches: number,
): Promise<void> {
  const totalSupply = meta.totalSupply;
  if (totalSupply <= 0) return;

  const traitCounts = await loadAllTraitCounts(db, collectionMint);

  for (let batch = 0; batch < maxBatches; batch += 1) {
    const rows = await loadUnscoredMintBatch(db, collectionMint, SCORE_BATCH_SIZE);
    if (rows.length === 0) return;

    const scores = rows.map((row) => {
      const attributes = parseTraitsJson(row.traitsJson);
      const score = scoreMintHowRare({
        attributes,
        totalSupply,
        getTraitCount: (traitType, traitValue) =>
          traitCounts.get(traitKey(traitType, traitValue)) ?? 0,
      });
      return { mint: row.mint, score };
    });

    await updateMintScores(db, collectionMint, scores);
  }
}

async function tryFinalizeRank(
  db: ReturnType<typeof getRarityDb>,
  collectionMint: string,
  meta: CollectionRarityMeta,
): Promise<CollectionRarityMeta> {
  const unscored = await countUnscoredMints(db, collectionMint);
  if (unscored > 0) return meta;

  await assignCollectionRanks(db, collectionMint);
  const builtAt = Math.floor(Date.now() / 1000);
  await updateCollectionRarityMeta(db, collectionMint, {
    status: "ready",
    builtAt,
    errorMessage: null,
  });
  return patchCollectionRarityMeta(meta, {
    status: "ready",
    builtAt,
    errorMessage: null,
  });
}

async function advanceCollectionRarityIndex(
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
    meta = patchCollectionRarityMeta(meta, {
      status: meta.scanComplete ? "scoring" : "scanning",
      errorMessage: null,
    });
  }

  const scanPages = opts?.scanPages ?? SYNC_SCAN_PAGES;
  const scoreBatches = opts?.scoreBatches ?? SYNC_SCORE_BATCHES;

  try {
    if (meta.status === "scanning") {
      meta = await scanNextPages(db, collectionMint, meta, scanPages);
    }

    if (meta.status === "scoring") {
      await scoreNextBatches(db, collectionMint, meta, scoreBatches);
      meta = await tryFinalizeRank(db, collectionMint, meta);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Index build failed";
    await updateCollectionRarityMeta(db, collectionMint, {
      status: "failed",
      errorMessage: message,
    });
    meta = patchCollectionRarityMeta(meta, {
      status: "failed",
      errorMessage: message,
    });
  }

  return meta;
}

async function continueIndexUntilReady(collectionMint: string): Promise<void> {
  for (let i = 0; i < MAX_INDEX_LOOPS; i += 1) {
    const meta = await advanceCollectionRarityIndex(collectionMint, {
      scanPages: BG_SCAN_PAGES,
      scoreBatches: BG_SCORE_BATCHES,
    });
    if (meta.status === "ready" || meta.status === "failed") return;
  }
}

function kickOffCollectionRarityBuild(collectionMint: string): void {
  if (inflightBuilds.has(collectionMint)) return;

  const work = (async () => {
    try {
      await continueIndexUntilReady(collectionMint);
    } finally {
      inflightBuilds.delete(collectionMint);
    }
  })();

  inflightBuilds.set(collectionMint, work);
  scheduleBackgroundWork(work);
}

async function ensureCollectionIndexStarted(
  collectionMint: string,
): Promise<CollectionRarityMeta> {
  const db = getRarityDb();
  await ensureRaritySchema(db);
  const meta = await ensureCollectionRarityMeta(db, collectionMint);
  if (meta.status !== "ready") {
    kickOffCollectionRarityBuild(collectionMint);
  }
  return meta;
}

async function buildCollectibleRarity(args: {
  db: ReturnType<typeof getRarityDb>;
  attributes: CollectibleAttribute[];
  meta: CollectionRarityMeta;
  mintRow: {
    rank: number;
    score: number;
    rankSharedWith: number;
  };
}): Promise<CollectibleRarity> {
  const { meta, mintRow } = args;
  const total = meta.totalSupply;
  const traitCounts = await loadTraitCountsForAttributes(
    args.db,
    meta.collectionMint,
    args.attributes,
  );

  return {
    algorithm: "howrare",
    rank: mintRow.rank,
    total,
    rankSharedWith: mintRow.rankSharedWith,
    score: mintRow.score,
    tier: tierFromRank(mintRow.rank, total),
    attributes: enrichAttributes({
      attributes: args.attributes,
      totalSupply: total,
      getTraitCount: (traitType, traitValue) =>
        traitCounts.get(traitKey(traitType, traitValue)) ?? 0,
    }),
  };
}

/** Read rarity if the D1 index is ready; otherwise start a background build. */
export async function getCollectibleRarityForMint(args: {
  mint: string;
  collectionMint: string | null;
  attributes: CollectibleAttribute[];
}): Promise<CollectibleRarity | null> {
  if (!args.collectionMint) return null;

  const meta = await ensureCollectionIndexStarted(args.collectionMint);
  if (meta.status !== "ready") return null;

  const db = getRarityDb();
  const mintRow = await getMintRarityRow(db, args.collectionMint, args.mint);
  if (mintRow?.rank == null || mintRow.score == null) return null;

  return buildCollectibleRarity({
    db,
    attributes: args.attributes,
    meta,
    mintRow: {
      rank: mintRow.rank,
      score: mintRow.score,
      rankSharedWith: mintRow.rankSharedWith,
    },
  });
}

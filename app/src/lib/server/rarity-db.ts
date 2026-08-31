import { getCloudflareContext } from "@opennextjs/cloudflare";
import "server-only";

import { getPaymentsDb, type D1Database } from "@/lib/server/payments-db";

/** Bump when score formula changes — forces per-collection D1 rebuild. */
export const RARITY_ALGORITHM_VERSION = 4;

export type CollectionRarityStatus =
  | "scanning"
  | "scoring"
  | "ready"
  | "failed";

export type CollectionRarityMeta = {
  collectionMint: string;
  status: CollectionRarityStatus;
  algorithmVersion: number;
  totalSupply: number;
  scanPage: number;
  scanComplete: boolean;
  scoreCursor: string | null;
  builtAt: number | null;
  errorMessage: string | null;
};

export type MintRarityRow = {
  mint: string;
  attrCount: number;
  traitsJson: string;
  score: number | null;
  rank: number | null;
  rankSharedWith: number;
};

type MetaRow = {
  collection_mint: string;
  status: string;
  algorithm_version: number;
  total_supply: number;
  scan_page: number;
  scan_complete: number;
  score_cursor: string | null;
  built_at: number | null;
  error_message: string | null;
};

type MintRow = {
  mint: string;
  attr_count: number;
  traits_json: string;
  score: number | null;
  rank: number | null;
  rank_shared_with: number;
};

type CountRow = {
  trait_type: string;
  trait_value: string;
  count: number;
};

const D1_BATCH_CHUNK = 100;

let schemaReady: Promise<void> | null = null;

export function getRarityDb(): D1Database {
  return getPaymentsDb();
}

/**
 * Idempotent CREATE IF NOT EXISTS — safe in every environment.
 * Production still ships migration 0007; this covers forgotten applies and local Miniflare.
 */
export function ensureRaritySchema(db: D1Database): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.batch([
        db.prepare(`
          CREATE TABLE IF NOT EXISTS collection_rarity_meta (
            collection_mint   TEXT PRIMARY KEY,
            status            TEXT NOT NULL,
            algorithm_version INTEGER NOT NULL DEFAULT 1,
            total_supply      INTEGER NOT NULL DEFAULT 0,
            scan_page         INTEGER NOT NULL DEFAULT 0,
            scan_complete     INTEGER NOT NULL DEFAULT 0,
            score_cursor      TEXT,
            built_at          INTEGER,
            error_message     TEXT
          )
        `),
        db.prepare(`
          CREATE TABLE IF NOT EXISTS collection_trait_counts (
            collection_mint TEXT NOT NULL,
            trait_type      TEXT NOT NULL,
            trait_value     TEXT NOT NULL,
            count           INTEGER NOT NULL,
            PRIMARY KEY (collection_mint, trait_type, trait_value)
          )
        `),
        db.prepare(`
          CREATE TABLE IF NOT EXISTS collection_attr_counts (
            collection_mint TEXT NOT NULL,
            attr_count      INTEGER NOT NULL,
            count           INTEGER NOT NULL,
            PRIMARY KEY (collection_mint, attr_count)
          )
        `),
        db.prepare(`
          CREATE TABLE IF NOT EXISTS collection_mint_rarity (
            collection_mint    TEXT NOT NULL,
            mint               TEXT NOT NULL,
            attr_count         INTEGER NOT NULL,
            traits_json        TEXT NOT NULL,
            score              REAL,
            rank               INTEGER,
            rank_shared_with   INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (collection_mint, mint)
          )
        `),
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_mint_rarity_score
            ON collection_mint_rarity (collection_mint, score DESC)
        `),
      ]);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

function rowToMeta(row: MetaRow): CollectionRarityMeta {
  return {
    collectionMint: row.collection_mint,
    status: row.status as CollectionRarityStatus,
    algorithmVersion: row.algorithm_version,
    totalSupply: row.total_supply,
    scanPage: row.scan_page,
    scanComplete: row.scan_complete === 1,
    scoreCursor: row.score_cursor,
    builtAt: row.built_at,
    errorMessage: row.error_message,
  };
}

export async function getCollectionRarityMeta(
  db: D1Database,
  collectionMint: string,
): Promise<CollectionRarityMeta | null> {
  const row = await db
    .prepare(
      `SELECT collection_mint, status, algorithm_version, total_supply,
              scan_page, scan_complete, score_cursor, built_at, error_message
       FROM collection_rarity_meta WHERE collection_mint = ?`,
    )
    .bind(collectionMint)
    .first<MetaRow>();
  return row ? rowToMeta(row) : null;
}

export async function ensureCollectionRarityMeta(
  db: D1Database,
  collectionMint: string,
): Promise<CollectionRarityMeta> {
  const existing = await getCollectionRarityMeta(db, collectionMint);
  if (existing) {
    if (existing.algorithmVersion !== RARITY_ALGORITHM_VERSION) {
      await clearCollectionRarity(db, collectionMint);
    } else {
      return existing;
    }
  }

  await db
    .prepare(
      `INSERT INTO collection_rarity_meta
         (collection_mint, status, algorithm_version, total_supply, scan_page)
       VALUES (?, 'scanning', ?, 0, 0)`,
    )
    .bind(collectionMint, RARITY_ALGORITHM_VERSION)
    .run();

  const created = await getCollectionRarityMeta(db, collectionMint);
  if (!created) {
    throw new Error("Failed to initialize collection rarity meta");
  }
  return created;
}

export async function clearCollectionRarity(
  db: D1Database,
  collectionMint: string,
): Promise<void> {
  await db.batch([
    db.prepare(
      `DELETE FROM collection_trait_counts WHERE collection_mint = ?`,
    ).bind(collectionMint),
    db.prepare(
      `DELETE FROM collection_attr_counts WHERE collection_mint = ?`,
    ).bind(collectionMint),
    db.prepare(
      `DELETE FROM collection_mint_rarity WHERE collection_mint = ?`,
    ).bind(collectionMint),
    db.prepare(
      `DELETE FROM collection_rarity_meta WHERE collection_mint = ?`,
    ).bind(collectionMint),
  ]);
}

export async function updateCollectionRarityMeta(
  db: D1Database,
  collectionMint: string,
  patch: Partial<{
    status: CollectionRarityStatus;
    totalSupply: number;
    scanPage: number;
    scanComplete: boolean;
    scoreCursor: string | null;
    builtAt: number | null;
    errorMessage: string | null;
  }>,
): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (patch.status != null) {
    sets.push("status = ?");
    values.push(patch.status);
  }
  if (patch.totalSupply != null) {
    sets.push("total_supply = ?");
    values.push(patch.totalSupply);
  }
  if (patch.scanPage != null) {
    sets.push("scan_page = ?");
    values.push(patch.scanPage);
  }
  if (patch.scanComplete != null) {
    sets.push("scan_complete = ?");
    values.push(patch.scanComplete ? 1 : 0);
  }
  if (patch.scoreCursor !== undefined) {
    sets.push("score_cursor = ?");
    values.push(patch.scoreCursor);
  }
  if (patch.builtAt !== undefined) {
    sets.push("built_at = ?");
    values.push(patch.builtAt);
  }
  if (patch.errorMessage !== undefined) {
    sets.push("error_message = ?");
    values.push(patch.errorMessage);
  }

  if (sets.length === 0) return;

  values.push(collectionMint);
  await db
    .prepare(
      `UPDATE collection_rarity_meta SET ${sets.join(", ")} WHERE collection_mint = ?`,
    )
    .bind(...values)
    .run();
}

export type ScannedMintInput = {
  mint: string;
  attrCount: number;
  traitsJson: string;
  attributes: Array<{ traitType: string; value: string }>;
};

export async function upsertScannedMintPage(
  db: D1Database,
  collectionMint: string,
  page: number,
  mints: ScannedMintInput[],
): Promise<void> {
  if (mints.length === 0) {
    await updateCollectionRarityMeta(db, collectionMint, { scanPage: page });
    return;
  }

  // Only aggregate traits for mints not already indexed (avoids double-count on retry).
  const existing = new Set<string>();
  const LOOKUP_CHUNK = 100;
  for (let i = 0; i < mints.length; i += LOOKUP_CHUNK) {
    const chunk = mints.slice(i, i + LOOKUP_CHUNK);
    const placeholders = chunk.map(() => "?").join(", ");
    const { results } = await db
      .prepare(
        `SELECT mint FROM collection_mint_rarity
         WHERE collection_mint = ? AND mint IN (${placeholders})`,
      )
      .bind(collectionMint, ...chunk.map((m) => m.mint))
      .all<{ mint: string }>();
    for (const row of results) existing.add(row.mint);
  }

  const newcomers = mints.filter((m) => !existing.has(m.mint));

  const mintStmt = db.prepare(
    `INSERT OR IGNORE INTO collection_mint_rarity
       (collection_mint, mint, attr_count, traits_json)
     VALUES (?, ?, ?, ?)`,
  );
  const traitStmt = db.prepare(
    `INSERT INTO collection_trait_counts
       (collection_mint, trait_type, trait_value, count)
     VALUES (?, ?, ?, 1)
     ON CONFLICT(collection_mint, trait_type, trait_value)
     DO UPDATE SET count = count + 1`,
  );
  const attrCountStmt = db.prepare(
    `INSERT INTO collection_attr_counts
       (collection_mint, attr_count, count)
     VALUES (?, ?, 1)
     ON CONFLICT(collection_mint, attr_count)
     DO UPDATE SET count = count + 1`,
  );

  const statements = [];
  for (const mint of mints) {
    statements.push(
      mintStmt.bind(collectionMint, mint.mint, mint.attrCount, mint.traitsJson),
    );
  }
  for (const mint of newcomers) {
    for (const attr of mint.attributes) {
      statements.push(
        traitStmt.bind(collectionMint, attr.traitType, attr.value),
      );
    }
    statements.push(attrCountStmt.bind(collectionMint, mint.attrCount));
  }

  for (let i = 0; i < statements.length; i += D1_BATCH_CHUNK) {
    await db.batch(statements.slice(i, i + D1_BATCH_CHUNK));
  }

  const countRow = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM collection_mint_rarity
       WHERE collection_mint = ?`,
    )
    .bind(collectionMint)
    .first<{ count: number }>();

  // Monotonic scan cursor + authoritative supply (never += page size).
  await db
    .prepare(
      `UPDATE collection_rarity_meta
       SET total_supply = ?,
           scan_page = CASE WHEN scan_page < ? THEN ? ELSE scan_page END
       WHERE collection_mint = ?`,
    )
    .bind(countRow?.count ?? 0, page, page, collectionMint)
    .run();
}

export async function countUnscoredMints(
  db: D1Database,
  collectionMint: string,
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM collection_mint_rarity
       WHERE collection_mint = ? AND score IS NULL`,
    )
    .bind(collectionMint)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function loadUnscoredMintBatch(
  db: D1Database,
  collectionMint: string,
  limit: number,
): Promise<MintRarityRow[]> {
  const { results } = await db
    .prepare(
      `SELECT mint, attr_count, traits_json, score, rank, rank_shared_with
       FROM collection_mint_rarity
       WHERE collection_mint = ? AND score IS NULL
       ORDER BY mint
       LIMIT ?`,
    )
    .bind(collectionMint, limit)
    .all<MintRow>();

  return results.map((row) => ({
    mint: row.mint,
    attrCount: row.attr_count,
    traitsJson: row.traits_json,
    score: row.score,
    rank: row.rank,
    rankSharedWith: row.rank_shared_with,
  }));
}

export async function updateMintScores(
  db: D1Database,
  collectionMint: string,
  scores: Array<{ mint: string; score: number }>,
): Promise<void> {
  if (scores.length === 0) return;
  const stmt = db.prepare(
    `UPDATE collection_mint_rarity SET score = ?
     WHERE collection_mint = ? AND mint = ?`,
  );
  await db.batch(
    scores.map((row) => stmt.bind(row.score, collectionMint, row.mint)),
  );
}

export async function assignCollectionRanks(
  db: D1Database,
  collectionMint: string,
): Promise<void> {
  await db
    .prepare(
      `WITH ranked AS (
         SELECT mint,
                RANK() OVER (ORDER BY score DESC) AS r,
                COUNT(*) OVER (PARTITION BY score) - 1 AS shared
         FROM collection_mint_rarity
         WHERE collection_mint = ?1 AND score IS NOT NULL
       )
       UPDATE collection_mint_rarity
       SET rank = (SELECT r FROM ranked WHERE ranked.mint = collection_mint_rarity.mint),
           rank_shared_with = (SELECT shared FROM ranked WHERE ranked.mint = collection_mint_rarity.mint)
       WHERE collection_mint = ?1`,
    )
    .bind(collectionMint)
    .run();
}

export async function getMintRarityRow(
  db: D1Database,
  collectionMint: string,
  mint: string,
): Promise<MintRarityRow | null> {
  const row = await db
    .prepare(
      `SELECT mint, attr_count, traits_json, score, rank, rank_shared_with
       FROM collection_mint_rarity
       WHERE collection_mint = ? AND mint = ?`,
    )
    .bind(collectionMint, mint)
    .first<MintRow>();

  if (!row) return null;
  return {
    mint: row.mint,
    attrCount: row.attr_count,
    traitsJson: row.traits_json,
    score: row.score,
    rank: row.rank,
    rankSharedWith: row.rank_shared_with,
  };
}

export async function loadAllTraitCounts(
  db: D1Database,
  collectionMint: string,
): Promise<Map<string, number>> {
  const { results } = await db
    .prepare(
      `SELECT trait_type, trait_value, count
       FROM collection_trait_counts
       WHERE collection_mint = ?`,
    )
    .bind(collectionMint)
    .all<CountRow>();

  return new Map(
    results.map((row) => [
      `${row.trait_type}|${row.trait_value}`,
      row.count,
    ]),
  );
}

/** Counts for a mint's traits only — avoids loading the full collection map. */
export async function loadTraitCountsForAttributes(
  db: D1Database,
  collectionMint: string,
  attributes: Array<{ traitType: string; value: string }>,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (attributes.length === 0) return out;

  const unique = new Map<string, { traitType: string; value: string }>();
  for (const attr of attributes) {
    unique.set(`${attr.traitType}|${attr.value}`, attr);
  }
  const list = [...unique.values()];

  // D1 has no great tuple IN binding — one SELECT with OR chain, chunked.
  const CHUNK = 40;
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    const clauses = chunk.map(() => `(trait_type = ? AND trait_value = ?)`).join(" OR ");
    const binds: unknown[] = [collectionMint];
    for (const attr of chunk) {
      binds.push(attr.traitType, attr.value);
    }
    const { results } = await db
      .prepare(
        `SELECT trait_type, trait_value, count
         FROM collection_trait_counts
         WHERE collection_mint = ? AND (${clauses})`,
      )
      .bind(...binds)
      .all<CountRow>();
    for (const row of results) {
      out.set(`${row.trait_type}|${row.trait_value}`, row.count);
    }
  }
  return out;
}

/** Best-effort background continuation after the HTTP response. */
export function scheduleRarityBackgroundWork(work: Promise<void>): void {
  try {
    const ctx = getCloudflareContext() as {
      ctx?: { waitUntil?: (promise: Promise<unknown>) => void };
    };
    if (typeof ctx.ctx?.waitUntil === "function") {
      ctx.ctx.waitUntil(work);
      return;
    }
  } catch {
    // Local dev without Cloudflare context — fire-and-forget.
  }
  void work;
}

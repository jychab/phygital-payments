-- Trait-normalized collection rarity index (one build per collection, persisted in D1).

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
);

CREATE TABLE IF NOT EXISTS collection_trait_counts (
  collection_mint TEXT NOT NULL,
  trait_type      TEXT NOT NULL,
  trait_value     TEXT NOT NULL,
  count           INTEGER NOT NULL,
  PRIMARY KEY (collection_mint, trait_type, trait_value)
);

CREATE TABLE IF NOT EXISTS collection_attr_counts (
  collection_mint TEXT NOT NULL,
  attr_count      INTEGER NOT NULL,
  count           INTEGER NOT NULL,
  PRIMARY KEY (collection_mint, attr_count)
);

CREATE TABLE IF NOT EXISTS collection_mint_rarity (
  collection_mint    TEXT NOT NULL,
  mint               TEXT NOT NULL,
  attr_count         INTEGER NOT NULL,
  traits_json        TEXT NOT NULL,
  score              REAL,
  rank               INTEGER,
  rank_shared_with   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_mint, mint)
);

CREATE INDEX IF NOT EXISTS idx_mint_rarity_score
  ON collection_mint_rarity (collection_mint, score DESC);

-- Wallet API keys (raw key shared out of band; only hash stored) and
-- short-lived single-use presence grants (wallet only; spend caps are on-chain).

CREATE TABLE IF NOT EXISTS wallet_api_keys (
  wallet      TEXT    NOT NULL PRIMARY KEY,
  api_key_hash TEXT   NOT NULL UNIQUE,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  revoked_at  INTEGER
);

CREATE TABLE IF NOT EXISTS preauth_grants (
  id          TEXT    NOT NULL PRIMARY KEY,
  wallet      TEXT    NOT NULL,
  expires_at  INTEGER NOT NULL,  -- unix seconds
  consumed_at INTEGER,
  claimed_at  INTEGER,            -- set at authorize (single-use lock)
  claimed_by  TEXT,               -- transfer job id holding the claim
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_preauth_wallet_active
  ON preauth_grants (wallet, expires_at DESC)
  WHERE consumed_at IS NULL;

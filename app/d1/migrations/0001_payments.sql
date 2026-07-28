-- Payment history indexed from Helius webhooks.
-- One row per token transfer within a transaction (a batched sponsored tx can
-- contain up to 8), keyed by (signature, transfer_index) for idempotent upserts.
CREATE TABLE IF NOT EXISTS payments (
  signature               TEXT    NOT NULL,
  transfer_index          INTEGER NOT NULL,
  slot                    INTEGER,
  block_time              INTEGER,          -- unix seconds
  mint                    TEXT    NOT NULL,
  amount                  TEXT    NOT NULL,  -- raw u64 as decimal string
  sender_owner            TEXT,
  recipient_owner         TEXT,
  sender_token_account    TEXT,
  recipient_token_account TEXT,
  indexed_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (signature, transfer_index)
);

CREATE INDEX IF NOT EXISTS idx_payments_recipient
  ON payments (recipient_owner, block_time DESC);

CREATE INDEX IF NOT EXISTS idx_payments_sender
  ON payments (sender_owner, block_time DESC);

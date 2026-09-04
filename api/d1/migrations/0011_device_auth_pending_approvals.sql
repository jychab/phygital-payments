-- Platform device authority (one per token) + soft-deny open approvals inbox.

CREATE TABLE IF NOT EXISTS device_authorities (
  phygital_token TEXT PRIMARY KEY NOT NULL,
  credential_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pending_approvals (
  id TEXT PRIMARY KEY NOT NULL,
  phygital_token TEXT NOT NULL,
  intent_hash TEXT NOT NULL,
  code TEXT NOT NULL,
  error TEXT NOT NULL,
  details_json TEXT,
  expires_at INTEGER NOT NULL,
  resolved_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS pending_approvals_token_intent_open
  ON pending_approvals (phygital_token, intent_hash)
  WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS pending_approvals_token_open
  ON pending_approvals (phygital_token, expires_at)
  WHERE resolved_at IS NULL;

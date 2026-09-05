-- Standing policies (Privy-shaped JSON) + one-time soft-deny grants per phygital token.

CREATE TABLE IF NOT EXISTS token_policies (
  phygital_token TEXT PRIMARY KEY NOT NULL,
  policy_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS one_time_grants (
  id TEXT PRIMARY KEY NOT NULL,
  phygital_token TEXT NOT NULL,
  intent_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS one_time_grants_token_intent_unconsumed
  ON one_time_grants (phygital_token, intent_hash)
  WHERE consumed_at IS NULL;

-- Per-token prepaid fee balance (off-chain paymaster ledger).

CREATE TABLE IF NOT EXISTS token_fee_balances (
  phygital_token TEXT PRIMARY KEY NOT NULL,
  balance_lamports INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fee_balance_events (
  signature TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL,
  phygital_token TEXT NOT NULL,
  lamports INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS fee_balance_events_token_idx
  ON fee_balance_events (phygital_token, created_at);

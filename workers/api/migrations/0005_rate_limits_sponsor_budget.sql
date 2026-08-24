-- Rate-limit buckets and per-vault sponsor budgets.

CREATE TABLE rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  window_start_ms INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start_ms)
);

CREATE INDEX idx_rate_limit_buckets_window ON rate_limit_buckets (window_start_ms);

CREATE TABLE sponsor_budget (
  vault_pda TEXT NOT NULL,
  day_key TEXT NOT NULL,
  tx_count INTEGER NOT NULL DEFAULT 0,
  updated_at_ms INTEGER NOT NULL,
  PRIMARY KEY (vault_pda, day_key)
);

CREATE INDEX idx_challenges_sweep ON challenges (kind, expires_at_ms, consumed);

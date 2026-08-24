-- Idempotency keys for sponsor/grant POST and D1-backed NFC tap counters.

CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY NOT NULL,
  route TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  response_json TEXT NOT NULL,
  expires_at_ms INTEGER NOT NULL
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys (expires_at_ms);

CREATE TABLE nfc_tap_counters (
  public_key TEXT PRIMARY KEY NOT NULL,
  counter INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

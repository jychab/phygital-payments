-- Isolated signer D1: encrypted session keys, NFC challenges, fee-payer key.

CREATE TABLE signer_keys (
  phygital_passkey TEXT PRIMARY KEY NOT NULL,
  vault_pda TEXT NOT NULL,
  wallet_pda TEXT NOT NULL,
  session_public_key TEXT NOT NULL,
  secret_ciphertext TEXT NOT NULL,
  expires_at_slot TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL
);

CREATE INDEX idx_signer_keys_vault ON signer_keys (vault_pda);
CREATE INDEX idx_signer_keys_session_public_key ON signer_keys (session_public_key);

CREATE TABLE signer_challenges (
  request_id TEXT PRIMARY KEY NOT NULL,
  challenge TEXT NOT NULL,
  origin TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL,
  consumed INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_signer_challenges_expires ON signer_challenges (expires_at_ms);

CREATE TABLE signer_fee_payer (
  id TEXT PRIMARY KEY NOT NULL CHECK (id = 'default'),
  public_key TEXT NOT NULL UNIQUE,
  secret_ciphertext TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL
);

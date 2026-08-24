-- Revoked wallet session JWT ids (logout / forced invalidation).

CREATE TABLE wallet_session_revocations (
  jti TEXT PRIMARY KEY NOT NULL,
  vault_pda TEXT NOT NULL,
  revoked_at_ms INTEGER NOT NULL
);

CREATE INDEX idx_wallet_session_revocations_vault ON wallet_session_revocations (vault_pda);
CREATE INDEX idx_wallet_session_revocations_revoked ON wallet_session_revocations (revoked_at_ms);

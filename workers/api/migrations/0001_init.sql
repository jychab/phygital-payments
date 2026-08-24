-- App DB (agents, passkeys, auth challenges).
-- Tap anti-replay stays on revibase_counter KV.

CREATE TABLE agent_sessions (
  session_pda TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('nfc', 'autonomous')),
  vault_pda TEXT NOT NULL,
  wallet_pda TEXT NOT NULL,
  session_public_key TEXT NOT NULL,
  expires_at_slot TEXT NOT NULL,
  phygital_passkey TEXT,
  task_json TEXT,
  actions_json TEXT,
  created_at_ms INTEGER NOT NULL
);

CREATE INDEX idx_agent_sessions_created_at ON agent_sessions (created_at_ms);

CREATE INDEX idx_agent_sessions_vault ON agent_sessions (vault_pda);

CREATE UNIQUE INDEX idx_agent_sessions_phygital
  ON agent_sessions (phygital_passkey)
  WHERE phygital_passkey IS NOT NULL;

CREATE TABLE challenges (
  kind TEXT NOT NULL,
  request_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  expires_at_ms INTEGER NOT NULL,
  consumed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, request_id)
);

CREATE INDEX idx_challenges_expires ON challenges (expires_at_ms);

CREATE TABLE passkey_map (
  credential_id TEXT PRIMARY KEY NOT NULL,
  compressed_pubkey TEXT NOT NULL
);

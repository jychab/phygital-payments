-- Device identity (one platform passkey) + owned token links.
-- Migrates legacy per-token device_authorities when present.

CREATE TABLE IF NOT EXISTS device_credentials (
  credential_id TEXT PRIMARY KEY NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  user_handle TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS device_token_links (
  credential_id TEXT NOT NULL,
  phygital_token TEXT NOT NULL,
  label TEXT,
  image_url TEXT,
  mint TEXT,
  linked_at INTEGER NOT NULL,
  PRIMARY KEY (credential_id, phygital_token),
  FOREIGN KEY (credential_id) REFERENCES device_credentials(credential_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS device_token_links_token_unique
  ON device_token_links (phygital_token);

CREATE INDEX IF NOT EXISTS device_token_links_credential
  ON device_token_links (credential_id);

-- Migrate legacy one-passkey-per-token rows if the old table exists.
INSERT OR IGNORE INTO device_credentials (credential_id, public_key, counter, user_handle, created_at)
SELECT credential_id, public_key, counter, phygital_token, created_at
FROM device_authorities;

INSERT OR IGNORE INTO device_token_links (credential_id, phygital_token, linked_at)
SELECT credential_id, phygital_token, created_at
FROM device_authorities;

DROP TABLE IF EXISTS device_authorities;

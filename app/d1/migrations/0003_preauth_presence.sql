-- Upgrade DBs that already applied the old 0002 (max_amount / mint columns).
-- Greenfield installs get the presence schema from 0002 directly.
CREATE TABLE preauth_grants_v3 (
  id          TEXT    NOT NULL PRIMARY KEY,
  wallet      TEXT    NOT NULL,
  expires_at  INTEGER NOT NULL,
  consumed_at INTEGER,
  claimed_at  INTEGER,
  claimed_by  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO preauth_grants_v3 (id, wallet, expires_at, consumed_at, claimed_at, claimed_by, created_at)
SELECT id, wallet, expires_at, consumed_at, claimed_at, claimed_by, created_at
FROM preauth_grants;

DROP TABLE preauth_grants;

ALTER TABLE preauth_grants_v3 RENAME TO preauth_grants;

CREATE INDEX IF NOT EXISTS idx_preauth_wallet_active
  ON preauth_grants (wallet, expires_at DESC);

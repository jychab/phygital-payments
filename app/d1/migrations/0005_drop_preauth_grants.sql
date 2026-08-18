-- Preauth grant lifecycle moved to PreauthGrantsDO (one DO per wallet).
DROP INDEX IF EXISTS idx_preauth_wallet_active;
DROP TABLE IF EXISTS preauth_grants;

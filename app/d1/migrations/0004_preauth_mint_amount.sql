-- No-op. Preauth grants no longer store mint or max_amount.
-- The table is dropped in 0005 (lifecycle moved to PreauthGrantsDO).
-- Filename kept so environments that already applied 0004 stay in sync.
SELECT 1 WHERE 0;

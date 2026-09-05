-- Payment history was for the removed Helius webhook indexer.
DROP INDEX IF EXISTS idx_payments_recipient;
DROP INDEX IF EXISTS idx_payments_sender;
DROP TABLE IF EXISTS payments;

-- Restore payer mint + max tap amount on the presence grant.
-- 0003 dropped these; settle still caps via on-chain delegate, but the
-- open window binds which mint and how much a tap may spend.
ALTER TABLE preauth_grants ADD COLUMN max_amount TEXT NOT NULL DEFAULT '0';
ALTER TABLE preauth_grants ADD COLUMN mint TEXT;

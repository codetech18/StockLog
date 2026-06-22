-- StockLog — make IMEI optional (some devices, e.g. accessories, don't have one).
-- The unique constraint on imei stays — Postgres allows multiple NULLs under a
-- unique constraint (NULLs aren't considered equal to each other), so several
-- no-IMEI devices can coexist without conflicting.
-- Run this once in the Supabase SQL editor after 0001_init.sql.

alter table inventory alter column imei drop not null;

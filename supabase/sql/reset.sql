-- Reset script - drop and recreate to revert any playground writes
-- Run this from the Run SQL playground's Reset button or manually in Supabase SQL Editor
-- It is idempotent: safe to run even if tables don't exist

\i seed.sql

-- Alternative inline version if \i is not supported in Supabase editor:
-- drop table if exists orders cascade;
-- drop table if exists users cascade;
-- (then paste the rest of seed.sql)

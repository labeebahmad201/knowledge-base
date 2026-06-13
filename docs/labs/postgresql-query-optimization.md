# PostgreSQL Query Optimization Labs

Run these locally to build intuition. Requires PostgreSQL (brew install postgresql / apt install postgresql / Docker).

## Setup: Generate Test Data

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    signup_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}'
);

INSERT INTO users (email, name, city, signup_date, status)
SELECT
  'user' || g || '@example.com',
  'Person ' || g,
  (ARRAY['NYC','LA','Chicago','Houston','Phoenix','Miami','Seattle','Boston','Denver','Atlanta'])[1 + (g % 10)],
  '2020-01-01'::DATE + (g % 1825)::INT,
  (ARRAY['active','inactive','suspended'])[1 + (g % 3)]
FROM generate_series(1, 1000000) AS g;

ANALYZE users;
```

## Lab 1: See a Full Table Scan

```sql
EXPLAIN SELECT * FROM users WHERE city = 'Miami';
-- Should show: Seq Scan on users

EXPLAIN ANALYZE SELECT * FROM users WHERE city = 'Miami';

EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE city = 'Miami';
-- "shared read" = pages from disk, "shared hit" = pages in RAM
```

## Lab 2: Create an Index, See Index Scan

```sql
CREATE INDEX idx_users_city ON users(city);

EXPLAIN ANALYZE SELECT * FROM users WHERE city = 'Miami';
-- Index Scan using idx_users_city on users
-- Note "Heap Fetches" — index found rows, then fetched from heap (random I/O)
```

## Lab 3: Full Scan vs Index Scan Performance

```sql
DROP INDEX idx_users_city;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE city = 'Miami';

CREATE INDEX idx_users_city ON users(city);
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE city = 'Miami';
-- 100k random heap fetches can be slow — planner might still choose index scan
```

## Lab 4: Covering Index (Skip Heap Fetch)

```sql
CREATE INDEX idx_users_city_covering ON users(city) INCLUDE (email, name);

EXPLAIN (ANALYZE, BUFFERS)
SELECT city, email, name FROM users WHERE city = 'Miami';
-- Look for: "Index Only Scan" — no heap fetches!
```

## Lab 5: Composite Indexes vs Single-Column

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM users WHERE city = 'Chicago' AND status = 'active';

CREATE INDEX idx_users_city_status ON users(city, status);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM users WHERE city = 'Chicago' AND status = 'active';
-- Both conditions used by the index
```

## Lab 6: When the Planner Ignores Your Index

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM users WHERE city IN ('NYC','LA','Chicago','Houston','Phoenix','Miami','Seattle','Boston');
-- ~800k rows. Planner will likely do Seq Scan even with index.
-- Reading 800k random heap pages > reading all pages sequentially.

DELETE FROM users WHERE id > 1000;
ANALYZE users;
EXPLAIN ANALYZE SELECT * FROM users;
-- Small table = Seq Scan is fine
```

## Lab 7: Partial Index

```sql
CREATE INDEX idx_users_active ON users(city)
WHERE status = 'active';

-- Query that matches
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM users WHERE city = 'Miami' AND status = 'active';

-- Query that doesn't match
EXPLAIN ANALYZE
SELECT * FROM users WHERE city = 'Miami' AND status = 'suspended';
-- Falls back to other index or Seq Scan
```

## Lab 8: EXPLAIN Damage — Slow Query Debugging

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...
```

What to look for:
- "Seq Scan" on large table → missing index
- "Index Scan" with high "Heap Fetches" → try covering index
- "Rows Removed by Filter" high → index not filtering enough
- "Parallel Seq Scan" → PostgreSQL split work across CPUs
- Large gap between "estimated rows" and "actual rows" → run ANALYZE

## Cleanup

```sql
DROP TABLE IF EXISTS users;
```

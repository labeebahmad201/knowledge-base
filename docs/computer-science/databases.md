# Databases

## Relational Modeling

Normalization, denormalization.

## SQL

Joins, aggregations, window functions, CTEs.

## Indexes

B-tree, hash, composite, covering, partial.

## Full Table Scan vs Index Scan

**Full table scan**: rows live in pages (8 KB blocks) on disk; the DB streams through pages sequentially into the buffer pool (RAM), checks each row against the WHERE clause, discards as it goes — it does NOT load all rows at once; sequential reads are fast because the disk head doesn't jump; time scales with table size (O(n)) but each read is cheap.

**Index scan**: traverses a B-tree in O(log n) to find matching keys, then fetches the actual row from heap pages (random I/O, expensive per row); wins for high-selectivity queries (e.g., `WHERE id = 42`) returning few rows.

### Sequential vs Random I/O (Physical Layer)

- **HDD**: data on spinning magnetic platters with a read/write head on a moving arm; sequential read = head stays put, platter spins, data streams in — cheap; random read = head must physically seek to a new track (seek time ~5-10ms) + wait for the platter to rotate (rotational latency ~4ms) — ~100x slower per read than sequential
- **SSD**: no moving parts; data stored in NAND flash cells, accessed electronically; random reads ~0.1ms vs HDD's ~5-10ms seek — roughly 50-100x faster for random I/O; sequential reads also faster (~500 MB/s vs HDD's ~150 MB/s, ~3x) but the real win is random access; SSDs make index scans far less punishing, which is why covering indexes matter slightly less on SSD (but still help)
- **AWS**: you always choose — EBS has `gp3` and `io2` (SSD, default for most workloads) vs `st1` and `sc1` (HDD, cheaper, for throughput-heavy sequential workloads like logs/data warehouses); RDS defaults to SSD (`gp3`), you'd only pick HDD if you need tons of cheap sequential storage; practically, in 2026, almost everything runs on SSD — HDDs are legacy

**The planner decides**: estimates selectivity from table statistics; uses index scan when few rows are needed, full table scan when most rows are needed or the table is small; a covering index (all columns in the index itself) skips the heap fetch entirely — best of both worlds.

## Query Planning

EXPLAIN, slow-query tuning.

## Transactions

ACID, isolation levels, locks, deadlocks.

## Migrations

Zero-downtime schema changes.

## Connection Pooling

## Replication

Leader/follower, multi-region.

## Sharding

Strategies and resharding pain.

## NoSQL

Document, wide-column, key-value, graph.

## OLTP vs OLAP

Data warehouse / lake basics.

## ETL/ELT

Batch vs stream processing.

## Data Retention

GDPR/privacy-by-design.

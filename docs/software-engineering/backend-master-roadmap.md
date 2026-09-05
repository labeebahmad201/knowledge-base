# Backend Master Roadmap - Full Topic List

This is the consolidated list from all sessions, grouped for Why-First learning (problem it solves, when to use, runnable example). Each will become a `problem -> solution` article with a live playground.

## 1. Database & SQL (28 topics - done in sql-introduction.md)
*   SELECT/WHERE, JOIN (inner/left/self/cross), GROUP BY/HAVING, DISTINCT/ORDER BY/LIMIT
*   Subquery/IN/EXISTS/CTE, UNION vs UNION ALL, Window functions, NULL/COALESCE
*   Constraints/indexes/EXPLAIN, Transactions/isolation/locks
*   Indexing deep dive (B-tree, partial, composite), WHEN (CASE), Aggregates, GROUPING SETS/ROLLUP/CUBE
*   VALUES/LATERAL/generate_series, Benchmarking (EXPLAIN ANALYZE), Monitoring (pg_stat_activity)
*   JSONB, Date/Time, Subquery vs JOIN, Data modeling (3NF), Views, Recursive CTEs, Full Text Search, UPSERT
*   Postgres memory (shared_buffers, work_mem), Selectivity, How to choose a database

## 2. Architecture (4)
*   Monolithic vs Microservices
*   Event-driven architecture (with example)
*   Synchronous vs Asynchronous processing
*   Background jobs

## 3. API Design (7)
*   RESTful APIs vs GraphQL
*   Idempotency in APIs / Idempotency keys
*   Rate limiting (Token bucket vs Leaky bucket) + Throttling
*   API versioning, Middleware, Error handling
*   Pagination, Filtering and sorting, Full-text search / Elasticsearch

## 4. Database Deep Dives (11)
*   SQL vs NoSQL - when to use each
*   Database indexing + impact (deep dive)
*   ACID properties
*   Deadlocks - how to prevent
*   Replication - why useful
*   Query optimization techniques
*   OLTP vs OLAP
*   Write-ahead logging (WAL)
*   Read-your-writes consistency
*   At-least-once delivery (vs at-most-once, exactly-once)
*   Read/write tradeoffs

## 5. Caching & Storage (10)
*   How caching works + 5 layers + strategies
*   Redis vs Memcached
*   Cache stampede / Hot partition
*   CDN (Day 2), Caching, Cache Invalidation
*   Session Storage vs Local Storage (vs Cookies/IndexedDB)
*   Distributed file storage
*   Tombstone records, Bloom filters

## 6. System Design (10)
*   Scale to millions req/s
*   URL shortener (Bitly) - Day 1-6 done: Load Balancing, CDN, Caching, Cache Invalidation, Rate Limiting, API Gateway
*   Messaging queue / Pub/Sub patterns
*   Load balancing - benefits + types (L4 vs L7)
*   Eventual vs Strong consistency
*   Consistent hashing, Gossip protocol, Vector clocks

## 7. Security (12)
*   OAuth vs JWT vs Session-based auth
*   SQL injection prevention
*   CORS, CSRF, XSS prevention
*   Common backend vulnerabilities + mitigations
*   Secure password storage (bcrypt/Argon2, salt and pepper)
*   Hashing (bcrypt) vs Encryption (AES) - when to use which
*   Authentication methods, 2FA, SSO, RBAC/ABAC
*   Input validation, Output sanitization

## 8. Distributed Systems - Senior 13 (2026)
*   Event sourcing, Saga pattern, Bulkhead isolation, Backpressure, Write-ahead logging, Tombstone records, Bloom filters, Vector clocks, Gossip protocol, Consistent hashing (duplicate), Read-your-writes consistency

## 9. Production & Resilience (10)
*   Dead letter queue, Circuit breaker, Read replica lag, Retry storm, Write amplification
*   Concurrency control, Indexes and query plans (deep), Async workflows, Idempotent consumers, Failure handling, Observability basics
*   How to debug memory leak, Logging and Monitoring, APM, Handling failed transactions in distributed env

## 10. Async Primitives (4)
*   Queue vs Stream vs Webhook vs Cron job

## 11. Cloud & Deployment (4)
*   Cloud deployment, Cloud services, Redundancy, Backups (PITR), Secrets management, Environment variables, Configuration management, Docker/Kubernetes, CI/CD, Production deployment strategies

## 12. Testing (4)
*   Unit tests, Integration tests, E2E tests, Mocking and stubbing, Debugging techniques

## 13. Fundamentals (HTTP etc. - ~40 from your last list)
*   HTTP methods, Status codes, Request/Response headers, Authentication/Authorization, JWT/Session/Cookies/OAuth 2.0, REST/GraphQL/WebSockets/Server-side rendering, Database design/SQL/NoSQL, ORM, Connection pooling, Transactions, Migrations/Seeding, Caching/Redis/Memcached/CDN, Rate limiting, API Gateway/Service mesh, Docker/K8s, etc. (full list in your message - all added)

## 14. Meta Patterns (3)
*   Modeling system before coding (Event Storming, DDD, C4)
*   Pattern: Generate runnable examples to learn, then orchestrate AI (human verifies) - the gym loop
*   RAG (Retrieval-Augmented Generation) - chunk, embed, retrieve your docs to ground LLM answers

## 15. Low Level Design (LLD)
*   OOD, SOLID, Design patterns (Singleton, Factory, Observer), Class diagrams, API design at code level

## 16. Hands-on Mono-repo - learn by building small projects

A mono-repo with multiple **simply scoped** projects, each covering 1-2 topics from above. Problems are limited so you can finish one in a day and verify with runnable tests.

```
knowledge-base/
  mono-repo/
    01-sql-playground/        -> SQL intro + Supabase (done)
    02-rate-limiter/          -> Token bucket vs Leaky bucket
    03-url-shortener/         -> Scale to millions, caching
    04-message-queue/         -> Queue vs Stream, at-least-once
    05-auth-service/          -> JWT vs Session, bcrypt, SSO
    06-load-balancer/         -> L4 vs L7
    07-circuit-breaker/       -> Bulkhead, retry storm
    08-event-sourcing/        -> Saga, Event sourcing
    ... (one project per roadmap topic, simply scoped)
```

Each project has: `problem.md` (what it solves), `solution/` (your code), `tests/` (non-AI evaluator, 0 cost), `README` (when to use). You write the code by hand in the gym, then orchestrate AI to generate the next one and verify faster.

---

**Total: ~110 topics** (deduplicated). Start with 3/day deep (Why-First + runnable) for your 10-day sprint. Each will be a `knowledge-base` article with StackBlitz/Supabase playground.

*Last updated: 2026-09-03 - branch docs/sql-introduction*

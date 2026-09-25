# Backend Master Roadmap - Full Topic List

This is the consolidated list from all sessions, grouped for Why-First learning (problem it solves, when to use, runnable example). Each will become a `problem -> solution` article with a live playground.

## Learning Path - the order to do these

The catalog below (sections 0-23) is the reference map. This path is the execution order: each phase assumes the one before it, so do not skip Phases 1-3 - everything downstream leans on concurrency, locks, and the request lifecycle. Two tracks run in parallel from day one: DSA (section 22) as a daily habit, and the interview rounds (section 23) once the knowledge lanes are in. Finish each phase by building its matching mono-repo project (section 20).

**Phase 1 - Language, runtime, and the wire**
Everything assumes you can read code and trace one request end to end.
1. Language choice (13b), and the [Go fundamentals series](./go/golang.md) (13c, the concurrency and cloud-infra pick)
2. JS/TS runtime: event loop, call stack, microtasks vs macrotasks, closures, this, prototypes (21a)
3. Fundamentals (13): [HTTP methods, status codes, request/response headers, idempotency](./http-fundamentals.md), DB connections and driver basics
4. Networking (19): TCP/IP, UDP, HTTP 1.1/2/3, DNS, TLS/SSL, socket programming, WebSockets, gRPC transport, forward proxy, reverse proxy
5. OOP and design patterns (18), then LLD (17): the catalog starts with [Abstract Factory: creating a family of objects without naming them](./abstract-factory.md); then SOLID, class diagrams, API design at code level

**Phase 2 - Data and SQL**
1. SQL surface (section 1): SELECT/WHERE, JOIN, GROUP BY/HAVING, DISTINCT/ORDER BY/LIMIT, subqueries/IN/EXISTS/CTE, UNION vs UNION ALL, window functions, NULL/COALESCE, CASE, aggregates, GROUPING SETS/ROLLUP/CUBE, VALUES/LATERAL/generate_series, subquery vs JOIN, recursive CTEs, full text search, UPSERT, date/time, JSONB
2. Data modeling + 3NF, how to choose a database
3. Indexing: constraints/indexes/EXPLAIN, B-Trees and B+ Trees, selectivity, partial/composite indexes, query optimization, benchmarking (EXPLAIN ANALYZE), monitoring (pg_stat_activity)
4. ACID properties, LSM trees, OLTP vs OLAP
5. Views, materialized views, Postgres memory (shared_buffers, work_mem)

**Phase 3 - Transactions, locks, and concurrency**
You are already strong here; finish it before any distributed work.
1. Concurrency primitives (16): concurrency vs parallelism, processes vs threads, thread lifecycle, race conditions, mutex, semaphore, condition variables, coarse vs fine-grained locking, reentrant lock, try-lock, CAS, deadlock vs livelock, signaling, thread pool, producer-consumer, reader-writer lock, thread-safe LRU, blocking queue
2. Transactions/isolation/locks (1) and the row-lock cluster (4): row locks + BEGIN lifetime, concurrent UPDATE serialization, deadlocks and prevention
3. MVCC, WAL, write amplification, isolation levels and their anomalies
4. Distributed locks (14): the single-node machinery stretched across nodes

**Phase 4 - APIs**
1. API Design (section 3): REST/GraphQL/gRPC, idempotency keys, rate limiting + throttling, versioning, middleware, error handling, pagination, filtering/sorting, FTS/Elasticsearch, BFF
2. ORM, migrations/seeding, database connections and drivers (13)
3. API Gateway and service mesh (13, 19), load balancing L4 vs L7 (6, 19)

**Phase 5 - Caching and storage**
1. Caching (section 5): how it works (5 layers + strategies), Redis vs Memcached, why the cache, cache stampede, thundering herd, hot partition, cache invalidation, CDN, distributed file storage, tombstone records, bloom filters
2. Consistency of the cache: strong vs eventual, stale is eventual (6)

**Phase 6 - Async and messaging**
1. Async primitives (section 10): queue vs stream vs webhook vs cron, Kafka vs RabbitMQ
2. Kafka internals: partitions, consumer groups, offsets, rebalancing, ordering guarantees
3. [NEW] Delivery semantics: at-most-once vs at-least-once vs effectively-once
4. [NEW] Schema registry and serialization evolution (Avro/Protobuf)
5. Idempotent consumers, dead letter queue, backpressure (revisit here)

**Phase 7 - Distributed systems**
1. System design fundamentals (section 6): CAP, PACELC, consistent hashing, gossip protocol, vector clocks, SPOF, latency vs throughput vs bandwidth
2. Replication and consistency (4): replication, read replicas, read-your-writes consistency, read/write tradeoffs, at-least-once delivery
3. Distributed systems patterns (8): event sourcing, saga, bulkhead isolation, backpressure
4. [NEW] Transactional outbox / inbox pattern - the reliable-messaging backbone under saga
5. Language-agnostic big-tech half of section 14: RPC (gRPC/Thrift), distributed transactions (2PC/Saga), consensus (Paxos/Raft), distributed locks, data sharding and partitioning, distributed databases, event-driven architecture + CQRS, failover
6. [NEW] Time and clocks: NTP skew, monotonic vs wall clock, ordering without a global clock
7. [NEW] Idempotency end to end: keys, dedup tables, effectively-once

**Phase 8 - Resilience, production, and observability**
1. Production and resilience (section 9): dead letter queue, circuit breaker, load shedding, read replica lag, write amplification, thread pools and async processing, concurrency control, indexes and query plans, async workflows, idempotent consumers, failure handling, how to debug a memory leak, failed transactions in a distributed env
2. Observability (9, 14): logging and monitoring, APM, logging and distributed tracing (ELK, Jaeger, Zipkin), monitoring and metrics (Prometheus, Grafana, Micrometer), alerting systems
3. [NEW] SLI / SLO / SLA and error budgets; RED (rate, errors, duration) and USE (utilization, saturation, errors)
4. [NEW] Timeout budgets and deadline propagation; retry budgets with exponential backoff + jitter; hedging
5. [NEW] Graceful shutdown and connection draining

**Phase 9 - Cloud, deployment, and testing**
1. Cloud and deployment (section 11): cloud deployment, cloud services, redundancy, backups (PITR), configuration management, Docker/Kubernetes, CI/CD, production deployment strategies
2. AWS services in order (11): IAM, VPC, EC2, RDS, S3, ElastiCache, ALB/NLB, Route 53, API Gateway, Secrets Manager + KMS, CloudWatch + X-Ray, ECR + CodeBuild/CodePipeline, EKS + Helm + kubectl, SQS, Lambda, Terraform, cost estimation
3. AWS Well-Architected Framework and the 14-day chaos plan (11)
4. [NEW] Deployment strategies: rolling, blue-green, canary, feature flags, and rollback
5. [NEW] Zero-downtime migrations: expand-contract (add, dual-write, backfill, cutover, drop) and schema evolution
6. Testing (section 12): unit, integration, E2E, mocking/stubbing, debugging

**Phase 10 - Security**
Section 7: OAuth 2.0 vs JWT vs session, SSO, 2FA, RBAC/ABAC, OAuth is delegation not authentication, SQL injection, CORS, CSRF, XSS, CSP, HSTS, OWASP Top 10, secure password storage, hashing vs encryption, input validation, output sanitization, confidential data in logs, HTTPS, MITM, session theft, don't invent cryptography, security by default, secrets management, environment variables

**Phase 11 - System design synthesis and architecture**
1. System design (section 6): scale to millions req/s, back-of-the-envelope estimation, URL shortener (Bitly), messaging queue / pub-sub patterns, load balancing, eventual vs strong consistency, Little's Law and queueing theory, multi-tenancy
2. Architecture (section 2): software design vs architecture, monolithic vs microservices, event-driven architecture, synchronous vs asynchronous processing, background jobs
3. Meta patterns (section 15): modeling the system before coding (event storming, DDD, C4), the generate-and-verify gym loop, RAG

**Phase 12 - Frontend / full-stack (parallel)**
Section 21: TypeScript, React and rendering, web performance, browser-side security, FE testing, AI integration

**Phase 13 - Selective big-tech depth (optional)**
The Java-runtime half of section 14: DI container, Java concurrency, Java Memory Model, Akka, in-memory data grids, Spring Boot/Spring Cloud, service discovery, JVM tuning, Spring ecosystem - only if targeting a JVM shop

**Interview track (parallel from day one)**
Section 22: DSA patterns in TS, 2/day, by hand. Section 23: the round-by-round loop.

## 0. Core 10 - start here
*   API Design (REST/GraphQL)
*   SQL & Database Design
*   Indexing & Query Optimization
*   Caching (Redis)
*   Authentication & Authorization
*   Message Queues (Kafka/RabbitMQ)
*   System Design Fundamentals
*   Concurrency & Transactions
*   Docker & Deployment
*   Monitoring & Observability

## 1. Database & SQL (28 topics - done in sql-introduction.md)
*   SELECT/WHERE
*   JOIN (inner/left/self/cross)
*   GROUP BY/HAVING
*   DISTINCT/ORDER BY/LIMIT
*   Subquery/IN/EXISTS/CTE
*   UNION vs UNION ALL — see [UNION vs UNION ALL](../databases/union-vs-union-all.md) (dedup cost of UNION, ORDER BY/LIMIT traps, INTERSECT/EXCEPT, recursive CTEs)
*   Window functions
*   NULL/COALESCE
*   Constraints/indexes/EXPLAIN
*   Transactions/isolation/locks
*   Indexing deep dive (B-tree, partial, composite)
*   WHEN (CASE)
*   Aggregates
*   GROUPING SETS/ROLLUP/CUBE
*   VALUES/LATERAL/generate_series
*   Benchmarking (EXPLAIN ANALYZE)
*   Monitoring (pg_stat_activity)
*   JSONB
*   Date/Time
*   Subquery vs JOIN
*   Data modeling (3NF)
*   Views — see [SQL Views: Stored Queries That Act Like Tables](../databases/views.md) (what they are, updatable views, WITH CHECK OPTION, security_barrier, materialized views, interview questions)
*   Recursive CTEs
*   Full Text Search
*   UPSERT
*   Postgres memory (shared_buffers, work_mem)
*   Selectivity
*   How to choose a database
## 2. Architecture (5)

*   Software Design vs Architecture — distinction — see [Architecture vs Design: Where Does This Code Belong?](./architecture-vs-design.md) (design is how a unit is built locally, architecture is where it lives system-wide and decides cost of change)
*   Monolithic vs Microservices
*   Event-driven architecture (with example)
*   Synchronous vs Asynchronous processing
*   Background jobs

## 3. API Design (10)
*   RESTful APIs vs GraphQL vs gRPC — see [REST APIs](../api/rest.md)
*   Idempotency in APIs / Idempotency keys
*   Rate limiting (Token bucket vs Leaky bucket) + Throttling
*   API versioning — see [API Versioning](../api/api-versioning.md) (compatible vs breaking, URI/header/media-type/date-pinned strategies, deprecation)
*   Middleware
*   Error handling
*   Pagination
*   Filtering and sorting
*   Full-text search / Elasticsearch
*   BFF (Backend for Frontend) - one backend per frontend (web/mobile)

## 4. Database Deep Dives (16)
*   SQL vs NoSQL is outdated framing - pick the database that meets the requirement and say which qualities you rely on (consistency, indexing, query pattern, scale) - via Hello Interview
*   Database indexing + impact (deep dive)
*   B-Trees and B+ Trees
*   LSM Trees
*   ACID properties
*   Row locks, transaction lifetime, and what `BEGIN` actually does — see [Locks Only Live as Long as Your Transaction](./lock-duration-and-begin.md) (locks are taken by statements and released when the transaction ends; without a block, autocommit releases instantly; row locks block writers, not plain readers). Lock duration = transaction duration, in three tiers: bare `UPDATE` = statement lifetime only; inside `BEGIN ... COMMIT` = till transaction end; inside `PREPARE TRANSACTION ... COMMIT PREPARED/ROLLBACK PREPARED` = till the prepared transaction is resolved (the tier that makes [2PC](./distributed-transactions.md) block)
*   Concurrent updates serialize — see [Do Concurrent UPDATEs Serialize in Autocommit? Yes, and Here's the Catch](./serialized-updates-autocommit.md) (writers to the same row always serialize, even in autocommit; a plain UPDATE locks at FOR NO KEY UPDATE strength; the real autocommit danger is the read-then-write race, fixed with SELECT ... FOR UPDATE)
*   Deadlocks - how to prevent
*   Replication - why useful
*   Read Replicas
*   Materialized Views — see [SQL Views](../databases/views.md#8-materialized-views--when-fresh-is-too-slow) (stored rows, REFRESH, CONCURRENTLY, locking, vs regular views)
*   Connection Pooling
*   Query optimization techniques
*   OLTP vs OLAP
*   Write-ahead logging (WAL)
*   Read-your-writes consistency
*   At-least-once delivery (vs at-most-once, exactly-once)
*   Read/write tradeoffs

## 5. Caching & Storage (11)
*   [Caching: how it works + 5 layers + strategies](../caching/how-it-works.md) and [Redis vs Memcached](../caching/how-it-works.md#8-redis-vs-memcached)
*   [Why The Cache: even when indexes are fast](../caching/why-cache.md) (the index speeds up the lookup, the cache removes the repeated work)
*   Cache stampede — see [Cache Stampede: when cache expires and DB falls over](../caching/cache-stampede.md) (mutex lock, early recompute, [Stale is Eventual](../caching/stale-is-eventual.md), [Strong vs Eventual Cache](../caching/strong-vs-eventual-cache.md))
*   Thundering herd — see [Thundering Herd: the retry storm that took down Braintree](../thundering-herd/thundering-herd.md) (fixed-interval retries retrample, why it is not backpressure, fix is jitter + concurrency limit; in production the second wave retramples, fix is jitter + break coupling — category [overview](../thundering-herd/overview.md))
*   Hot partition
*   CDN (Day 2)
*   Cache Invalidation
*   Session Storage vs Local Storage (vs Cookies/IndexedDB) — see [Browser Storage: Cookies, localStorage, sessionStorage, IndexedDB](../frontend/browser-storage.md) (which store survives tab close, which goes to server, which blocks)
*   Distributed file storage
*   Tombstone records
*   Bloom filters

## 6. System Design (16)
*   Scale to millions req/s
*   Back-of-the-envelope estimation - rounds numbers to order-of-magnitude (count the digits, 10^x gaps), used for capacity + cost calls, see [Orders of Magnitude: The 10x Language of Scale](../production-insights/order-of-magnitude.md) (a ~5x gap is under one order; a design change, not tuning, is what crosses an order)
*   URL shortener (Bitly) - Day 1-6 done: Load Balancing, CDN, Caching, Cache Invalidation, Rate Limiting, API Gateway
*   Messaging queue / Pub/Sub patterns
*   Load balancing - benefits + types (L4 vs L7)
*   Eventual vs Strong consistency — see [Strong vs Eventual Cache](../caching/strong-vs-eventual-cache.md) (PACELC trade: lock for strong vs stale for eventual) and [Stale is Eventual](../caching/stale-is-eventual.md) (bounded staleness)
*   CAP theorem
*   PACELC (extends CAP: even without partition, latency vs consistency) — practiced in [Strong vs Eventual Cache](../caching/strong-vs-eventual-cache.md)
*   Consistent hashing
*   Gossip protocol
*   Vector clocks
*   SPOF (Single Point of Failure)
*   Latency vs Throughput vs Bandwidth
*   [NEW] Little's Law and queueing theory - concurrency = arrival rate x latency; the math behind capacity sizing and why a queue explodes as it approaches saturation
*   [NEW] Time and clocks - NTP skew, monotonic vs wall clock, why ordering needs logical clocks (extends vector clocks)
*   [NEW] Multi-tenancy - shared vs silo vs bridge, tenant isolation (data, noisy-neighbor, per-tenant limits)

## 7. Security (25 - OWASP Top 10)
*   OAuth 2.0 vs JWT vs Session-based auth
*   SSO
*   2FA
*   RBAC/ABAC
*   OAuth 2.0 is delegation, not authentication - using it for authn without OIDC on top leads to confused deputy and identity substitution bugs
*   SQL injection prevention (prepared statements, ORM)
*   CORS
*   CSRF
*   XSS prevention
*   CSP (Content Security Policy)
*   HSTS
*   OWASP Top 10 (Injection, Broken Auth, Sensitive Data Exposure, XXE, Broken Access Control, Security Misconfig, XSS, Insecure Deserialization, Using Components with Known Vulnerabilities, Insufficient Logging)
*   Secure password storage (bcrypt/Argon2, salt and pepper)
*   Hashing (bcrypt) vs Encryption (AES) - when to use which
*   Input validation
*   Output sanitization
*   Confidential data in logs
*   HTTPS
*   MITM
*   Stealing sessions
*   Don't invent cryptography
*   Security by Default
*   Secrets management (env vars, don't log secrets, KMS)
*   Environment variables

## 8. Distributed Systems - Senior (6)
*   Event sourcing
*   [Saga pattern](./sagas.md)
*   Bulkhead isolation
*   Backpressure
*   [NEW] Transactional outbox / inbox pattern - persist the state change and the outgoing event in one local transaction, then a relay publishes it; on the consumer side an inbox/dedup table makes redelivery safe. This is the reliable-messaging layer underneath [saga](./sagas.md) and every async consumer, and the honest answer to "exactly-once"

## 9. Production & Resilience (21)
*   Production Insights — see [overview](../production-insights/overview.md), [Cache Stampede](../caching/cache-stampede.md), [Thundering Herd](../thundering-herd/thundering-herd.md), [Stale is Eventual](../caching/stale-is-eventual.md), [Strong vs Eventual Cache](../caching/strong-vs-eventual-cache.md)
*   Dead letter queue
*   Circuit breaker
*   Load Shedding
*   Read replica lag
*   Write amplification
*   Thread Pools & Async Processing
*   Concurrency control
*   Indexes and query plans (deep)
*   Async workflows
*   Idempotent consumers
*   Failure handling
*   Observability basics
*   How to debug memory leak
*   Logging and Monitoring
*   APM
*   Handling failed transactions in distributed env
*   [NEW] SLI / SLO / SLA and error budgets - define reliability numerically; diagnose with RED (rate, errors, duration) and USE (utilization, saturation, errors)
*   [NEW] Timeout budgets and deadline propagation - a request's total budget split across hops, not a per-call timeout that hides the real cost
*   [NEW] Retry budgets + exponential backoff + jitter, and hedging (send a second request, take the first) - retries without a budget are a self-inflicted load amplifier
*   [NEW] Graceful shutdown and connection draining - stop accepting new work, finish in-flight, deregister, then exit

## 10. Async Primitives (7)
*   Queue vs Stream vs Webhook vs Cron job
*   Kafka vs RabbitMQ - how to choose (log vs queue, replay, ordering, throughput)
*   Idempotent consumers (revisited for async delivery)
*   Dead letter queue (revisited for async delivery)
*   Backpressure (the sync/async fairness trade)
*   [NEW] Delivery semantics - at-most-once vs at-least-once vs effectively-once (exactly-once is idempotency + dedup, not a broker promise)
*   [NEW] Schema registry and serialization evolution (Avro/Protobuf) - keep producers and consumers compatible as events change

## 11. Cloud & Deployment (copied from AWS Cloud Services + 14-day chaos plan)
*   Cloud deployment
*   Cloud services
*   Redundancy
*   Backups (PITR)
*   Configuration management
*   Docker/Kubernetes
*   CI/CD
*   Production deployment strategies
*   [NEW] Deployment strategies - rolling, blue-green, canary, feature flags, and the rollback path for each
*   [NEW] Zero-downtime migrations - expand-contract (add, dual-write, backfill, cutover, drop) and schema evolution

### AWS services a backend dev must know (in order)
*   **IAM** — roles, policies, least privilege. Everything else depends on it.
*   **VPC** — subnets, security groups, NAT, CIDR basics. Diagnose connectivity by inspecting route tables + SG rules.
*   **EC2** — AMI, SSH, EBS volumes, snapshots, recovery when the key is lost.
*   **RDS** — Postgres/MySQL in the cloud, read replicas, Multi-AZ failover.
*   **S3** — object storage, versioning, lifecycle policies, presigned URLs.
*   **ElastiCache (Redis)** — caching, sessions, rate limiting (see [Caching layer analysis](../caching/how-it-works.md)).
*   **ALB / NLB** — routing, TLS termination, healthy/unhealthy instance handling.
*   **Route 53** — DNS.
*   **API Gateway** — versioning, throttling, auth.
*   **Secrets Manager + KMS** — never hardcode secrets.
*   **CloudWatch + X-Ray** — logs, metrics, alarms, tracing.
*   **ECR + CodeBuild/CodePipeline** — image build + deploy.
*   **EKS + Helm + kubectl** — container orchestration (the polish layer on the above).
*   Optional high-value: **SQS** (async jobs), **Lambda** (serverless), **Terraform/CloudFormation** (infra as code).
*   **Cloud cost estimation** — estimate the bill before building: understand per-hour and per-GB prices, where the 80% spend sits (usually compute + data transfer + storage), and round with back-of-the-envelope numbers so a million requests is 1-3 orders, never a fuzzy guess.

### AWS Well-Architected Framework (~3-5 focused days, overlapped with the 14-day plan)
*   Six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability ([AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)).
*   ~1.5 days to read all six pillars (each is a compact review checklist, not a course), then ~2 days applying it: run a real Well-Architected review against the stack built in the 14-day plan, score each pillar, and fix the top finding per pillar.
*   The review question is the skill: "if I fail this pillar, what breaks and how do I recover?" that is the interview answer for "how do you design for reliability/security/cost".

### 14-day chaos plan (for an experienced dev, no tutorials)
*   Days 1-3 — IAM (deny-all then grant), VPC (public/private + NAT), EC2 (EBS snapshot restore, lose key → serial console recovery), then break each and fix it.
*   Days 4-6 — RDS (force a failover, kill the primary), S3 (versioning, lifecycle, presigned), ElastiCache Redis in front of a real app, flush it and watch DB pressure spike.
*   Days 7-9 — Docker → ECR → ALB in front of 2 EC2 instances, Route 53 + ACM TLS + API Gateway. Deregister an instance mid-traffic and watch ALB drain it.
*   Days 10-14 — EKS (Deployments, Services, Ingress, ConfigMaps, Secrets, HPA). Chaos: kill a pod, drain a node, scale to zero and back. Terraform the whole thing, destroy, recreate. Cost drill: calculate the 14-day bill from the console (back-of-the-envelope first, then the billing dashboard), identify the 80% spend, and size the same workload in EKS vs EC2 vs Lambda.
*   Two rules: (1) delete & recreate everything at least once, (2) keep a broken-things log — the failures are the interview stories.

## 12. Testing (5)
*   Unit tests
*   Integration tests
*   E2E tests
*   Mocking and stubbing
*   Debugging techniques

## 13. Fundamentals (7 - deduped into deeper sections)
*   [HTTP methods, status codes, request/response headers, idempotency](./http-fundamentals.md)
*   Status codes
*   Request/Response headers
*   ORM
*   Migrations/Seeding
*   API Gateway/Service mesh
*   Database connections & driver basics

## 13b. Language Choice
*   When to use Node (I/O-heavy, JS everywhere) vs Python (data/ML, Django/FastAPI) vs Java (enterprise, Spring) vs Go (concurrency, low latency) vs Rust (systems, safety) - pick by team, hiring, and workload, not hype

## 13c. Go (Golang) - the concurrency and cloud-infra pick

Go is the language the roadmap leans on for the concurrency and cloud-infra sections: fast builds, goroutines + channels, and a single static binary. Start at the [Go series hub](./go/golang.md) for context on what Go is and who built it, then work through the fundamentals in order:

*   [Variables and type inference](./go/go-variables.md) - `var` vs `:=`, how Go keeps static typing without the ceremony, and function vs package level declarations
*   [Constants](./go/go-constants.md) - `const`, the block form, untyped constants, and why they cannot use `:=`
*   [Bit-shift operators](./go/go-bit-shift-operators.md) - expressing powers of two and bit masks with the `<<` and `>>` operators
*   [Functions, multiple return values, and named results](./go/go-functions.md) - the `(value, error)` idiom and bare returns
*   [Function values (anonymous functions)](./go/go-function-values.md) - functions as values, closures, callbacks
*   [Printing: `fmt` vs the built-in `print`](./go/go-printing-fmt.md) - `Println`, `Printf`, and `Sprintf`
*   [Packages and the `main` entry point](./go/go-packages.md) - `package main`, `func main`, and package naming
*   [Imports and code location (GOPATH)](./go/go-imports-gopath.md) - import paths, `go get`, and the `src`/`pkg`/`bin` layout, plus GOPATH vs Go modules
*   [Exported names (the capital letter rule)](./go/go-exported-names.md) - Go's `public`/`private` replacement
*   [Pointers](./go/go-pointers.md) - `&`, `*`, no pointer arithmetic, and pointer receivers
*   [Mutability: pass by value vs pass by reference](./go/go-mutability.md) - why your function did not change your variable

## 14. Java & Big-Tech Depth (24) - not big individually, big career boost
*   Distributed System Architectures
*   RPC (gRPC, Thrift, RMI)
*   Dependency Injection Container (Spring, Guice, Inversify) - lifecycle, scopes, auto-wiring
*   Apache Kafka for Streaming
*   Zookeeper for Coordination (x2)
*   Java Concurrency (ExecutorService, Future, ForkJoinPool)
*   Thread Safety and Synchronization
*   Java Memory Model
*   Akka for Actor-based Concurrency
*   Distributed Databases (Cassandra, MongoDB, HBase)
*   Data Sharding and Partitioning
*   In-memory Data Grids (Hazelcast, Infinispan)
*   Consensus Algorithms (Paxos, Raft)
*   Distributed Locks (Zookeeper, Redis)
*   Spring Boot and Spring Cloud for Microservices
*   Service Discovery (Consul, Eureka, Kubernetes)
*   Failover Mechanisms
*   [Distributed Transactions (2PC, Saga)](./distributed-transactions.md)
*   Event-Driven Architecture: Event Sourcing and CQRS
*   Logging and Distributed Tracing (ELK, Jaeger, Zipkin)
*   Monitoring and Metrics (Prometheus, Grafana, Micrometer)
*   Alerting Systems
*   Distributed Data Processing (Spark/Flink)
*   JVM Tuning

## 15. Meta Patterns (3)
*   Modeling system before coding (Event Storming, DDD, C4)
*   Pattern: Generate runnable examples to learn, then orchestrate AI (human verifies) - the gym loop
*   RAG (Retrieval-Augmented Generation) - chunk, embed, retrieve your docs to ground LLM answers

## 16. Concurrency (18 - from system_monarch thread)
*   Concurrency vs Parallelism
*   Processes vs Threads
*   Thread Lifecycle (NEW→RUNNABLE→RUNNING→BLOCKED→TERMINATED)
*   Race Condition
*   Mutex
*   Semaphore (counting)
*   Condition Variables
*   Coarse vs Fine-grained Locking
*   Reentrant Lock
*   Try-Lock
*   CAS (Compare-And-Swap) - lock-free foundation
*   Deadlock (4 Coffman conditions) vs Livelock
*   Signaling Pattern
*   Thread Pool
*   Producer-Consumer
*   Reader-Writer Lock
*   Thread-Safe Cache (LRU)
*   Blocking Queue

## 17. Low Level Design (LLD)
*   OOD
*   SOLID
*   Design patterns (Singleton, Factory, Observer)
*   Class diagrams
*   API design at code level

## 18. OOP & Design Patterns
*   OOP: Encapsulation, Inheritance, Polymorphism, Abstraction, SOLID
*   Creational: Singleton, Factory, Builder, Prototype
*   Start the catalog with [Abstract Factory](./abstract-factory.md): creating a family of related objects without naming their concrete classes; the two separate problems it solves (the client naming a concrete class, fixed by the abstract product; nothing keeping the products matched, fixed by the abstract factory); why the key word is "families"; the abstract product as the type the client binds to (and why Java forces the annotation); the abstract factory as the single source that keeps the set consistent; the asymmetric cost (a new family is cheap, a new product kind is expensive); and the book's class diagram
*   Structural: Adapter, Decorator, Proxy, Facade
*   Behavioral: Observer, Strategy, Command, State

## 19. Networking
*   TCP/IP
*   UDP
*   HTTP (1.1/2/3)
*   DNS
*   TLS/SSL
*   WebSockets
*   gRPC transport
*   Socket programming
*   Forward proxy (client-side, egress — hiding the client)
*   Reverse proxy (server-side, ingress — hiding the backend: Nginx, Caddy)
*   API Gateway (L7 reverse proxy + auth, throttling, versioning, aggregation — Kong, AWS API Gateway, Traefik)
*   Load balancer types (L4 vs L7, round-robin, least-connections, IP hash, sticky sessions, health checks, DNS LB vs LB vs ALB)

## 20. Hands-on Mono-repo - learn by building small projects

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

## 21. Frontend - for the full-stack TypeScript engineer

This roadmap treats full-stack breadth as the way to round out a TS profile: the FE topics below are the minimum to complement the backend core. Link each to a `problem -> solution` article like the backend ones. The JS/TS language core is non-negotiable for competence in a TS ecosystem.

### 21a. TypeScript - the language, not the tag (must-have)
*   Primitive vs structural typing, `type` vs `interface`
*   Narrowing, discriminated unions, `satisfies` operator
*   Generics (function, constraint, conditional types)
*   Utility types: `Omit/Pick/Partial/Record/ReturnType/Awaited`
*   JS runtime under the hood: event loop, call stack, microtasks vs macrotasks, closures, `this`, prototypes, async/await internals — the #1 TS interview lane after types
*   Two-way type safety across the API boundary (shared types front-to-back; `zod`/`tRPC` are the honest versions) — see [Static code analysis TypeScript](../software-engineering/static-code-analysis-typescript.md), [JS/TS questions](../software-engineering/js-ts-questions.md)
*   Why equality checks use `Object.is` — see [Object.is](../frontend/javascript-object-is.md)
*   Async/error typing: errors as types, not try/catch guessing

### 21b. React & rendering (the frontend baseline)
*   Declarative vs imperative — see [React: declarative vs imperative](../frontend/reactjs-declarative-vs-imperative.md)
*   Rendering models: MPA vs SPA vs hybrid, SSR/SSG/CSR/ISR per route, hydration — see [From MPA to SPA to Hybrid](../frontend/spa-vs-mpa.md)
*   Hooks data-fetching lifecycle — see [useEffect](../frontend/reactjs-use-effect.md)
*   Re-renders: why they happen, bailouts — see [memo](../frontend/reactjs-react-memo.md), [useCallback](../frontend/reactjs-use-callback.md), [useMemo](../frontend/reactjs-use-memo.md)
*   Prop drilling vs context vs state libraries — see [Re-renders: prop drilling vs context](../frontend/react-rerenders-prop-drilling-vs-context.md), [Context API](../frontend/reactjs-context-api.md)
*   Server Components / Next.js App Router (RSC on server, client islands, streaming)
*   State: local vs global vs server state (React Query/SWR) - server state is sync to cache, not component state

### 21c. Web performance (the differentiator)
*   Core Web Vitals: LCP/INP/CLS and what causes each
*   Bundle size: code-splitting, lazy loading, tree-shaking
*   Rendering cost: hydration, memoization, list virtualization
*   Browser HTTP caching, service workers, CDN
*   Browser storage: which store survives tab close, which goes to server — see [Browser Storage: Cookies, localStorage, sessionStorage, IndexedDB](../frontend/browser-storage.md)

### 21d. Security from the browser side
*   CORS / CSRF / XSS from the FE's vantage point
*   CSP, sanitization, hydration-injection risks
*   Never trust client input - validation is a server-boundary job too

### 21e. FE testing
*   Component tests (Testing Library: assert user behavior, not internals)
*   E2E (Playwright) - one happy path per user flow
*   Snapshot vs behavior tests - why snapshots rot

### 21f. AI integration (the 2027 premium, small but real)
*   FE/UX for AI: streaming responses, optimistic UI, feedback loops
*   Retrieval in the product: chunk/embed/retrieve to ground LLM answers — see [RAG](../artificial-intelligence/rag.mdx), [Hybrid Search](../artificial-intelligence/hybrid-search.md)
*   Work with AI agents as the default tool with human verification - same gym loop as the backend

## 22. Coding Interview Prep (DSA - the actual gate for a TS role)

The previous ~250 topics get you the *knowledge*; this lane gets you *through the screen*. The weed-out for a TS role is a DSA round (often the 45-min side by side with an LLM in the room). Patterns from the [LeetCode index](../computer-science/leetcode/index.mdx), practiced in TS:
*   Two pointers / sliding window — see [Valid Palindrome](../computer-science/leetcode/lc-125-valid-palindrome.md), [Longest Substring w/o Repeats](../computer-science/leetcode/lc-3-longest-substring-without-repeating-characters.md)
*   Hash maps: counting, grouping, "seen before" — see [Two Sum](../computer-science/leetcode/lc-1-two-sum.md), [Valid Anagram](../computer-science/leetcode/lc-242-valid-anagram.md)
*   Frequencies / top-k (heap) — see [Top K Frequent Elements](../computer-science/leetcode/lc-347-top-k-frequent-elements.md)
*   Arrays & intervals, prefix products — see [Container with Most Water](../computer-science/leetcode/lc-11-container-with-most-water.md), [Product of Array Except Self](../computer-science/leetcode/lc-238-product-of-array-except-self.md)
*   Sorting & two-sum style, encode/decode — see [3Sum](../computer-science/leetcode/lc-15-3sum.md), [Encode and Decode Strings](../computer-science/leetcode/lc-271-encode-and-decode-strings.md)
*   Greedy vs DP: when brute force then optimize — see [Greedy](../computer-science/leetcode/lc-greedy.md)
*   Trees/graphs traversal (BFS/DFS), recursion, backtracking
*   Big-O analysis on every solution: time first, space second
*   Meta-skill: say the approach BEFORE coding, walk through a small example, then code - the narration is 50% of the score

## 23. Interview Rounds - the shape of a real TS loop

Knowledge and DSA are necessary, not sufficient. This is the actual test harness, drill it in order:
*   Phone screen: live coding terminal, 30-45 min, one pattern max - you are selling the narration as much as the code
*   Technical screen: take-home or live "build a small thing" - your mono-repo projects are prep for this
*   System design round: "design X", 45-60 min - back-of-envelope, DB schema, caching, failure modes, always state the trade-off you are making (see [System Design](#6-system-design-16))
*   Pairing + depth round: real codebase, read existing code, find the bug, extend a feature - this is where "reading code" pays off
*   Behavioral: STAR stories - one story from event storming, one from the chaos plan, one from a production incident
*   Golden rule across all rounds: explain like a teacher, not a memorizer - say the trade-off, not just the pattern
*   The "why hire developers if AI builds everything" question — see [You Cannot Catch What You Cannot Read](../perspectives/you-cannot-catch-what-you-cannot-read.md) (delegating a spec = delegating hundreds of decisions; speed cuts both ways; the surviving skill is reading generated code and spotting the wrong choice, trained by the lock-duration/transaction fundamentals)

## Perspectives - the industry context around all of this

The catalog above is *what* to learn. These are takes on *why it matters and where it is going*, kept in the [Perspectives](../perspectives/overview.md) section. Read them alongside the plan for context, not as study material.

*   [The Bottleneck Moved](../perspectives/the-bottleneck-moved.md) - the bottleneck shifts from writing code to judgment; the scarce skill is deciding what correct means
*   [Developers Will Move Closer to the Customer](../perspectives/developers-closer-to-customer.md) - when coding gets cheap, understanding what to build is what is left, and that forces a conversation
*   [Ownership Stays With You](../perspectives/ownership-stays-with-you.md) - the agent ships, but you review it, ship it, and answer for it
*   [Own the Lifecycle, Not the Ticket](../perspectives/own-the-lifecycle-not-the-ticket.md) - a ticket tells you what to type; a feature asks you to own the whole arc
*   [The Architect Could Always Code](../perspectives/architect-could-always-code.md) - three eras of software, and why the unease is the bottleneck moving rather than the skill dying
*   [The Wave Does Not Wait](../perspectives/the-wave-does-not-wait.md) - shifts happen whether you accept them or not; your choice is which side of the wave you are on
*   [Where the Value Actually Sits](../perspectives/where-the-value-actually-sits.md) - the leverage is the retrieval, the tools, the loop, and the judgment that supervises them
*   [You Can Slow Time](../perspectives/you-can-slow-time.md) - attention dilates perceived time, which matters when the incident is live and the pressure is high
*   [You Cannot Catch What You Cannot Read](../perspectives/you-cannot-catch-what-you-cannot-read.md) - delegating a spec delegates hundreds of decisions; the surviving skill is reading generated code and spotting the wrong choice
*   **[The Software Factory Mirage](../perspectives/the-software-factory-mirage.md)** - the "coding is solved" narrative and the "you are holding it wrong" rebuttal describe the same tool; choose your own integration level and protect the domain expertise that lets you supervise it

---

**Total: ~271 topics** (deduplicated from ~305; every topic now appears exactly once, duplicates removed). AWS services, Well-Architected, the 14-day chaos plan and the mono-repo are plans/action-items, not topics. Work the topics in the **Learning Path** order at the top, roughly 2-3 deep per day (Why-First + runnable), and finish each phase by building its mono-repo project. Each will be a `knowledge-base` article with StackBlitz/Supabase playground.

*Last updated: 2026-09-21 - added dependency-ordered Learning Path and gap topics (outbox/inbox, SLI/SLO, Little's Law, deployment strategies, zero-downtime migrations); linked the Perspectives reading list and added The Software Factory Mirage*
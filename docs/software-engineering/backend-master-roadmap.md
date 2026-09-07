# Backend Master Roadmap - Full Topic List

This is the consolidated list from all sessions, grouped for Why-First learning (problem it solves, when to use, runnable example). Each will become a `problem -> solution` article with a live playground.

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
*   UNION vs UNION ALL
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

## 3. API Design (9)
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

## 5. Caching & Storage (10)
*   [Caching: how it works + 5 layers + strategies](../caching/how-it-works.md) and [Redis vs Memcached](../caching/how-it-works.md#8-redis-vs-memcached)
*   [Why The Cache: even when indexes are fast](../caching/why-cache.md) (the index speeds up the lookup, the cache removes the repeated work)
*   Cache stampede — see [Cache Stampede: when cache expires and DB falls over](../caching/cache-stampede.md) (mutex lock, early recompute, [Stale is Eventual](../caching/stale-is-eventual.md), [Strong vs Eventual Cache](../caching/strong-vs-eventual-cache.md))
*   Thundering herd — see [Thundering Herd: the retry storm that took down Braintree](../thundering-herd/thundering-herd.md) (fixed-interval retries retrample, fix is jitter + concurrency limit — category [overview](../thundering-herd/overview.md))
*   Hot partition
*   CDN (Day 2)
*   Caching
*   Cache Invalidation
*   Session Storage vs Local Storage (vs Cookies/IndexedDB) — see [Browser Storage: Cookies, localStorage, sessionStorage, IndexedDB](../frontend/browser-storage.md) (which store survives tab close, which goes to server, which blocks)
*   Distributed file storage
*   Tombstone records
*   Bloom filters

## 6. System Design (15)
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

## 7. Security (15+ - OWASP Top 10)
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
*   Secrets management
*   Environment variables
*   Don't log secrets

## 8. Distributed Systems - Senior 13 (2026)
*   Event sourcing
*   Saga pattern
*   Bulkhead isolation
*   Backpressure
*   Thundering herd — see [Thundering Herd: the retry storm that took down Braintree](../thundering-herd/thundering-herd.md) (fixed-interval retries retrample, why it is not backpressure — fix is jitter + concurrency limit)
*   Write-ahead logging
*   Tombstone records
*   Bloom filters
*   Vector clocks
*   Gossip protocol
*   Consistent hashing (duplicate)
*   Read-your-writes consistency

## 9. Production & Resilience (12)
*   Production Insights — see [overview](../production-insights/overview.md), [Cache Stampede](../caching/cache-stampede.md), [Thundering Herd](../thundering-herd/thundering-herd.md), [Stale is Eventual](../caching/stale-is-eventual.md), [Strong vs Eventual Cache](../caching/strong-vs-eventual-cache.md)
*   Dead letter queue
*   Circuit breaker
*   Load Shedding
*   Read replica lag
*   Retry storm / Thundering herd — see [Thundering Herd: the retry storm that took down Braintree](../thundering-herd/thundering-herd.md) (second wave retramples; fix is jitter + break coupling, not just queuing)
*   Write amplification
*   Connection Pooling
*   Thread Pools & Async Processing
*   Backpressure & Rate Limiting
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

## 10. Async Primitives (5)
*   Queue vs Stream vs Webhook vs Cron job
*   Kafka vs RabbitMQ - how to choose (log vs queue, replay, ordering, throughput)

## 11. Cloud & Deployment (copied from AWS Cloud Services + 14-day chaos plan)
*   Cloud deployment
*   Cloud services
*   Redundancy
*   Backups (PITR)
*   Secrets management
*   Environment variables
*   Configuration management
*   Docker/Kubernetes
*   CI/CD
*   Production deployment strategies

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

## 12. Testing (4)
*   Unit tests
*   Integration tests
*   E2E tests
*   Mocking and stubbing
*   Debugging techniques

## 13. Fundamentals (HTTP etc. - ~40 from your last list)
*   HTTP methods
*   Status codes
*   Request/Response headers
*   Authentication/Authorization
*   JWT/Session/Cookies/OAuth 2.0
*   REST/GraphQL/WebSockets/Server-side rendering
*   Rendering models: MPA vs SPA vs hybrid — see [From MPA to SPA to Hybrid](../frontend/spa-vs-mpa.md) (when each model wins, SSR/SSG/CSR/ISR per route, hydration, gated inventory pattern)
*   JavaScript equality: == vs === vs Object.is vs SameValueZero — see [Object.is](../frontend/javascript-object-is.md) (NaN/-0 edge cases, SameValue vs SameValueZero, why React uses Object.is for bailouts)
*   Database design/SQL/NoSQL
*   ORM
*   Connection pooling
*   Transactions
*   Migrations/Seeding
*   Caching/Redis/Memcached/CDN
*   Rate limiting
*   API Gateway/Service mesh
*   Docker/K8s

## 13b. Language Choice
*   When to use Node (I/O-heavy, JS everywhere) vs Python (data/ML, Django/FastAPI) vs Java (enterprise, Spring) vs Go (concurrency, low latency) vs Rust (systems, safety) - pick by team, hiring, and workload, not hype

## 14. Senior Java 40 - not big individually, big career boost
*   CAP Theorem
*   Consistency Models
*   Distributed System Architectures
*   Socket Programming (TCP/IP, UDP)
*   HTTP and RESTful APIs
*   RPC (gRPC, Thrift, RMI)
*   Dependency Injection Container (Spring, Guice, Inversify) - lifecycle, scopes, auto-wiring
*   Message Queues (Kafka, RabbitMQ, JMS)
*   Apache Kafka for Streaming
*   Zookeeper for Coordination (x2)
*   Java Concurrency (ExecutorService, Future, ForkJoinPool)
*   Thread Safety and Synchronization
*   Java Memory Model
*   Akka for Actor-based Concurrency
*   Distributed Databases (Cassandra, MongoDB, HBase)
*   Data Sharding and Partitioning
*   Caching Mechanisms (Redis, Memcached, Ehcache)
*   In-memory Data Grids (Hazelcast, Infinispan)
*   Consensus Algorithms (Paxos, Raft)
*   Distributed Locks (Zookeeper, Redis)
*   Spring Boot and Spring Cloud for Microservices
*   Service Discovery (Consul, Eureka, Kubernetes)
*   API Gateways (Zuul, NGINX, Spring Cloud Gateway)
*   Inter-service Communication (REST, gRPC, Kafka)
*   Circuit Breakers and Retry Patterns (Hystrix, Resilience4j)
*   Load Balancing (NGINX, Kubernetes, Ribbon)
*   Failover Mechanisms
*   Distributed Transactions (2PC, Saga)
*   Event-Driven Architecture: Event Sourcing and CQRS
*   Logging and Distributed Tracing (ELK, Jaeger, Zipkin)
*   Monitoring and Metrics (Prometheus, Grafana, Micrometer)
*   Alerting Systems
*   Authentication and Authorization (OAuth, JWT)
*   Encryption (SSL/TLS)
*   Rate Limiting and Throttling
*   Cluster Management: Kubernetes
*   Cloud-Native (AWS/GCP/Azure, AWS Lambda)
*   Distributed Data Processing (Spark/Flink)
*   GraphQL
*   JVM Tuning

## 15. Meta Patterns (3)
*   Modeling system before coding (Event Storming, DDD, C4)
*   Pattern: Generate runnable examples to learn, then orchestrate AI (human verifies) - the gym loop
*   RAG (Retrieval-Augmented Generation) - chunk, embed, retrieve your docs to ground LLM answers

## 16. Concurrency - 20 must-know (from system_monarch thread)
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

---

**Total: ~120 topics** (deduplicated, including AlgoMaster 30). Start with 3/day deep (Why-First + runnable) for your 10-day sprint. Each will be a `knowledge-base` article with StackBlitz/Supabase playground.

*Last updated: 2026-09-06 - branch docs/caching-fundamentals*

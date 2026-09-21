---
sidebar_label: "Changelog"
sidebar_position: 3
---

# Changelog

All notable changes to the Knowledge Base are documented here, date by date.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this wiki follows no versioning — each date is a release.

## Unreleased

### Added

- [You Cannot Catch What You Cannot Read](./perspectives/you-cannot-catch-what-you-cannot-read.md) - why delegating a spec to AI means delegating hundreds of small decisions, why AI speed cuts both ways (build and break), and why the surviving skill is the ability to read generated code and spot the wrong choice, demonstrated with the lock-duration/2PC nuance.
- [Do Concurrent UPDATEs Serialize in Autocommit? Yes, and Here's the Catch](./software-engineering/serialized-updates-autocommit.md) - why concurrent UPDATEs on the same row always serialize (row-level exclusive lock at FOR NO KEY UPDATE strength), what `BEGIN` really changes (the size of the lock window), and why the real autocommit danger is the read-then-write race.
- [Locks Only Live as Long as Your Transaction: What BEGIN Really Does](./software-engineering/lock-duration-and-begin.md) - why a row lock is gone the moment the transaction ends, what `BEGIN` actually does, why autocommit releases locks instantly, and why row locks do not block plain readers (MVCC).
- [Distributed Transactions: When 2PC Fails and Saga Is the Answer](./software-engineering/distributed-transactions.md) - the two mechanisms for atomicity across services, why two-phase commit blocks and couples, and when a saga with compensating transactions is the answer.
- [Hybrid Search](./artificial-intelligence/hybrid-search.md) - how a retriever combines keyword search, semantic search, and metadata filtering into one final ranking, with the strengths of each technique and how to tune the balance.
- [Keyword Search: Matching the Words](./artificial-intelligence/keyword-search.md) - the bag-of-words sparse-vector technique behind retrieval, from simple presence scoring through length normalization and TF-IDF to BM25's saturation, length normalization, and tunable hyperparameters.
- [Metadata Filtering: The Retriever's Rigid Net](./artificial-intelligence/metadata-filtering.md) - the rigid-criteria technique for narrowing retrieval results, with the spreadsheet/SQL mental model, user-driven filters, and its strengths vs limitations.
- [UNION vs UNION ALL](./databases/union-vs-union-all.md) - combining result sets, the hidden dedup cost, the ORDER BY/LIMIT gotcha, and what columns the dedup compares.
- [INTERSECT and EXCEPT](./databases/intersect-except.md) - rows in both queries vs rows in one but not the other, with data reconciliation use cases.

## [2026-09-09]

### Added

- [AI Model vs. Agentic Harness](./artificial-intelligence/ai-model-vs-agentic-harness.mdx) - where the reasoning model ends and the harness (tools, memory, loop) begins, from a video transcript ([#105](https://github.com/labeebahmad201/knowledge-base/pull/105)).
- AI navbar link in the top navigation.

### Changed

- Sidebar categories now collapse by default for a cleaner nav.

### Removed

- Agents article removed.

## [2026-09-08]

### Added

- [AI Agent Hallucination](./artificial-intelligence/agent-hallucination.mdx) - why agents invent facts, and how to verify their outputs, from a video transcript ([#104](https://github.com/labeebahmad201/knowledge-base/pull/104)).

## [2026-09-07]

### Added

- [API Versioning](./api/api-versioning.md) - compatible vs breaking changes and the URI/header/media-type strategies ([#101](https://github.com/labeebahmad201/knowledge-base/pull/101)).
- [SQL Views: Stored Queries That Act Like Tables](./databases/views.md) - views, materialized views, `WITH CHECK OPTION`, and `security_barrier` ([#100](https://github.com/labeebahmad201/knowledge-base/pull/100)).
- Top-level [Caching](./caching/index.md) section ([#99](https://github.com/labeebahmad201/knowledge-base/pull/99)).
- [Thundering Herd](./thundering-herd/thundering-herd.md) category with the Braintree case study ([#102](https://github.com/labeebahmad201/knowledge-base/pull/102)).

### Changed

- Backend Master Roadmap now links the Thundering Herd case study ([#103](https://github.com/labeebahmad201/knowledge-base/pull/103)).

### Removed

- CS Fundamentals stub page ([#98](https://github.com/labeebahmad201/knowledge-base/pull/98)).

## [2026-09-06]

### Added

- [The Wave Does Not Wait](./perspectives/the-wave-does-not-wait.md) - on resisting industry shifts ([#96](https://github.com/labeebahmad201/knowledge-base/pull/96)).
- [Browser Storage](./frontend/browser-storage.md) - cookies, localStorage, sessionStorage, IndexedDB ([#94](https://github.com/labeebahmad201/knowledge-base/pull/94)).
- [The Architect Could Always Code](./perspectives/architect-could-always-code.md) - notes from Orosz and Ubl ([#93](https://github.com/labeebahmad201/knowledge-base/pull/93)).
- [Ownership Stays With You](./perspectives/ownership-stays-with-you.md) and [Own the Lifecycle, Not the Ticket](./perspectives/own-the-lifecycle-not-the-ticket.md) ([#91](https://github.com/labeebahmad201/knowledge-base/pull/91)).
- [Perspectives](./perspectives/overview.md) category with [The Bottleneck Moved](./perspectives/the-bottleneck-moved.md) and [Developers Closer to the Customer](./perspectives/developers-closer-to-customer.md) ([#90](https://github.com/labeebahmad201/knowledge-base/pull/90)).
- [Production Insights](./production-insights/overview.md) category with the cache stampede trio ([#88](https://github.com/labeebahmad201/knowledge-base/pull/88)).

### Changed

- Backend Master Roadmap links Production Insights ([#92](https://github.com/labeebahmad201/knowledge-base/pull/92)).

## [2026-09-05]

### Added

- [Backend Master Roadmap](./software-engineering/backend-master-roadmap.md) - the consolidated topic list grouped by why-first learning ([#84](https://github.com/labeebahmad201/knowledge-base/pull/84)).
- [REST APIs](./api/rest.md) under a new API category ([#83](https://github.com/labeebahmad201/knowledge-base/pull/83)).

### Changed

- Roadmap links the design-vs-architecture distinction ([#87](https://github.com/labeebahmad201/knowledge-base/pull/87)).
- The write-article skill now requires technology context for every topic ([#86](https://github.com/labeebahmad201/knowledge-base/pull/86)).

## [2026-09-04]

### Added

- Top-level [Databases](./databases/overview.md) section like Frontend ([#80](https://github.com/labeebahmad201/knowledge-base/pull/80)).
- [Database Consistency & Availability Comparison](./databases/database-comparison.md), [Postgres MVCC](./databases/postgresql-mvcc.md), and [Postgres Locks](./databases/postgresql-locks.md) to fix broken links ([#77](https://github.com/labeebahmad201/knowledge-base/pull/77)).
- [SQL - Important Questions](./databases/sql-introduction.md) with Supabase setup and runnable examples ([#76](https://github.com/labeebahmad201/knowledge-base/pull/76)).

### Changed

- SQL Introduction pinned to the top of the Software Engineering sidebar ([#78](https://github.com/labeebahmad201/knowledge-base/pull/78)).

## [2026-09-02]

### Added

- [Object.is](./frontend/javascript-object-is.md) - with React bailout examples ([#71](https://github.com/labeebahmad201/knowledge-base/pull/71)).
- [Re-renders: prop drilling vs context](./frontend/react-rerenders-prop-drilling-vs-context.md) ([#70](https://github.com/labeebahmad201/knowledge-base/pull/70)).
- [Agentic Engineering](./artificial-intelligence/agentic-engineering.md) ([#69](https://github.com/labeebahmad201/knowledge-base/pull/69)).
- [React Context API](./frontend/reactjs-context-api.md) with a runnable StackBlitz theme demo ([#68](https://github.com/labeebahmad201/knowledge-base/pull/68)).

### Changed

- React.memo article emphasizes render vs DOM update ([#74](https://github.com/labeebahmad201/knowledge-base/pull/74)) and gains StackBlitz demos ([#73](https://github.com/labeebahmad201/knowledge-base/pull/73)).
- Object.is expanded with a memo shallow per-key deep dive ([#72](https://github.com/labeebahmad201/knowledge-base/pull/72)).

## [2026-08-31]

### Added

- [The Evolving Developer](./artificial-intelligence/the-evolving-developer.md) - AI reshaping software engineering ([#67](https://github.com/labeebahmad201/knowledge-base/pull/67)).
- [SPA vs MPA](./frontend/spa-vs-mpa.md) evolution and the gated preview pattern ([#66](https://github.com/labeebahmad201/knowledge-base/pull/66)).

## [2026-08-30]

### Added

- [Declarative vs Imperative](./frontend/reactjs-declarative-vs-imperative.md) ([#65](https://github.com/labeebahmad201/knowledge-base/pull/65)).

## [2026-08-24]

### Added

- [React useEffect](./frontend/reactjs-use-effect.md) ([#64](https://github.com/labeebahmad201/knowledge-base/pull/64)).

## [2026-08-23]

### Added

- [Frontend](./frontend/overview.md) section with React memoization topics ([#62](https://github.com/labeebahmad201/knowledge-base/pull/62)).
- [How MVC Layer Structure Becomes a Big Ball of Mud](./software-engineering/mvc-big-ball-of-mud.md) ([#61](https://github.com/labeebahmad201/knowledge-base/pull/61)).
- JS module system question and expanded request coalescing article ([#59](https://github.com/labeebahmad201/knowledge-base/pull/59)).
- [Logs](./software-engineering/error-log.md) page for the personal hand-coding practice session ([#58](https://github.com/labeebahmad201/knowledge-base/pull/58)).

### Changed

- useCallback and memo re-render interaction clarified ([#63](https://github.com/labeebahmad201/knowledge-base/pull/63)).

### Removed

- System design and scalability stub page ([#60](https://github.com/labeebahmad201/knowledge-base/pull/60)).

## [2026-08-22]

### Added

- [Sagas](./software-engineering/sagas.md) - transactions across services ([#56](https://github.com/labeebahmad201/knowledge-base/pull/56)).
- [Top K Frequent Elements](./computer-science/leetcode/lc-347-top-k-frequent-elements.md) with heap notes ([#55](https://github.com/labeebahmad201/knowledge-base/pull/55)).
- Generators section to JS/TS questions ([#57](https://github.com/labeebahmad201/knowledge-base/pull/57)).

## [2026-08-21]

### Added

- F-strings explanation and comparison with older methods ([#54](https://github.com/labeebahmad201/knowledge-base/pull/54)).
- Group Anagrams character-count solution ([#53](https://github.com/labeebahmad201/knowledge-base/pull/53)).

## [2026-08-20]

### Added

- [AI in the Software Development Lifecycle](./artificial-intelligence/engineering.md) ([#51](https://github.com/labeebahmad201/knowledge-base/pull/51)).
- [Software Development Stories](./software-engineering/development-stories.md) with lessons, plus six more microservices/abstraction stories ([#49](https://github.com/labeebahmad201/knowledge-base/pull/49), [#50](https://github.com/labeebahmad201/knowledge-base/pull/50)).

### Changed

- Python questions and ecosystem restored in JS/TS questions ([#52](https://github.com/labeebahmad201/knowledge-base/pull/52)).

## [2026-08-19]

### Added

- [Debugging a Down System](./software-engineering/debugging-down-system.md) ([#48](https://github.com/labeebahmad201/knowledge-base/pull/48)).
- `this` keyword and `use strict` sections in JS/TS questions ([#47](https://github.com/labeebahmad201/knowledge-base/pull/47)).
- Serialization, CPython, and free-threaded GIL sections in the Python guide ([#46](https://github.com/labeebahmad201/knowledge-base/pull/46)).

## [2026-08-18]

### Added

- [JS/TS Interview Questions](./software-engineering/js-ts-questions.md) ([#42](https://github.com/labeebahmad201/knowledge-base/pull/42)).
- Python section, `enumerate`, and when-to-use guidance for debounce vs throttle within it ([#43](https://github.com/labeebahmad201/knowledge-base/pull/43), [#44](https://github.com/labeebahmad201/knowledge-base/pull/44), [#45](https://github.com/labeebahmad201/knowledge-base/pull/45)).

## [2026-08-11]

### Added

- [Building Public APIs for Modules Using Interfaces](./software-engineering/module-public-api-interface.md) ([#39](https://github.com/labeebahmad201/knowledge-base/pull/39)).

## [2026-08-10]

### Added

- [Shopify Modular Monolith](./software-engineering/shopify-modular-monolith.md), [Aggregates: Behavior and Querying](./software-engineering/aggregates-behavior-and-querying.md), and [DDD Starts From Business, Not Database](./software-engineering/ddd-starts-from-business-not-database.md) ([#38](https://github.com/labeebahmad201/knowledge-base/pull/38)).
- [Parallel Actors and Concurrency](./software-engineering/parallel-actors-and-concurrency.md) and Redis data ownership article ([#37](https://github.com/labeebahmad201/knowledge-base/pull/37)).
- [Architecture Styles and Event Storming](./software-engineering/architecture-styles-and-event-storming.md) and [Refactoring](./software-engineering/refactoring.md) ([#35](https://github.com/labeebahmad201/knowledge-base/pull/35)).
- [Aggregate Sizing](./software-engineering/aggregate-sizing.md), [Transaction Locking](./software-engineering/transaction-locking.md), and [Strong vs Eventual Consistency](./software-engineering/strong-vs-eventual-consistency.md), plus the Insights page ([#33](https://github.com/labeebahmad201/knowledge-base/pull/33)).
- [DDD Process](./software-engineering/ddd-process.md) with the bounded contexts series ([#32](https://github.com/labeebahmad201/knowledge-base/pull/32)).

## [2026-08-08]

### Added

- [The AI Application Stack](./artificial-intelligence/opencode-skills.md) ([#31](https://github.com/labeebahmad201/knowledge-base/pull/31)).

## [2026-08-07]

### Added

- [MVC: When to Use It](./software-engineering/mvc-when-to-use.md) ([#30](https://github.com/labeebahmad201/knowledge-base/pull/30)).
- [Decoupling Case Studies](./software-engineering/decoupling-case-studies.md) ([#29](https://github.com/labeebahmad201/knowledge-base/pull/29)).
- [Decoupling Moves Complexity](./software-engineering/decoupling-moves-complexity.md) ([#28](https://github.com/labeebahmad201/knowledge-base/pull/28)).

## [2026-08-06]

### Added

- [Abstractions Are Contextual](./software-engineering/abstractions-are-contextual.md) ([#27](https://github.com/labeebahmad201/knowledge-base/pull/27)).
- [Why Branches Are Deleted After Merge](./software-engineering/delete-branch-after-merge.md) ([#26](https://github.com/labeebahmad201/knowledge-base/pull/26)).
- [Architecture Decision Records](./software-engineering/architecture-decision-records.md) - why ADRs happen but design decisions do not ([#25](https://github.com/labeebahmad201/knowledge-base/pull/25)).

## [2026-08-01]

### Added

- Books section with DDIA chapter notes.

## [2026-07-31]

### Changed

- [Event Storming to Bounded Contexts](./software-engineering/event-storming-read-models-boundaries.md) refined ([#23](https://github.com/labeebahmad201/knowledge-base/pull/23)).

## [2026-07-30]

### Added

- [Event Storming to Bounded Contexts](./software-engineering/event-storming-read-models-boundaries.md) - the full workflow from workshop output to documented bounded contexts ([#22](https://github.com/labeebahmad201/knowledge-base/pull/22)).

## [2026-07-29]

### Added

- [What Makes Coupling Loose](./software-engineering/what-makes-coupling-loose.md) ([#20](https://github.com/labeebahmad201/knowledge-base/pull/20)).
- [Module Wiring: Ports and Adapters](./software-engineering/module-wiring-ports-adapters.md) ([#19](https://github.com/labeebahmad201/knowledge-base/pull/19)).
- [Deployment Is a Configuration Choice](./software-engineering/deployment-configuration-choice.md) ([#18](https://github.com/labeebahmad201/knowledge-base/pull/18)).
- [One Model Per Context](./software-engineering/one-model-per-context.md) ([#17](https://github.com/labeebahmad201/knowledge-base/pull/17)).
- [Capability-First Design](./software-engineering/capability-first-design.md) ([#16](https://github.com/labeebahmad201/knowledge-base/pull/16)).
- [Git Squash and Merge](./software-engineering/git-squash-and-merge.md) ([#15](https://github.com/labeebahmad201/knowledge-base/pull/15)).
- [Cross-Module Queries](./software-engineering/cross-module-queries.md) ([#12](https://github.com/labeebahmad201/knowledge-base/pull/12)).

### Changed

- Overview page gained an article filter with a search bar; search upgraded from fuzzy to a simple includes search; categorized software-engineering docs into architecture and testing headings ([#13](https://github.com/labeebahmad201/knowledge-base/pull/13)).

### Removed

- Empty design-architecture page ([#14](https://github.com/labeebahmad201/knowledge-base/pull/14)).

## [2026-07-28]

### Added

- [Seams and Testability](./software-engineering/seams-and-testability.md) with TypeScript examples ([#8](https://github.com/labeebahmad201/knowledge-base/pull/8)).
- [The Interface-Implementation Pair](./software-engineering/interface-implementation-pair.md) anti-pattern ([#9](https://github.com/labeebahmad201/knowledge-base/pull/9)).
- [When to Abstract](./software-engineering/when-to-abstraction.md) ([#8](https://github.com/labeebahmad201/knowledge-base/pull/8)).
- [Architecture Is Not the Starting Point](./software-engineering/architecture-is-not-the-starting-point.md) ([#7](https://github.com/labeebahmad201/knowledge-base/pull/7)).
- [Testing Modular Monolith](./software-engineering/testing-modular-monolith.md) with the integration test rollback pattern ([#6](https://github.com/labeebahmad201/knowledge-base/pull/6)).
- [Modular Monolith](./software-engineering/modular-monolith.md), [Monorepo](./software-engineering/monorepo.md), and [Architecture by Neglect](./software-engineering/architecture-by-neglect.md) ([#4](https://github.com/labeebahmad201/knowledge-base/pull/4)).
- [When the Monolith Breaks](./software-engineering/when-the-monolith-breaks.md) with real-world cost data ([#3](https://github.com/labeebahmad201/knowledge-base/pull/3)).
- [Cohesion: Capability vs Layer](./software-engineering/cohesion-capability-vs-layer.md), [Third-Party Coupling](./software-engineering/third-party-coupling.md), and the distributed monolith anti-pattern section ([#2](https://github.com/labeebahmad201/knowledge-base/pull/2)).

## [2026-07-27]

### Added

- [Monolith vs Microservices](./software-engineering/monolith-vs-microservices.md) ([#1](https://github.com/labeebahmad201/knowledge-base/pull/1)).

## [2026-07-08]

### Added

- [PostgreSQL Table and Row Locks](./databases/select-vs-write-locks.md).
- [Database Indexing](./databases/indexing.md) and [The "Not Equal" Index Anti-Pattern](./databases/not-equal-index.md).
- Mermaid diagram support across the docs.

### Changed

- Databases section reorganized with a category index.

## [2026-06-15]

### Added

- AI Agents and AI Engineering articles - prompt/context/harness engineering, human judgment & verification, and Software 3.0 notes.
- PR guidelines skill and the Product section.
- Leetcode search bar on the index page.

## [2026-06-13]

### Added

- Initial commit with LeetCode solutions, the Python cheat sheet, and the site scaffold.
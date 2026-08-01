# Designing Data-Intensive Applications

Chapter-by-chapter notes on *Designing Data-Intensive Applications* (Martin Kleppmann, 2017).

DDIA is a book about data systems: how they work internally (design) and how those mechanics constrain the shape of the whole system (architecture). It does not teach boundaries or team structure, but it explains the mechanical realities that any architecture must respect.

## Chapters

- [Chapter 1: Reliable, Scalable, and Maintainable Applications](/docs/software-engineering/books/ddia/ch1-reliable-scalable-maintainable) - The three properties every data system needs, and what each actually requires of you.
- [Chapter 2: Data Models and Query Languages](/docs/software-engineering/books/ddia/ch2-data-models-query-languages) - Relational, document, and graph models, and how the model shapes what is easy or hard.
- [Chapter 3: Storage and Retrieval](/docs/software-engineering/books/ddia/ch3-storage-retrieval) - Log-structured vs page-oriented storage, LSM-trees, B-trees, and how engines decide.
- [Chapter 4: Encoding and Evolution](/docs/software-engineering/books/ddia/ch4-encoding-evolution) - Formats for passing data and how systems change while staying compatible.
- [Chapter 5: Replication](/docs/software-engineering/books/ddia/ch5-replication) - Why replicate, single-leader vs multi-leader vs leaderless, and consistency tradeoffs.
- [Chapter 6: Partitioning](/docs/software-engineering/books/ddia/ch6-partitioning) - How to split data across nodes and the challenges each strategy brings.
- [Chapter 7: Transactions](/docs/software-engineering/books/ddia/ch7-transactions) - What transactions actually guarantee and when the guarantees break.
- [Chapter 8: The Trouble with Distributed Systems](/docs/software-engineering/books/ddia/ch8-trouble-with-distributed-systems) - Unreliable networks, clocks, and why distributed systems fail.
- [Chapter 9: Consistency and Consensus](/docs/software-engineering/books/ddia/ch9-consistency-consensus) - Linearizability, ordering guarantees, and how consensus is actually achieved.
- [Chapter 10: Batch Processing](/docs/software-engineering/books/ddia/ch10-batch-processing) - MapReduce, joins at scale, and the Unix-philosophy ancestry.
- [Chapter 11: Stream Processing](/docs/software-engineering/books/ddia/ch11-stream-processing) - Event streams, time windows, and stream joins.
- [Chapter 12: The Future of Data Systems](/docs/software-engineering/books/ddia/ch12-future-of-data-systems) - Integrating batch and stream, and the tools for building reliable systems.

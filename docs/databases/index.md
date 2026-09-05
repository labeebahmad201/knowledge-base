# Databases

## PostgreSQL

- [Table and Row Locks](./select-vs-write-locks) - How PostgreSQL lock modes work at table and row levels, and which operations conflict with each other.

- [Database Indexing](./indexing) - Why databases need indexes, how different index structures work (B-tree, Hash, GiST, GIN), and how to choose the right one for your workload.

- [The Not-Equal Index Anti-Pattern](./not-equal-index) - Why `!=` queries bypass your indexes, and how to rewrite them for performance.

# CS Fundamentals

## Time & Space Complexity

Big-O, amortized analysis.

## Data Structures

Arrays, linked lists, stacks, queues, heaps, hash tables, trees (BST, AVL/red-black), tries, graphs.

## Algorithms

Sorting, searching, BFS, DFS, shortest path, topological sort, recursion, dynamic programming, greedy algorithms.

## Concurrency

Threads, locks, deadlocks, race conditions.

## Memory Model

Stack vs heap, garbage collection vs manual memory.

## Operating Systems

Processes, scheduling, virtual memory, I/O.

### Process vs Thread

- **Process**: independent program in execution; gets its own dedicated virtual address space (sandbox), file descriptors, and PID; isolated — Process A cannot access Process B's memory; to share data between processes you need IPC (pipes, sockets, shared memory segments) which is slower but safe; one process crashing can't corrupt another
- **Thread**: unit of execution inside a process; ALL threads in a process share the same memory space — they literally point to the same physical memory, no copying needed; thread A writes a variable, thread B sees it instantly — this is why threads are fast for communication but dangerous (need mutexes/locks to avoid race conditions); context switching between threads is cheap because they share the same address space (no TLB flush); downside: one thread writing bad memory can crash the entire process

**Analogy**: process = a house with its own address and walls; threads = people living in that house sharing the kitchen and furniture

**Why it matters**: Node.js is single-threaded for JS execution (event loop) but uses a thread pool (libuv) for I/O; PostgreSQL spawns a process per connection (not thread); Go uses goroutines (lightweight user-space threads); when debugging — `ps aux` shows processes, `top -H` shows threads

## Networking

TCP/UDP, DNS, HTTP, TLS.

## Compilation

Compilation vs interpretation; type systems (static, dynamic, structural, nominal).

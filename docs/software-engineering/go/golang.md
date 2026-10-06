---
sidebar_position: 1
---

# Go (Golang)

Go is a statically typed, compiled language built at Google by Robert Griesemer, Rob Pike, and Ken Thompson, designed for fast builds, controlled dependencies, and concurrency. This page is the hub for the Go article series; each topic below is its own short page.

## Language fundamentals

- [Variables and type inference](./go-variables.md) - `var` vs `:=`, and how Go keeps static typing without the ceremony.
- [Constants](./go-constants.md) - `const`, the block form, untyped constants, and why they cannot use `:=`.
- [Bit-shift operators](./go-bit-shift-operators.md) - expressing powers of two and bit masks with the `<<` and `>>` operators.
- [Functions, multiple return values, and named results](./go-functions.md) - the `(value, error)` idiom and bare returns.
- [Function values (anonymous functions)](./go-function-values.md) - functions as values, closures, callbacks.
- [Printing: `fmt` vs the built-in `print`](./go-printing-fmt.md) - `Println`, `Printf`, and `Sprintf`.
- [Packages and the `main` entry point](./go-packages.md) - `package main`, `func main`, and package naming.
- [Imports and code location (GOPATH)](./go-imports-gopath.md) - import paths, `go get`, and the `src`/`pkg`/`bin` layout.
- [Exported names (the capital letter rule)](./go-exported-names.md) - Go's `public`/`private` replacement.
- [Pointers](./go-pointers.md) - `&`, `*`, no pointer arithmetic, and pointer receivers.
- [Mutability: pass by value vs pass by reference](./go-mutability.md) - why your function did not change your variable.

## Types and data

- [Basic types](./go-basic-types.md) - `bool`, `string`, the numeric types, and the `byte`/`rune` aliases.
- [Type conversion (and the `string(int)` gotcha)](./go-type-conversion.md) - `T(v)` and why `string(65)` is `"A"`, not `"65"`.
- [Structs](./go-structs.md) - fields, keyed vs positional literals, zero values, and `&T{}` vs `new(T)`.
- [Defined types: adding methods to types you do not own](./go-defined-types.md) - `type T U` vs `type T = U`, what the underlying type gives you, and compile-time type safety.

## Methods and object-oriented style

- [Methods and method receivers](./go-methods-and-receivers.md) - defining methods on types, value vs pointer receivers, method sets, and why `v.Scale(5)` works without `&`.
- [Code organization](./go-code-organization.md) - the package is one directory, methods can live in any file, and a readable layout for types, functions, and methods.

## Interfaces and composition

- [Interfaces](./go-interfaces.md) - method signatures only, implicit satisfaction, and Go's polymorphism.
- [Implicit interfaces and interface composition](./go-implicit-interfaces.md) - why there is no `implements` keyword, how decoupling works, and embedding interfaces such as `io.ReadWriter`.
- [Type assertions and type switches](./go-type-assertions.md) - the comma-ok form and recovering a concrete value from `interface{}`.
- [Composition (struct embedding)](./go-composition.md) - embedding structs and pointers, method promotion.

## Errors

- [Errors: the `error` interface and returning errors](./go-errors.md) - the built-in `error` interface, custom error types, `fmt` formatting, and wrapping with `%w`.
- [`defer`, `panic`, and `recover`](./go-panic) - `defer` for guaranteed cleanup and its three rules, `panic` unwinding the stack, `recover` only inside a deferred function, and why the two belong in different functions.

## Modules and API evolution

- [Modules, packages, and type aliases](./go-modules-and-type-aliases.md) - `go.mod`, defined types vs aliases, and safe API migration across packages.

## Concurrency

- [Goroutines: why `main` exits before your goroutine finishes](./go-goroutines-and-main-exit.md) - `go f()` returns immediately, `main` returns and kills every goroutine, and why `time.Sleep` only hides the race.
- [`main` runs in a goroutine too](./go-main-runs-in-a-goroutine.md) - the runtime calls `main.main` and then `exit(0)`, so nothing is drained and the exit code is still `0`.
- [The Go runtime architecture: goroutines, threads, and the GMP scheduler](./go-runtime-scheduler-architecture.md) - the stacked layers G, M, and P, why an M needs a P to run, syscall handoff, and work stealing.
- [Channels](./go-channels) - typed pipes between goroutines, the send/receive rendezvous, buffering, close/range, and why blocking is the synchronization.
- [Buffered vs unbuffered channels](./go-buffered-vs-unbuffered-channels) - how capacity sets the coupling between goroutines, when a buffer earns its place, and why buffering removes synchronization.
- [`os.Exit`, deferred functions, and exit codes](./go-os-exit) - why `os.Exit` skips every `defer`, why `main` cannot return a status, and where a non-zero exit code belongs.
- [Defer with multiple lines](./go-defer-multiple-lines) - `defer` takes one call, so wrap several statements in `defer func() { ... }()` and mind the trailing `()`.
- [Unix signals: graceful shutdown with `signal.NotifyContext`](./go-signals) - turn `SIGINT`/`SIGTERM` into a context cancellation, block on `<-ctx.Done()`, and read the cause.
- [`select`: waiting on many channels at once](./go-select) - one ready case per pass, random choice when several are ready, `default` for non-blocking polls, and `time.After` for timeouts.

## Still to come

- What Go is and who built it (one-page intro)
- Go vs JavaScript/Node: which to pick
- `select` and context: waiting on many channels and cancelling waits
- Why Go is fast (build, run, deploy)
- Garbage collection in Go: what it costs you
- Header files vs Go's import model
- Systems programming: what it means and why Go counts
- When to choose Go (decision guide)
- Where Go is used: Docker, Kubernetes, etcd, databases
- Building a database with Go

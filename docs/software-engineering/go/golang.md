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

## Still to come

- What Go is and who built it (one-page intro)
- Go vs JavaScript/Node: which to pick
- Go's concurrency model: goroutines and channels
- Why Go is fast (build, run, deploy)
- Garbage collection in Go: what it costs you
- Header files vs Go's import model
- Systems programming: what it means and why Go counts
- When to choose Go (decision guide)
- Where Go is used: Docker, Kubernetes, etcd, databases
- Building a database with Go

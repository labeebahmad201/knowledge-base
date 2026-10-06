---
sidebar_position: 1
---

# TypeScript

TypeScript adds a static type system on top of JavaScript. This page is the hub for the TypeScript article series; each topic below is its own short page.

## Runtime and tooling

- [TypeScript does not run in Node.js](./typescript-does-not-run-in-nodejs) - Node runs JavaScript, so `.ts` is converted first with `tsc` or type stripping.
- [`tsc: command not found` after installing TypeScript](./tsc-command-not-found) - local installs link the binary into `node_modules/.bin`, which is not on your `PATH`; use `npx tsc`, an npm script, or a global install.

## Type safety

- [Why your API response types are a lie](./why-api-response-types-lie) - types are erased at runtime, so `res.json()` annotation is unchecked; validate boundary data with a schema and why Zod exists.
- [Type guards](./type-guards) - how runtime checks narrow `unknown` and unions into real types, from `typeof` and `in` to type predicates and assertion functions.
- [Zod `safeParse`](./zod-safeparse) - validate without exceptions by returning a discriminated union result instead of throwing.

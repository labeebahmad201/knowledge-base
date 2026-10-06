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
- [Structural typing and branded types](./structural-typing-and-branded-types) - why TypeScript is duck typed, the Go and Rust criticism, and the brand fix (including Zod `.brand()`).
- [What `__brand` is](./brand-property-explained) - how `string & { __brand: "id" }` makes two strings distinct types, what the tag means, and why it is erased at runtime.

## Modules

- [TS2393 duplicate function implementation](./scripts-vs-modules-ts2393) - a file with no top-level `import` or `export` is a global script, so its declarations collide across the project; make it a module with `export {};`.
- [The global namespace and how to extend it](./global-namespace) - what the global scope and `globalThis` are, plus `declare var`, interface merging, and `declare global`.
- [Adding a property to `window` with `declare global`](./extend-window-declare-global) - why `window.analytics` errors and how to merge the property into the global `Window` interface.
- [Modules vs scripts](./modules-vs-scripts) - a top-level `import`/`export` makes a file a module, `export {}` flips it, and why we moved from scripts to modules.
- [Side-effect imports](./side-effect-imports) - `import "./polyfill"` binds no names but still runs the module, used for polyfills and global registration.

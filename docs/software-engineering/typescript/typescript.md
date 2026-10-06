---
sidebar_position: 1
---

# TypeScript

TypeScript adds a static type system on top of JavaScript. This page is the hub for the TypeScript article series; each topic below is its own short page.

## Runtime and tooling

- [TypeScript does not run in Node.js](./typescript-does-not-run-in-nodejs) - Node runs JavaScript, so `.ts` is converted first with `tsc` or type stripping.
- [`tsc: command not found` after installing TypeScript](./tsc-command-not-found) - local installs link the binary into `node_modules/.bin`, which is not on your `PATH`; use `npx tsc`, an npm script, or a global install.

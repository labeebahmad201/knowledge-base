---
sidebar_position: 15
---

# `TS2688: Cannot find type definition file for 'node'`

## TLDR

- After `npm install dotenv` (or another Node package), `tsc` can fail inside `node_modules/.../index.d.ts` with `TS2688: Cannot find type definition file for 'node'`, plus `TS2591` for `Buffer`, `url`, and `process`.
- Cause: the package's type declarations start with `/// <reference types="node" />` and use Node's globals and modules. Those live in `@types/node`, which TypeScript does not ship.
- Fix: `npm install --save-dev @types/node`. No tsconfig change is needed in the default case.
- It is not a bug in dotenv or in your code. TypeScript type-checks the `.d.ts` files of the packages you import.
- If your tsconfig sets a `types` array, add `"node"` to it, or the fix will not take effect.

## The problem

Install a Node package, run `npx tsc`, and the errors point into `node_modules`:

```
node_modules/dotenv/dist/index.d.ts:2:23 - error TS2688: Cannot find type definition file for 'node'.
node_modules/dotenv/dist/index.d.ts:3:26 - error TS2591: Cannot find name 'url'. Do you need to install type definitions for node? ...
node_modules/dotenv/dist/index.d.ts:34:17 - error TS2591: Cannot find name 'Buffer'. ...
```

Two things are happening:

1. TypeScript knows JavaScript built-ins (`Array`, `Promise`, `JSON`) from its bundled `lib` files, but it knows nothing about the Node runtime: `Buffer`, `process`, `__dirname`, `require`, or the `node:` modules such as `url`, `fs`, and `path`. Those are declared in `@types/node`.
2. Packages that target Node declare that dependency with a triple-slash directive at the top of their declarations: `/// <reference types="node" />`. When TypeScript reads dotenv's `.d.ts`, it tries to resolve `node` from `@types/node`. If that package is missing, the reference fails (`TS2688`), and because the Node types are absent, `Buffer` and `url` are unknown names (`TS2591`).

`npm install dotenv` installs dotenv only. Type definitions for the runtime are a separate package, so the errors appear until you add it.

## The solution

Install the Node type definitions as a dev dependency:

```
npm install --save-dev @types/node
```

Then run `tsc` again; it exits cleanly. `@types/node` describes the Node runtime, so the triple-slash reference resolves and the Node globals and modules are known.

Two notes:

- With a `tsconfig.json` that does not set `types`, every package under `node_modules/@types` is included automatically, so nothing else is required.
- If your tsconfig restricts this with `"types": [...]`, add `"node"` to the list. Otherwise `@types/node` is installed but ignored, and the errors stay.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
graph TD
  A["import dotenv"] --> B["TypeScript reads dotenv's index.d.ts"]
  B --> C["/// <reference types=\"node\" />"]
  C --> D{"@types/node installed?"}
  D -->|no| E["TS2688 for 'node' + TS2591 for Buffer/url"]
  D -->|yes| F["Node globals and node: modules are typed"]
  E --> G["npm i -D @types/node"]
```

</div>

## Sources

- TypeScript Documentation, [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) (`/// <reference types="..." />` declares a dependency on a type package).
- TypeScript Documentation, [`types` compiler option](https://www.typescriptlang.org/tsconfig#types) (when `types` is set, only the listed packages are included automatically).
- npm, [`@types/node`](https://www.npmjs.com/package/@types/node) (TypeScript definitions for Node.js).
- dotenv, [repository](https://github.com/motdotla/dotenv) (its type declarations use `/// <reference types="node" />` and reference `Buffer` and the `url` module, which is what surfaces the errors).

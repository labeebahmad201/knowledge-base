---
sidebar_position: 13
---

# Side-Effect Imports: What `import "./polyfill"` Does

## TLDR

- `import "./polyfill"` has no `{ }` and no `from`, so it binds no names in your file, but it still **loads and runs** the module.
- Every import runs the module; a normal import also binds names. A side-effect import keeps only the run.
- Use it when the point is the work the module does when it executes: a polyfill, registering a global or a web component, starting instrumentation, or importing CSS through a bundler.
- A module file does nothing just by existing. In a module graph it runs only if something imports it, so the import is the trigger. Write it once at your entry point.
- `import()` is the on-demand version; `import type` runs nothing.

## The syntax

```ts
import { flatMap } from "./utils"; // runs ./utils and binds flatMap
import "./polyfill"; // runs ./polyfill, binds nothing
import type { Config } from "./config"; // binds nothing, runs nothing (erased)
```

The middle line is the side-effect import. It is a full `import` statement with the binding part removed, so the module still loads and evaluates, but no name enters your scope.

## Why you need the import

A file sitting in your project is not executed on its own. Only files reachable from an entry point through imports are loaded and run. So a module whose only purpose is an effect has to be imported by something, or it never runs.

Think of it as calling a function:

```ts
function installPolyfill() {
  Array.prototype.flatMap = /* ... */;
}
```

Calling `installPolyfill()` changes the global, but you still have to call it. In the module graph, `import "./polyfill"` is that call. The old equivalent was a `<script src="polyfill.js">` tag placed before your app's scripts.

## Example

```ts
// polyfill.ts (no export at all)
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function (fn) {
    // ...implementation...
  };
}
```

```ts
// main.ts
import "./polyfill"; // runs the file, patching Array.prototype
import { startApp } from "./app";

startApp();
```

`main.ts` never receives a value from `polyfill.ts`; it imports it so the patch happens. Because the change lands on `Array.prototype`, every other file benefits without importing the polyfill. You import it once, at the entry point.

Static imports run before your module's body and evaluate dependencies first, so the polyfill is in place before `startApp()` runs.

## When to use it

- **Polyfills**, like the one above.
- **Registering something global**, such as `customElements.define("my-el", MyEl)`.
- **Instrumentation**, such as `Sentry.init({ ... })` at startup.
- **Styles** through a bundler, such as `import "./styles.css"`.

## Notes

- Bundlers keep side-effect imports because they cannot know the module has no effect. The `sideEffects` field in `package.json` lets them drop unused ones safely.
- `import()` is the on-demand form and returns a promise, so the module loads only when that line runs.
- `import type` is erased by TypeScript, so it loads nothing at runtime.

## Sources

- MDN Web Docs, [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) (the side-effect-only form, `import "./my-module.js";`, and that static imports allow modules to be analyzed before evaluation).
- TypeScript Handbook, [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) (a top-level `import` or `export` makes a file a module; modules run in their own scope).
- V8, [JavaScript modules](https://v8.dev/features/modules) (module evaluation, and dynamic `import()` for on-demand loading).

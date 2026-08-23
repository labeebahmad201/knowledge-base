# React: useCallback

## The problem: functions change identity on every render

A function defined inside a component is recreated on every render. The code is identical, but the reference is new each time. This is invisible until the function is passed somewhere that cares about reference identity: as a prop to a memoized child, as a key, or as a dependency of an effect.

The React documentation is direct about the consequence: a function defined inside a component is a new function on every render. Any component or effect that receives it as a dependency sees a change, even when the behavior did not change at all.

```jsx
function Parent() {
  const handleSave = () => saveDraft();  // new reference every render
  return <Child onSave={handleSave} />;
}
```

Every time `Parent` renders, `handleSave` is a fresh reference. If `Child` is wrapped in `React.memo`, it compares the `onSave` prop with the previous render, sees a different function, and re-renders. The memo is defeated, and the child renders on every parent render.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
flowchart TD
    RENDER["Parent renders"] --> NEW["Function is created again,<br/>new reference"]
    NEW --> PROP["Passed as a prop<br/>or dependency"]
    PROP --> CHILD["React.memo child sees change,<br/>re-renders for nothing"]
    PROP --> EFFECT["Effect sees change,<br/>reruns for nothing"]
```

</div>

## The solution: keep the reference stable until a dependency changes

`useCallback` returns the same function reference until one of its dependencies changes. When the dependencies stay the same, the memoized child skips its render and the effect does not rerun.

```jsx
import {useCallback} from 'react';

function Parent({saveDraft}) {
  const handleSave = useCallback(() => saveDraft(), [saveDraft]);
  return <Child onSave={handleSave} />;
}
```

Now `handleSave` keeps the same identity as long as `saveDraft` does. The memoized child renders only when its other props change, and any effect depending on `handleSave` stays quiet.

The React docs describe `useCallback` precisely: it returns a memoized callback, so the function is not recreated on every render. Combined with `React.memo`, this is the standard tool for avoiding child re-renders.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
flowchart TD
    RENDER["Parent renders"] --> CHECK{"Do the dependencies<br/>match the last render?"}
    CHECK -->|"yes"| SAME["Same function reference<br/>returned"]
    CHECK -->|"no"| NEW["New function created,<br/>stored"]
    SAME --> SKIP["Memoized child skips render,<br/>effect stays quiet"]
```

</div>

## useCallback and useMemo are the same idea

`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`. One caches a function value, the other caches a computed value. The rule for when it earns its place is the same: the reference has to actually be expensive to change.

The React docs are blunt about the wrong reason to use it: do not wrap a function in `useCallback` purely to avoid re-creating it. Creating a function is cheap. The cost is in the downstream effect, a memoized child that should not re-render, or a heavy effect that reruns.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
flowchart TD
    CALLBACK["useCallback(fn, deps)"] --> MEMO["Same as useMemo(() => fn, deps)"]
    MEMO --> REFERENCE["Caches a function reference"]
    MEMO2["useMemo(fn, deps)"] --> VALUE["Caches a computed value"]
```

</div>

## When it hurts

The same overuse trap as `useMemo` applies. React's own guidance on unnecessary effects warns against memoizing for its own sake: if nothing downstream reads the function identity, `useCallback` is pure overhead, one more dependency array to keep accurate and one more place for a stale reference to hide.

A common mistake is a stale dependency. A callback closed over an old value because the dependency array was left empty or incomplete. The function still works, but it reads stale state, and the bug is hard to spot because the code looks right.

The rule from the React docs: use `useCallback` when the function is passed to a memoized child, used in an effect dependency, or read by something else that should not restart on every render. Not just because the hook exists.

<div style={{display: 'flex', justifyContent: 'center'}}>

```mermaid
flowchart TD
    Q{"Is the function passed to a memoized child<br/>or used in an effect dependency?"}
    Q -->|"no"| SKIP["No useCallback,<br/>function creation is cheap"]
    Q -->|"yes"| Q2{"Do its dependencies<br/>change rarely?"}
    Q2 -->|"no"| SKIP2["Reference changes anyway,<br/>cache buys nothing"]
    Q2 -->|"yes"| USE["Use useCallback"]
    style USE fill:#6f6,stroke:#333
```

</div>

## The decision in one line

Use `useCallback` when a function reference is consumed as a dependency: by a memoized child, by an effect, or by a context consumer that should not restart. Skip it when the function is used inline and nothing tracks its identity. It caches a reference, exactly like `useMemo` caches a value, and it pays for itself only when that reference being stable actually saves work.

## References

- React Documentation. *useCallback*. https://react.dev/reference/react/useCallback. The definition of a memoized callback, the dependency contract, and the equivalence to `useMemo`.
- React Documentation. *You Might Not Need an Effect*. https://react.dev/learn/you-might-not-need-an-effect. The guidance on not memoizing for its own sake and on correct dependency handling.
- React Documentation. *useMemo*. https://react.dev/reference/react/useMemo. The companion hook that caches a value instead of a function reference.
- Knowledge base. *React: useMemo*. reactjs-use-memo.md. The same problem/solution shape for caching computed values.

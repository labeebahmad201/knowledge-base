# JavaScript / TypeScript Interview Questions

Frequently asked JS/TS questions in a problem → solution format.

## Remove Duplicates from an Array using `new Set`

### Problem

Given an array that may contain duplicates, return a new array with each value once, preserving order of first occurrence.

```
Input:  [1, 2, 2, 3, 4, 4, 5, 2]
Output: [1, 2, 3, 4, 5]
```

### Solution

A `Set` holds only unique values. Build one from the array, spread it back:

```js
const unique = [...new Set(arr)];      // → [1, 2, 3, 4, 5]
const unique = Array.from(new Set(arr)); // same
```

- **Time:** O(n), **Space:** O(n).
- Order preserved: sets iterate in insertion order.

### Pitfalls

**Equality is SameValueZero** — like `===` but `NaN === NaN` and `0 === -0` are true:

```js
[...new Set([NaN, NaN, 0, -0])] // → [NaN, 0]
```

**Objects dedupe by reference**, not content:

```js
[...new Set([{id: 1}, {id: 1}])] // → both kept
```

**The naive alternative** `arr.filter((v, i) => arr.indexOf(v) === i)` is O(n²) — `indexOf` rescans for every element.

### TypeScript

```ts
const unique: number[] = [...new Set(arr)];          // infers fine
const unique = Array.from(new Set(readonlyArr));     // safer for readonly/tuple
```

### Sources

- MDN: [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality)
- MDN: [Array.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)

---

## `==` vs `===`

### Problem

Two operators that look alike but behave differently. Not knowing which one coerces types produces silent bugs:

```js
console.log(1 == "1")    // ???
console.log(1 === "1")   // ???
console.log([] == false) // ???
```

### Solution

- `===` compares **value and type** — no coercion, ever.
- `==` compares **value** after coercing one side to a common type.

```js
1 === "1"  // false — different types
1 == "1"   // true  — "1" coerced to number
```

### The dirty dozen

```js
null == undefined   // true  — only equal to each other
null == 0           // false — null does NOT → 0 here
false == 0          // true  — false → 0
"" == 0             // true  — "" → 0
[] == 0             // true  — [] → "" → 0
[] == ![]           // true  — [] is truthy, ![] is false, then above
[1] == 1            // true  — [1] → "1" → 1
NaN === NaN         // false — NaN is the only value not equal to itself
```

### Pitfalls

**The one safe `==` idiom** — null/undefined check:

```js
if (x == null) // true for null AND undefined
if (x === null || x === undefined) // equivalent
```

Never use `==` with `""`, `0`, `false`, or `[]` on either side.

**`Object.is`** — like `===`, but `Object.is(NaN, NaN)` is `true` and `Object.is(0, -0)` is `false`. Used internally by `Set`/`Map` and `Array.prototype.includes`.

### TypeScript

Under `strict`, `==` between non-overlapping types is a compile error. `x == null` is allowed — it's the typed way to check null + undefined at once.

### Sources

- MDN: [Equality (`==`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality), [Strict equality (`===`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)
- MDN: [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)

---

## Debounce vs Throttle

### Problem

Events fire more often than you need to handle them. Typing fires an input event per keystroke. Scrolling fires dozens of events per second. Resizing fires continuously. If every event triggers a handler — an API call, a layout recalc, a localStorage write — you burn work (and money, and jank) on redundant calls.

```js
input.addEventListener("input", () => searchApi(query)); // fires on every keystroke
```

The two ways to rate-limit the handler are **debounce** and **throttle**. They solve different symptoms, and candidates who can't say which is which have usually memorized, not understood.

### Debounce — "wait until the action stops"

Debounce delays a call until the caller has gone quiet for a fixed window. Every new event **resets the timer**. Nothing runs while events keep coming; the function runs **once, after the last event**, when the silence lasts the full delay. The delay is also a trailing one: the call happens after the quiet, not at the start.

**The problem it solves:** you don't care about every intermediate event, only the final state after the action settles.

Use cases:

- **Search box autocomplete** — you want the API call only after the user stops typing, not on every keystroke.
- **Window resize** — recalculate layout once the user finishes dragging, not a hundred times mid-drag.
- **Form input validation** — validate after the user pauses.

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce((q) => searchApi(q), 300);
input.addEventListener("input", (e) => debouncedSearch(e.target.value));
// 300ms of silence after the last keystroke → searchApi runs once
```

**Timeline (delay = 300ms):**

```
t=0    t=100  t=200  t=300+silence
 k1      k2     k3    → runs ONCE at ~t=300 after k3
```

Each keystroke resets the clock, so `searchApi` fires only after the typing stops.

### Throttle — "at most one call per window"

Throttle runs the function **at most once every N ms**, no matter how many events arrive. The first call runs immediately (or after a short lead), and a trailing guard prevents more calls until the window elapses. Unlike debounce, events during the window don't reset the throttle timer — they're ignored or coalesced.

Alternative framing: throttle guarantees a **steady, maximum rate**; debounce guarantees **zero noise, one final call**.

**The problem it solves:** you care about the events themselves (progress, position, activity) but can't process them all — you just need a regular sample.

Use cases:

- **Scroll position tracking** — update a progress bar at most once per 100ms, not per pixel.
- **Click guard** — a button that can trigger at most once per second regardless of double-clicks.
- **Resize / mouse-move** — sample position at a fixed rate.

```js
function throttle(fn, interval) {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  };
}

const throttledScroll = throttle(() => updateProgressBar(), 100);
window.addEventListener("scroll", throttledScroll);
// at most one update per 100ms
```

**Timeline (interval = 100ms):**

```
t=0    t=50   t=100  t=150  t=200
run    skip    run   skip   run   ← drains events at a fixed rate, not at the end
```

### The one-line distinction

| | Debounce | Throttle |
|---|---|---|
| Fires when | once, after activity stops | at most once per interval |
| Resets on new events? | **yes** — pushes the call out | **no** — fixed rhythm |
| Best for | "run when done typing" | "run at most every 100ms" |
| Worst case | fires very late if user never stops | fires mid-noise even if not needed |

### When to use which — the decision rule

Ask one question: **do you want the *last* event, or a *steady sample* of events?**

- **Debounce — use it when only the final state matters** and intermediate events are meaningless:
  - **Search / autocomplete** — fire the API call after the user stops typing, not per keystroke (the intermediate results are thrown away anyway).
  - **Form validation** — validate once the user pauses; running on each keystroke flashes errors mid-typing.
  - **Window resize → recalc layout** — you only care about the size when the user lets go.
  - **Save drafts** — write to localStorage/backend after the user stops editing.
  - **"Save" buttons** — collapse a flurry of rapid clicks into one action.

- **Throttle — use it when you need *regular progress updates* and the events themselves matter**:
  - **Scroll → progress bar / lazy-load** — must fire *during* the scroll, at a capped rate.
  - **Mouse-move → tooltip/coordinate tracking** — sample at 10Hz, don't run per pixel.
  - **Click guard / rate limiting** — a submit button that can fire at most once per second (anti double-submit).
  - **Game loop / analytics ping** — a steady heartbeat of events, never more than N per second.
  - **Continuous animation frames** — run at a fixed interval regardless of how often the user moves.

**Walk-through of the two classic wrong answers:**

```js
// ❌ debounce on scroll — never fires while the user keeps scrolling
window.addEventListener("scroll", debounce(updateProgressBar, 100));

// ✅ throttle on scroll — fires steadily mid-scroll
window.addEventListener("scroll", throttle(updateProgressBar, 100));

// ❌ throttle on search — fires mid-keystroke, sends half-typed queries
input.addEventListener("input", throttle(searchApi, 300));

// ✅ debounce on search — one query after the user pauses
input.addEventListener("input", debounce(searchApi, 300));
```

Rule of thumb to say out loud: **"Debounce for 'when they're done', throttle for 'while they're doing it'."** Debounce is about *saving the final work*; throttle is about *not flooding the pipe*.

### What the interviewer probes next

**1. "Debounce" vs "throttle" in your own words?**

Say: "Debounce waits for a pause — the timer restarts every event. Throttle caps the rate — one call per window regardless of the noise." If you can't say the 'resets timer' bit, you don't understand debounce.

**2. Does debounce run on the leading or trailing edge?**

Trailing by default — after the silence. Add a `leading` flag to run once immediately, then debounce (e.g., fire a search instantly on first keystroke, but not for subsequent rapid ones). Libraries like Lodash expose `{leading, trailing, maxWait}`; `maxWait` caps debounce so the call can't be pushed out forever by continuous events.

**3. When would debounce be wrong?**

When you care about every event, or need a guarantee within a fixed time — e.g., a scroll spy that must notify even during continuous scrolling. A trailing-only debounce would never fire while the user keeps scrolling. Throttle (or `maxWait`) fixes that.

### Sources

- MDN: [setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout), [Date.now()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)
- CSS-Tricks: [Debouncing and Throttling Explained Through Examples](https://css-tricks.com/debouncing-throttling-explained-examples/)
- Lodash docs: [debounce](https://lodash.com/docs/4.17.15#debounce), [throttle](https://lodash.com/docs/4.17.15#throttle)

---

## Check if a String is a Palindrome

### Problem

Given a string, return `true` if it reads the same forward and backward (e.g., `racecar`), ignoring case, spaces, and punctuation for the classic variant. The naive answer — reverse and compare — works, but interviewers probe for an O(1)-space, two-pointer version and for the "clean input" variant (e.g., `"A man, a plan, a canal: Panama"`).

```
isPalindrome("racecar")                  // → true
isPalindrome("hello")                    // → false
isPalindrome("A man, a plan, a canal: Panama") // → true
```

### Solution 1: Reverse and compare

```js
function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}
```

- **Time:** O(n), **Space:** O(n) — two extra arrays/strings.

### Solution 2: Two pointers (O(1) space, the one they want)

Walk one pointer from the left and one from the right, skipping non-alphanumeric characters, and compare as you go:

```js
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    while (left < right && !isAlphanumeric(s[left])) left++;
    while (left < right && !isAlphanumeric(s[right])) right--;

    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;

    left++;
    right--;
  }
  return true;
}

function isAlphanumeric(ch) {
  return /[a-zA-Z0-9]/.test(ch);
}
```

- **Time:** O(n) — each pointer crosses the string once.
- **Space:** O(1) — no extra data structures.

### What the interviewer probes next

**1. What if input has only non-alphanumeric characters?** The inner `while (left < right && ...)` guards prevent reading past the ends, and the loop exits `true` — which is the expected answer for an effectively-empty string.

**2. Why not just reverse?** Reversing allocates O(n) extra memory. The two-pointer version is the standard follow-up to the easy answer, especially for the LeetCode variant ([LC-125](https://leetcode.com/problems/valid-palindrome/)).

**3. What about numbers?** The `[a-z0-9]` regex keeps digits, so `"a1a"` → `true`. If the problem says letters only, drop `0-9`.

### TypeScript notes

Typing the pointers as `number` and the input as `string` is enough; the inner helper can be typed with a regex guard:

```ts
function isAlphanumeric(ch: string): boolean {
  return /[a-zA-Z0-9]/.test(ch);
}
```

### Sources

- LeetCode: [Valid Palindrome (LC-125)](https://leetcode.com/problems/valid-palindrome/)
- MDN: [String.prototype.toLowerCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase), [String.prototype.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)

---

## Deep Clone: Why `JSON.parse(JSON.stringify(x))` is Unsafe

### Problem

The quick-and-dirty deep clone:

```js
const clone = JSON.parse(JSON.stringify(obj));
```

It works perfectly for plain data — strings, numbers, `null`, arrays, nested objects. But for many real values it **silently produces the wrong clone** (or, rarely, throws). You asked the right question: `undefined` and functions don't throw an error — they're quietly dropped. That's the dangerous part, because nothing signals the corruption; you just get a subtly different object.

### What happens to each value

| Value in original | After `JSON.stringify`+`parse` | Why |
|---|---|---|
| `undefined` (obj property) | **removed** | JSON has no `undefined` |
| function (obj property) | **removed** | JSON has no functions |
| `undefined` / function (array item) | `null` | arrays keep length, items become `null` |
| `NaN`, `Infinity` | `null` | JSON has no `NaN`/`Infinity` |
| `Date` | **string** | serializes to ISO string |
| `RegExp`, `Map`, `Set` | `{}` (or mangled) | not JSON types |
| `BigInt` | **throws** `TypeError` | the one non-silent case |
| circular reference | **throws** `TypeError` | JSON can't represent cycles |
| symbol keys / `Symbol()` | removed | symbols are ignored |

Confirmed behaviour:

```js
const obj = {a: 1, b: undefined, c: () => {}, d: NaN};
JSON.stringify(obj);                  // '{"a":1,"d":null}' — b and c gone silently
JSON.parse('{"a":1,"d":null}');       // {a: 1, d: null}  — wrong clone
```

### Why it doesn't throw (usually)

`JSON.stringify` treats `undefined` and functions as **non-serializable → omit** for object keys, not as errors. The spec says: "If the value is a function or undefined... the member is excluded." Throwing happens only when JSON has *no representation at all* and omission is impossible — a circular structure (can't omit, can't serialize) or a `BigInt` (a primitive JSON doesn't know).

### The follow-up the interviewer probes

**When is the silent-loss clone actually fine?**

When you clone a plain data payload — API responses, config objects, DB rows — where you *know* there are no functions, `undefined`, `Date`, `Map`, `Set`, `BigInt`, or cycles. In that case it's the simplest correct deep clone.

**What should you use otherwise?**

- `structuredClone()` (native, modern browsers/Node ≥17): clones `Date`, `Map`, `Set`, `RegExp`, typed arrays, cycles — but still not functions.

  ```js
  const clone = structuredClone(obj); // handles cycles, Map, Set, Date
  ```

- A library like Lodash `cloneDeep` when you need functions preserved or exotic types handled.
- If `Date` is involved, write a replacer that converts it (`JSON.parse(s, (k, v) => ...)`).

**Why does the array case become `null` and not get removed?** Arrays are lists with order and holes — JSON can't remove an item without shifting indices, so it fills non-serializable slots with `null` to keep the structure.

### TypeScript notes

The silent-loss clone is worse under TS because the type stays `YourType`:

```ts
const clone: Config = JSON.parse(JSON.stringify(config)); // compiles, but functions/symbols gone at runtime
```

Types can't catch what `JSON.stringify` drops. If you clone types with methods (class instances, config with callbacks), prefer `structuredClone` (which also can't clone functions — but at least throws or behaves predictably) or a real deep-clone library.

### The production answer

In production, don't hand-roll a deep clone. You *can* write a recursive `Object.keys` version that keeps functions and `undefined`, but it needs branches for `Array`, `Date`, `Map`, `Set`, `RegExp`, typed arrays, and a `Map`-based cache for circular references — and every branch is a place for a subtle, silent bug. More code means more liability.

The decision rule, stated so it's defensible in an interview:

1. **Plain data payloads** (API responses, JSON config, DB rows) → `JSON.parse(JSON.stringify(x))` is fine, but `structuredClone()` is just as easy and safer.
2. **Need `Date`, `Map`, `Set`, cycles** → `structuredClone()` — native, zero deps, battle-tested by the platform.
3. **Need functions/prototypes preserved** (class instances, config objects with callbacks) → Lodash `cloneDeep`, or a library that handles exotic types.

> "A library centralizes and de-risks this. Hand-written clone logic is easy to get subtly wrong — cycle blowups, corrupted `Date`s, silent key drops — and every fork adds maintenance surface. `structuredClone` covers the data cases natively; `cloneDeep` when I need functions or exotic types. I'd only hand-roll it if the codebase already avoids the dependency and the domain is narrow plain data."

The one caveat interviewers reward: understand *why* before reaching for the library. Saying "just use `cloneDeep`" without knowing what JSON drops, what `structuredClone` can't clone, and what a manual clone must handle reads as cargo-cult. Say the rule, then name the reasons behind it.

### Sources

- MDN: [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify), [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse), [structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- ECMA-262: [The JSON.stringify property](https://tc39.es/ecma262/#sec-json.stringify)
- Lodash: [cloneDeep](https://lodash.com/docs/4.17.15#cloneDeep)
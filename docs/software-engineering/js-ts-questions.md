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

---

## Python for JS/TS Developers

What you already know maps directly. The differences are where the bugs hide.

### Syntax at a glance

```python
# Variables — no let/const, just assignment
name = "Alice"
age = 25
is_active = True

# Lists — like JS arrays, mutable
scores = [90, 85, 77]
scores.append(100)        # push
scores[0]                 # 90
scores[-1]                # 100 (last element)

# Dicts — like JS objects/maps
user = {"name": "Alice", "age": 25}
user["name"]              # "Alice"
user.get("email", "N/A")  # "N/A" if key missing

# Tuples — immutable lists (JS has no equivalent)
point = (10, 20)
point[0]                  # 10
point[0] = 30             # TypeError — immutable
```

### The key difference: indentation IS syntax

JS uses `{}` for blocks. Python uses indentation. No semicolons, no braces, no `end` keyword:

```js
// JavaScript
if (age > 18) {
    console.log("adult");
} else {
    console.log("minor");
}
```

```python
# Python
if age > 18:
    print("adult")
else:
    print("minor")
```

Wrong indentation = wrong code. Use 4 spaces (not tabs).

### Functions

```python
# Simple
def greet(name):
    return f"Hello, {name}"

# Default arguments (like JS)
def greet(name="World"):
    return f"Hello, {name}"

# Keyword arguments (like JS object params)
def create_user(name, age=25, active=True):
    return {"name": name, "age": age, "active": active}

create_user("Alice", active=False)  # keyword args
```

### List comprehensions — Python's superpower

JS has `.filter().map()`. Python has comprehensions — faster, more readable:

```python
# JS: items.filter(x => x.active).map(x => x.name)
names = [x.name for x in items if x.active]

# JS: Array.from({length: 5}, (_, i) => i * 2)
doubles = [i * 2 for i in range(5)]  # [0, 2, 4, 6, 8]

# Dict comprehension
user_map = {u.id: u.name for u in users}

# Set comprehension — dedupes automatically
lower_names = {x.lower() for x in names}  # no duplicates, unordered
```

The syntax difference is just the bracket: `[...]` → list, `{...: ...}` → dict, `{...}` → set. Sets are unordered and dedupe, so `{x for x in [1, 1, 2, 3]}` → `{1, 2, 3}`.

**Why use comprehensions instead of loops:**

1. **One line instead of three.** A `for` loop with `append` takes 3 lines. A comprehension takes 1.
2. **No temporary variable.** The result goes directly where you need it.
3. **Faster.** Python optimizes comprehensions internally — they avoid repeated `append` calls.
4. **Readability.** `[x.name for x in users if x.active]` reads like English: "give me x.name for each x in users where x.active."

**When NOT to use them:**

- **Logic is complex.** If the comprehension has nested ifs or side effects, use a `for` loop instead. Comprehensions are for simple filter + transform, not for everything.
- **You need to debug.** A comprehension is a single expression — no breakpoints inside. A `for` loop lets you inspect each step.
- **The result is huge.** A generator expression `(x for x in ...)` is better for large datasets — it yields one item at a time instead of building the whole list in memory.

### Error handling

```python
# try/except — like try/catch
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
finally:
    print("always runs")

# Specific exceptions
try:
    data = json.loads(text)
except json.JSONDecodeError:
    data = {}
except Exception as e:
    print(f"Unexpected: {e}")
    raise  # re-raise if you can't handle it
```

### Classes

```python
class User:
    def __init__(self, name, age):   # like constructor
        self.name = name              # public
        self._age = age               # private by convention (not enforced)
        self.__secret = "hidden"      # name-mangled (pseudo-private)

    def greet(self):                  # methods take self explicitly
        return f"Hi, I'm {self.name}"

    @property
    def age(self):                    # getter (like TS get)
        return self._age

# Inheritance
class Admin(User):
    def __init__(self, name, age, role):
        super().__init__(name, age)   # call parent constructor
        self.role = role
```

### Files

```python
# Read
with open("data.json") as f:         # auto-closes when done
    data = json.load(f)

# Write
with open("output.txt", "w") as f:
    f.write("hello\n")

# Read lines
with open("data.csv") as f:
    lines = f.readlines()            # list of strings
```

`with` is critical — it auto-closes the file. In JS you'd use `fs.readFileSync` or promises. Python's `with` is better than both.

### Common gotchas for JS devs

**1. `None` vs falsy:**

```python
if None:      # False — None is falsy
if 0:         # False
if "":        # False
if []:        # False — empty list is falsy!
if {}:        # False — empty dict is falsy!
```

In JS, `[]` and `{}` are truthy. In Python they're falsy. This breaks conditions.

**2. Pass by object reference:**

```python
def modify(lst):
    lst.append(4)       # mutates original — like JS

my_list = [1, 2, 3]
modify(my_list)
print(my_list)          # [1, 2, 3, 4] — changed!
```

Python passes the *reference* to the object, not a copy. Same as JS arrays/objects.

**3. No block scope:**

```python
for i in range(5):
    pass

print(i)    # 4 — i leaks out of the loop! (JS `let` is block-scoped)
```

**4. `is` vs `==`:**

```python
a = [1, 2]
b = [1, 2]
a == b      # True — values equal
a is b      # False — different objects in memory
a is a      # True — same object
```

`==` compares values. `is` compares identity (memory address). Use `is` only for `None` checks: `if x is None`.

### Virtual environments — the npm equivalent

```bash
python -m venv .venv          # create (like npm init)
source .venv/bin/activate     # activate (like nvm use)
pip install requests          # install (like npm install)
pip freeze > requirements.txt # lockfile (like package-lock.json)
deactivate                    # exit
```

Or use `uv` — the modern, faster alternative:

```bash
uv init                        # create project
uv add requests                # install
uv run python main.py          # run
```

### Testing

```python
# pytest — simpler and better than any JS test framework
def test_add():
    assert 1 + 1 == 2

def test_user_creation():
    user = User("Alice", 25)
    assert user.name == "Alice"
    assert user.age == 25

# Run: pytest (auto-discovers test_*.py files)
```

No setup, no config, no boilerplate. Just `assert` statements. pytest is the reason Python testing is easier than JS testing.

### The 5 things to memorize

| JS | Python | Difference |
|---|---|---|
| `const x = []` | `x = []` | No `const`/`let` — just assign |
| `x.forEach(fn)` | `for item in x:` | Python uses `for...in`, not `for...of` |
| `x.map(fn)` | `[fn(x) for x in xs]` | List comprehension, not method chain |
| `x === null` | `x is None` | Identity check, not equality |
| `try {} catch {}` | `try: except:` | Colon + indent, not braces |

### Machine code vs bytecode — what Python actually runs

When you run `python script.py`, Python doesn't send your source code directly to the CPU. It compiles your code to **bytecode** first, then the Python interpreter executes that bytecode.

**Machine code** (what C/Rust/Go compile to):
- Binary instructions: `10110000 01100001`
- CPU executes these directly
- Different for every CPU architecture (x86, ARM)
- This is what makes compiled languages fast — no middleman

**Bytecode** (what Python compiles to):
- Intermediate instructions: `LOAD_FAST`, `BINARY_ADD`, `STORE_FAST`
- Stored in `.pyc` files in `__pycache__/`
- Platform-independent — same bytecode on any OS
- Python's interpreter translates bytecode to machine code at runtime
- This is why Python is slower — there's a translation step

```
Source code → Bytecode (.pyc) → Interpreter → Machine code → CPU
   .py         compiled          runs it       translates
```

When you change your `.py` file, Python recompiles the bytecode. If you don't change it, Python uses the cached `.pyc` — that's why the second run is faster.

**How other languages compare:**

| Language | Compilation | Bytecode | JIT | Speed |
|---|---|---|---|---|
| C/Rust/Go | Source → machine code directly | No | No | Fastest |
| Java | Source → bytecode → JVM | Yes | Yes (HotSpot) | Fast |
| C# | Source → IL bytecode → CLR | Yes | Yes (RyuJIT) | Fast |
| JS (V8) | Source → bytecode → Ignition | Yes | Yes (TurboFan) | Fast |
| Python | Source → bytecode → CPython interpreter | Yes | No | Slow |
| PyPy | Source → bytecode → JIT | Yes | Yes | Fast |

The takeaway: Python's slowness isn't because it's interpreted — it's because CPython doesn't have a JIT. PyPy (Python with a JIT) is 10-100x faster, but most libraries are written for CPython, so it's not widely adopted.

### How we got from threading → multiprocessing → asyncio

The story of Python's concurrency is a story of tradeoffs:

**Step 1: Threading** — "let's run things in parallel"
- Multiple threads share memory, run concurrently
- Problem: the GIL. Only one thread executes Python bytecode at a time. Two threads doing CPU work take turns, never run simultaneously. Threading adds overhead (thread creation, GIL contention) without real parallelism.

**Step 2: Multiprocessing** — "let's bypass the GIL entirely"
- Separate processes, each with its own GIL. True parallelism on multiple cores.
- Problem: resources sit idle. A 4-core machine running 4 processes uses all cores, but each process has its own memory space. Sharing data requires serialization. And if your task is I/O-bound (waiting for network), the cores sit idle most of the time — you're paying for processes you don't need.

**Step 3: asyncio** — "let's stop fighting the GIL and work with it"
- One thread, one event loop, tasks that yield control voluntarily
- No thread overhead, no GIL contention, no process spawning
- The event loop is like a manager: it hands a task to the worker, the worker hits I/O and says "I'll be back," the manager hands the next task to the same worker. When the first task's I/O completes, the manager resumes it.
- The worker never sits idle — it always has something to do. No wasted cores, no wasted threads.

```
Threading:     Worker 1 ──── GIL ──── Worker 2 ──── GIL ──── Worker 1
               (take turns, never parallel)

Multiprocessing: Worker 1 (core 1) ──── busy ──── idle (waiting for I/O)
                 Worker 2 (core 2) ──── busy ──── idle (waiting for I/O)
                 (cores idle during I/O)

asyncio:       Worker 1: Task A (I/O) → Task B (I/O) → Task A (done) → Task C
               (one worker, always busy, never idle)
```

The insight: asyncio doesn't try to be parallel. It tries to never be idle. For I/O-heavy work, that's the most efficient approach — you get thousands of concurrent connections on one thread with minimal overhead.

### What is a thread?

A thread is a sequence of instructions that runs within a process. Every program starts with at least one thread (the main thread). A process can have multiple threads running concurrently, sharing the same memory.

**Analogy:** A process is a kitchen. A thread is a cook. A single-cook kitchen (one thread) can only do one thing at a time. A multi-cook kitchen (multiple threads) can cook multiple dishes simultaneously — but they share the same counters, fridge, and stove (shared memory). That's why they need coordination (locks, mutexes).

**Process vs thread:**

| | Process | Thread |
|---|---|---|
| Memory | Separate (isolated) | Shared |
| Communication | IPC (pipes, sockets) | Direct (shared variables) |
| Startup cost | Heavy (new memory space) | Light (reuses existing) |
| Crash impact | Only the process dies | Can crash the whole process |
| GIL (Global Interpreter Lock) | Each has its own GIL | Shares the parent's GIL |

**In Python:**

Python has the **GIL (Global Interpreter Lock)** — a mutex that allows only **one thread** to execute Python bytecode at a time, even on multi-core CPUs.

```python
# Main thread — everything runs here by default
import time

def work():
    print("thread is working")
    time.sleep(1)

# Spawn a second thread — now two threads run concurrently
import threading
t = threading.Thread(target=work)
t.start()  # starts the thread
print("main thread continues")
t.join()   # wait for thread to finish
# Output:
# main thread continues
# thread is working
```

The main thread and the new thread run concurrently during the `time.sleep(1)` — the main thread prints while the other thread sleeps. Without threading, they'd run sequentially (3 seconds total instead of 1).

**Why threads matter:** Without threads, your program does one thing at a time. With threads, it can fetch data, render a UI, and process results simultaneously — as long as the GIL allows it (I/O releases the GIL, CPU doesn't).

### Threading — concurrent I/O, not parallel CPU

Threading spawns multiple threads within the same process. Each thread shares memory. The problem: the GIL allows only one thread to execute Python bytecode at a time.

```python
import threading
import time

def fetch(url):
    print(f"start: {url}")
    time.sleep(2)  # simulates network I/O — GIL is released during sleep
    print(f"done: {url}")

# Threading — these run concurrently (I/O only)
t1 = threading.Thread(target=fetch, args=("api1",))
t2 = threading.Thread(target=fetch, args=("api2",))
t1.start()
t2.start()
t1.join()
t2.join()
# Total: ~2 seconds (concurrent), not 4 seconds
```

**When threading works:** I/O-bound tasks — network requests, file reads, database queries. The GIL is released during I/O waits, so other threads can run while one thread is waiting.

**When threading fails:** CPU-bound tasks — the GIL prevents true parallelism. Two threads doing math will take turns, not run simultaneously.

```python
# CPU-bound threading — WORSE than no threading
import threading

def compute():
    total = 0
    for i in range(10_000_000):
        total += i

t1 = threading.Thread(target=compute)
t2 = threading.Thread(target=compute)
t1.start(); t2.start()
t1.join(); t2.join()
# Slower than running sequentially — GIL contention + overhead
```

### Multiprocessing — true parallelism

Multiprocessing spawns separate processes, each with its own Python interpreter and its own GIL. This bypasses the GIL entirely — true parallelism on multiple cores.

```python
from multiprocessing import Pool
import time

def heavy_compute(n):
    return sum(i * i for i in range(n))

# 4 workers — true parallelism on 4 cores
with Pool(4) as p:
    results = p.map(heavy_compute, [10_000_000] * 4)
# Runs in ~1 second (4 cores), not 4 seconds
```

**The tradeoff:** Each process has its own memory space. Sharing data between processes requires serialization (like JSON between services). This makes multiprocessing heavier than threading — more memory, slower to start, harder to share state.

**When to use multiprocessing:** CPU-bound tasks — math, data processing, image processing, anything that burns CPU cycles.

```python
# CPU-bound multiprocessing — MUCH faster than threading
from multiprocessing import Pool

def compute(n):
    return sum(i * i for i in range(n))

with Pool(4) as p:
    results = p.map(compute, [10_000_000] * 4)
# ~4x faster on 4 cores
```

### asyncio — one thread, many tasks

asyncio is Python's event loop — single-threaded, cooperative multitasking. Like Node.js. Tasks yield control voluntarily (`await`), so the event loop can switch to the next task.

```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        # Launch all requests concurrently
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

# 1000 requests run concurrently on one thread
urls = [f"https://api.example.com/{i}" for i in range(1000)]
results = asyncio.run(fetch_all(urls))
# ~2-3 seconds total, not 2000 seconds
```

**How it works:**

1. `await` suspends the current task and yields control back to the event loop
2. The event loop picks the next ready task and runs it
3. When the first task's I/O completes, the event loop resumes it
4. Everything happens on one thread — no GIL contention, no thread switching overhead

**When to use asyncio:** High-concurrency I/O — thousands of simultaneous network requests, WebSocket servers, chat applications. The event loop handles more connections than threads can because there's no per-thread overhead.

**When NOT to use asyncio:** CPU-bound work (no benefit, single-threaded), blocking libraries (if a library blocks the event loop, everything waits), simple scripts (threading is simpler).

### When to use multiprocessing vs asyncio

The key insight: **look at where the CPU spends its time.**

**asyncio** — when the CPU is mostly idle (waiting):
- During I/O, the CPU sits idle — waiting for a network response, a database query, a file read
- asyncio exploits that idle time by switching to another task during the wait
- The CPU does real work only during the tiny fraction of time when data arrives
- Thousands of concurrent connections on one thread, minimal overhead

**multiprocessing** — when the CPU is mostly busy (computing):
- The CPU is under constant load — math, data transforms, image processing
- asyncio can't help because the CPU is never idle — there's no "wait time" to exploit
- Need true parallelism across multiple cores to finish faster

| | asyncio | multiprocessing |
|---|---|---|
| CPU usage | Low (mostly waiting) | High (mostly computing) |
| Concurrency model | Cooperative (yield at await) | Parallel (multiple cores at once) |
| Memory | Shared (one process) | Separate (each process has its own) |
| Overhead | Minimal (context switch in user space) | Heavy (new process per worker) |
| Max practical | Thousands of tasks | Number of CPU cores |

**Real-world production pattern:** Most apps use both. A web server uses asyncio for handling thousands of concurrent requests, and offloads CPU-heavy tasks (image processing, ML inference) to a multiprocessing pool or a separate worker queue.

```python
import asyncio
from multiprocessing import Pool

async def handle_request(request):
    # I/O: fetch from database (async — yields during wait)
    data = await db.fetch(request.id)
    
    # CPU-heavy: offload to process pool (true parallelism)
    with Pool(4) as p:
        result = p.map(heavy_compute, data)
    
    return result
```

The mental model: asyncio squeezes in tasks during I/O waits. multiprocessing divides CPU-heavy work across cores. Most production systems need both.

### asyncio vs threading — single-threaded vs multi-threaded

The critical distinction: asyncio is **single-threaded**, threading is **multi-threaded**.

```
Threading:   Thread 1 ─────┐
                           ├── OS switches between them (GIL)
             Thread 2 ─────┘

asyncio:     Task 1 → await → Task 2 → await → Task 1 resumes
             (all on one thread, event loop coordinates)
```

| | Threading | asyncio |
|---|---|---|
| Threads | Multiple | One |
| Scheduling | OS decides (preemptive) | Event loop decides (cooperative) |
| Switching | GIL forces context switches | Tasks yield voluntarily at `await` |
| Overhead | Thread creation + context switch | Minimal (just a function call) |
| Blocking | One blocking call only freezes that thread | One blocking call freezes everything |

**Why asyncio is faster for I/O:** No thread overhead, no GIL contention, no OS context switching. The event loop coordinates tasks in user space — much cheaper than the OS juggling threads.

**The danger of asyncio:** One synchronous call (`time.sleep(5)` instead of `await asyncio.sleep(5)`) blocks the entire event loop. Every other task freezes. With threading, only that thread freezes — the others continue.

```python
# asyncio — one bad call freezes everything
async def bad():
    time.sleep(5)        # ❌ blocks the entire event loop
    await asyncio.sleep(5)  # ✅ yields control, other tasks run

# threading — one bad call only freezes that thread
def bad():
    time.sleep(5)        # only this thread freezes, others continue
```

The analogy: threading is like having multiple cooks who each work independently (but take turns at the stove). asyncio is like one cook who starts a pot boiling, moves to chopping while it boils, then comes back when the pot is ready — but if the cook gets stuck (blocking call), everything stops.

### The decision rule

```
I/O-bound + low concurrency?    → threading (simple, good enough)
I/O-bound + high concurrency?   → asyncio (thousands of connections)
CPU-bound + multi-core?         → multiprocessing (true parallelism)
CPU-bound + single-core?        → just use a loop (simplest)
Need speed + Python ecosystem?  → PyPy (JIT, 10-100x faster)
Need speed + no constraints?    → Go/Rust (compiled, no GIL)
```

### Sources

- Python docs: [Tutorial](https://docs.python.org/3/tutorial/)
- PEP 8: [Style Guide](https://peps.python.org/pep-0008/)
- pytest: [Documentation](https://docs.pytest.org/)
- uv: [Astral](https://docs.astral.sh/uv/)
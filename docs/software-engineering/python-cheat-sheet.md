# Python Cheat Sheet

## Tuples

Ordered, **immutable**, fixed-size sequence. Often confused with lists — key differences:

| | Tuple | List |
|---|---|---|
| Mutable? | No | Yes |
| Fixed size? | Yes | No (can append/remove) |
| Ordered? | Yes | Yes |
| Hashable? | Yes (if elements are) | No |
| Dict key? | ✅ | ❌ |

```python
t = (1, 2, 3)       # create with parens
t = 1, 2, 3         # tuple packing (same result)
a, b, c = t         # tuple unpacking
t[0]                # → 1
t[0] = 99           # ❌ TypeError — immutable
{(1, 2): "hello"}   # ✅ valid dict key
{[1, 2]: "hello"}   # ❌ TypeError — list not hashable
len(t)              # → 3 (fixed, can't change)
```

### Sorting by first element with heapq

`heapq` sorts tuples **lexicographically** — by the first element, then second, etc. This is why `(freq, num)` puts frequency first:

```python
import heapq
h = []
heapq.heappush(h, (2, "apple"))
heapq.heappush(h, (1, "banana"))
heapq.heappush(h, (3, "cherry"))
heapq.heappop(h)   # → (1, "banana") — smallest first element
heapq.heappop(h)   # → (2, "apple")
heapq.heappop(h)   # → (3, "cherry")
```

### Tuple unpacking in list comprehensions

```python
pairs = [(2, "x"), (3, "y")]
[a for a, b in pairs]          # → [2, 3]  — unpack each tuple, keep first
[b for a, b in pairs]          # → ["x", "y"]  — keep second
[x for x, y in pairs]          # works too, names are just labels
```

This is the same mechanism as tuple unpacking in `for` loops — each tuple is unpacked into named variables for that iteration.

## Dictionaries

```python
d = {"a": 1, "b": 2}

# key existence check
if key not in d:
    d[key] = []

# append to list value
d[key].append(val)

# iterate over keys, values, or both
for k in d:                    # keys only (default)
for k in d.keys():             # explicit keys
for v in d.values():           # values
for k, v in d.items():         # key-value pairs (returns view of tuples)
list(d.values())               # values as a list
list(d.items())                # → [("a", 1), ("b", 2)]
```

`dict.items()` returns a **view** of `(key, value)` tuples. It's lazy — it reflects changes to the dict without creating a new list. Use `list(d.items())` to materialize it.

### Iteration + unpacking

```python
for k, v in d.items():  # each item is a (key, value) tuple, unpacked inline
    print(k, v)
```

Same as:
```python
for item in d.items():
    k, v = item          # explicit unpacking
    print(k, v)
```

## Strings → Character Frequency

```python
def get_canonical_form(input: str) -> str:
    count = [0] * 26

    for i in range(len(input)):
        count[ord(input[i]) - ord('a')] += 1

    return tuple(count)   # tuple so it's hashable
```

| Idiom | Purpose |
|---|---|
| `[0] * 26` | Initialize frequency array |
| `ord(c) - ord('a')` | Map 'a'–'z' to 0–25 |
| `tuple(count)` | Convert list → tuple for dict key |

## Iterating Over Strings & Arrays

```python
s = "hello"
arr = [1, 2, 3]

# by element
for ch in s:           # h e l l o
for x in arr:          # 1 2 3

# by index
for i in range(len(s)):
for i, ch in enumerate(s):

# reverse
for ch in reversed(s):
for x in reversed(arr):

# slice iteration (every 2nd)
for ch in s[::2]:
```

## Sorting Strings

Strings are **immutable** — `sorted()` always returns a **list** of characters internally:

```python
s = "leetcode"

sorted(s)           # → ['c', 'd', 'e', 'e', 'l', 'o', 't']  (list)
"".join(sorted(s))  # → "cdeelot"                             (string)

# reverse sort
"".join(sorted(s, reverse=True))  # → "tolledec"
```

`sorted(s)` creates a list from the string, sorts the list in place internally, and returns the sorted list. The original string is unchanged. To get a string back, use `"".join(...)`.

## Heap — Top K Pattern

Use a **min-heap** to keep the `k` largest elements. The heap evicts the smallest element when it exceeds size `k`, so only the largest `k` remain.

```python
import heapq

def top_k_frequent(nums, k):
    freq = {}
    for num in nums:
        freq[num] = freq.get(num, 0) + 1

    heap = []
    for num, count in freq.items():   # iterate key-value pairs
        heapq.heappush(heap, (count, num))   # tuple so heapq sorts by count
        if len(heap) > k:
            heapq.heappop(heap)               # discard smallest count

    # unpack each (count, num) tuple, keep only num
    return [num for count, num in heap]
```

Step by step:

1. **`freq.items()`** — returns `(key, value)` tuples. Unpacked as `for num, count in ...`.
2. **`(count, num)` tuple** — heapq sorts by the **first element** (count). We want min-heap by frequency, so count goes first.
3. **Min-heap to get top K** — we push everything, but whenever the heap exceeds `k`, we pop the **smallest** (the min-heap's top). This discards low-frequency elements, keeping only the highest K.
4. **`[num for count, num in heap]`** — list comprehension with tuple unpacking. Each element in `heap` is `(count, num)`, we unpack and keep only `num`.

### Why not a max-heap?

A max-heap would keep the largest at the top, so when we pop (to stay at size `k`), we'd remove the largest — the exact elements we want to keep. A min-heap pops the smallest, which is exactly what we want to discard.

### Complexity

- Push/pop on a heap of size `k`: **O(log k)** each.
- Total: **O(n log k)** — much better than O(n log n) sorting when `k` is small.

## Common Patterns

| Task | Code |
|---|---|
| Iterate with index | `for i, v in enumerate(lst):` |
| Zip two lists | `for a, b in zip(xs, ys):` |
| Sort by key | `sorted(lst, key=lambda x: x[1])` |
| Dict get default | `d.get(key, default)` |
| Dict iterate key-value | `for k, v in d.items():` |
| Dict items as list | `list(d.items())` |
| Setdefault pattern | `d.setdefault(key, []).append(val)` |
| Counter | `from collections import Counter` |
| Default dict | `from collections import defaultdict` |
| Min-heap push/pop | `heapq.heappush(h, x)` / `heapq.heappop(h)` |
| Heap top k (keep largest) | `heappush; if len>k: heappop` (min-heap discards smallest) |
| List comp with unpack | `[x for a, b, c in list_of_tuples]` |

## String Building & Encoding Patterns

### Joining and splitting with delimiters

```python
# joining a list of strings
encoded = ''.join(arr)           # concatenate all pieces (no separator)
encoded = '#'.join(strs)         # join with '#' — but breaks if '#' in input
```

A naive delimiter like `#` fails when that character appears in the strings. The solution is **length-prefix encoding**.

### Length-prefix encoding (self-delimiting)

```python
# encode: prefix each string with #<length>#
for string in strs:
    arr.append('#' + str(len(string)) + '#' + string)
encoded = ''.join(arr)

# decode: read #, collect digits until next #, then read that many chars
i = 0
output = []
while i < len(s):
    if s[i] == '#':
        i += 1
        num_chars = []
        while i < len(s) and s[i] != '#':
            num_chars.append(s[i])
            i += 1
    length = int(''.join(num_chars))
    i += 1
    output.append(s[i: i + length])
    i += length
```

### Key functions

| Function | Why it's needed |
|---|---|
| `str(int_value)` | `len()` returns an `int`; you must convert to `str` before concatenating with other strings |
| `int(str_value)` | Parses a string of digit characters into an integer (e.g., `int("05")` → `5`) |
| `''.join(list)` | Concatenates a list of strings into one string efficiently |
| `list.append(x)` | Adds `x` to the end of a list — the standard way to build lists incrementally |
| `s[i: i + n]` | Slice that extracts `n` characters starting at index `i`; safely handles end-of-string |

### The delimiter problem

```python
# ❌ What if the strings contain '#'?
strs = ["hello", "wo#rld"]
encoded = '#'.join(strs)     # → "hello#wo#rld"
decoded = encoded.split('#')  # → ["hello", "wo", "rld"]  ❌ wrong!

# ✅ Length-prefix fixes this — decoder reads exactly n chars, ignores content
# "#5#hello#6#wo#rld"  →  knows to read 5 chars, then 6 chars  ✅
```

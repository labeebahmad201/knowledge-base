# Python Cheat Sheet

## Tuples

Immutable ordered sequence — unlike lists, usable as dictionary keys.

```python
t = (1, 2, 3)       # create with parens
t = 1, 2, 3         # tuple packing (same result)
a, b, c = t         # tuple unpacking
t[0]                # → 1
t[0] = 99           # ❌ TypeError — immutable
{(1, 2): "hello"}   # ✅ valid dict key
{[1, 2]: "hello"}   # ❌ TypeError — list not hashable
```

## Dictionaries

```python
d = {}

# key existence check
if key not in d:
    d[key] = []

# append to list value
d[key].append(val)

# get all values as list
list(d.values())
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

## Common Patterns

| Task | Code |
|---|---|
| Iterate with index | `for i, v in enumerate(lst):` |
| Zip two lists | `for a, b in zip(xs, ys):` |
| Sort by key | `sorted(lst, key=lambda x: x[1])` |
| Dict get default | `d.get(key, default)` |
| Setdefault pattern | `d.setdefault(key, []).append(val)` |
| Counter | `from collections import Counter` |
| Default dict | `from collections import defaultdict` |

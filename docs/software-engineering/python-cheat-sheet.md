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

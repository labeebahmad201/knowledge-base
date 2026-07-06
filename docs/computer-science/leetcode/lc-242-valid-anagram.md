# LC-242 — Valid Anagram

## Problem

Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.

> An anagram: X is an anagram of Y if both have the same characters and each character appears the same number of times. e.g., `cat` and `atc` are anagrams.

### Constraints

- `1 <= s.length, t.length <= 5 * 10^4`
- `s` and `t` consist of **lowercase English letters** only.

---

## Solution 1: Hash map counting (extra space)

```python
from collections import defaultdict

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False

        s_count = defaultdict(int)

        for char in s:
            s_count[char] += 1

        for char in t:
            s_count[char] -= 1

        for char in s_count:
            if s_count[char] != 0:
                return False

        return True
```

- **Time:** O(n) — single pass over each string.
- **Space:** O(1) — at most 26 keys (lowercase letters). Technically constant, but in the general case (Unicode) it could grow to O(k) where k is the distinct character set.
- **Pattern:** Count-increment, then count-decrement. If all counters end at 0, it's an anagram.

### Why `defaultdict`?

Avoids explicit `if key not in dict` checks. `defaultdict(int)` returns 0 for missing keys, so `s_count[char] += 1` works even when `char` is seen for the first time.

---

## Solution 1b: Two hash maps (simpler to read)

```python
from collections import defaultdict

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        s_count = defaultdict(int)
        t_count = defaultdict(int)

        for char in s:
            s_count[char] += 1

        for char in t:
            t_count[char] += 1

        if len(s) != len(t):
            return False

        for char in s_count:
            if s_count[char] != t_count[char]:
                return False

        return True
```

Same complexity as above; uses two maps instead of one. Slightly more readable, slightly more memory.

---

## Solution 2: Sorting (no extra space\*)

```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return sorted(s) == sorted(t)
```

- **Time:** O(n log n) — sorting dominates.
- **Space:** O(n) — `sorted()` returns a **new list**. Strings in Python are immutable, so in-place sorting is not possible.
- **Tradeoff:** Uses no *manual* extra data structures, but Python's `sorted()` allocates O(n) memory internally.

### Key insight

You cannot sort a string in-place because strings are immutable in Python. Any algorithm that sorts will need O(n) auxiliary space (for the list copy or for the sort's internal memory). So the "no extra space" claim for sorting is misleading in Python/JS/Java — the `\*` matters.

---

## Solution 3: Fixed array (most efficient for constrained input)

```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False

        count = [0] * 26

        for char in s:
            count[ord(char) - ord('a')] += 1

        for char in t:
            count[ord(char) - ord('a')] -= 1

        return all(x == 0 for x in count)
```

- **Time:** O(n)
- **Space:** O(1) — fixed 26-slot array.
- **Best for this constraint:** lowercase English letters only. Fast, no hash overhead.

---

## Follow-up: What if the input contains Unicode characters?

A hash map approach (Solution 1 or 1b) works naturally — just count characters instead of array indices. A fixed array of size 26 would not work.

- Python handles Unicode transparently in strings. `defaultdict(int)` works with any hashable character.
- Sorting also handles Unicode correctly (lexicographic by code point), though the O(n log n) tradeoff remains.

---

## Memory tradeoff deep-dive

**Why interviewers ask for "no extra space" solutions:**

When the dataset is too large to fit in memory (e.g., 12 GB strings, but only 12 GB RAM available), an extra hash map could cause OOM. A sorting solution still allocates memory internally, but a **streaming** approach that reads data in chunks (< available RAM) is the more robust long-term answer.

**What would actually scale:**

- Read strings in chunks that fit in memory
- Process each chunk with a hash map or sort
- Disk-backed merge for truly massive data

**Key point for interviews:**

```text
If memory is the constraint, neither hash-map nor sorting works if the whole input
doesn't fit. The real solution is streaming/chunking — read ≤ available RAM,
process incrementally, merge to disk. In any case, for LeetCode-scale inputs
(≤ 5*10^4 chars), both hash map and sorting are fine.
```

---

## Revision notes

- `defaultdict(int)` removes the need for explicit key-existence checks.
- `sorted(s) == sorted(t)` works in Python because `sorted()` returns a list and Python compares lists element-by-element. This does NOT work in JavaScript/Java the same way.
- In-place sorting a string is impossible in Python — strings are immutable.
- When constrained to lowercase letters, a `[0]*26` array is the fastest and leanest solution.
- `collections.Counter` also works: `Counter(s) == Counter(t)` — concise, but the O(1) space argument is weaker since the internal hash table may hold more keys than 26 for general input.

---

## Techniques

- [Hash Map / Hash Set](techniques#hash-map--hash-set)

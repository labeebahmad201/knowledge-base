# LC-424 — Longest Repeating Character Replacement

## TLDR

- We slide a window over the string and keep a count of every character inside it.
- A window is valid when `window_size - max_count <= k`: the number of non-majority characters (the ones we must replace) fits in the budget `k`.
- The obvious, safe implementation recomputes `max(char_to_freq.values())` every step. Cost is O(26) per step, so O(26n) = O(n) overall.
- A common "trick" instead keeps a running `max_frequent` that only ever goes up. When the window shrinks this value goes stale and can falsely mark an invalid window as valid (see `"AAB", k=0` below). It is still correct because a stale value can slide the window but never grow it past a length a real valid window already earned.
- Recommendation: use the exact `max(...)` version unless you can explain the stale one.

---

## Problem

You are given a string `s` consisting of only uppercase English letters and an integer `k`. You are allowed to replace at most `k` characters in the string with any uppercase English letter. Return the length of the longest substring containing the same letter after performing the replacement.

### Constraints

- `1 <= s.length <= 10^5`
- `s` consists of only uppercase English letters.
- `0 <= k <= s.length`

---

## Solution: Sliding window with exact max

```python
from collections import defaultdict

class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        char_to_freq = defaultdict(int)
        left = 0
        max_window_length = 0

        for right in range(len(s)):
            char_to_freq[s[right]] += 1

            # shrink while the window needs more than k replacements
            while (right - left + 1) - max(char_to_freq.values()) > k:
                char_to_freq[s[left]] -= 1
                left += 1

            max_window_length = max(max_window_length, right - left + 1)

        return max_window_length
```

- **Time:** O(26n) = O(n). Every step scans the frequency map (at most 26 letters) to find the max, and the total number of shrink operations across the run is at most `n`.
- **Space:** O(26) = O(1). The map holds at most the 26 uppercase letters.
- **Pattern:** Sliding window + hash map frequency tracking.

The key line is `max(char_to_freq.values())`. Because `char_to_freq` always holds exactly the characters currently in the window (we add on the right, remove on the left), that max is always the true most frequent count. The validity check is therefore a real check on every step. There is no staleness to reason about.

### Validity check

A window is valid if:

```
window_size - max_frequency <= k
```

This means the number of characters that are NOT the most frequent (and thus need replacement) is within our budget `k`. If this holds, we can replace those characters to make the entire window the same letter.

### Shrinking strategy

When the window becomes invalid (more than `k` replacements needed), we shrink from `left` until it is valid again. We update the frequency map by decrementing the count of the character at `left`, and move `left` forward.

---

## Thought process

### Brute force (O(n²))

Try every possible substring and check whether it can be made valid by replacing at most `k` characters.

**Step 1 — how many substrings exist?**

A substring is fully identified by a `(start, end)` pair with `start <= end`. Plotting those pairs gives a triangle:

```
index:      0     1     2     3     4     5     6
            A     A     B     A     B     B     A
                          n = 7

start=0 -> [0,0] [0,1] [0,2] [0,3] [0,4] [0,5] [0,6]   7 substrings
start=1 ->       [1,1] [1,2] [1,3] [1,4] [1,5] [1,6]   6 substrings
start=2 ->             [2,2] [2,3] [2,4] [2,5] [2,6]   5 substrings
start=3 ->                   [3,3] [3,4] [3,5] [3,6]   4 substrings
start=4 ->                         [4,4] [4,5] [4,6]   3 substrings
start=5 ->                               [5,5] [5,6]   2 substrings
start=6 ->                                     [6,6]   1 substring
                                 ---------------------
                                 7+6+5+4+3+2+1 = 28
                                 = n(n+1)/2 = O(n²)
```

So the enumeration alone is already `n(n+1)/2 = O(n²)` pairs — the upper triangle of an `n × n` grid.

**Step 2 — cost of validating each one**

```
fix start, sweep end:                re-scan the substring each time:

  start=0:  end=0,1,2,...,n-1   <-     for each pair: O(n) scan
            (carry counts forward)    O(n²) pairs x O(n) = O(n³)
            total O(n) per start

  n starts x O(n) = O(n²)             too slow
```

- Keeping a running character-count for a fixed `start` while `end` sweeps right keeps validation amortized O(1) per pair, which gives **O(n²) total**.
- Re-scanning each substring from scratch makes it **O(n³)**, even worse.

Either way it is far too slow for `n = 10^5` (`10^10` operations is out of reach). The point of the sliding window is to avoid enumerating that triangle at all: each character enters and leaves the window at most once.

### Why sliding window fits

We expand the window by moving `right` to the right. Only one character changes per step (the new character at `right`), so we can update the frequency map in O(1) and check validity in O(1) without re-scanning the entire window.

---

## Optimization: stale max_frequent

The exact version recomputes the max on every step, which scans up to 26 entries. That is already O(n). The version you will see most often on LeetCode avoids that scan by keeping a running `max_frequent` that is updated only when a character is added:

```python
from collections import defaultdict

class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        freq_map = defaultdict(int)
        left = 0
        max_frequent = 0
        longest_substring = 0

        for right in range(len(s)):
            freq_map[s[right]] += 1
            max_frequent = max(max_frequent, freq_map[s[right]])

            while (right - left + 1) - max_frequent > k:
                freq_map[s[left]] -= 1
                left += 1

            longest_substring = max(longest_substring, right - left + 1)

        return longest_substring
```

The only change is that `max(char_to_freq.values())` is replaced by `max_frequent = max(max_frequent, freq_map[s[right]])`. This saves the O(26) scan, which is a constant-factor speedup.

### The never-shrink variant

The most common version you will see drops the `while` loop and the `longest_substring` variable entirely:

```python
from collections import Counter

class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        char_count = Counter()
        left = 0
        max_freq = 0

        for right, char in enumerate(s):
            char_count[char] += 1
            max_freq = max(max_freq, char_count[char])

            if (right - left + 1) - max_freq > k:
                char_count[s[left]] -= 1
                left += 1

        return len(s) - left
```

It relies on two facts, both consequences of `max_freq` being non-decreasing.

**`if` is enough, no `while`.** The shrink is what fixes an invalid window, and one shrink always fixes it. Take `s = "AABB"`, `k = 1`. The full window is invalid: `4 - 2 = 2 > 1`. Shrink one from the left and it becomes `"ABB"`: `3 - 2 = 1 <= 1`, valid. The length dropped by one, and `length - max_freq` dropped with it.

Why one shrink always does the job: before a step the window satisfies `length - max_freq <= k`. Adding a character raises `length` by one and raises `max_freq` by at most one (only `s[right]` changed). If `max_freq` rises, `(length+1) - (max_freq+1) = length - max_freq <= k`, still valid. If it does not, `(length+1) - max_freq = (length - max_freq) + 1 <= k + 1`, over budget by at most one, and removing one character drops `length` back by one to restore `length - max_freq <= k`.

**`return len(s) - left`, no max tracking.** The window length never decreases. Each step either grows the window by one (the `if` did not fire) or slides it by one keeping the same length (the `if` fired). So the final window size is the largest window size ever reached, and it equals `len(s) - left`. This is the same identity as the previous version: `answer = min(n, max_frequent_final + k)`.

One caveat on that single shrink: it restores the *check* (`length - max_freq <= k`), not genuine validity. Because `max_freq` can be stale, the shrunk window can still be genuinely invalid, exactly as in the `"AAB"`, `k = 0` trace above. That is harmless for the same reason as before: the length did not grow, so the answer is unaffected.

**Dry run.** `s = "AABABBA"`, `k = 1`:

| right | add | window after add | size | max_freq | size - max_freq | action | left after |
|-------|-----|------------------|------|----------|-----------------|--------|-----------|
| 0 | `A` | `A` | 1 | 1 | 0 | grow | 0 |
| 1 | `A` | `AA` | 2 | 2 | 0 | grow | 0 |
| 2 | `B` | `AAB` | 3 | 2 | 1 | grow | 0 |
| 3 | `A` | `AABA` | 4 | 3 | 1 | grow | 0 |
| 4 | `B` | `AABAB` | 5 | 3 | 2 | shrink | 1 |
| 5 | `B` | `ABABB` | 5 | 3 | 2 | shrink | 2 |
| 6 | `A` | `BABBA` | 5 | 3 | 2 | shrink | 3 |

The window grows while `size - max_freq <= 1`. At `right = 4` it reaches `2 > 1`, so it starts sliding: each step removes one from the left and the size stays at `5`. It never grows again because `max_freq` never rises above `3`. The answer is `len(s) - left = 7 - 3 = 4`.

### The asymmetry: add vs remove

When `right` advances, exactly one count goes up, so the only entry that can beat the current max is the one that just changed. Comparing it against the running max is enough.

When `left` advances, exactly one count goes down. That single entry cannot tell you the new max, because the runner-up lives among the keys you did not touch. This code does not rescan, so `max_frequent` simply never decreases. After a removal it becomes an upper bound (stale-high) on the true window max.

The asymmetry worth remembering: additions can set a new record for free, removals can only make the record stale.

### Where it fails: "AAB", k = 0

The stale value is not a theoretical worry. It makes the check falsely accept an invalid window. Trace `"AAB"` with `k = 0`:

| step | added | window | size | `freq_map` (true) | true max | `max_frequent` (stored) | `size - stored` | verdict |
|------|-------|--------|------|-------------------|----------|-------------------------|-----------------|---------|
| 1 | `A` | `A` | 1 | `{A:1}` | 1 | 1 | 0 | valid |
| 2 | `A` | `AA` | 2 | `{A:2}` | 2 | 2 | 0 | valid |
| 3 | `B` | `AAB` | 3 | `{A:2, B:1}` | 2 | 2 | 1 | `1 > 0`, shrink |
| 4 | (remove `A`) | `AB` | 2 | `{A:1, B:1}` | **1** | **2** | 0 | **falsely valid** |

The failure is at step 4. When we removed the leftmost `A`, the map was correctly decremented to `{A:1, B:1}`, but `max_frequent` was never lowered from `2` to `1`. So the check computes:

```
2 - 2 = 0 <= 0
```

and declares the window `"AB"` valid. But `"AB"` is two different letters and `k = 0`, so it genuinely needs `1` replacement. The check lied, purely because `max_frequent` is a ghost of the old `"AA"` window.

The exact version does not make this mistake. It recomputes `max({A:1, B:1}) = 1`, sees `2 - 1 = 1 > 0`, shrinks again to the length-1 window `"B"`, and finishes with `longest_substring = 2` (earned by `"AA"`).

### Why it is still correct

Two separate facts make the stale value harmless. They point in opposite directions, and together they bracket the answer.

**It never rejects a valid window.** The stored value is always an upper bound on the true max: `max_frequent >= true_max`. So

```
window_size - max_frequent <= window_size - true_max
```

Subtracting a bigger number gives a smaller result. Whenever the window is genuinely valid (`window_size - true_max <= k`), the stale check also passes (`window_size - max_frequent <= k`). Raising `max_frequent` can only make the left side smaller, so it can turn a "reject" into an "accept" but never the reverse. The stale version never throws away a window the exact version would keep, so it can never undercount.

**It never over-grows the answer.** The answer is the maximum length ever reached. A window's length only grows when a character is added and the check passes; in that moment `max_frequent` was just refreshed by the newly added character, so it equals the true max. Length grows only on honest steps. When `max_frequent` is stale, the check can only keep the window sliding at its current length, never grow it to a value a real valid window did not already earn.

In `"AAB"`, the first fact says the stale version keeps every valid window (it never rejects `"AA"`). The second fact says it never grows past `2`: the stale value let it hold `"AB"` of length `2`, but never length `3`. Together the answer stays `2`.

So the stale max makes the algorithm hold the wrong window sometimes, but never a longer one and never a shorter one than the true answer. Since the answer is a length, that is enough.

### The identity behind it

There is a still cleaner way to see the same thing. The shrink loop only ever cuts the window back to `max_frequent + k`, so the window grows one character at a time until its length reaches `max_frequent + k`, then slides at exactly that length, growing again only when `max_frequent` grows. The length recorded at the end is therefore

```
answer = min(n, max_frequent_final + k)
```

where `max_frequent_final` is the stored value at the end of the run. The recorded length is the largest `max_frequent + k` the run ever reached. This is why the stale value is not noise: it is the very term the answer is built from, and it only ever changes when a character genuinely reaches a new count.

All of these deductions were checked against a brute-force reference (an O(n^2) scan over every substring) for every string up to length 9 over a 3-letter alphabet, plus tens of thousands of random longer cases. The identity `answer = min(n, max_frequent_final + k)` matched the brute force in every case, and a new record length was never set by an invalid window.

This subtlety is why the exact version is the safer default. The stale version is a constant-factor optimization you should only use if you can explain where it "fails" (`"AAB", k=0`) and why that failure does not change the result.

---

## Key insight

The sliding window works because we maintain a frequency map of the characters in the current window. A window is valid when `window_size - max_frequency <= k`, meaning the replacement budget covers everything that is not the majority character. The safe implementation recomputes `max(freq_map.values())` each step; the optimized version caches it and accepts that the cached value can go stale after a shrink without breaking the answer.

---

## Related

- [Tracking Max Frequency in a Sliding Window](lc-sliding-window-max-frequency) (this technique, in isolation)
- [LC-3 — Longest Substring Without Repeating Characters](lc-3-longest-substring-without-repeating-characters) (sliding window variant)
- [LC-242 — Valid Anagram](lc-242-valid-anagram) (character frequency map)

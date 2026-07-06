# LC-424 — Longest Repeating Character Replacement

## Problem

You are given a string `s` consisting of only uppercase English letters and an integer `k`. You are allowed to replace at most `k` characters in the string with any uppercase English letter. Return the length of the longest substring containing the same letter after performing the replacement.

### Constraints

- `1 <= s.length <= 10^5`
- `s` consists of only uppercase English letters.
- `0 <= k <= s.length`

---

## Solution: Sliding window with frequency map

```python
from collections import defaultdict

class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        freq_map = defaultdict(int)
        n = len(s)
        start = 0
        end = 0
        longest_substring = 0
        max_frequent = 0

        while end < n:
            freq_map[s[end]] += 1

            max_frequent = max(freq_map[s[end]], max_frequent)

            # end - start + 1 is the window size
            if ((end - start + 1) - max_frequent) > k:
                while start <= end and ((end - start + 1) - max_frequent > k):
                    freq_map[s[start]] -= 1
                    max_frequent = max(freq_map[s[start]], max_frequent)
                    start += 1

            longest_substring = max(end - start + 1, longest_substring)
            end += 1

        return longest_substring
```

- **Time:** O(n) — each character is visited at most twice (once by `end`, once by `start`).
- **Space:** O(min(n, m)) — where `m` is the character set size (at most 26 letters).
- **Pattern:** Sliding window + hash map frequency tracking.

---

## Thought process

### Brute force (O(n²))

Try all possible substrings and for each check if it can be made valid by replacing at most `k` characters. That's O(n²) substrings, each checked in O(n) — too slow.

### Why sliding window fits

We expand the window by moving `end` to the right. Only one character changes per step (the new character at `end`), so we can update the frequency map in O(1) and check validity in O(1) without re-scanning the entire window.

### Validity check

A window is valid if:

```
window_size - max_frequency <= k
```

This means the number of characters that are NOT the most frequent (and thus need replacement) is within our budget `k`. If this holds, we can replace those characters to make the entire window the same letter.

### Shrinking strategy

When the window becomes invalid (more than `k` replacements needed), we shrink from `start` until the window is valid again. We update the frequency map by decrementing the count of the character at `start`, and move `start` forward.

### Common mistake: not updating max_frequent when shrinking

A subtle point: when shrinking the window, the character that was most frequent might have exited the window. We must recompute `max_frequent` after each shrink step. However, since we only need the **maximum** frequency and the window is getting smaller, we can simply compare the current shrinking character's frequency with the existing max — if it's higher, update it.

### Why max_frequent doesn't need a full recomputation

When shrinking, we don't need to scan all characters in the frequency map to find the new max. The max frequency can only decrease or stay the same as we remove characters. Since we're already comparing `freq_map[s[start]]` against `max_frequent`, and only updating if the removed character's new count exceeds the current max, this is sufficient. The max will naturally "catch up" as the window expands again.

---

## Key insight

The sliding window works because we maintain a frequency map of characters in the current window. The window is valid when `window_size - max_frequency <= k`, meaning we have enough replacement budget to make all characters in the window the same. As we expand by moving `end` right, we check validity and shrink from `start` if needed. The longest valid window seen is our answer.

---

## Related

- [LC-3 — Longest Substring Without Repeating Characters](lc-3-longest-substring-without-repeating-characters) (sliding window variant)
- [LC-242 — Valid Anagram](lc-242-valid-anagram) (character frequency map)

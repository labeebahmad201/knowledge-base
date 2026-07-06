# LC-3 — Longest Substring Without Repeating Characters

## Problem

Given a string `s`, find the length of the **longest substring** without repeating characters.

### Constraints

- `0 <= s.length <= 5 * 10^4`
- `s` consists of English letters, digits, symbols, and spaces.

---

## Solution: Sliding window with frequency map

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        longest_window = 0
        start = 0
        end = 0
        n = len(s)
        freq_map = defaultdict(int)

        while end < n:
            freq_map[s[end]] += 1

            # found duplicate
            if freq_map[s[end]] > 1:
                # shrink window until duplicate for s[end] is gone
                while start <= end and freq_map[s[end]] > 1:
                    freq_map[s[start]] -= 1
                    start += 1
                # after loop: start is at end + 1
            else:
                window_size = end - start + 1

            # keep longest_window updated outside if/else
            longest_window = max(window_size, longest_window)

            # always move end to extend window next iteration
            end += 1

        return longest_window
```

- **Time:** O(n) — each character is visited at most twice (once by `end`, once by `start`).
- **Space:** O(min(n, m)) — where `m` is the character set size (at most 26 letters, 10 digits, etc.).
- **Pattern:** Sliding window + hash map frequency tracking.

---

## Thought process

### Brute force (O(n²))

The natural first thought: for every possible starting index, try every possible ending index and check if the substring has duplicates. That gives us O(n²) starting/ending pairs, and each check costs O(n) — so O(n³) total, or O(n²) with a hash set per window. Still too slow.

### Why sliding window fits

The key realization: we're sliding the window one character at a time, so only **one character changes** per step (the one at `end`). We don't need to re-scan the entire window for duplicates — we just check if the new character's frequency goes above 1 in the frequency map. This makes the check O(1) per step.

### Shrinking strategy

When a duplicate is found at position `end`, we can't just shrink from the left one by one until the duplicate is gone — that's valid but not the only way. The insight is that we need to move `start` to right after the last occurrence of the duplicate character. But the simpler approach (shrink while `freq_map[s[end]] > 1`) works and is easier to reason about.

### Common mistakes

1. **Only updating `longest_window` inside the valid branch** — it must be updated every iteration, outside the `if/else`, because the window is valid after the shrink loop too.
2. **Only moving `end` when the window is valid** — `end` must always advance to keep expanding and exploring the string.
3. **Shrinking all the way to `end`** — we only need to shrink until the specific duplicate character's count drops back to 1.

---

## Key insight

The sliding window works because we're building the window incrementally. When `end` adds a character, we check the frequency map — if it's > 1, we've hit a duplicate and must shrink from `start` until it's gone. The longest valid window seen at any point is our answer. This avoids re-checking the entire window each time.

---

## Related

- [LC-125 — Valid Palindrome](lc-125-valid-palindrome) (two-pointer on string)
- [LC-242 — Valid Anagram](lc-242-valid-anagram) (character frequency map)

---

## Techniques

- [Sliding Window](techniques#sliding-window)

# Tracking Max Frequency in a Sliding Window

## The technique

When using a sliding window with a frequency map, you can track the **maximum frequency** incrementally instead of recomputing it from scratch on every step. This keeps the per-step cost at O(1) instead of O(charset size).

```python
freq_map = defaultdict(int)
max_frequent = 0

while end < n:
    freq_map[s[end]] += 1
    max_frequent = max(freq_map[s[end]], max_frequent)
    # ...
    end += 1
```

The key insight: when a character enters the window (at `end`), its count increases by 1. The new max frequency is either the previous max or this character's new count — nothing else can become the new max without increasing. So a single `max()` call is sufficient.

This is a special case of a general rule: if a step mutates one entry, only that entry can change the aggregate. The reverse is not true, and that asymmetry is covered under Shrinking below.

---

## The validity check

For problems where you can replace at most `k` characters, a window is valid when:

```
window_size - max_frequency <= k
```

This computes the number of characters that are NOT the most frequent (i.e., characters that need replacement) and checks if it fits within the budget `k`. No need to iterate over the frequency map — the check is O(1).

---

## Shrinking: why you don't need a full recomputation

When the window shrinks (moving `start` forward), a character exits the window and its count decrements. You might think you need to scan all frequencies to find the new max — but you don't.

The `max()` on the shrink side (`max_frequent = max(freq_map[s[start]], max_frequent)`) can never lower the stored value, so `max_frequent` can only **stay the same or become stale-high** during a shrink. It never goes below the true max.

Stale-high makes the validity check **more permissive**, not stricter: `window_size - max_frequent` comes out too small, so a window that genuinely needs `k + 1` replacements can pass the `<= k` test. The algorithm then stops shrinking early and may record a window that does not actually qualify.

That is still safe for LC-424, because a recorded length never exceeds the true optimum. An under-shrunk window can never be longer than a genuinely valid window of the same era, so the final `max` lands on the right answer.

---

## When to use this technique

- Sliding window problems where you need to know the most frequent element inside the window.
- You're allowed to modify up to `k` elements (replacement budget).
- The validity of the window depends on the relationship between window size and the count of the dominant element.

---

## Common mistakes

1. **Recomputing max from scratch on every step** — costs O(charset) per step, so O(26n) for lowercase letters. That is still O(n) and perfectly fast for a fixed small alphabet, but it is unnecessary: the incremental `max()` is sufficient. Scanning `max(freq_map.values())` is the exact, obviously correct baseline if you would rather not reason about the stale value.
2. **Shrinking and recomputing max during shrink** — unnecessary for this problem. A full rescan per removal would push the solution to O(n * charset), and the stale value still yields a correct answer.
3. **Forgetting that max_frequent can lag** — fine here, but for the right reason. A stale (too-high) `max_frequent` makes the validity check *permissive*, so you shrink too late and may record a window that does not qualify. That is safe only because the recorded length never exceeds the true optimum. If the answer *were* the max itself (LC-239), this would be a bug.

---

## Related problems

| Problem | Technique |
|---------|-----------|
| [LC-424 — Longest Repeating Character Replacement](lc-424-longest-repeating-character-replacement) | Max frequency tracking + sliding window |
| [LC-3 — Longest Substring Without Repeating Characters](lc-3-longest-substring-without-repeating-characters) | Sliding window + frequency map (different validity check) |
| [LC-347 — Top K Frequent Elements](lc-347-top-k-frequent-elements) | Frequency map (not sliding window, but frequency tracking) |

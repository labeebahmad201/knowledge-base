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

The max frequency can only **decrease or stay the same** as characters leave. It never increases during a shrink. Since you're only computing the longest valid window seen so far, a slightly stale `max_frequent` that's too high doesn't cause incorrect results — it just means the validity check becomes stricter temporarily. The true max will "catch up" as the window expands again.

This is the same reason we don't need a `max()` call during shrinking — we only update `max_frequent` when a character enters (at `end`), not when one leaves (at `start`).

---

## When to use this technique

- Sliding window problems where you need to know the most frequent element inside the window.
- You're allowed to modify up to `k` elements (replacement budget).
- The validity of the window depends on the relationship between window size and the count of the dominant element.

---

## Common mistakes

1. **Recomputing max from scratch on every step** — this makes the solution O(n * charset) instead of O(n). The incremental `max()` is sufficient.
2. **Shrinking and recomputing max during shrink** — unnecessary. The max can only decrease during shrink, so leaving it stale is safe. It will self-correct on the next expand.
3. **Forgetting that max_frequent can lag** — this is actually fine. A stale (too-high) max_frequent makes the validity check stricter, so you might shrink more than needed, but you'll never miss a valid window. The answer is still correct.

---

## Related problems

| Problem | Technique |
|---------|-----------|
| [LC-424 — Longest Repeating Character Replacement](lc-424-longest-repeating-character-replacement) | Max frequency tracking + sliding window |
| [LC-3 — Longest Substring Without Repeating Characters](lc-3-longest-substring-without-repeating-characters) | Sliding window + frequency map (different validity check) |
| [LC-347 — Top K Frequent Elements](lc-347-top-k-frequent-elements) | Frequency map (not sliding window, but frequency tracking) |

# Techniques

A reference of reusable patterns and techniques used across LeetCode problems.

---

## Two-Pointer

Use two pointers moving toward each other (or in the same direction) to narrow down the search space. Often paired with sorting.

**When to use:** Sorted arrays, finding pairs/triplets, palindromes, container-type problems.

| Problem | Insight |
|---------|---------|
| [LC-1 — Two Sum (Sorted)](lc-1-two-sum) | Narrow from both ends based on sum comparison |
| [LC-11 — Container With Most Water](lc-11-container-with-most-water) | Greedy: move the shorter line inward |
| [LC-15 — 3Sum](lc-15-3sum) | Fix one element, two-pointer on the rest |
| [LC-125 — Valid Palindrome](lc-125-valid-palindrome) | Skip non-alphanumeric, compare from ends |

---

## Sliding Window

Maintain a window `[start, end]` over the string/array, expanding right and shrinking left when a constraint is violated.

**When to use:** Substring/subarray problems with constraints on characters or values.

| Problem | Insight |
|---------|---------|
| [LC-3 — Longest Substring Without Repeating Characters](lc-3-longest-substring-without-repeating-characters) | Shrink when duplicate found in frequency map |
| [LC-424 — Longest Repeating Character Replacement](lc-424-longest-repeating-character-replacement) | Validity: `window_size - max_frequency <= k` |

### Technique: [Max Frequency Tracking in Sliding Window](lc-sliding-window-max-frequency)

Track `max_frequency` incrementally with a single `max()` call instead of recomputing from the full frequency map. Enables O(1) validity checks.

---

## Hash Map / Hash Set

Use a hash map or set for O(1) lookups, frequency counting, or grouping.

**When to use:** Frequency analysis, duplicate detection, fast membership tests.

| Problem | Insight |
|---------|---------|
| [LC-36 — Valid Sudoku](lc-36-valid-sudoku) | Compound keys `(val, "r", i)` for single-pass validation |
| [LC-128 — Longest Consecutive Sequence](lc-128-longest-consecutive-sequence) | Only start counting from sequence heads (`num - 1 not in set`) |
| [LC-242 — Valid Anagram](lc-242-valid-anagram) | Increment for s, decrement for t; check all zeros |
| [LC-271 — Encode and Decode Strings](lc-271-encode-and-decode-strings) | Length-prefix format `#<len>#<string>` for self-delimiting encoding |

---

## Prefix / Suffix Pre-computation

Precompute prefix and/or suffix arrays to answer range queries in O(1).

**When to use:** Products, sums, min/max excluding current element.

| Problem | Insight |
|---------|---------|
| [LC-42 — Trapping Rain Water](lc-42-trapping-rain-water) | `water[i] = min(maxLeft[i], maxRight[i]) - height[i]` |
| [LC-238 — Product of Array Except Self](lc-238-product-of-array-except-self) | Prefix product + suffix product, O(1) extra space |

---

## Heap / Priority Queue

Maintain a heap of fixed size to track top/bottom K elements.

**When to use:** Top K problems, median finding, scheduling.

| Problem | Insight |
|---------|---------|
| [LC-347 — Top K Frequent Elements](lc-347-top-k-frequent-elements) | Frequency map + min-heap of size K, O(n log k) |

---

## Greedy

Make the locally optimal choice at each step without backtracking.

**When to use:** Problems with greedy-choice property and optimal substructure.

| Problem | Insight |
|---------|---------|
| [LC-121 — Best Time to Buy and Sell Stock](lc-121-best-time-to-buy-and-sell-stock) | Track min-so-far, compute max profit at each step |

See also: [Greedy Algorithms](lc-greedy) — a deeper dive into when and why greedy works.

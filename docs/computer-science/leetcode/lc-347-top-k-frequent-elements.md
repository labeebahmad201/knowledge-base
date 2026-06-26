# LC-347 — Top K Frequent Elements

## Problem

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in **any order**.

### Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `k` is in the range `[1, the number of unique elements]`
- It is **guaranteed** that the answer is **unique**.

---

## Solution 1: Hash map + sort (brute force)

```python
from collections import defaultdict

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        freq_map = defaultdict(int)

        for num in nums:
            freq_map[num] += 1

        list_sorted_by_freq = sorted(freq_map.items(), key=lambda x: x[1], reverse=True)

        top_k = []
        for i in range(0, k):
            top_k.append(list_sorted_by_freq[i][0])

        return top_k
```

- **Time:** O(n log n) — counting frequencies is O(n), but sorting all unique elements dominates at O(n log n).
- **Space:** O(n) — frequency map stores up to n key-value pairs.
- **Observation:** We sort *every* unique element, but we only need the top `k`. That's wasted work when `k` is small relative to the number of unique values.

### What happens under the hood

`freq_map.items()` returns `(num, freq)` pairs. The `sorted(..., key=lambda x: x[1], reverse=True)` sorts by frequency descending. We then pluck the first `k` elements' keys.

---

## Solution 2: Min-heap (optimal)

```python
import heapq

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        freq_map = defaultdict(int)

        for num in nums:
            freq_map[num] += 1

        min_heap = []

        for num, freq in freq_map.items():
            heapq.heappush(min_heap, (freq, num))
            if len(min_heap) > k:
                heapq.heappop(min_heap)

        return [num for freq, num in min_heap]
```

- **Time:** O(n log k) — pushing/popping on a heap of size at most `k` costs O(log k) per operation. Building the frequency map is O(n).
- **Space:** O(n) — the frequency map still holds all unique entries.

### How the min-heap trick works

1. Iterate over the frequency map.
2. Push `(freq, num)` into a min-heap. Python's `heapq` orders by the first tuple element (frequency).
3. If the heap exceeds size `k`, pop the smallest frequency element. Since we use a *min*-heap, the smallest rises to the top — so we evict the least frequent candidate.
4. After processing all elements, the heap holds exactly the `k` most frequent elements.

### Why this is faster than sorting

Sorting requires O(n log n) because it orders *all* elements. The heap approach keeps only `k` candidates at any time, reducing the log factor from log n to log k. For small `k` (e.g., `k = 1`), this is effectively O(n).

---

## Follow-up: Can we do better than O(n log k)?

Yes — **Bucket sort** can achieve O(n) time by using the frequency as an index:

```python
class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        freq_map = defaultdict(int)
        for num in nums:
            freq_map[num] += 1

        bucket = [[] for _ in range(len(nums) + 1)]
        for num, freq in freq_map.items():
            bucket[freq].append(num)

        res = []
        for freq in range(len(bucket) - 1, 0, -1):
            for num in bucket[freq]:
                res.append(num)
                if len(res) == k:
                    return res
```

- **Time:** O(n) — counting + distributing into buckets is linear. Iterating buckets from highest to lowest frequency is also linear.
- **Space:** O(n) — frequency map + bucket array of size `n + 1`.
- **Tradeoff:** Linear time, but only works because frequency is bounded by `n` (the array length), so we can use it as a direct index.

---

## Revision notes

- `defaultdict(int)` is the cleanest way to build a frequency map in Python.
- `heapq` in Python is a **min-heap**. To get max-heap behavior, negate values or pop the smallest when the heap is oversized.
- The tuple `(freq, num)` is used so `heapq` sorts by frequency first. Python compares tuples lexicographically.
- Bucket sort exploits the constraint that max frequency ≤ `n`, turning frequency into an index — only practical when the input size is the upper bound.

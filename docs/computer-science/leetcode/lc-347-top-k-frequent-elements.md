# LC-347 - Top K Frequent Elements

## Problem

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in **any order**.

### Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `k` is in the range `[1, the number of unique elements]`
- It is **guaranteed** that the answer is **unique**.
- Time complexity must be **better than O(n log n)**.

---

## Solution 1: Hash map + sort (first thought)

When you first see this, the instinct is: get the frequency of each value, sort by frequency (largest to smallest), then take the first `k` elements. That works.

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

- **Time:** O(n log n) - frequency count is O(n), sorting dominates at O(n log n). Then extraction is O(k), which is negligible.
- **Space:** O(n) - frequency map holds all unique entries.

### The problem

We sorted *everything*, but we only need the top `k`. If there are 10,000 unique elements and k is 3, we just sorted 9,997 elements for nothing. Sorting is O(n log n) and the problem says we *must* do better than that.

---

## Solution 2: Min-heap (arriving at it)

So we need something that avoids sorting everything. A heap comes to mind: a heap is not fully sorted, but it keeps the smallest (or largest) element accessible at the top in O(log n) push/pop time.

How do we use it? We iterate over the frequency map and push each `(freq, num)` into a heap. But we need to track only `k` elements at a time, so after each push, if the heap size exceeds `k`, we pop one off. If we pop from a max-heap, we'd lose one of the top `k` elements we want. So we use a **min-heap** instead - the smallest frequency element rises to the top, and we pop that one. The heap ends up with exactly the `k` largest frequencies.

Since the heap never holds more than `k` elements, every push and pop is O(log k), not O(log n). For small `k`, this is a big improvement over sorting.

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

- **Time:** O(n log k) - frequency count O(n), each heap push/pop is O(log k), with at most n operations. Since `log k <= log n`, this satisfies the "better than O(n log n)" requirement.
- **Space:** O(n) - frequency map still holds all entries.

### Why this works

Python's `heapq` is a min-heap, so `(freq, num)` tuples are ordered by frequency. When the heap has more than `k` elements, `heappop` removes the element with the smallest frequency. After processing everything, the `k` elements that remain are the ones with the largest frequencies - all the smaller ones got evicted along the way.

---

## Revision notes

- `defaultdict(int)` avoids explicit key-existence checks when counting.
- `heapq` is a **min-heap** in Python. To make it behave like a max-heap, you can negate values or (as we did here) pop the smallest when the heap is oversized.
- Tuple `(freq, num)` ensures `heapq` sorts by frequency first, then by num as a tiebreaker.
- The key insight: you don't need to sort everything. You just need to track the top `k` candidates, and a min-heap of size `k` does exactly that.

---

## Techniques

- [Heap / Priority Queue](techniques#heap--priority-queue)

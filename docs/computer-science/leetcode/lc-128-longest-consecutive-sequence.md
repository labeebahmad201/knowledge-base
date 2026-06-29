# LC-128 — Longest Consecutive Sequence

## Problem

Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in **O(n)** time.

### Constraints

- `0 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

---

## Solution 1: Hash set lookups (O(n))

```python
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        longest = 0

        for num in num_set:
            if num - 1 not in num_set:   # start of a sequence
                cur = num
                length = 1
                while cur + 1 in num_set:
                    cur += 1
                    length += 1
                longest = max(longest, length)

        return longest
```

- **Time:** O(n) — each number is visited at most twice (once in the outer loop, once in a while loop when it's part of a sequence).
- **Space:** O(n) — the hash set stores all elements.
- **Pattern:** Only build sequences from their **smallest** element. If `num - 1` exists, `num` is not the start, so skip it. This guarantees each element is processed in only one while loop.

### Why this works in O(n)

A naive approach would sort the array (O(n log n)) then scan. The hash set trick avoids sorting by using O(1) lookups. The key insight is that we only start counting when `num - 1` is absent — this bounds the total work across all sequences to O(n).

---

## Solution 2: Sorting (O(n log n), for reference)

```python
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        if not nums:
            return 0

        nums.sort()
        longest = 1
        cur_len = 1

        for i in range(1, len(nums)):
            if nums[i] == nums[i - 1]:
                continue       # skip duplicates
            if nums[i] == nums[i - 1] + 1:
                cur_len += 1
            else:
                longest = max(longest, cur_len)
                cur_len = 1

        return max(longest, cur_len)
```

- **Time:** O(n log n) — sorting.
- **Space:** O(1) or O(n) depending on sort implementation.
- **Tradeoff:** Simpler, but violates the O(n) requirement.

---

## Key insight

The `if num - 1 not in num_set` check is the crux. It ensures we only start counting at the **beginning** of each consecutive run, so each element is examined by at most one inner while loop. Without this guard, the algorithm degrades to O(n²).

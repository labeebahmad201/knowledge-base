# LC-1 — Two Sum (Sorted)

## Problem

Given a **1-indexed** array of integers `numbers` that is already **sorted in non-decreasing order**, find two numbers that add up to a specific `target` number. Return the indices of the two numbers (1-indexed) as a list `[index1, index2]`.

> You may not use the same element twice. There is exactly one solution.

### Constraints

- `2 <= numbers.length <= 3 * 10^4`
- `-1000 <= numbers[i] <= 1000`
- `numbers` is sorted in **non-decreasing order**.
- `-1000 <= target <= 1000`
- Exactly **one valid solution** exists.

---

## Solution: Two-pointer

```python
class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:

        left = 0
        right = len(numbers) - 1

        while left < right:

            target_sum = numbers[left] + numbers[right]
            if target_sum > target:
                right -= 1
            elif target_sum < target:
                left += 1
            else:
                return [left + 1, right + 1]

        return []
```

- **Time:** O(n) — each element is visited at most once.
- **Space:** O(1) — only two pointers.
- **Pattern:** Two-pointer on sorted array.

---

## Key insights

- The array is **sorted**, so the two-pointer approach works: too large → move `right` down; too small → move `left` up.
- Return `[left + 1, right + 1]` because the problem uses **1-indexed** positions.
- No extra space needed (unlike the hash-map approach for the unsorted version).

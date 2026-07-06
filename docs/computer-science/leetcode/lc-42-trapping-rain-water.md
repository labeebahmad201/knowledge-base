# LC-42 — Trapping Rain Water

## Problem

Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.

### Constraints

- `n == height.length`
- `1 <= n <= 2 * 10^4`
- `0 <= height[i] <= 10^5`

---

## Solution: Pre-computed prefix max (left & right)

```python
class Solution:
    def trap(self, height: List[int]) -> int:

        n = len(height)
        maxLeft = [0] * n
        maxRight = [0] * n

        maxSoFar = 0
        for i in range(0, n):
            maxLeft[i] = maxSoFar
            maxSoFar = max(height[i], maxSoFar)

        maxSoFar = 0
        for i in range(n - 1, -1, -1):
            maxRight[i] = maxSoFar
            maxSoFar = max(height[i], maxSoFar)

        total = 0
        for i in range(0, n):
            waterTrapped = min(maxLeft[i], maxRight[i]) - height[i]
            if waterTrapped > 0:
                total += waterTrapped

        return total
```

- **Time:** O(n) — three linear passes.
- **Space:** O(n) — two auxiliary arrays of length n.
- **Pattern:** Prefix/suffix max.

---

## Key insights

The first and last rocks (indices `0` and `n-1`) will not store any water because there is no boundary on one side to hold it in. For every other index, the amount of water we can trap is determined not by the immediate left and right neighbours but by the **tallest** column to its left and the **tallest** column to its right. If we only looked at the immediate neighbours, we would miss cases where a taller column further away would allow us to trap more water — this is why the problem is **not greedy**: a locally optimal choice (picking the immediate neighbour) does not lead to a globally optimal answer. So for each index we need the maximum height seen so far to its left (excluding itself) and the maximum height seen to its right (excluding itself). We compute these with two prefix passes: `maxLeft[i]` stores the maximum height in `[0, i-1]`, and `maxRight[i]` stores the maximum height in `[i+1, n-1]`. The water trapped at index `i` is then `min(maxLeft[i], maxRight[i]) - height[i]` — the smaller of the two maxima is the bottleneck, and the height of the rock at `i` itself eats up some of that space, so we subtract it. We clamp the result at zero (negative values mean no water is trapped) and sum over all indices.

- **Why `maxLeft[i]` is set before updating `maxSoFar`:** If we updated `maxSoFar` first, we would include `height[i]` in the max, but we want the maximum to the left *excluding* the current index.
- **Why `min(L, R)`:** The shorter side is the bottleneck — water cannot rise higher than the shorter wall.
- **Why subtract `height[i]`:** The rock at `i` takes up volume that would otherwise hold water.

---

## Related

- [LC-11 — Container With Most Water](lc-11-container-with-most-water) (two-pointer, greedy variant)
- [LC-238 — Product of Array Except Self](lc-238-product-of-array-except-self) (similar prefix/suffix technique)

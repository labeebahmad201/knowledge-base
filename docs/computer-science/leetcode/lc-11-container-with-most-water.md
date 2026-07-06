# LC-11 — Container With Most Water

## Problem

You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`-th line are `(i, 0)` and `(i, height[i])`.

Find two lines that together with the x-axis form a container such that the container contains the most water.

Return the maximum amount of water a container can store.

**You may not slant the container.**

### Constraints

- `n == height.length`
- `2 <= n <= 10^5`
- `0 <= height[i] <= 10^4`

---

## Solution: Two-pointer

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:

        left = 0
        right = len(height) - 1
        max_area = 0

        while left < right:
            container_height = min(height[left], height[right])
            width = right - left
            area = container_height * width
            max_area = max(area, max_area)

            if height[left] < height[right]:
                left += 1
            elif height[left] > height[right]:
                right -= 1
            else:
                left += 1

        return max_area
```

- **Time:** O(n) — each element is visited at most once.
- **Space:** O(1) — only two pointers.
- **Pattern:** Two-pointer (greedy narrowing from ends).

---

## Key insights

- Start with pointers at **both ends** so width is maximised; then narrow the pointer that points to the **shorter** line, because that line is the bottleneck limiting the water.
- Area formula: `min(height[left], height[right]) * (right - left)`. Note `right - left` (not `+1`) gives the correct number of gaps between the two indices.
- When heights are equal, moving either pointer is fine. Moving the left pointer is a safe default — the area is already computed before the move, so no combination is missed.
- **Why move the shorter line?** Suppose the left line is short and the right line is tall. The water height is limited by the short left line — it's the bottleneck. If you move the tall right line inward, width shrinks and the height is still capped by the same short left line, so the area can only get smaller. Moving the short left line inward is your only chance to find a taller line and increase the bottleneck. You lose the current short line, but you might find a better one.
- **This is a greedy algorithm** — at each step, you pick the locally best move (shorten the bottleneck side) without backtracking. See the [Greedy Algorithms concept page](lc-greedy) for more.

---

## Techniques

- [Two-Pointer](techniques#two-pointer)
- [Greedy](techniques#greedy)

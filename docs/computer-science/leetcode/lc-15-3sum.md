# LC-15 - 3Sum

## Problem

Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

The solution set must not contain duplicate triplets (sets of three numbers, order within a triplet does not matter).

### Constraints

- `3 <= nums.length <= 3000`
- `-10^5 <= nums[i] <= 10^5`

---

## Solution: Sort + Two-pointer

```python
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        sorted_nums = sorted(nums)

        # x + y + z = 0
        ans = []

        for i in range(len(sorted_nums)):
            # de-duplication logic for outer loop
            if i > 0 and sorted_nums[i] == sorted_nums[i - 1]:
                continue

            # left = 0   # common mistake: we wanna be looking from the next of x
            left = i + 1
            right = len(sorted_nums) - 1
            target = -sorted_nums[i]

            while left < right:
                num_sum = sorted_nums[left] + sorted_nums[right]

                if num_sum == target:
                    ans.append([sorted_nums[i], sorted_nums[left], sorted_nums[right]])

                    # yeah I wonder what should we move here?
                    left += 1
                    right -= 1  # why move both...

                    # de-dup within the section
                    # we add de-dup logic here because we don't wanna be
                    # capturing the same combination again. having this
                    # in mismatch branches won't serve any purpose.
                    while left < right and sorted_nums[left] == sorted_nums[left - 1]:
                        left += 1

                    while left < right and sorted_nums[right] == sorted_nums[right + 1]:
                        right -= 1

                elif num_sum < target:
                    left += 1
                else:
                    right -= 1

        return ans
```

- **Time:** O(n^2)
- **Space:** O(1) extra (not counting the output list) or O(n) for sorting.
- **Pattern:** Sort + two-pointer on the remaining subarray.

---

### Time complexity breakdown

```
sorted(nums)        => O(n log n)
outer loop (i)      => O(n)
  two-pointer scan  => O(n) per i
```

The outer `for i` loop runs `n` times. For each `i`, the inner `while left < right` two-pointer scan walks across the remaining subarray. In the worst case, `left` and `right` together visit every element to the right of `i` once — that's O(n) per `i`.

Total inner work: O(n * n) = O(n^2).

Adding the sort: O(n log n + n^2) = O(n^2), since n^2 dominates for large n.

Why isn't it O(n^3)? Because we don't use a third nested loop. The two-pointer scan replaces what would be an O(n^2) brute-force search for `y` and `z` with a single O(n) pass. That is the whole reason the two-pointer technique matters here — it drops one factor of n.

---

## Notes / Thought process

### The setup

Consider the array: `[-3, 3, 4, -3, 1, 2]`.

How can we have triplets that sum to zero? Pick the -3 at index 0 and pair it with 1 and 2. That's one triplet. We could also pick the -3 at index 3 and pair it with 1 and 2. That would be the second triplet. Because both -3s are at different positions, but the triplet values are the same — that makes them duplicate triplets.

Now what if the positions for -3 and 1 were swapped inside one of the triplets? Would that be a different triplet? No — swapping the positions does NOT create a new triplet. A triplet is a set of numbers, not a sequence. `[-3, 1, 2]` and `[1, -3, 2]` are identical. That is why we always output triplets in sorted order to eliminate the "swapped order" problem before it even starts.

### The two kinds of duplicates

This distinction is crucial:

| Concept | Definition | Allowed in 3Sum? | Example |
|---|---|---|---|
| Duplicate value **within** a triplet | The same numeric value used twice in one triplet (different indices). | Yes, absolutely allowed. | `[-2, 1, 1]` is valid — it sums to 0. |
| Duplicate triplet (combination) | The same three values from different index combinations or different order. | No, must be removed. | `[-3 (idx0), 1, 2]` and `[-3 (idx3), 1, 2]` are the same triplet and must be deduped. |

So if we rearrange the items in the triplet, they are still the same triplet because in this context these are sets and the order does not matter — it's just about what values are in there.

### De-duplication strategy

**Method 1 — Sort + skip adjacent duplicates (used in the code):**
- Sort the array so duplicates sit next to each other.
- In the outer loop: if the current element is the same as the one before it, skip it. That prevents duplicate triplets by ensuring we don't pick the same `x` value twice from different indices.
- In the inner section after finding a match: when we move the pointers, make sure we keep moving until we land on a different number. This prevents capturing the same combination again.

**Method 2 — Use a hash set:**
- Store seen triplets in a set to automatically filter duplicates.
- This requires additional memory. Depending on the requirements we might not want that, but it's good to know both approaches.

Two things to remember here: (1) how to do the de-duplication, and (2) where it needs to be done. These patterns help speed up your thought process when interviewing or solving problems, because you don't have to think about these things from scratch every time.

### Turning 3Sum into a two-sum subproblem

x + y + z = 0

What are the candidates for `x`? Any number in the array can be a candidate. But if we take the same value as `x` from two different positions, that leads to duplicate triplets — so we need to skip that.

Now once `x` is fixed, we need to find `y` and `z` such that `y + z = -x`. If `x = -1`, we need the opposite: `y + z = 1`. That makes the equation sum to zero. So it just becomes a two-sum problem on the remaining subarray.

### Two-pointer mechanics

We have the sorted array, and we know the target `-x` for the two-sum. How do we find `y` and `z` without extra memory?

- `left` starts at `i + 1` (common mistake: setting `left = 0` instead of `i + 1`).
- `right` starts at the last index.
- Calculate `y + z`.
- If equal to target: found it.
- If less than target: need a larger sum — move `left` towards the right.
- If greater than target: need a smaller sum — move `right` towards the left.

The right pointer is already at the rightmost position so there is no way to go further right. The left pointer is at the leftmost position of the subarray, so it can't go further left. Only one direction helps in each case.

When we find a match (`y + z == target`) and move both pointers inward — why move both? Why not just move `left` and keep `right` where it is?

Because after recording `[x, nums[left], nums[right]]`:
- If we only move `left` inward (`left++`) but keep `right` unchanged, then `nums[left] + nums[right]` becomes **larger** than before (in a sorted array, `nums[new_left] >= nums[old_left]`). The sum overshoots the target.
- If we only move `right` inward (`right--`) but keep `left` unchanged, then `nums[left] + nums[right]` becomes **smaller** than before (`nums[new_right] <= nums[old_right]`). The sum undershoots the target.

So any single-pointer move guarantees the new sum is either too large or too small — it can't hit the target again. Moving **both** is the only way to have a fresh pair with a shot at reaching the target once more.

### De-duplication within the inner section

After finding a match and moving both pointers, we need to skip over duplicate values to avoid capturing the same combination again:

```python
# when we found a match:
left += 1
right -= 1

# skip duplicates on the left side
while left < right and sorted_nums[left] == sorted_nums[left - 1]:
    left += 1

# skip duplicates on the right side
while left < right and sorted_nums[right] == sorted_nums[right + 1]:
    right -= 1
```

This inner de-dup logic only goes in the `num_sum == target` branch. Putting it in the mismatch branches would not serve any purpose.

---

## Key insights

- Sorting solves two problems at once: it enables the two-pointer technique and makes duplicate detection trivial.
- The outer loop skip (`nums[i] == nums[i-1]`) prevents duplicate **triplets** (not duplicate values within a triplet).
- After finding a match, both pointers move because any single-pointer move would yield a sum that is either too large or too small given the sorted order.
- The inner while loops for de-duplication are only needed in the `num_sum == target` branch.

# LC-238 — Product of Array Except Self

## Problem

Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must solve it **without division** and in **O(n)** time.

### Constraints

- `2 <= nums.length <= 10^5`
- `-30 <= nums[i] <= 30`
- The product of any prefix or suffix of `nums` is guaranteed to fit in a **32-bit integer**.
- **Follow-up:** Can you solve it in **O(1)** extra space? (The output array does not count as extra space.)

---

## Solution 1: Prefix and postfix product arrays (first thought)

The brute force way is: for each element, loop through the rest of the array and multiply everything together. That's **O(n²)** — not good enough.

The insight: for any index `i`, we need the product of everything to the **left** of `i` multiplied by the product of everything to the **right** of `i`. We can precompute those.

### Step-by-step

1. **Left product array** — traverse left to right. At each index `i`, store the product of all elements before `i`. Use a placeholder `1` for the first element (nothing to its left).
2. **Right product array** — traverse right to left. At each index `i`, store the product of all elements after `i`. Use a placeholder `1` for the last element (nothing to its right).
3. **Multiply** — for each index `i`, `answer[i] = left_product[i] * right_product[i]`.

### Why the `1` placeholder?

At the first index there's nothing to the left. At the last index there's nothing to the right. We use `1` instead of special-casing these positions — multiplying by `1` is a no-op, so the formula works uniformly without extra checks.

```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        left_product = []
        right_product = [0] * len(nums)

        product = 1
        for i in range(0, len(nums)):
            left_product.append(product)
            product = product * nums[i]

        product = 1
        for i in range(len(nums) - 1, -1, -1):
            right_product[i] = product
            product = product * nums[i]

        return [left_product[i] * right_product[i] for i in range(0, len(left_product))]
```

```
Example: nums = [1, 2, 3, 4]

Left product:   [1,  1,  2,  6]
Right product:  [24, 12, 4,  1]
Answer:         [24, 12, 8,  6]
```

- **Time:** O(n) — three passes (left, right, multiply), each linear.
- **Space:** O(n) — two extra arrays of size n.

---

## Solution 2: Single output array (reduced space)

Same idea, but reuse the output array to store the left products first, then fold in the right products with a running variable. This avoids allocating a separate `right_product` array.

```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        answer = [1] * len(nums)

        product = 1
        for i in range(0, len(nums)):
            answer[i] = product
            product = product * nums[i]

        product = 1
        for i in range(len(nums) - 1, -1, -1):
            answer[i] = answer[i] * product
            product = product * nums[i]

        return answer
```

- **Time:** O(n)
- **Space:** O(1) extra (output array is not counted).

---

## Revision notes

- Brute force O(n²) is the obvious first thought. The constraint `10^5` rules it out.
- Prefix/suffix product is the standard pattern for "product of everything except current".
- The `1` placeholder elegantly avoids edge-case checks at the boundaries.
- The space-optimized version (Solution 2) is the typical follow-up interview question.

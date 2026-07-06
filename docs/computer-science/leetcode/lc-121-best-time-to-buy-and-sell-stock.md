# LC-121 — Best Time to Buy and Sell Stock

## Problem

You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve. If no profit can be made, return `0`.

### Constraints

- `1 <= prices.length <= 10^5`
- `0 <= prices[i] <= 10^4`

---

## Solution: Greedy (single pass)

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        buyingPrice = prices[0]
        maxProfitSoFar = 0

        for i in range(1, len(prices)):
            if prices[i] < buyingPrice:
                buyingPrice = prices[i]
                continue

            profit = prices[i] - buyingPrice

            if profit >= 0:
                maxProfitSoFar = max(profit, maxProfitSoFar)

        return maxProfitSoFar
```

- **Time:** O(n) — single pass through the array.
- **Space:** O(1) — only two variables.

---

## Key insights

- Start with `prices[0]` as the initial buying price. Walk through the array once.
- If we find a **lower price**, switch to that as the new buying price — it's strictly better (buy cheaper).
- If we find a **higher price**, calculate the profit (current price − buying price) and track the max.
- We never need to look back or reconsider past decisions. Each step makes a locally optimal choice and commits to it.

---

## Your thought process

> "I guess we can take the first price as a starting point and then start with the price right after that and then we could say OK what is the profit and 1-7 would show us that there is no profit and also one is less than seven so it makes sense that that becomes the buying price so we do that and then we move forward and then we come across five which is higher in price than one then we calculate the profit and then we're gonna have to keep track of it... we came across a price that was cheaper than one then we would have bought that because of course we are always optimizing for buying cheaper and selling higher."

The intuition is simple:
1. Lock in the cheapest price seen so far as your buying price.
2. For every later day, check if selling today beats your current max profit.
3. The `continue` after updating `buyingPrice` avoids unnecessarily comparing a price against itself.

---

## Why this is greedy

At each step (day), you make the **locally optimal choice** without backtracking:

- **Greedy choice:** "If today's price is the lowest I've seen, lock it in as my buying price." You don't consider whether a slightly higher price today might somehow work out better later — you commit to the minimum.
- **No backtracking:** Once you update `buyingPrice`, you never revisit the old price. You assume that buying at the lowest seen-so-far price is always the right move for maximizing future profit.
- **Global optimum falls out naturally:** The max profit is simply the largest difference between a later price and the minimum price seen before it. The greedy approach finds exactly that.

This satisfies both properties of greedy algorithms:
1. **Greedy-choice property** — Choosing the lowest price seen so far never rules out the optimal profit.
2. **Optimal substructure** — The optimal profit up to day `i` depends only on the optimal profit up to day `i-1` and the price on day `i`.

Compare with other approaches:
- **Brute force** would check every `(buy, sell)` pair — O(n²).
- **Greedy** makes one decision per element, no revisiting — O(n).

---

## Related

| Problem | Pattern |
|---------|---------|
| LC-121 Best Time to Buy and Sell Stock | Track min-so-far, compute max profit (greedy) |
| LC-122 Best Time to Buy and Sell Stock II | Accumulate every positive gain (greedy) |
| LC-123 Best Time to Buy and Sell Stock III | DP (at most 2 transactions) |

See the [Greedy Algorithms concept page](lc-greedy) for more.

---

## Techniques

- [Greedy](techniques#greedy)

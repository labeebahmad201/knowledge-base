# Greedy Algorithms

## What is a greedy algorithm?

A greedy algorithm builds a solution step-by-step. At each step, it makes the **locally optimal choice** — the choice that looks best *right now* — hoping that this leads to a globally optimal solution.

It never reconsiders past decisions.

---

## When does greedy work?

Greedy works when a problem has these two properties:

1. **Greedy-choice property** — A globally optimal solution can be arrived at by making a locally optimal (greedy) choice.
2. **Optimal substructure** — An optimal solution to the problem contains optimal solutions to its subproblems.

If a problem doesn't have these, greedy will give you the wrong answer.

---

## How to spot greedy problems

Ask yourself:

- Can I make a choice at each step without needing to look ahead or backtrack?
- Does making the "best choice now" never prevent me from reaching the best overall answer?
- If I lock in a decision, does the rest of the problem stay the same type of problem (just smaller)?

Common patterns that are often greedy:

- **Interval scheduling** — pick the meeting that ends earliest
- **Minimum spanning tree** — Kruskal's / Prim's
- **Huffman coding** — merge smallest frequencies first
- **Coin change** (canonical currencies) — use largest coin first
- **Two-pointer narrowing** — Container With Most Water

---

## How greedy differs from other approaches

| Approach | Key idea | Example |
|----------|----------|---------|
| **Greedy** | Take the best immediate option, never backtrack | Container With Most Water |
| **DP** | Try all options, reuse subproblem answers | 0/1 Knapsack |
| **Brute force** | Try everything | Checking every pair of lines |
| **Divide & conquer** | Split in half, solve each, combine | Merge Sort |

The difference between greedy and DP:
- **Greedy** makes one irreversible choice per step — fast, but only works for certain problems.
- **DP** explores all choices at each step but reuses overlapping subproblems — slower, but more widely applicable.

---

## Example: why Container With Most Water is greedy

At each step, you have two pointers (left and right). You have two options:

- Move the left pointer inward.
- Move the right pointer inward.

**The greedy choice:** move the pointer that points to the **shorter** line.

This is locally optimal because the shorter line is the bottleneck — moving the taller line inward can never increase the area (width shrinks, height is still capped by the short line). So you lock in your decision (move the short one) and repeat on the smaller subproblem.

No backtracking needed. No need to try both options. That's greedy.

---

## LeetCode problems that use greedy

| Problem | Greedy choice |
|---------|--------------|
| LC-11 Container With Most Water | Move the shorter line inward |
| LC-55 Jump Game | Jump as far as possible from each position |
| LC-45 Jump Game II | At each step, jump to the position that extends your reach the most |
| LC-435 Non-overlapping Intervals | Pick intervals that end earliest |
| LC-406 Queue Reconstruction by Height | Insert tallest people first |

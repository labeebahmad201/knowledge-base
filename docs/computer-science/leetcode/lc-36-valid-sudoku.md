# LC-36 — Valid Sudoku

## Problem

Determine if a `9 x 9` Sudoku board is valid. Only the filled cells need to be validated according to the following rules:

1. Each row must contain the digits `1-9` **without repetition**.
2. Each column must contain the digits `1-9` **without repetition**.
3. Each of the nine `3 x 3` sub-boxes must contain the digits `1-9` **without repetition**.

> The board is partially filled — empty cells are represented by `"."`. A valid board is not necessarily solvable; only the filled cells are validated.

### Constraints

- `board.length == 9`
- `board[i].length == 9`
- `board[i][j]` is a digit `1-9` or `"."`.

---

## Solution 1: Per-row / per-column / per-box scans (initial approach)

The most direct reading of the three rules: scan each row, each column, and each 3×3 box, checking for duplicates within each.

```python
from collections import defaultdict
from typing import List

class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:

        def checkValidityOf(start_i: int, start_j: int, end_i: int, end_j: int) -> bool:
            for i in range(start_i, end_i + 1):
                row_vals = defaultdict(int)
                for j in range(start_j, end_j + 1):
                    if board[i][j] != ".":
                        row_vals[board[i][j]] += 1
                        if row_vals[board[i][j]] > 1:
                            return False

            for j in range(start_j, end_j + 1):
                column_vals = defaultdict(int)
                for i in range(start_i, end_i + 1):
                    if board[i][j] != ".":
                        column_vals[board[i][j]] += 1
                        if column_vals[board[i][j]] > 1:
                            return False

            return True

        def checkSubBox(start_i: int, start_j: int, end_i: int, end_j: int) -> bool:
            seen = defaultdict(int)
            for i in range(start_i, end_i + 1):
                for j in range(start_j, end_j + 1):
                    if board[i][j] != ".":
                        seen[board[i][j]] += 1
                        if seen[board[i][j]] > 1:
                            return False
            return True

        for i in range(0, 9, 3):
            for j in range(0, 9, 3):
                if not checkSubBox(i, j, i + 2, j + 2):
                    return False

        return checkValidityOf(0, 0, 8, 8)
```

- **Time:** O(1) — board is fixed at 9×9, so every operation is constant. In the generalised sense: O(9²) = O(1).
- **Space:** O(1) — at most 9 keys per hash map.
- **Pattern:** Separate validation of rows, columns, and sub-boxes.

### Why not one shared map for rows/columns?

If `row_vals` is declared *outside* the row loop (or reused across columns), it accumulates values across multiple rows/columns instead of resetting — giving false positives for duplicates that span different rows.

---

## Solution 2: Single-pass with a set (cleaner)

Track every seen `(value, row)`, `(value, col)`, and `(value, box)` in one set. If any tuple already exists, the board is invalid.

```python
from typing import List

class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        seen = set()

        for i in range(9):
            for j in range(9):
                val = board[i][j]
                if val == ".":
                    continue
                box = (i // 3, j // 3)
                if (val, "r", i) in seen or \
                   (val, "c", j) in seen or \
                   (val, "b", box) in seen:
                    return False
                seen.add((val, "r", i))
                seen.add((val, "c", j))
                seen.add((val, "b", box))

        return True
```

- **Time:** O(1) — single 9×9 pass.
- **Space:** O(1) — at most 3×81 = 243 entries.
- **Why this is better:** One pass, no separate helper functions, no per-row/per-column maps. The `(i // 3, j // 3)` trick maps any cell to its 3×3 box index.

### The box-indexing trick

A Sudoku board has 9 sub-boxes, each 3×3. For any cell at `(i, j)`:
- `i // 3` maps the row index to its sub-box row group (0, 1, or 2)
- `j // 3` maps the column index to its sub-box column group (0, 1, or 2)

Together `(i // 3, j // 3)` uniquely identifies which of the 9 boxes the cell belongs to. Integer division by 3 works because each box spans exactly 3 rows and 3 columns:

| Rows | `i // 3` | Columns | `j // 3` |
|------|----------|---------|----------|
| 0-2  | 0        | 0-2     | 0        |
| 3-5  | 1        | 3-5     | 1        |
| 6-8  | 2        | 6-8     | 2        |

So `(0, 0)` → box (0,0), `(4, 7)` → box (1,2), and so on.

---

## Revision notes

- `defaultdict(int)` is useful but reusing the same map across rows/columns causes bugs — reset it per scan or use a set with compound keys.
- A set-based single-pass solution is the most idiomatic Python approach.
- The `(i // 3, j // 3)` box-index mapping is a common LeetCode trick worth remembering.
- Because the board is always 9×9, every solution runs in constant time — interviewers care more about code clarity and correctness than asymptotic complexity here.

---

## Techniques

- [Hash Map / Hash Set](techniques#hash-map--hash-set)
